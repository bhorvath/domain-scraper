import * as dotenv from "dotenv";
import { getShortlistListings } from "./domain";
import { ListingSearchCriteria } from "./types/domain";

dotenv.config();

const getDomainAuthToken = (): string => {
  const authToken = process.env.DOMAIN_AUTH_TOKEN;

  if (!authToken) {
    throw new Error("Could not find Domain auth token");
  }

  return authToken;
};

(async () => {
  const domainAuthToken = getDomainAuthToken();

  const searchCriteria: ListingSearchCriteria = {
    address: {
      suburb: "",
    },
  };

  const listings = await getShortlistListings(domainAuthToken, searchCriteria);
  console.log(listings);
})();
