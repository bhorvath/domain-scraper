import { PendingComment } from "../../types/comments";
import { ElementPosition } from "../../types/elements";
import { SheetsApi } from "../api";

export class CommentHandler {
  private pendingCommentsQueue: PendingComment[] = [];

  constructor(private api: SheetsApi) {}

  /**
   * Queues a pending comment to be added to the sheet.
   */
  public queuePendingComment(
    column: ElementPosition,
    row: number,
    comment: string
  ): void {
    this.pendingCommentsQueue.push({ column, row, comment });
  }

  /**
   * Writes any queued pending comments to the sheet.
   */
  public async writePendingComments(): Promise<void> {
    const updatedComments: PendingComment[] = await Promise.all(
      this.pendingCommentsQueue.map(async (pendingComment) => ({
        column: pendingComment.column,
        row: pendingComment.row,
        comment: await this.appendComment(pendingComment),
      }))
    );
    this.api.insertComments(updatedComments);
  }

  /**
   * Retrieves any existing comments and returns these with the new comment appended.
   */
  private async appendComment(pendingComment: PendingComment) {
    const existingComments = await this.api.getNotes(pendingComment.row);
    // If there's an existing comment then append the new comment,
    // otherwise just use the new comment.
    const newComments = existingComments
      ? `${existingComments}\n${pendingComment.comment}`
      : pendingComment.comment;

    return newComments;
  }

  /**
   * Clears the pending comment queue.
   */
  public clearQueue(): void {
    this.pendingCommentsQueue = [];
  }
}
