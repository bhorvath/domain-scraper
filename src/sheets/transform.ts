import { Listing } from "../types/domain";
import { RawListing, SheetsListing } from "../types/sheets";
import { Element } from "../types/elements";
import {
  AND,
  DATEDIF,
  FORMULA,
  IF,
  ISBLANK,
  ISNUMBER,
  NOT,
  TODAY,
} from "./functions";
import { EnrichedListing } from "../types/enrichment";

export const listingsToRawListings = (listings: Listing[]): RawListing[] =>
  listings.map(listingToRawListing);

const listingToRawListing = (listing: Listing): RawListing => {
  return [
    `${listing.address.street}, ${listing.address.suburb}`, // Address
    "", // Distance
    "", // Land
    String(listing.features.beds), // Beds
    String(listing.features.baths), // Baths
    String(listing.price), // Advertised Price
    "", //  Initial Price
    listing.datePlaced, // Date Listed
    getSoldPrice(listing), // Sold price
    "", // Date sold
    getDiscountFormula(), // Discounting
    getDiscountPercentageFormula(), // Disc. %
    getDaysListedFormula(), // Days Listed
    listing.url, // URL
    getEstPriceFormula(), // Est. Price
    "", // Last Sold Price
    "", // Last Sold Date
    "", // Difference
    "", // Years Since Sold
    "", // CAGR
    String(listing.id), // ID
    listing.status, // Status
    listing.displayPrice, // Display Price
    listing.inspectionDate?.openTime ?? "", // Inspection
    "", // Comments
  ];
};

export const enrichedListingsToRawListings = (
  listings: EnrichedListing[]
): RawListing[] => listings.map(enrichedListingToRawListing);

const enrichedListingToRawListing = (listing: EnrichedListing): RawListing => {
  return [
    `${listing.address.street}, ${listing.address.suburb}`, // Address
    listing.distance, // Distance
    listing.land, // Land
    String(listing.features.beds), // Beds
    String(listing.features.baths), // Baths
    String(listing.price), // Advertised Price
    "", //  Initial Price
    listing.datePlaced, // Date Listed
    getSoldPrice(listing), // Sold price
    "", // Date sold
    getDiscountFormula(), // Discounting
    getDiscountPercentageFormula(), // Disc. %
    getDaysListedFormula(), // Days Listed
    listing.url, // URL
    getEstPriceFormula(), // Est. Price
    "", // Last Sold Price
    "", // Last Sold Date
    "", // Difference
    "", // Years Since Sold
    "", // CAGR
    String(listing.id), // ID
    listing.status, // Status
    listing.displayPrice, // Display Price
    listing.inspectionDate?.openTime ?? "", // Inspection
    "", // Comments
  ];
};

export const sheetsListingsToRawListings = (
  listings: SheetsListing[]
): RawListing[] => listings.map(sheetsListingToRawListing);

export const sheetsListingToRawListing = (
  listing: SheetsListing
): RawListing => {
  return [
    listing.address, // Address
    listing.distance, // Distance
    listing.land, // Land
    String(listing.beds), // Beds
    String(listing.baths), // Baths
    String(listing.advertisedPrice), // Advertised Price
    String(listing.initialPrice), //  Initial Price
    listing.dateListed, // Date Listed
    String(listing.soldPrice), // Sold price
    listing.dateSold, // Date sold
    listing.discounting, // Discounting
    listing.discountPercentage, // Disc. %
    listing.daysListed, // Days Listed
    listing.url, // URL
    listing.estimatedPrice, // Est. Price
    String(listing.lastSoldPrice), // Last Sold Price
    listing.lastSoldDate ?? "", // Last Sold Date
    "", // Difference
    "", // Years Since Sold
    "", // CAGR
    String(listing.id), // ID
    listing.status, // Status
    listing.displayPrice, // Display Price
    listing.inspection, // Inspection
    "", // Comments
  ];
};

const getDiscountFormula = (): string =>
  FORMULA(
    IF(
      AND(
        NOT(ISNUMBER(Element.AdvertisedPrice)),
        NOT(ISNUMBER(Element.InitialPrice))
      ),
      "",
      IF(
        NOT(ISNUMBER(Element.SoldPrice)),
        IF(
          ISBLANK(Element.InitialPrice),
          "",
          `(${Element.InitialPrice}-${Element.AdvertisedPrice})`
        ),
        `${IF(
          ISBLANK(Element.InitialPrice),
          Element.AdvertisedPrice,
          Element.InitialPrice
        )}-${Element.SoldPrice}`
      )
    )
  );

const getDiscountPercentageFormula = (): string =>
  FORMULA(
    IF(
      AND(
        NOT(ISNUMBER(Element.AdvertisedPrice)),
        NOT(ISNUMBER(Element.InitialPrice))
      ),
      "",
      IF(
        ISBLANK(Element.Discounting),
        "",
        `${Element.Discounting}/${IF(
          ISBLANK(Element.InitialPrice),
          Element.AdvertisedPrice,
          Element.InitialPrice
        )}`
      )
    )
  );

const getDaysListedFormula = (): string =>
  FORMULA(
    DATEDIF(
      Element.DateListed,
      IF(ISBLANK(Element.DateSold), TODAY(), Element.DateSold)
    )
  );

const getEstPriceFormula = (): string =>
  FORMULA(
    IF(
      NOT(ISNUMBER(Element.SoldPrice)),
      Element.AdvertisedPrice,
      Element.SoldPrice
    )
  );

const getSoldPrice = (listing: Listing) => {
  // Only return sold price if the listing has sold
  if (listing.listingType !== "sold") {
    return "";
  }

  // Remove prefix
  const cleanPrice = listing.displayPrice.replace(/SOLD - /, "");

  return cleanPrice;
};

export const rawListingsToSheetsListings = (
  listings: RawListing[]
): SheetsListing[] => {
  let position = 1;
  return listings.map((listing) => {
    return rawListingToSheetsListing(listing, position++);
  });
};

const rawListingToSheetsListing = (
  listing: RawListing,
  position: number
): SheetsListing => {
  // console.log("transforming", listing);
  return {
    position,
    address: listing[0],
    distance: listing[1],
    land: listing[2],
    beds: Number(listing[3]),
    baths: Number(listing[4]),
    advertisedPrice: cleanPrice(listing[5]),
    initialPrice: cleanPrice(listing[6]),
    dateListed: listing[7],
    soldPrice: listing[8],
    dateSold: listing[9],
    discounting: listing[10],
    discountPercentage: listing[11],
    daysListed: listing[12],
    url: listing[13],
    estimatedPrice: listing[14],
    lastSoldPrice: listing[15],
    lastSoldDate: listing[16],
    difference: Number(listing[17]),
    yearsSinceSold: Number(listing[18]),
    cagr: Number(listing[19]),
    id: Number(listing[20]),
    status: listing[21],
    displayPrice: listing[22],
    inspection: listing[23],
    comments: listing[24],
  };
};

const cleanPrice = (dirtyPrice: string): number =>
  Number(dirtyPrice.replace(/\.00$|\D/g, ""));
