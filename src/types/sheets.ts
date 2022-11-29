export type SheetsListing = {
  position: number;
  address: string;
  distance: string;
  land: string;
  beds: number;
  baths: number;
  advertisedPrice: number;
  initialPrice: number | undefined;
  dateListed: string;
  soldPrice: string;
  dateSold: string;
  discounting: string;
  discountPercentage: string;
  daysListed: string;
  url: string;
  estimatedPrice: string;
  lastSoldPrice: string;
  lastSoldDate: string;
  difference: number | undefined;
  yearsSinceSold: number | undefined;
  cagr: number | undefined;
  id: number;
  status: string;
  direction: string;
  displayPrice: string;
  inspection: string;
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
  string,
  string,
  string,
  string,
  string
];

export type RawHistory = [string, string, string, string, string];
