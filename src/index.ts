import * as dotenv from "dotenv";
import { getShortlistListings } from "./domain/domain";
import { ListingFilterCriteria } from "./types/domain";
import { authoriseSheets } from "./sheets/auth";
import { Sheets } from "./sheets/sheets";
import { GoogleMapsApi } from "./google-maps/api";
import { DomainApi } from "./domain/api";

dotenv.config();

const getDomainAuthToken = (): string => {
  const authToken = process.env.DOMAIN_AUTH_TOKEN;

  if (!authToken) {
    throw new Error("Could not find Domain auth token");
  }

  return authToken;
};

const getDomainApiKey = (): string => {
  const key = process.env.DOMAIN_API_KEY;

  if (!key) {
    throw new Error("Could not find Domain API key");
  }

  return key;
};

const getDomainConfig = () => {
  return {
    key: getDomainApiKey(),
  };
};

const getGoogleMapsKey = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    throw new Error("Could not find Google Maps API key");
  }

  return key;
};

const getOriginAddress = () => {
  const key = process.env.ORIGIN_ADDRESS;

  if (!key) {
    throw new Error("Could not find origin address");
  }

  return key;
};
const getGoogleMapsConfig = () => {
  return {
    key: getGoogleMapsKey(),
    originAddress: getOriginAddress(),
  };
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
  const domainConfig = getDomainConfig();
  const googleMapsConfig = getGoogleMapsConfig();
  const sheetsConfig = getSheetsConfig();

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

    const sheets = new Sheets(
      auth,
      sheetsConfig,
      domainConfig,
      googleMapsConfig
    );
    await sheets.updateListings(listings);
  } catch (e) {
    console.error(e);
  }
})();
