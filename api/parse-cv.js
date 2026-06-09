// POST /api/parse-cv
// Proxies a CV file (sent as base64 JSON) to the Affinda resume parser.
// Keeps the API key server-side — it is never exposed in the client bundle.
//
// Request body (JSON):
//   { data: "<base64 file content>", filename: "cv.pdf", mimeType: "application/pdf" }
//
// Response (JSON):
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

  const { data: base64, filename = "cv.pdf", mimeType = "application/octet-stream" } = req.body || {};
  if (!base64) {
    return res.status(400).json({ ok: false, error: "Missing field: data (base64 file content)" });
  }

  try {
    const buffer = Buffer.from(base64, "base64");
    const blob   = new Blob([buffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("workspace",    "1007732");
    formData.append("documentType", "1058304");

    const affindaRes = await fetch("https://api.affinda.com/v3/documents", {
      method:  "POST",
      headers: { Authorization: `Bearer ${key}` },
      body:    formData,
    });

    if (!affindaRes.ok) {
      const err = await affindaRes.json().catch(() => ({}));
      console.error("[parse-cv] Affinda error:", err);
      return res.status(502).json({ ok: false, error: "Affinda rejected the request", detail: err });
    }

    const json = await affindaRes.json();
    const d    = json?.data;
    if (!d) return res.status(200).json({ ok: true, name: "", phone: "", city: "", summary: "", skills: [], workHistory: [] });

    const name    = d.name?.raw || [d.name?.first, d.name?.last].filter(Boolean).join(" ") || "";
    const phone   = d.phoneNumbers?.[0]?.rawText || d.phoneNumbers?.[0]?.value || "";
    const city    = d.location?.city || "";
    const summary = typeof d.summary === "string" ? d.summary.slice(0, 800) : "";
    const skills  = (d.skills || []).map((s) => s.name).filter(Boolean);

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
    console.error("[parse-cv] unexpected error:", e);
    return res.status(500).json({ ok: false, error: "Failed to parse CV" });
  }
}
