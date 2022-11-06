import { Listing } from "../types/domain";
import { SheetsListing } from "../types/sheets";
import { Element } from "./element";
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

export const transformToSheetsListings = (
  listings: Listing[]
): SheetsListing[] => listings.map(transformToSheetsListing);

export const transformToSheetsListing = (listing: Listing): SheetsListing => {
  return [
    `${listing.address.street}, ${listing.address.suburb}`, // Address
    "", // Distance
    "", // Land
    listing.features.beds, // Beds
    listing.features.baths, // Baths
    listing.price, // Advertised Price
    undefined, //  Price
    listing.datePlaced, // Date Listed
    getSoldPrice(listing), // Sold price
    "", // Date sold
    getDiscountFormula(), // Discounting
    getDiscountPercentageFormula(), // Disc. %
    getDaysListedFormula(), // Days Listed
    listing.url, // URL
    getEstPriceFormula(), // Est. Price
    undefined, // Last Sold Price
    undefined, // Last Sold Date
    undefined, // Difference
    undefined, // Years Since Sold
    undefined, // CAGR
    listing.id, // ID
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

export const transformListingResponses = (
  listings: SheetsListing[]
): Listing[] => listings.map(transformListingResponse);

export const transformListingResponse = (listing: SheetsListing): Listing => {
  // console.log("transforming", listing);
  const addressComponents = listing[0].split(/, /);
  return {
    address: {
      street: addressComponents[0],
      suburb: addressComponents[1],
    },
    price: listing[5],
    id: Number(listing[20]),
  } as Listing;
};
