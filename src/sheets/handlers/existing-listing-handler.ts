import { format, isEqual } from "date-fns";
import { Listing } from "../../types/domain";
import { ElementPosition } from "../../types/elements";
import { SheetsListing } from "../../types/sheets";
import { TextFormat } from "../../types/text-format";
import { SheetsApi } from "../api";
import { sheetsListingToRawListing } from "../transform";
import { CommentHandler } from "./comment-handler";
import { HistoryHandler } from "./history-handler";
import { TextFormatHandler } from "./text-format-handler";

type QueueItem = {
  persistedListing: SheetsListing;
  currentListing: Listing;
};

export class ExistingListingHandler {
  private queue: QueueItem[] = [];
  private commentHandler: CommentHandler;
  private historyHandler: HistoryHandler;
  private textFormatHandler: TextFormatHandler;

  constructor(private api: SheetsApi) {
    this.commentHandler = new CommentHandler(api);
    this.historyHandler = new HistoryHandler(api);
    this.textFormatHandler = new TextFormatHandler(api);
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
    const listingsToUpdate: Set<SheetsListing> = new Set();

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
        !isEqual(
          new Date(persistedListing.inspection),
          new Date(currentListing.inspectionDate.openTime)
        )
      ) {
        this.handleNewInspectionTime(item);
        listingRequiresUpdate = true;
      }

      if (listingRequiresUpdate) {
        listingsToUpdate.add(persistedListing);
      }

      // Display Price
      if (persistedListing.displayPrice !== currentListing.displayPrice) {
        this.handleDisplayPriceChange(item);
        listingRequiresUpdate = true;
      }

      if (listingRequiresUpdate) {
        listingsToUpdate.add(persistedListing);
      }

      // Status
      if (persistedListing.status !== currentListing.status) {
        this.handleStatusChange(item);
        listingRequiresUpdate = true;
      }

      if (listingRequiresUpdate) {
        listingsToUpdate.add(persistedListing);
      }
    }

    if (listingsToUpdate.size > 0) {
      console.info(`Writing ${listingsToUpdate.size} modified listings`);
      await this.writeListings(Array.from(listingsToUpdate));
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
    this.addHistory(
      item.persistedListing.address,
      description,
      this.formatPrice(item.persistedListing.advertisedPrice)
    );

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
    this.addHistory(item.persistedListing.address, description);

    item.persistedListing.inspection =
      item.currentListing.inspectionDate?.openTime ?? "";
  }

  private handleDisplayPriceChange(item: QueueItem) {
    console.info(`Display price changed for ${item.persistedListing.address}`);

    const description = `Display Price: ${item.currentListing.displayPrice}`;
    this.addHistory(
      item.persistedListing.address,
      description,
      item.persistedListing.displayPrice
    );

    item.persistedListing.displayPrice = item.currentListing.displayPrice;
  }

  private handleStatusChange(item: QueueItem) {
    console.info(`Status changed for ${item.persistedListing.address}`);

    let description = "";
    switch (item.currentListing.status) {
      case "sold":
        const cleanPrice = item.currentListing.displayPrice.replace(
          /SOLD - /,
          ""
        );
        description = `Sold: ${cleanPrice}`;
        item.persistedListing.soldPrice = cleanPrice;
        // item.persistedListing.dateSold = format(Date.now(), "dd/MM/yyyy");
        this.textFormatHandler.queuePendingTextFormat(
          ElementPosition.Address,
          item.persistedListing.position,
          TextFormat.Strikethrough
        );
        break;
      case "archived":
        description = `Removed`;
        this.textFormatHandler.queuePendingTextFormat(
          ElementPosition.Address,
          item.persistedListing.position,
          TextFormat.Strikethrough
        );
        break;
      default:
        description = `Status: ${item.currentListing.status}`;
    }

    this.addComment(item.persistedListing.position, description);
    this.addHistory(
      item.persistedListing.address,
      description,
      item.persistedListing.status
    );

    item.persistedListing.status = item.currentListing.status;
  }

  private addComment(position: number, description: string): void {
    this.commentHandler.queuePendingComment(
      ElementPosition.Address,
      position,
      `${format(Date.now(), "dd/MM/yyyy")} - ${description}`
    );
  }

  private addHistory(
    address: string,
    description: string,
    previousValue?: string
  ): void {
    this.historyHandler.queuePendingHistory(
      address,
      description,
      previousValue
    );
  }

  private async writeListings(listings: SheetsListing[]): Promise<void> {
    const mappedListings = new Map(
      listings.map((listing) => [
        listing.position,
        sheetsListingToRawListing(listing),
      ])
    );
    await this.api.updateListings(mappedListings);
    await this.commentHandler.writePendingComments();
    await this.historyHandler.writePendingHistory();
    await this.textFormatHandler.writePendingTextFormat();
  }

  /**
   * Clears the existing listings queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
