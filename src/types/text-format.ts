import { ElementPosition } from "./elements";

export type PendingTextFormat = {
  column: ElementPosition;
  row: number;
  format: TextFormat;
};

export enum TextFormat {
  Strikethrough,
}
