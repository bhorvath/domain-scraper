import { Listing } from "../../types/domain";
import { SheetsListing } from "../../types/sheets";
import { SheetsApi } from "../api";
import { sheetsListingToRawListing } from "../transform";
import { CommentHandler } from "./comment-handler";

type QueueItem = {
  persistedListing: SheetsListing;
  currentListing: Listing;
};

export class ExistingListingHandler {
  private queue: QueueItem[] = [];
  private commentHandler: CommentHandler;

  constructor(private api: SheetsApi) {
    this.commentHandler = new CommentHandler(api);
  }

  /**
   * Queues an existing listing to potentially be updated in the sheet.
   */
  public queueListing(
    persistedListing: SheetsListing,
    currentListing: Listing
  ): void {
    this.queue.push({ persistedListing, currentListing });
  }

  /**
   * Processes existing listings. Check for changes and update as needed.
   */
  public async processListings(): Promise<void> {
    const listingsToUpdate: SheetsListing[] = [];

    for (const item of this.queue) {
      const persistedListing = item.persistedListing;
      const currentListing = item.currentListing;
      let listingRequiresUpdate = false;

      if (persistedListing.advertisedPrice !== currentListing.price) {
        this.handlePriceChange(item);
        listingRequiresUpdate = true;
      }

      if (listingRequiresUpdate) {
        listingsToUpdate.push(persistedListing);
      }
    }

    if (listingsToUpdate.length > 0) {
      await this.writeListings(listingsToUpdate);
    }
  }

  private handlePriceChange(item: QueueItem) {
    console.info(`Price changed for ${item.persistedListing.address}`);

    // If the persisted listing doesn't have an `Initial Price` set then this
    // is the first price change - copy `Advertised Price` to `Initial Price`
    if (!item.persistedListing.initialPrice) {
      item.persistedListing.initialPrice =
        item.persistedListing.advertisedPrice;
    }

    // Update the listing price
    item.persistedListing.advertisedPrice = item.currentListing.price;
  }

  private async writeListings(listings: SheetsListing[]): Promise<void> {
    const mappedListings = new Map(
      listings.map((listing) => [
        listing.position,
        sheetsListingToRawListing(listing),
      ])
    );
    await this.api.updateListings(mappedListings);
  }

  /**
   * Clears the existing listings queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
