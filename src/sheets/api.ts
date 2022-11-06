import { sheets_v4 } from "googleapis";
import { RawListing, SheetsListing } from "../types/sheets";

export class SheetsApi {
  constructor(
    private sheets: sheets_v4.Sheets,
    private spreadsheetId: string
  ) {}

  public async readListings(): Promise<RawListing[] | null | undefined> {
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Get = {
      spreadsheetId: this.spreadsheetId,
      majorDimension: "ROWS",
      range: "Sheet1",
    };

    const response = (await this.sheets.spreadsheets.values.get(request)).data;

    return response.values as RawListing[] | null | undefined;
  }

  public async writeListings(listings: RawListing[]) {
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
      spreadsheetId: this.spreadsheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        majorDimension: "ROWS",
        values: listings,
      },
    };

    const response = (await this.sheets.spreadsheets.values.append(request))
      .data;
    // console.log("response", response);
  }

  public async updateListings(listings: Map<number, RawListing>) {
    const data = Array.from(listings).map(([row, listing]) => ({
      majorDimension: "ROWS",
      range: `Sheet1!A${row}`,
      values: [listing],
    }));
    console.log("data", data);

    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate = {
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    };

    const response = (
      await this.sheets.spreadsheets.values.batchUpdate(request)
    ).data;
    console.log("update response", response);
  }
}
