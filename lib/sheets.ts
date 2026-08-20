import { google, sheets_v4 } from "googleapis";
import { config } from "./config";

let authClient: InstanceType<typeof google.auth.GoogleAuth> | null = null;
let sheetsClient: sheets_v4.Sheets | null = null;

function getAuth() {
  if (!authClient) {
    authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.google.serviceAccountEmail(),
        private_key: config.google.serviceAccountPrivateKey(),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return authClient;
}

function getSheets(): sheets_v4.Sheets {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: "v4", auth: getAuth() });
  }
  return sheetsClient;
}

// Sheet names contain spaces/Thai text, so they must be single-quoted in A1-notation ranges.
function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function colToLetter(col1Based: number): string {
  let n = col1Based;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

/** Equivalent of `sheet.getDataRange().getValues()`. */
export async function getSheetValues(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const res = await getSheets().spreadsheets.values.get({
    spreadsheetId,
    range: quoteSheetName(sheetName),
    // UNFORMATTED_VALUE + SERIAL_NUMBER (the default) gives date-formatted
    // cells back as a numeric day-serial rather than a locale string — see
    // lib/date-utils.ts#formatDateCell for why that's what we want here.
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
  });
  return (res.data.values as string[][]) || [];
}

/** Equivalent of `sheet.appendRow(row)`. */
export async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  row: unknown[]
): Promise<void> {
  await getSheets().spreadsheets.values.append({
    spreadsheetId,
    range: quoteSheetName(sheetName),
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/** Equivalent of `sheet.getRange(row, col).setValue(value)` (1-based row/col). */
export async function updateCell(
  spreadsheetId: string,
  sheetName: string,
  row1Based: number,
  col1Based: number,
  value: unknown
): Promise<void> {
  const cell = `${colToLetter(col1Based)}${row1Based}`;
  await getSheets().spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetName(sheetName)}!${cell}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[value]] },
  });
}

/** Equivalent of `sheet.getRange(row, 1, 1, values.length).setValues([values])` (1-based row). */
export async function updateRow(
  spreadsheetId: string,
  sheetName: string,
  row1Based: number,
  values: unknown[]
): Promise<void> {
  const lastCol = colToLetter(values.length);
  await getSheets().spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetName(sheetName)}!A${row1Based}:${lastCol}${row1Based}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

const sheetIdCache = new Map<string, number>();

async function getSheetGid(spreadsheetId: string, sheetName: string): Promise<number> {
  const cacheKey = `${spreadsheetId}:${sheetName}`;
  const cached = sheetIdCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const res = await getSheets().spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets?.find((s) => s.properties?.title === sheetName);
  if (!sheet || sheet.properties?.sheetId == null) {
    throw new Error(`Sheet tab "${sheetName}" not found in spreadsheet ${spreadsheetId}`);
  }
  const gid = sheet.properties.sheetId;
  sheetIdCache.set(cacheKey, gid);
  return gid;
}

/** Equivalent of `sheet.deleteRow(row1Based)`. */
export async function deleteRow(
  spreadsheetId: string,
  sheetName: string,
  row1Based: number
): Promise<void> {
  const sheetId = await getSheetGid(spreadsheetId, sheetName);
  await getSheets().spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: row1Based - 1,
              endIndex: row1Based,
            },
          },
        },
      ],
    },
  });
}

// Tabs are practically never deleted during normal operation, so once we've
// confirmed one exists there's no need to keep re-fetching spreadsheet
// metadata (a slow, whole-spreadsheet call) on every request just to check.
const knownExistingSheets = new Set<string>();

/**
 * Equivalent of the `getOrCreate*Sheet()` pattern in the legacy Apps Script:
 * creates the tab if it doesn't exist yet, then (only on creation) seeds it via `seedRows`.
 */
export async function ensureSheetExists(
  spreadsheetId: string,
  sheetName: string,
  seedRows?: unknown[][]
): Promise<void> {
  const cacheKey = `${spreadsheetId}:${sheetName}`;
  if (knownExistingSheets.has(cacheKey)) return;

  const res = await getSheets().spreadsheets.get({ spreadsheetId });
  const exists = res.data.sheets?.some((s) => s.properties?.title === sheetName);
  if (exists) {
    knownExistingSheets.add(cacheKey);
    return;
  }

  await getSheets().spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetName } } }],
    },
  });

  if (seedRows && seedRows.length > 0) {
    await getSheets().spreadsheets.values.update({
      spreadsheetId,
      range: `${quoteSheetName(sheetName)}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: seedRows },
    });
  }

  knownExistingSheets.add(cacheKey);
}
