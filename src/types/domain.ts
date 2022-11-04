import type { PartialDeep } from "type-fest";

type ListingType = "buy" | "sold" | "rent" | "leased" | "archived";

type ListingStatus =
  | "new"
  | "live"
  | "sold"
  | "leased"
  | "archived" // Removed
  | "recentlyUpdated";

type ListingAddress = {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  isFullAddress: boolean;
};

type ListingFeatures = {
  beds: number;
  baths: number;
  parking: number;
  isRural: boolean;
};

type ListingLocation = {
  latitude: number;
  longtitude: number;
};

type ListingUser = {
  userId: number;
};

type ListingPropertyType = "house" | "apartmentUnitFlat" | "townhouse";

export type Listing = {
  id: number;
  listingType: ListingType;
  isNewDevelopement: boolean;
  status: ListingStatus;
  cardImageUrl: string;
  headerImageUrl: string;
  url: string;
  images: string[];
  address: ListingAddress;
  features: ListingFeatures;
  displayPrice: string;
  price: number;
  auctionDate: Date;
  auctionDateRaw: Date;
  datePlaced: Date;
  dateShortlisted: number;
  geoLocation: ListingLocation;
  notes: string | null;
  rentalApplication: string | null;
  user: ListingUser;
  isArchived: boolean;
  propertyId: string;
  propertyTypes: ListingPropertyType[];
};

export type ListingSearchCriteria = PartialDeep<Listing>;
