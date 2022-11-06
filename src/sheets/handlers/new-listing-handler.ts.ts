import { Listing } from "../../types/domain";
import { SheetsApi } from "../api";
import { transformToSheetsListings } from "../transform";

export class NewListingHandler {
  private newListingsQueue: Listing[] = [];

  constructor(private api: SheetsApi) {}

  /**
   * Queues a new listing to be added to the sheet.
   */
  public queueNewListing(listing: Listing): void {
    this.newListingsQueue.push(listing);
  }

  /**
   * Writes any queued new listings to the sheet.
   */
  public async writeListings(): Promise<void> {
    console.info(`Writing ${this.newListingsQueue.length} new listings`);
    const listingsToWrite = transformToSheetsListings(this.newListingsQueue);
    await this.api.writeListings(listingsToWrite);
  }

  /**
   * Clears the new listings queue.
   */
  public clearQueue(): void {
    this.newListingsQueue = [];
  }
}
