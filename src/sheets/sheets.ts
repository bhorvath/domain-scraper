import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { Listing } from "../types/domain";
import { SheetsApi } from "./api";
import { NewListingHandler } from "./handlers/new-listing-handler.ts";
import { SetupHandler } from "./handlers/setup-handler";
import { transformListingResponses } from "./transform";

export class Sheets {
  private api: SheetsApi;
  private setupHandler: SetupHandler;
  private newListingHandler: NewListingHandler;

  constructor(auth: OAuth2Client, spreadsheetId: string) {
    const sheets = google.sheets({ version: "v4", auth });
    this.api = new SheetsApi(sheets, spreadsheetId);
    this.setupHandler = new SetupHandler(this.api);
    this.newListingHandler = new NewListingHandler(this.api);
  }

  public async updateListings(listings: Listing[]) {
    const persistedListings = await this.getListings();

    const modifiedListings = this.findModifiedListings(
      persistedListings,
      listings
    );

    // If there are currently no persisted listings then assume that this is a
    // brand new sheet
    if (!persistedListings.length) {
      await this.setupHandler.execute();
    }

    // Write new listings
    try {
      await this.newListingHandler.writeListings();
    } finally {
      this.newListingHandler.clearQueue();
    }
  }

  private async getListings(): Promise<Listing[]> {
    // console.log("LISTINGS", await this.api.readListings());
    const listings = await this.api.readListings();
    if (listings) {
      return await transformListingResponses(listings);
    } else {
      return [];
    }
  }

  private findModifiedListings(
    persistedListings: Listing[],
    currentListings: Listing[]
  ): void {
    const mappedPersistedListings = this.mapListings(persistedListings);

    currentListings.forEach((listing) => {
      const persistedListing = mappedPersistedListings.get(listing.id);
      if (!persistedListing) {
        this.newListingHandler.queueNewListing(listing);
      } else {
        // listingsToModify.update.push(listing);
      }
    });
  }

  private mapListings(listings: Listing[]): Map<number, Listing> {
    return new Map(listings.map((listing) => [listing.id, listing]));
  }
}
