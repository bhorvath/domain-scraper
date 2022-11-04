import * as dotenv from "dotenv";
import { getShortlistListings } from "./domain";
import { ListingSearchCriteria } from "./types/domain";
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

(async () => {
  const domainAuthToken = getDomainAuthToken();
  const sheetsSpreadsheetId = getSheetsSpreadsheetId();

  const searchCriteria: ListingSearchCriteria = {
    address: {
      suburb: "",
    },
  };

  const listings = await getShortlistListings(domainAuthToken, searchCriteria);
  console.info(`Found ${listings.length} shortlisted properties`);

  try {
    const auth = await authoriseSheets();

    const sheets = new Sheets(auth, sheetsSpreadsheetId);
    await sheets.updateListings(listings);
  } catch (e) {
    console.error(e);
  }
})();
