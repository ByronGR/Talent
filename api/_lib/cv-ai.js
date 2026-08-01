// ── CV extraction via Claude ─────────────────────────────────────────────────
// Used by /api/parse-cv to pre-fill the onboarding form. Replaces Affinda.
//
// KEEP IN SYNC with Admin/src/lib/cv-ai-extract.ts — that file is the source of
// truth for the schema and the rules. Admin parses staff-side and stores the
// full profile; this endpoint only needs the subset the onboarding form fills
// in, so the schema here is deliberately smaller, but the RULES must match or
// the same CV would produce different data depending on which door it came in.

const MODEL = 'claude-sonnet-5';

const SYSTEM = `You extract structured candidate profiles from CVs for a LATAM nearshore staffing company.

Candidates come from every business function — operations, finance, HR, engineering, design, data, customer success, sales, admin and marketing among them. Use the vocabulary of that person's field. Never default to marketing framing.

Rules:
- Extract ONLY what the CV supports. Never invent. Empty string for unknown text.
- Use the document's VISUAL LAYOUT to pair each job title with its correct company and dates — columns and alignment matter on designed CVs.
- Education is schools and degrees, including high-school diplomas and technical qualifications. A Google, DataCamp, AWS or HubSpot credential is a CERTIFICATION, never education. The awarding body decides: a school means education, a certifying organisation means certification.
- SKILLS: be generous and thorough — these decide which openings a candidate is matched to, so a capability left out means a qualified person is never shown for a role they could do. Include skills stated explicitly AND those clearly evidenced by the work described, in any discipline ("reconciled month-end accounts" → reconciliation, financial reporting; "ran onboarding for 40 hires" → onboarding, HR operations; "cut pick times 18%" → process improvement, logistics). Add the capability implied by each tool (NetSuite → accounting, Workday → HR systems, Salesforce → CRM, Figma → product design, Power BI → data visualisation, Klaviyo → email marketing). Evidence in the text is the bar, not the exact phrase.
- Dates as YYYY-MM where determinable, otherwise empty.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'phone', 'city', 'summary', 'skills', 'workHistory', 'languages', 'education', 'certifications'],
  properties: {
    name: { type: 'string' },
    phone: { type: 'string' },
    city: { type: 'string' },
    summary: { type: 'string', description: 'Professional summary, max ~800 characters' },
    skills: { type: 'array', items: { type: 'string' } },
    languages: { type: 'array', items: { type: 'string' }, description: 'e.g. "English (C1)"' },
    education: { type: 'array', items: { type: 'string' }, description: 'One line each: qualification — institution — year' },
    certifications: { type: 'array', items: { type: 'string' }, description: 'One line each: name — issuer — year' },
    workHistory: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['company', 'title', 'from', 'to'],
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          from: { type: 'string', description: 'YYYY-MM' },
          to: { type: 'string', description: 'YYYY-MM, or "present"' },
        },
      },
    },
  },
};

/**
 * Extract a candidate profile from a CV buffer.
 * Returns the same shape the onboarding form has always consumed, so the
 * client-side code does not change when the engine does.
 */
export async function extractCV({ buffer, mimeType, apiKey }) {
  const isPdf = String(mimeType).includes('pdf');

  // PDFs go in whole: Claude reads the page, which is what makes two-column
  // and scanned CVs work. Word documents have no visual layout to preserve.
  const content = [];
  if (isPdf) {
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
    });
    content.push({ type: 'text', text: 'Extract the profile from the attached CV.' });
  } else {
    // .doc/.docx are sent as a document too; Claude handles common formats.
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
    });
    content.push({ type: 'text', text: 'Extract the profile from the attached CV.' });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
      system: SYSTEM,
      thinking: { type: 'disabled' },
      messages: [{ role: 'user', content }],
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Claude returned ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const block = (json.content || []).find((b) => b.type === 'text');
  if (!block?.text) throw new Error('No content returned');

  const p = JSON.parse(block.text);
  return {
    name: p.name || '',
    phone: p.phone || '',
    city: p.city || '',
    summary: (p.summary || '').slice(0, 800),
    skills: p.skills || [],
    workHistory: (p.workHistory || []).filter((w) => w.company || w.title),
    languages: p.languages || [],
    education: p.education || [],
    certifications: p.certifications || [],
    _usage: json.usage,
  };
}
