type ListingType = "buy" | "sold" | "rent" | "leased" | "archived";

type ListingStatus =
  | "new"
  | "live"
  | "sold"
  | "leased"
  | "archived" // Removed
  | "recentlyUpdated";

export type ListingAddress = {
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

export type ListingLocation = {
  latitude: number;
  longitude: number;
};

type ListingUser = {
  userId: number;
};

type InspectionDate = {
  openTime: string;
  closeTime: string;
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
  datePlaced: string;
  dateShortlisted: number;
  geoLocation: ListingLocation;
  notes: string | null;
  rentalApplication: string | null;
  user: ListingUser;
  inspectionDate: InspectionDate | null;
  isArchived: boolean;
  propertyId: string;
  propertyTypes: ListingPropertyType[];
};

export type ListingFilterCriteria = Partial<{
  id: number[];
  listingType?: ListingType[];
  isNewDevelopement: boolean[];
  status: Partial<ListingStatus>[];
  cardImageUrl: string[];
  headerImageUrl: string[];
  url: string[];
  images: string[][];
  address: Partial<ListingAddress>[];
  features: Partial<ListingFeatures>[];
  displayPrice: string[];
  price: number[];
  auctionDate: Date[];
  auctionDateRaw: Date[];
  datePlaced: string[];
  dateShortlisted: number[];
  geoLocation: Partial<ListingLocation>[];
  notes: string[];
  rentalApplication: string[];
  user: Partial<ListingUser>[];
  inspectionDate: Partial<InspectionDate>[];
  isArchived: boolean[];
  propertyId: string[];
  propertyTypes: Partial<ListingPropertyType>[][];
}>;
