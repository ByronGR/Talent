// POST /api/parse-cv
// Server-side proxy: receives a CV as base64 JSON, sends it to the
// Affinda Resume Parser as multipart/form-data, returns structured data.
// The API key lives in process.env.AFFINDA_API_KEY (server-side only).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const key = (process.env.AFFINDA_API_KEY || "").trim();
  if (!key) {
    return res.status(500).json({ ok: false, error: "AFFINDA_API_KEY not configured" });
  }

  // Vercel auto-parses JSON bodies into req.body; fall back to stream read.
  let payload = req.body;
  if (!payload || typeof payload !== "object") {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return res.status(400).json({ ok: false, error: "Could not parse request body as JSON" });
    }
  }

  const { data: base64, filename = "cv.pdf", mimeType = "application/octet-stream" } = payload;
  if (!base64 || typeof base64 !== "string") {
    return res.status(400).json({ ok: false, error: "Missing field: data (base64 file)" });
  }

  try {
    const fileBuffer = Buffer.from(base64, "base64");

    // RFC 2046 multipart/form-data — boundary must NOT include leading "--"
    const bnd  = `NearworkBnd${Date.now()}`;
    const CRLF = "\r\n";

    // Helper: text field part
    const textPart = (name, value) =>
      `--${bnd}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`;

    const multipart = Buffer.concat([
      Buffer.from(textPart("workspace",    "iKIEtiBE")),
      Buffer.from(textPart("documentType", "rcqSyqXA")),  // Resume Parser collection
      // File part header
      Buffer.from(
        `--${bnd}${CRLF}` +
        `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
        `Content-Type: ${mimeType}${CRLF}${CRLF}`
      ),
      // Raw file bytes
      fileBuffer,
      // Closing boundary (CRLF after binary content + closing delimiter)
      Buffer.from(`${CRLF}--${bnd}--${CRLF}`),
    ]);

    const affRes = await fetch("https://api.us1.affinda.com/v3/documents", {
      method: "POST",
      headers: {
        Authorization:    `Bearer ${key}`,
        "Content-Type":   `multipart/form-data; boundary=${bnd}`,
        "Content-Length": String(multipart.length),
      },
      body: multipart,
    });

    if (!affRes.ok) {
      const errText = await affRes.text().catch(() => "");
      console.error("[parse-cv] Affinda HTTP", affRes.status, errText.slice(0, 400));
      return res.status(502).json({ ok: false, error: `Affinda returned ${affRes.status}`, detail: errText.slice(0, 200) });
    }

    const json = await affRes.json().catch(() => null);
    const d    = json?.data;

    if (!d) {
      return res.status(200).json({ ok: true, name: "", phone: "", city: "", summary: "", skills: [], workHistory: [], languages: [], certifications: [] });
    }

    const name    = d.name?.raw || [d.name?.first, d.name?.last].filter(Boolean).join(" ") || "";
    const phone   = d.phoneNumbers?.[0]?.rawText || d.phoneNumbers?.[0]?.value || "";
    const city    = d.location?.city || "";
    const summary = (typeof d.summary === "string" ? d.summary : d.summary?.raw || "").slice(0, 800);

    // Strip trailing punctuation/whitespace that Affinda sometimes includes
    const cleanSkill = (s) => String(s || "").replace(/[,.\s]+$/, "").replace(/^[,.\s]+/, "").trim();

    // Debug: log all top-level keys and work entry parsed keys to identify remaining field names
    console.log("[parse-cv] top-level keys:", Object.keys(d).sort().join(", "));
    const rawWorkExp = d.workExperience || d.work_experience || d.WorkExperience || [];
    if (rawWorkExp[0]) {
      const p0 = rawWorkExp[0].parsed || {};
      console.log("[parse-cv] workEntry.parsed keys:", Object.keys(p0).join(", "));
      const dateKeys = Object.keys(p0).filter((k) => /date/i.test(k));
      dateKeys.forEach((k) => console.log(`[parse-cv] ${k}:`, JSON.stringify(p0[k])));
    }

    const workHistory = rawWorkExp
      .map((w) => {
        const p = w.parsed || {};
        // Nested custom-workspace structure
        const title   = p.workExperienceJobTitle?.raw    || p.workExperienceJobTitle?.parsed    || w.jobTitle    || w.job_title    || "";
        const company = p.workExperienceOrganization?.raw || p.workExperienceOrganization?.parsed || w.organization || w.company     || "";
        const dates   = p.workExperienceDates?.parsed    || p.workExperienceDates               || {};
        const from    = dates.startDate ? String(dates.startDate).slice(0, 7) : (w.dates?.startDate ? String(w.dates.startDate).slice(0, 7) : "");
        const isCurr  = dates.isCurrent ?? w.dates?.isCurrent;
        const to      = isCurr ? "present" : (dates.endDate ? String(dates.endDate).slice(0, 7) : (w.dates?.endDate ? String(w.dates.endDate).slice(0, 7) : ""));
        return { title, company, from, to };
      })
      .filter((w) => w.title || w.company);

    // Skills — try flat array first, then nested parsed structure
    const rawSkills = d.skills || d.Skills || [];
    const skills = rawSkills
      .map((s) => {
        const nested = s.parsed?.skillsName?.raw || s.parsed?.skillsName?.parsed || "";
        return cleanSkill(nested || s.name || s.text || s.value || s.raw || "");
      })
      .filter((s) => s.length > 1);

    // Languages
    const rawLanguages = d.languages || d.Languages || [];
    const languages = rawLanguages
      .map((l) => {
        const nested = l.parsed?.languagesValue?.raw || l.parsed?.languagesValue?.parsed || "";
        return cleanSkill(nested || l.name || l.rawText || l.value || l.raw || "");
      })
      .filter(Boolean);

    // Certifications
    const rawCerts = d.certifications || d.Certifications || [];
    const certifications = rawCerts
      .map((c) => {
        const p      = c.parsed || {};
        const cname  = cleanSkill(p.certificationsName?.raw || p.certificationsName?.parsed || c.name || c.rawText || c.value || c.raw || "");
        const issuer = p.certificationsIssuer?.raw || p.certificationsIssuer?.parsed || c.organization || c.issuer || "";
        const date   = p.certificationsDate?.raw   || (c.completionDate ? String(c.completionDate).slice(0, 7) : "");
        return { name: cname, issuer, date };
      })
      .filter((c) => c.name);

    return res.status(200).json({ ok: true, name, phone, city, summary, skills, workHistory, languages, certifications });

  } catch (e) {
    console.error("[parse-cv] error:", e?.message || String(e));
    return res.status(500).json({ ok: false, error: "Internal error: " + (e?.message || "") });
  }
}
