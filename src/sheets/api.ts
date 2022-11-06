import { sheets_v4 } from "googleapis";
import { SheetsListing } from "../types/sheets";

export class SheetsApi {
  constructor(
    private sheets: sheets_v4.Sheets,
    private spreadsheetId: string
  ) {}

  public async readListings(): Promise<SheetsListing[] | undefined> {
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Get = {
      spreadsheetId: this.spreadsheetId,
      majorDimension: "ROWS",
      range: "Sheet1",
    };

    const response = (await this.sheets.spreadsheets.values.get(request)).data;

    return response.values as SheetsListing[];
  }

  public async writeListings(listings: any[]) {
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
}
