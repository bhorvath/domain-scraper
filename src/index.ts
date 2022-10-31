import * as dotenv from "dotenv";
import { getShortlistListings } from "./domain";
import { ListingSearchCriteria } from "./types/domain";
import { authoriseSheets } from "./types/sheets/auth";
import { listMajors } from "./types/sheets";
import { OAuth2Client } from "google-auth-library";

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
  // const domainAuthToken = getDomainAuthToken();
  const sheetsSpreadsheetId = getSheetsSpreadsheetId();

  // const searchCriteria: ListingSearchCriteria = {
  //   address: {
  //     suburb: "",
  //   },
  // };

  // const listings = await getShortlistListings(domainAuthToken, searchCriteria);
  // console.log(listings);

  authoriseSheets()
    .then((auth: OAuth2Client) => listMajors(auth, sheetsSpreadsheetId))
    .catch(console.error);
})();
