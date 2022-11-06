import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { Listing } from "../types/domain";
import { SheetsListing } from "../types/sheets";
import { SheetsApi } from "./api";
import { ExistingListingHandler } from "./handlers/existing-listing-handler";
import { NewListingHandler } from "./handlers/new-listing-handler.ts";
import { SetupHandler } from "./handlers/setup-handler";
import { rawListingsToSheetsListings } from "./transform";

export class Sheets {
  private api: SheetsApi;
  private setupHandler: SetupHandler;
  private newListingHandler: NewListingHandler;
  private existingListingHandler: ExistingListingHandler;

  constructor(auth: OAuth2Client, spreadsheetId: string) {
    const sheets = google.sheets({ version: "v4", auth });
    this.api = new SheetsApi(sheets, spreadsheetId);
    this.setupHandler = new SetupHandler(this.api);
    this.newListingHandler = new NewListingHandler(this.api);
    this.existingListingHandler = new ExistingListingHandler(this.api);
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

    // Update existing listings
    try {
      await this.existingListingHandler.processListings();
    } finally {
      this.existingListingHandler.clearQueue();
    }
  }

  private async getListings(): Promise<SheetsListing[]> {
    return await this.api
      .readListings()
      .then((rawListings) => rawListings ?? [])
      .then(rawListingsToSheetsListings);
  }

  private findModifiedListings(
    persistedListings: SheetsListing[],
    currentListings: Listing[]
  ): void {
    const mappedPersistedListings = this.mapListings(persistedListings);

    currentListings.forEach((listing) => {
      const persistedListing = mappedPersistedListings.get(listing.id);
      if (persistedListing) {
        this.existingListingHandler.queueListing(persistedListing, listing);
      } else {
        this.newListingHandler.queueListing(listing);
      }
    });
  }

  private mapListings(listings: SheetsListing[]): Map<number, SheetsListing> {
    console.log("sheets listing", listings);
    return new Map(listings.map((listing) => [listing.id, listing]));
  }
}
