// GET /api/check-affinda
// Quick health check: verifies AFFINDA_API_KEY is set and auth works.

export default async function handler(req, res) {
  const key = (process.env.AFFINDA_API_KEY || "").trim();
  if (!key) {
    return res.status(200).json({ ok: false, error: "AFFINDA_API_KEY not set" });
  }
  const r = await fetch("https://api.us1.affinda.com/v3/workspaces/iKIEtiBE", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const body = await r.json().catch(() => null);
  return res.status(200).json({
    ok: r.ok,
    affindaStatus: r.status,
    workspace: r.ok ? body?.name : null,
    error: r.ok ? null : body,
  });
}
