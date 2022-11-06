import { SheetColumns, SheetsListing } from "../../types/sheets";
import { SheetsApi } from "../api";

export class SetupHandler {
  constructor(private api: SheetsApi) {}

  public async execute() {
    await this.api.writeListings([this.getHeader()]);
  }

  private getHeader(): SheetsListing {
    return Object.keys(new SheetColumns()) as SheetsListing;
  }
}
