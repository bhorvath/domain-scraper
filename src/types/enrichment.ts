import { Listing } from "./domain";

export type EnrichedListing = Listing & {
  land: string;
  distance: string;
};
