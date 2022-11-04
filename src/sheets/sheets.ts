import { OAuth2Client } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";
import { Listing } from "../types/domain";
import { SheetsApi } from "./api";
import {
  transformListingRequests,
  transformListingResponses,
} from "./transform";

type ListingsToModify = {
  add: Listing[];
  update: Listing[];
};

export class Sheets {
  private api: SheetsApi;

  constructor(auth: OAuth2Client, spreadsheetId: string) {
    const sheets = google.sheets({ version: "v4", auth });
    this.api = new SheetsApi(sheets, spreadsheetId);
  }

  public async updateListings(listings: Listing[]) {
    const persistedListings = await this.getListings();
    const modifiedListings = this.findModifiedListings(
      persistedListings,
      listings
    );
    // listings.forEach(async (listing) => {
    //   await this.writeListing(listing);
    // });
    await this.addListings(modifiedListings.add);
  }

  private async getListings() {
    return await this.api.readListings().then(transformListingResponses);
  }

  private findModifiedListings(
    persistedListings: Listing[],
    currentListings: Listing[]
  ): ListingsToModify {
    const listingsToModify: ListingsToModify = {
      add: [],
      update: [],
    };
    const mappedPersistedListings = this.mapListings(persistedListings);

    currentListings.forEach((listing) => {
      const persistedListing = mappedPersistedListings.get(listing.id);
      // console.log("persistedListing", persistedListing);
      if (!persistedListing) {
        listingsToModify.add.push(listing);
      } else {
        // listingsToModify.update.push(listing);
      }
    });

    console.log("new", listingsToModify.add.length);

    return listingsToModify;
  }

  private mapListings(listings: Listing[]): Map<number, Listing> {
    return new Map(listings.map((listing) => [listing.id, listing]));
  }

  private async addListings(listings: Listing[]) {
    const w = transformListingRequests(listings);
    console.log("listings to write", w.length);
    await this.api.writeListings(w);
  }
}
