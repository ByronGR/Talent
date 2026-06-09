// GET /api/check-affinda
// Diagnostic: verifies the AFFINDA_API_KEY env var is set and tests
// authentication against the Affinda API. Returns safe debug info only
// (key length + first/last 4 chars, never the full key).

export default async function handler(req, res) {
  const key = process.env.AFFINDA_API_KEY;

  if (!key) {
    return res.status(200).json({ ok: false, step: "env", error: "AFFINDA_API_KEY is not set in this environment" });
  }

  const keyInfo = {
    length: key.length,
    preview: key.slice(0, 4) + "..." + key.slice(-4),
    hasSpaces: key !== key.trim(),
    trimmedLength: key.trim().length,
  };

  // Test auth with a lightweight GET to /v3/workspaces
  try {
    const testRes = await fetch("https://api.us1.affinda.com/v3/workspaces", {
      headers: { Authorization: `Bearer ${key.trim()}` },
    });
    const body = await testRes.text().catch(() => "");
    // 400 validation_error on /workspaces means auth passed but the endpoint
    // needs an org param — still counts as key valid.
    if (testRes.ok || testRes.status === 400) {
      return res.status(200).json({ ok: true, step: "auth_ok", keyInfo, affindaStatus: testRes.status, note: testRes.status === 400 ? "Key valid — 400 just means org param required on this endpoint" : "Key valid" });
    }
    return res.status(200).json({ ok: false, step: "auth", keyInfo, affindaStatus: testRes.status, affindaDetail: body.slice(0, 300) });
  } catch (e) {
    return res.status(200).json({ ok: false, step: "fetch", keyInfo, error: e?.message });
  }
}
