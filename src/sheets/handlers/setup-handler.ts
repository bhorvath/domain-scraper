import { RawListing } from "../../types/sheets";
import { SheetsApi } from "../api";

export class SetupHandler {
  constructor(private api: SheetsApi) {}

  public async execute() {
    await this.api.writeListings([this.getHeader()]);
  }

  private getHeader(): RawListing {
    return [
      "Address",
      "Distance",
      "Land",
      "Beds",
      "Baths",
      "Advertised Price",
      "Initial Price",
      "Date Listed",
      "Sold Price",
      "Date Sold",
      "Discounting",
      "Disc. %",
      "Days Listed",
      "URL",
      "Est. Price",
      "Last Sold Price",
      "Last Sold Date",
      "Difference",
      "Years Since Sold",
      "CAGR",
      "ID",
      "Est. Price",
    ];
  }
}
