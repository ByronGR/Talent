// POST /api/parse-cv
// Proxies a CV file to the Affinda Resume Parser so the API key never
// appears in the client bundle.
//
// Request: POST, Content-Type: application/json
//   { data: "<base64 file>", filename: "cv.pdf", mimeType: "application/pdf" }
//
// Response:
//   { ok: true,  name, phone, city, summary, skills[], workHistory[] }
//   { ok: false, error: "..." }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const key = process.env.AFFINDA_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, error: "AFFINDA_API_KEY not configured" });
  }

  // Vercel auto-parses JSON bodies; fall back to manual stream read if needed.
  let body = req.body;
  if (!body || typeof body !== "object") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return res.status(400).json({ ok: false, error: "Could not parse request body" });
    }
  }

  const { data: base64, filename = "cv.pdf", mimeType = "application/octet-stream" } = body;
  if (!base64 || typeof base64 !== "string") {
    return res.status(400).json({ ok: false, error: "Missing field: data (base64 file content)" });
  }

  try {
    const fileBuffer = Buffer.from(base64, "base64");
    const boundary   = `--NW${Date.now()}`;
    const CRLF       = "\r\n";

    // Build multipart/form-data manually (no Blob/FormData dependency)
    const body = Buffer.concat([
      // workspace field
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="workspace"${CRLF}${CRLF}1007732${CRLF}`),
      // documentType field
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="documentType"${CRLF}${CRLF}1058304${CRLF}`),
      // file field
      Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}Content-Type: ${mimeType}${CRLF}${CRLF}`),
      fileBuffer,
      Buffer.from(`${CRLF}--${boundary}--${CRLF}`),
    ]);

    const affRes = await fetch("https://api.affinda.com/v3/documents", {
      method: "POST",
      headers: {
        Authorization:    `Bearer ${key}`,
        "Content-Type":   `multipart/form-data; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
    });

    if (!affRes.ok) {
      const txt = await affRes.text().catch(() => "");
      console.error("[parse-cv] Affinda error", affRes.status, txt.slice(0, 300));
      return res.status(502).json({ ok: false, error: `Affinda returned ${affRes.status}` });
    }

    const json = await affRes.json().catch(() => null);
    const d    = json?.data;

    if (!d) {
      return res.status(200).json({ ok: true, name: "", phone: "", city: "", summary: "", skills: [], workHistory: [] });
    }

    const name    = d.name?.raw || [d.name?.first, d.name?.last].filter(Boolean).join(" ") || "";
    const phone   = d.phoneNumbers?.[0]?.rawText || d.phoneNumbers?.[0]?.value || "";
    const city    = d.location?.city || "";
    const summary = (typeof d.summary === "string" ? d.summary : d.summary?.raw || "").slice(0, 800);
    const skills  = (d.skills || []).map((s) => s.name || s.text || "").filter(Boolean);

    const workHistory = (d.workExperience || [])
      .filter((w) => w.jobTitle || w.organization)
      .map((w) => ({
        title:   w.jobTitle     || "",
        company: w.organization || "",
        from:    w.dates?.startDate ? String(w.dates.startDate).slice(0, 7) : "",
        to:      w.dates?.isCurrent ? "present" : (w.dates?.endDate ? String(w.dates.endDate).slice(0, 7) : ""),
      }));

    return res.status(200).json({ ok: true, name, phone, city, summary, skills, workHistory });

  } catch (e) {
    console.error("[parse-cv] error:", e?.message || String(e));
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}
