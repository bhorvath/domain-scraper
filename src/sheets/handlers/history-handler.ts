import { format } from "date-fns";
import { PendingHistory } from "../../types/history";
import { RawHistory } from "../../types/sheets";
import { SheetsApi } from "../api";

export class HistoryHandler {
  private queue: PendingHistory[] = [];

  constructor(private api: SheetsApi) {}

  /**
   * Queues a pending history item to be added to the sheet.
   */
  public queuePendingHistory(address: string, description: string): void {
    this.queue.push({ date: Date.now(), address, description });
  }

  /**
   * Writes any queued pending history items to the sheet.
   */
  public async writePendingHistory(): Promise<void> {
    const rawHistory = this.api.insertHistory(
      this.pendingHistoryToRawHistory(this.queue)
    );
  }

  private pendingHistoryToRawHistory(
    pendingHistory: PendingHistory[]
  ): RawHistory[] {
    return pendingHistory.map((history) => [
      format(history.date, "dd/MM/yyyy HH:mm:ss"),
      history.address,
      history.description,
    ]);
  }

  /**
   * Clears the pending history queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
