export class SheetColumns {
  readonly "Address": string = "";
  readonly "Distance": string = "";
  readonly "Land": string = "";
  readonly "Beds": number = 0;
  readonly "Baths": number = 0;
  readonly "Advertised Price": number = 0;
  readonly "Initial Price": number | undefined = 0;
  readonly "Date Listed": Date = {} as Date;
  readonly "Sold Price": string = "";
  readonly "Date Sold": string = "";
  readonly "Discounting": string = "";
  readonly "Disc. %": string = "";
  readonly "Days Listed": string = "";
  readonly "URL": string = "";
  readonly "Est. Price": string = "";
  readonly "Last Sold Price": number | undefined = 0;
  readonly "Last Sold Date": Date | undefined = {} as Date;
  readonly "Difference": number | undefined = 0;
  readonly "Years Since Sold": number | undefined = 0;
  readonly "CAGR": number | undefined = 0;
  readonly "ID": number = 0;
  readonly "Comments": string = "";
}

export type SheetsListing = [
  SheetColumns["Address"],
  SheetColumns["Distance"],
  SheetColumns["Land"],
  SheetColumns["Beds"],
  SheetColumns["Baths"],
  SheetColumns["Advertised Price"],
  SheetColumns["Initial Price"],
  SheetColumns["Date Listed"],
  SheetColumns["Sold Price"],
  SheetColumns["Date Sold"],
  SheetColumns["Discounting"],
  SheetColumns["Disc. %"],
  SheetColumns["Days Listed"],
  SheetColumns["URL"],
  SheetColumns["Est. Price"],
  SheetColumns["Last Sold Price"],
  SheetColumns["Last Sold Date"],
  SheetColumns["Difference"],
  SheetColumns["Years Since Sold"],
  SheetColumns["CAGR"],
  SheetColumns["ID"],
  SheetColumns["Est. Price"]
];
