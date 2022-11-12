import * as dotenv from "dotenv";
import { getShortlistListings } from "./domain";
import { ListingFilterCriteria } from "./types/domain";
import { authoriseSheets } from "./sheets/auth";
import { Sheets } from "./sheets/sheets";

dotenv.config();

const getDomainAuthToken = (): string => {
  const authToken = process.env.DOMAIN_AUTH_TOKEN;

  if (!authToken) {
    throw new Error("Could not find Domain auth token");
  }

  return authToken;
};

const getSheetsSpreadsheetId = (): string => {
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error("Could not find Sheets spreadsheet ID");
  }

  return spreadsheetId;
};

const getSheetsMainSheetName = (): string => {
  const spreadsheetId = process.env.SHEETS_MAIN_SHEET_NAME;

  if (!spreadsheetId) {
    throw new Error("Could not find Sheets main sheet name");
  }

  return spreadsheetId;
};

(async () => {
  const domainAuthToken = getDomainAuthToken();
  const sheetsSpreadsheetId = getSheetsSpreadsheetId();
  const sheetsMainSheetName = getSheetsMainSheetName();

  const filterCriteria: ListingFilterCriteria = {
    listingType: "buy",
    // address: {
    //   street: "21 Aster Court",
    // },
    features: {
      beds: 4,
      baths: 3,
    },
  };

  const listings = await getShortlistListings(domainAuthToken, filterCriteria);
  console.info(`Found ${listings.length} shortlisted properties`);
  // console.debug("listing", listings[0]);

  try {
    const auth = await authoriseSheets();

    const config = {
      spreadsheetId: sheetsSpreadsheetId,
      mainSheetName: sheetsMainSheetName,
    };
    const sheets = new Sheets(auth, config);
    await sheets.updateListings(listings);
  } catch (e) {
    console.error(e);
  }
})();
