import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1KcG2Fqwt6Fvzw--wCi14Z3X9vRJFXuCt0DelE6UhT8c';

function getSheetClient() {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!saJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
  }

  let creds: any;
  try {
    creds = JSON.parse(saJson);
    if (typeof creds === 'string') creds = JSON.parse(creds);
  } catch {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
  }

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId: SPREADSHEET_ID };
}

async function appendLeadRow(row: any[]) {
  const { sheets, spreadsheetId } = getSheetClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    
    const timestamp = new Date().toISOString();
    const source = body.source || 'Unknown';
    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim();
    const email = (body.email || '').trim();
    const service = (body.service || '').trim();
    const details = (body.details || body.message || '').trim();
    const city = (body.city || '').trim();

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const row = [timestamp, source, name, phone, email, service, details, city];
    
    await appendLeadRow(row);
    
    return res.status(200).json({ ok: true, message: 'Lead submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting lead:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Internal server error' });
  }
}
