import { Listing } from "../../types/domain";
import { SheetsApi } from "../api";
import { listingsToRawListings } from "../transform";

export class NewListingHandler {
  private queue: Listing[] = [];

  constructor(private api: SheetsApi) {}

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
    console.info(`Writing ${this.queue.length} new listings`);
    const listingsToWrite = listingsToRawListings(this.queue);
    await this.api.writeListings(listingsToWrite);
  }

  /**
   * Clears the new listings queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
