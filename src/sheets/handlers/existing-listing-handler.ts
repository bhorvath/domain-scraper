import { format } from "date-fns";
import { Listing } from "../../types/domain";
import { ElementPosition } from "../../types/elements";
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
      console.info(`Writing ${listingsToUpdate.length} modified listings`);
      await this.writeListings(listingsToUpdate);
    } else {
      console.info("No modified listings to write");
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

    // Add comment with previous price
    this.commentHandler.queuePendingComment(
      ElementPosition.Address,
      item.persistedListing.position,
      `${format(
        Date.now(),
        "dd/MM/yyyy"
      )} - Price updated to ${this.formatPrice(item.currentListing.price)}`
    );

    // Update the listing price
    item.persistedListing.advertisedPrice = item.currentListing.price;
  }

  private formatPrice(price: number): string {
    const formatter = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(price);
  }

  private async writeListings(listings: SheetsListing[]): Promise<void> {
    const mappedListings = new Map(
      listings.map((listing) => [
        listing.position,
        sheetsListingToRawListing(listing),
      ])
    );
    await this.api.updateListings(mappedListings);
    this.commentHandler.writePendingComments();
  }

  /**
   * Clears the existing listings queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
