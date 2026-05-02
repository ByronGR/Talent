export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const key = process.env.AIRTABLE_KEY || process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE || process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_LOCATION_TABLE || process.env.AIRTABLE_COLOMBIA_TABLE;
  const departmentField = process.env.AIRTABLE_DEPARTMENT_FIELD || 'Departamento';
  const municipalityField = process.env.AIRTABLE_MUNICIPALITY_FIELD || 'Municipio';

  if (!key || !base || !table) {
    return res.status(500).json({ ok: false, error: 'Airtable location credentials are not configured' });
  }

  const records = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`);
    url.searchParams.append('fields[]', departmentField);
    url.searchParams.append('fields[]', municipalityField);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}` }
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ ok: false, error: data.error?.message || 'Airtable error' });
    }

    records.push(...data.records);
    offset = data.offset || null;
  } while (offset);

  const departments = {};
  for (const record of records) {
    const fields = record.fields || {};
    const department = String(fields[departmentField] || '').trim();
    const municipality = String(fields[municipalityField] || '').trim();
    if (!department || !municipality) continue;
    if (!departments[department]) departments[department] = [];
    if (!departments[department].includes(municipality)) departments[department].push(municipality);
  }

  Object.keys(departments).forEach(department => departments[department].sort((a, b) => a.localeCompare(b)));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, departments });
}
