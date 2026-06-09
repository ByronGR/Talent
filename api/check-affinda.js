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
    if (!testRes.ok && testRes.status !== 400) {
      return res.status(200).json({ ok: false, step: "auth", keyInfo, affindaStatus: testRes.status, affindaDetail: body.slice(0, 300) });
    }

    // Auth passed — fetch workspace details + document types using the
    // identifier shown in Affinda UI (Settings → Integrations → Workspace ID)
    const wsIdentifier = "iKIEtiBE";

    const wsRes  = await fetch(`https://api.us1.affinda.com/v3/workspaces/${wsIdentifier}`, {
      headers: { Authorization: `Bearer ${key.trim()}` },
    });
    const wsBody = await wsRes.json().catch(() => null);

    // Document types are workspace-scoped
    const dtRes  = await fetch(`https://api.us1.affinda.com/v3/workspaces/${wsIdentifier}/document_types`, {
      headers: { Authorization: `Bearer ${key.trim()}` },
    });
    const dtBody = await dtRes.json().catch(() => null);

    // Also try collections endpoint (Affinda v3 may use "collections" for doc types)
    const colRes  = await fetch(`https://api.us1.affinda.com/v3/collections?workspace=${wsIdentifier}`, {
      headers: { Authorization: `Bearer ${key.trim()}` },
    });
    const colBody = await colRes.json().catch(() => null);

    return res.status(200).json({
      ok: true,
      step: "auth_ok",
      keyInfo,
      workspace: { status: wsRes.status, body: wsBody },
      documentTypes: { status: dtRes.status, body: dtBody },
      collections: { status: colRes.status, body: colBody },
    });
  } catch (e) {
    return res.status(200).json({ ok: false, step: "fetch", keyInfo, error: e?.message });
  }
}
