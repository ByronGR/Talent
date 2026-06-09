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

    // The workspace lists documentType identifiers — probe each as a `collection`
    // upload to find which one corresponds to "Resume Parser"
    const tinyPdf = "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXT4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxODcKJSVFT0Y=";
    const wsDocTypes = wsBody?.documentTypes || [];

    const probeResults = await Promise.all(
      wsDocTypes.map(async (colId) => {
        const bnd = `NWProbe${Date.now()}${colId}`;
        const CRLF = "\r\n";
        const tp = (n, v) => `--${bnd}${CRLF}Content-Disposition: form-data; name="${n}"${CRLF}${CRLF}${v}${CRLF}`;
        const fileBuf = Buffer.from(tinyPdf, "base64");
        const body = Buffer.concat([
          Buffer.from(tp("workspace", "iKIEtiBE")),
          Buffer.from(tp("documentType", colId)),
          Buffer.from(`--${bnd}${CRLF}Content-Disposition: form-data; name="file"; filename="probe.pdf"${CRLF}Content-Type: application/pdf${CRLF}${CRLF}`),
          fileBuf,
          Buffer.from(`${CRLF}--${bnd}--${CRLF}`),
        ]);
        const r = await fetch("https://api.us1.affinda.com/v3/documents", {
          method: "POST",
          headers: { Authorization: `Bearer ${key.trim()}`, "Content-Type": `multipart/form-data; boundary=${bnd}` },
          body,
        });
        const b = await r.json().catch(() => null);
        return { collection: colId, status: r.status, docType: b?.meta?.documentType?.name || b?.data?.documentType || null, error: r.ok ? null : b };
      })
    );

    return res.status(200).json({
      ok: true,
      step: "auth_ok",
      keyInfo,
      workspaceDocTypes: wsDocTypes,
      probeResults,
    });
  } catch (e) {
    return res.status(200).json({ ok: false, step: "fetch", keyInfo, error: e?.message });
  }
}
