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
  const sheetName = process.env.SHEETS_MAIN_SHEET_NAME;

  if (!sheetName) {
    throw new Error("Could not find Sheets main sheet name");
  }

  return sheetName;
};

const getSheetsHistorySheetName = (): string => {
  const sheetName = process.env.SHEETS_HISTORY_SHEET_NAME;

  if (!sheetName) {
    throw new Error("Could not find Sheets history sheet name");
  }

  return sheetName;
};

const getSheetsConfig = () => {
  return {
    spreadsheetId: getSheetsSpreadsheetId(),
    mainSheetName: getSheetsMainSheetName(),
    historySheetName: getSheetsHistorySheetName(),
  };
};

(async () => {
  const domainAuthToken = getDomainAuthToken();

  const filterCriteria: ListingFilterCriteria = {
    listingType: ["buy", "sold"],
    // address: [
    //   {
    //     street: "21 Aster Court",
    //   },
    // ],
    features: [
      {
        beds: 5,
        baths: 3,
      },
    ],
  };

  const listings = await getShortlistListings(domainAuthToken, filterCriteria);
  console.info(`Found ${listings.length} shortlisted properties`);
  // console.debug("listing", listings[0]);

  try {
    const auth = await authoriseSheets();

    const sheets = new Sheets(auth, getSheetsConfig());
    await sheets.updateListings(listings);
  } catch (e) {
    console.error(e);
  }
})();
