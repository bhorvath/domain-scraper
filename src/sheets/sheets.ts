import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { Listing } from "../types/domain";
import { SheetColumns, SheetsListing } from "../types/sheets";
import { SheetsApi } from "./api";
import {
  transformToSheetsListings,
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

    // If there are currently no persisted listings then add in a header as the
    // first listing
    if (!persistedListings.length) {
      await this.api.writeListings([await this.getHeader()]);
    }

    console.info(`Writing ${modifiedListings.add.length} new listings`);
    await this.addListings(modifiedListings.add);
  }

  private getHeader(): SheetsListing {
    return Object.keys(new SheetColumns()) as SheetsListing;
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
  ): ListingsToModify {
    const listingsToModify: ListingsToModify = {
      add: [],
      update: [],
    };
    const mappedPersistedListings = this.mapListings(persistedListings);

    currentListings.forEach((listing) => {
      const persistedListing = mappedPersistedListings.get(listing.id);
      if (!persistedListing) {
        listingsToModify.add.push(listing);
      } else {
        // listingsToModify.update.push(listing);
      }
    });

    return listingsToModify;
  }

  private mapListings(listings: Listing[]): Map<number, Listing> {
    return new Map(listings.map((listing) => [listing.id, listing]));
  }

  private async addListings(listings: Listing[]) {
    const listingsToWrite = transformToSheetsListings(listings);
    await this.api.writeListings(listingsToWrite);
  }
}
