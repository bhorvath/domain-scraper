export enum ElementPosition {
  Address = "A",
  Distance = "B",
  Land = "C",
  Beds = "D",
  Baths = "E",
}

export enum Element {
  AdvertisedPrice = 'INDIRECT(CONCAT("F",ROW()))',
  InitialPrice = 'INDIRECT(CONCAT("G",ROW()))',
  DateListed = 'INDIRECT(CONCAT("H",ROW()))',
  SoldPrice = 'INDIRECT(CONCAT("I",ROW()))',
  DateSold = 'INDIRECT(CONCAT("J",ROW()))',
  Discounting = 'INDIRECT(CONCAT("K",ROW()))',
}
