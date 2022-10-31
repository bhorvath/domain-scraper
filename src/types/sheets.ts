import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
export async function listMajors(auth: OAuth2Client, spreadsheetId: string) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Buy!A2:E",
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log("No data found.");
    return;
  }
  console.log("Name, Major:");
  rows.forEach((row) => {
    // Print columns A and E, which correspond to indices 0 and 4.
    console.log(`${row[0]}, ${row[4]}`);
  });
}
