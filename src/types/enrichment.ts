import { Listing } from "./domain";

export type EnrichedListing = Listing & {
  distance: string;
};
