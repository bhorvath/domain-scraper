import { ListingStatus } from "../types/domain";

export const cleanStatus = (
  dirtyStatus: ListingStatus
): Exclude<ListingStatus, "recentlyUpdated"> => {
  if (dirtyStatus === "recentlyUpdated") {
    return "live";
  }

  return dirtyStatus;
};
