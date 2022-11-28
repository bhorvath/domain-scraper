import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { DomainApi, DomainApiConfig } from "../domain/api";
import { GoogleMapsApi, GoogleMapsApiConfig } from "../google-maps/api";
import { Listing } from "../types/domain";
import { SheetsListing } from "../types/sheets";
import { SheetsApi, SheetsApiConfig } from "./api";
import {
  EnrichmentHandler,
  EnrichmentHandlerConfig,
} from "./handlers/enrichment-handler";
import { ExistingListingHandler } from "./handlers/existing-listing-handler";
import { NewListingHandler } from "./handlers/new-listing-handler.ts";
import { SetupHandler } from "./handlers/setup-handler";
import { rawListingsToSheetsListings } from "./transform";

export class Sheets {
  private sheetsApi: SheetsApi;
  private setupHandler: SetupHandler;
  private newListingHandler: NewListingHandler;
  private existingListingHandler: ExistingListingHandler;

  constructor(
    auth: OAuth2Client,
    sheetsApiConfig: SheetsApiConfig,
    domainApiConfig: DomainApiConfig,
    googleMapsApiConfig: GoogleMapsApiConfig,
    enrichmentHandlerConfig: EnrichmentHandlerConfig
  ) {
    const sheets = google.sheets({ version: "v4", auth });
    this.sheetsApi = new SheetsApi(sheets, sheetsApiConfig);
    this.setupHandler = new SetupHandler(this.sheetsApi);
    const domainApi = new DomainApi(domainApiConfig);
    const mapsApi = new GoogleMapsApi(googleMapsApiConfig);
    const enrichmentHandler = new EnrichmentHandler(
      domainApi,
      mapsApi,
      enrichmentHandlerConfig
    );
    this.newListingHandler = new NewListingHandler(
      this.sheetsApi,
      enrichmentHandler
    );
    this.existingListingHandler = new ExistingListingHandler(this.sheetsApi);
  }

  public async updateListings(listings: Listing[]) {
    const persistedListings = await this.getListings();

    this.findModifiedListings(persistedListings, listings);

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
    return await this.sheetsApi
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
    return new Map(listings.map((listing) => [listing.id, listing]));
  }
}
