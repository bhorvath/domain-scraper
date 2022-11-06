import { SheetsListing } from "../../types/sheets";
import { SheetsApi } from "../api";

type PendingComment = {
  column: Element;
  comment: string;
};

export class CommentHandler {
  private pendingCommentsQueue: PendingComment[] = [];

  constructor(private api: SheetsApi) {}

  /**
   * Queues a pending comment to be added to the sheet.
   */
  public queuePendingComment(column: Element, comment: string): void {
    this.pendingCommentsQueue.push({ column, comment });
  }

  /**
   * Writes any queued pending comments to the sheet.
   */
  public async writePendingComments(): Promise<void> {}

  /**
   * Clears the pending comment queue.
   */
  public clearQueue(): void {
    this.pendingCommentsQueue = [];
  }
}
