import { format } from "date-fns";
import { ElementPosition } from "../../types/elements";
import { RawHistory } from "../../types/sheets";
import { PendingTextFormat, TextFormat } from "../../types/text-format";
import { SheetsApi } from "../api";

export class TextFormatHandler {
  private queue: PendingTextFormat[] = [];

  constructor(private api: SheetsApi) {}

  /**
   * Queues a pending text format to be made to the sheet.
   */
  public queuePendingTextFormat(
    column: ElementPosition,
    row: number,
    format: TextFormat
  ): void {
    this.queue.push({ column, row, format });
  }

  /**
   * Processes any queued pending text formats on the sheet.
   */
  public async writePendingTextFormat(): Promise<void> {
    return this.api.updateTextFormat(this.queue);
  }

  /**
   * Clears the pending history queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }
}
