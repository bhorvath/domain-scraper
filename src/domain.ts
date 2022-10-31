import axios, { AxiosResponse } from "axios";
import { load } from "cheerio";
import { Listing, ListingSearchCriteria } from "./types/domain";

const shortlistUrl = "https://www.domain.com.au/user/shortlist";

export const getShortlistListings = async (
  authToken: string,
  searchCriteria?: ListingSearchCriteria
) => {
  const page = await getPage(authToken);
  const data = extractData(page);
  const parsedData = parseData(data);
  const listings = extractListings(parsedData);
  const result = search(listings, searchCriteria);
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

// TODO: Implement search
const search = (
  listings: Listing[],
  searchCriteria?: ListingSearchCriteria
): Listing[] => {
  return listings;
};

const hasChildren = (obj: object): boolean => {
  return !!Object.keys(obj).length;
};

const cleanse = (listings: Listing[]): any[] => {
  return listings.map(
    ({ cardImageUrl, headerImageUrl, images, ...item }) => item
  );
};
