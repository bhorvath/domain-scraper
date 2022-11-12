import { ElementPosition } from "./elements";

export type PendingComment = {
  column: ElementPosition;
  row: number;
  comment: string;
};
