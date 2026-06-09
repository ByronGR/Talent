// POST /api/parse-cv
// Server-side proxy for the Affinda Resume Parser.
// Receives the CV as base64 JSON, rebuilds the binary, and sends it to
// Affinda as multipart/form-data — so the API key never lives in the
// client bundle.
//
// Request body (JSON):
//   { data: "<base64>", filename: "cv.pdf", mimeType: "application/pdf" }
//
// Response (JSON):
//   { ok: true,  name, phone, city, summary, skills[], workHistory[] }
//   { ok: false, error: "..." }

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',   // CVs can be a few MB; base64 adds ~33% overhead
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const key = process.env.AFFINDA_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, error: "AFFINDA_API_KEY not configured on server" });
  }

  const { data: base64, filename = "cv.pdf", mimeType = "application/octet-stream" } = req.body || {};
  if (!base64) {
    return res.status(400).json({ ok: false, error: "Missing required field: data (base64 file content)" });
  }

  try {
    const fileBuffer = Buffer.from(base64, "base64");

    // Build multipart/form-data manually — avoids any Blob/FormData
    // availability differences across Node.js / Vercel runtime versions.
    const boundary = `----NearworkBoundary${Date.now()}`;
    const CRLF     = "\r\n";

    const parts = [];

    // Text fields
    for (const [name, value] of [["workspace", "1007732"], ["documentType", "1058304"]]) {
      parts.push(
        `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
        `${value}${CRLF}`
      );
    }

    // File field
    const fileHeader =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
      `Content-Type: ${mimeType}${CRLF}${CRLF}`;
    const fileFooter = `${CRLF}--${boundary}--${CRLF}`;

    const body = Buffer.concat([
      Buffer.from(parts.join("")),
      Buffer.from(fileHeader),
      fileBuffer,
      Buffer.from(fileFooter),
    ]);

    const affindaRes = await fetch("https://api.affinda.com/v3/documents", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${key}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
    });

    if (!affindaRes.ok) {
      const errText = await affindaRes.text().catch(() => "");
      console.error("[parse-cv] Affinda HTTP error", affindaRes.status, errText);
      return res.status(502).json({
        ok: false,
        error: `Affinda returned ${affindaRes.status}`,
        detail: errText.slice(0, 500),
      });
    }

    const json = await affindaRes.json();
    const d    = json?.data;
    if (!d) {
      console.warn("[parse-cv] Affinda response had no .data field", JSON.stringify(json).slice(0, 200));
      return res.status(200).json({ ok: true, name: "", phone: "", city: "", summary: "", skills: [], workHistory: [] });
    }

    const name    = d.name?.raw || [d.name?.first, d.name?.last].filter(Boolean).join(" ") || "";
    const phone   = d.phoneNumbers?.[0]?.rawText || d.phoneNumbers?.[0]?.value || "";
    const city    = d.location?.city || "";
    const summary = typeof d.summary === "string" ? d.summary.slice(0, 800) : (d.summary?.raw || "").slice(0, 800);
    const skills  = (d.skills || []).map((s) => s.name || s.text || "").filter(Boolean);

    const workHistory = (d.workExperience || [])
      .filter((w) => w.jobTitle || w.organization)
      .map((w) => ({
        title:   w.jobTitle     || "",
        company: w.organization || "",
        from:    w.dates?.startDate ? String(w.dates.startDate).slice(0, 7) : "",
        to:      w.dates?.isCurrent
                   ? "present"
                   : (w.dates?.endDate ? String(w.dates.endDate).slice(0, 7) : ""),
      }));

    return res.status(200).json({ ok: true, name, phone, city, summary, skills, workHistory });

  } catch (e) {
    console.error("[parse-cv] unexpected error:", e?.message || e);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
