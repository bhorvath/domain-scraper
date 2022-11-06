export type SheetsListing = {
  position: number;
  address: string;
  distance: string;
  land: string;
  beds: number;
  baths: number;
  advertisedPrice: number;
  initialPrice: number | undefined;
  dateListed: Date;
  soldPrice: string;
  dateSold: string;
  discounting: string;
  discountPercentage: string;
  daysListed: string;
  url: string;
  estimatedPrice: string;
  lastSoldPrice: number | undefined;
  lastSoldDate: Date | undefined;
  difference: number | undefined;
  yearsSinceSold: number | undefined;
  cagr: number | undefined;
  id: number;
  comments: string;
};

export type RawListing = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];
