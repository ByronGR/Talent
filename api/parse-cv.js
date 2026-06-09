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

    // Log actual top-level keys AND the first work experience entry so we can fix the field mapping
    console.log("[parse-cv] Affinda data keys:", Object.keys(d).sort().join(", "));
    const rawWorkExp = d.workExperience || d.work_experience || d.WorkExperience || [];
    if (rawWorkExp[0]) {
      console.log("[parse-cv] workExp[0] keys:", Object.keys(rawWorkExp[0]).join(", "));
      console.log("[parse-cv] workExp[0] full:", JSON.stringify(rawWorkExp[0]));
    }

    // Strip trailing punctuation/whitespace that Affinda sometimes includes
    const cleanSkill = (s) => String(s || "").replace(/[,.\s]+$/, "").replace(/^[,.\s]+/, "").trim();

    // Try both camelCase and snake_case variants Affinda may use
    const rawSkills      = d.skills         || d.Skills         || [];
    const rawLanguages   = d.languages       || d.Languages      || [];
    const rawCerts       = d.certifications  || d.Certifications || [];

    const skills = rawSkills
      .map((s) => cleanSkill(s.name || s.text || s.value || ""))
      .filter((s) => s.length > 1);

    const workHistory = rawWorkExp
      .filter((w) => w.jobTitle || w.job_title || w.organization || w.company)
      .map((w) => ({
        title:   w.jobTitle    || w.job_title    || "",
        company: w.organization || w.company     || "",
        from:    w.dates?.startDate ? String(w.dates.startDate).slice(0, 7) : "",
        to:      w.dates?.isCurrent ? "present" : (w.dates?.endDate ? String(w.dates.endDate).slice(0, 7) : ""),
      }));

    const languages = rawLanguages
      .map((l) => cleanSkill(l.name || l.rawText || l.value || ""))
      .filter(Boolean);

    const certifications = rawCerts
      .map((c) => ({
        name:   cleanSkill(c.name || c.rawText || c.value || ""),
        issuer: c.organization || c.issuer || "",
        date:   c.completionDate ? String(c.completionDate).slice(0, 7) : "",
      }))
      .filter((c) => c.name);

    // Include a debug snapshot so the client can log the actual Affinda structure
    const _debug = {
      affindaKeys: Object.keys(d).sort(),
      skillsCount: rawSkills.length,
      workExpCount: rawWorkExp.length,
      certsCount: rawCerts.length,
      skillsSample: rawSkills.slice(0, 3),
      workExpFirstEntry: rawWorkExp[0] || null,   // full first entry so we can see exact field names
      workExpFirstEntryKeys: rawWorkExp[0] ? Object.keys(rawWorkExp[0]) : [],
    };

    return res.status(200).json({ ok: true, name, phone, city, summary, skills, workHistory, languages, certifications, _debug });

  } catch (e) {
    console.error("[parse-cv] error:", e?.message || String(e));
    return res.status(500).json({ ok: false, error: "Internal error: " + (e?.message || "") });
  }
}
