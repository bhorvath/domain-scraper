import * as dotenv from "dotenv";
import { getShortlistListings } from "./domain/domain";
import { ListingFilterCriteria } from "./types/domain";
import { authoriseSheets } from "./sheets/auth";
import { Sheets } from "./sheets/sheets";
import { GoogleMapsApiConfig } from "./google-maps/api";
import { LatLng } from "spherical-geometry-js";
import { EnrichmentHandlerConfig } from "./sheets/handlers/enrichment-handler";

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

const getOriginLocation = (): LatLng => {
  const latitude = process.env.ORIGIN_LAT;
  const longitude = process.env.ORIGIN_LONG;

  if (!latitude || !longitude) {
    throw new Error("Could not find origin location");
  }

  return new LatLng(latitude, longitude);
};

const getGoogleMapsConfig = (): GoogleMapsApiConfig => {
  return {
    key: getGoogleMapsKey(),
    originLocation: getOriginLocation(),
  };
};

const getEnrichmentHandlerConfig = (): EnrichmentHandlerConfig => {
  return {
    originLocation: getOriginLocation(),
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
  const enrichmentHandlerConfig = getEnrichmentHandlerConfig();

  const filterCriteria: ListingFilterCriteria = {
    listingType: ["buy", "sold"],
    // address: [
    //   {
    //     suburb: "",
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
  console.debug("listing", listings[0]);

  try {
    const auth = await authoriseSheets();

    const sheets = new Sheets(
      auth,
      sheetsConfig,
      domainConfig,
      googleMapsConfig,
      enrichmentHandlerConfig
    );
    await sheets.updateListings(listings);
  } catch (e) {
    console.error(e);
  }
})();
