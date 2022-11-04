import { Listing } from "../types/domain";
import { Element } from "./element";

export const transformListingRequests = (listings: Listing[]): any[][] =>
  listings.map(transformListingRequest);

export const transformListingRequest = (listing: Listing): any[] => {
  return [
    listing.id,
    `${listing.address.street}, ${listing.address.suburb}`, // Address
    listing.features.beds, // Beds
    listing.features.baths, // Baths
    listing.price, // Advertised Price
    listing.price, // Initial Price
    listing.datePlaced, // Date Listed
    '=INDIRECT("R[0]C[-3]", FALSE)-INDIRECT("R[0]C[-2]",FALSE)',
    // '=DATEDIF(INDIRECT(CONCAT("H", ROW())), IF(ISBLANK(INDIRECT(CONCAT("J", ROW()))),TODAY(),INDIRECT(CONCAT("J", ROW())),"D")', // Days listed
    "=" + Element.DateListed,
  ];
};

export const transformListingResponses = (listings: any[][]): Listing[] =>
  listings.map(transformListingResponse);

export const transformListingResponse = (listing: any[]): Listing => {
  // console.log("transforming", listing);
  return {
    id: Number(listing[0]),
    // address
    // beds
    // baths
    displayPrice: listing[4],
    datePlaced: listing[5],
  } as Listing;
};
