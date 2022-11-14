import { format } from "date-fns";
import { Listing } from "../../types/domain";
import { ElementPosition } from "../../types/elements";
import { SheetsListing } from "../../types/sheets";
import { SheetsApi } from "../api";
import { sheetsListingToRawListing } from "../transform";
import { CommentHandler } from "./comment-handler";
import { HistoryHandler } from "./history-handler";

type QueueItem = {
  persistedListing: SheetsListing;
  currentListing: Listing;
};

export class ExistingListingHandler {
  private queue: QueueItem[] = [];
  private commentHandler: CommentHandler;
  private historyHandler: HistoryHandler;

  constructor(private api: SheetsApi) {
    this.commentHandler = new CommentHandler(api);
    this.historyHandler = new HistoryHandler(api);
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

      // Price
      if (persistedListing.advertisedPrice !== currentListing.price) {
        this.handlePriceChange(item);
        listingRequiresUpdate = true;
      }

      // Inspection time (only add history if new value is not null)
      if (
        currentListing.inspectionDate &&
        persistedListing.inspection !== currentListing.inspectionDate.openTime
      ) {
        this.handleNewInspectionTime(item);
        listingRequiresUpdate = true;
      }

      if (listingRequiresUpdate) {
        listingsToUpdate.push(persistedListing);
      }

      // Display Price
      if (persistedListing.displayPrice !== currentListing.displayPrice) {
        this.handleDisplayPriceChange(item);
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

    const description = `Price: ${this.formatPrice(item.currentListing.price)}`;
    this.addComment(item.persistedListing.position, description);
    this.addHistory(item.persistedListing.address, description);

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

  private handleNewInspectionTime(item: QueueItem) {
    console.info(`New inspection time for ${item.persistedListing.address}`);

    const description = `Inspection time: ${item.currentListing.inspectionDate?.openTime}`;
    this.addComment(item.persistedListing.position, description);
    this.addHistory(item.persistedListing.address, description);

    item.persistedListing.inspection =
      item.currentListing.inspectionDate?.openTime ?? "";
  }

  private handleDisplayPriceChange(item: QueueItem) {
    console.info(`Display price changed for ${item.persistedListing.address}`);

    const description = `Display Price: ${item.currentListing.displayPrice}`;
    this.addComment(item.persistedListing.position, description);
    this.addHistory(item.persistedListing.address, description);

    item.persistedListing.displayPrice = item.currentListing.displayPrice;
  }

  private addComment(position: number, description: string): void {
    this.commentHandler.queuePendingComment(
      ElementPosition.Address,
      position,
      `${format(Date.now(), "dd/MM/yyyy")} - ${description}`
    );
  }

  private addHistory(address: string, description: string): void {
    this.historyHandler.queuePendingHistory(address, description);
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
    this.historyHandler.writePendingHistory();
  }

  /**
   * Clears the existing listings queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
