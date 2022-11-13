import { GoogleMapsApi } from "../../google-maps/api";
import { Listing } from "../../types/domain";
import { SheetsApi } from "../api";
import { enrichedListingsToRawListings } from "../transform";
import { EnrichmentHandler } from "./enrichment-handler";

export class NewListingHandler {
  private queue: Listing[] = [];

  constructor(
    private api: SheetsApi,
    private enrichmentHandler: EnrichmentHandler
  ) {}

  /**
   * Queues a new listing to be added to the sheet.
   */
  public queueListing(listing: Listing): void {
    this.queue.push(listing);
  }

  /**
   * Writes any queued new listings to the sheet.
   */
  public async writeListings(): Promise<void> {
    if (this.queue.length) {
      console.info(`Writing ${this.queue.length} new listings`);
      const enrichedListings = await this.enrichmentHandler.enrichListings(
        this.queue
      );
      const listingsToWrite = enrichedListingsToRawListings(enrichedListings);
      // console.log("listingsToWrite", listingsToWrite);
      await this.api.writeListings(listingsToWrite);
    } else {
      console.info("No new listings to write");
    }
  }

  /**
   * Clears the new listings queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
