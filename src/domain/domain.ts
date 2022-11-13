import axios from "axios";
import { load } from "cheerio";
import { Listing, ListingFilterCriteria } from "../types/domain";

const shortlistUrl = "https://www.domain.com.au/user/shortlist";

export const getShortlistListings = async (
  authToken: string,
  filterCriteria?: ListingFilterCriteria
): Promise<Listing[]> => {
  const page = await getPage(authToken);
  const data = extractData(page);
  const parsedData = parseData(data);
  const listings = extractListings(parsedData);
  const result = filter(listings, filterCriteria);
  const clean = cleanse(result);

  return clean;
};

const getPage = async (authToken: string): Promise<string> => {
  const headers = {
    Cookie: `DOMAIN.ASPXFORMSAUTH=${authToken}`,
  };
  const response = await axios.get(shortlistUrl, { headers });

  return response.data;
};

const extractData = (page: string): string => {
  const $ = load(page);
  const data = $("#__NEXT_DATA__").html() ?? "";

  return data;
};

const parseData = (data: string) => {
  const parsedData = JSON.parse(data);

  return parsedData;
};

const extractListings = (data: any): Listing[] => {
  const listings = data.props.pageProps.componentProps.shortlistListings;

  return listings;
};

const filter = (
  listings: Listing[],
  filterCriteria?: ListingFilterCriteria
): Listing[] => {
  if (!filterCriteria) {
    return listings;
  }

  return listings.filter((listing) => matchesCriteria(listing, filterCriteria));
};

const matchesCriteria = (listing: any, filterCriteria: any): boolean => {
  const keys = Object.keys(filterCriteria) as Array<
    keyof ListingFilterCriteria
  >;

  for (const key of keys) {
    const listingValue = listing[key];
    const criteriaValues = filterCriteria[key];
    // Always make sure we get a match on at least one criteria - eg. ["buy", "sold"] must match on
    // one of the two values; ["buy"] must match on the single value.
    let matches = 0;
    if (Array.isArray(criteriaValues)) {
      for (const criteriaValue of criteriaValues) {
        matches = matches + findMatches(listingValue, criteriaValue);
      }
    } else {
      matches = findMatches(listingValue, criteriaValues);
    }
    if (!matches) {
      return false;
    }
  }

  return true;
};

const findMatches = (listingValue: any, criteriaValue: any): number => {
  if (hasChildren(criteriaValue)) {
    // Look deeper if the value is an object
    const deepMatches = matchesCriteria(listingValue, criteriaValue);
    if (deepMatches) {
      return 1;
    }
  } else {
    if (listingValue === criteriaValue) {
      return 1;
    }
  }

  return 0;
};

const hasChildren = (
  obj: ListingFilterCriteria[keyof ListingFilterCriteria]
): boolean => {
  if (!obj) {
    return false;
  }

  return Object(obj) === obj && !!Object.keys(obj).length;
};

const cleanse = (listings: Listing[]): any[] => {
  return listings.map(
    ({ cardImageUrl, headerImageUrl, images, ...item }) => item
  );
};
