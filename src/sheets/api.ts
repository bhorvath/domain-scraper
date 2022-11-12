import { sheets_v4 } from "googleapis";
import { PendingComment } from "../types/comments";
import { RawListing } from "../types/sheets";

export type SheetsApiConfig = {
  spreadsheetId: string;
  mainSheetName: string;
};

export class SheetsApi {
  constructor(
    private sheets: sheets_v4.Sheets,
    private config: SheetsApiConfig
  ) {}

  public async readListings(): Promise<RawListing[] | null | undefined> {
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Get = {
      spreadsheetId: this.config.spreadsheetId,
      majorDimension: "ROWS",
      range: this.config.mainSheetName,
    };

    const response = (await this.sheets.spreadsheets.values.get(request)).data;

    return response.values as RawListing[] | null | undefined;
  }

  public async writeListings(listings: RawListing[]) {
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
      spreadsheetId: this.config.spreadsheetId,
      range: this.config.mainSheetName,
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
      range: `${this.config.mainSheetName}!A${row}`,
      values: [listing],
    }));

    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate = {
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    };

    const response = (
      await this.sheets.spreadsheets.values.batchUpdate(request)
    ).data;
    // console.log("update response", response);
  }

  public async getNotes(row: number): Promise<string> {
    const request: sheets_v4.Params$Resource$Spreadsheets$Get = {
      spreadsheetId: this.config.spreadsheetId,
      ranges: [`${this.config.mainSheetName}!A${row}`],
      includeGridData: true,
    };

    // This is ugly but I don't care. The Google Sheets API makes me cry.
    const response = (await this.sheets.spreadsheets.get(request)).data as any;
    const notes = response?.sheets[0].data[0].rowData[0].values[0].note ?? "";

    return notes;
  }

  public async insertComments(pendingComments: PendingComment[]) {
    const requests: sheets_v4.Schema$Request[] = pendingComments.map(
      (pendingComment) => {
        const charCode = this.positionToIndex(pendingComment.column);

        return {
          updateCells: {
            range: {
              sheetId: 0,
              startRowIndex: pendingComment.row - 1,
              endRowIndex: pendingComment.row,
              startColumnIndex: charCode,
              endColumnIndex: charCode + 1,
            },
            rows: [
              {
                values: [
                  {
                    note: pendingComment.comment,
                  },
                ],
              },
            ],
            fields: "note",
          },
        };
      }
    );
    // console.log("requests", requests);

    const request: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        requests,
      },
    };

    const response = (await this.sheets.spreadsheets.batchUpdate(request)).data;
    // console.log("insert comments response", response);
  }

  private positionToIndex(position: string): number {
    const charCode = position.toUpperCase().charCodeAt(0);
    if (charCode > 64 && charCode < 91) {
      return charCode - 65;
    }

    throw new Error("Invalid position given for comment");
  }
}
