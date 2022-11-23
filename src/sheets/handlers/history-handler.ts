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
  public queuePendingHistory(
    address: string,
    description: string,
    previousValue?: string
  ): void {
    const pendingHistory: PendingHistory = {
      date: Date.now(),
      address,
      description,
    };
    if (previousValue) {
      pendingHistory.previousValue = previousValue;
    }
    this.queue.push(pendingHistory);
  }

  /**
   * Writes any queued pending history items to the sheet.
   */
  public async writePendingHistory(): Promise<void> {
    if (!this.queue.length) {
      return;
    }

    return this.api.insertHistory(this.pendingHistoryToRawHistory(this.queue));
  }

  private pendingHistoryToRawHistory(
    pendingHistory: PendingHistory[]
  ): RawHistory[] {
    return pendingHistory.map((history) => [
      format(history.date, "dd/MM/yyyy HH:mm:ss"),
      history.address,
      history.description,
      history.previousValue ?? "",
    ]);
  }

  /**
   * Clears the pending history queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
