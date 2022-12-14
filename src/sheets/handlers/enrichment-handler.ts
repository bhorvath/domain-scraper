import { LatLng } from "spherical-geometry-js";
import { DomainApi } from "../../domain/api";
import { GoogleMapsApi } from "../../google-maps/api";
import { Listing, ListingAddress, ListingLocation } from "../../types/domain";
import { EnrichedListing } from "../../types/enrichment";
import { calculateDirection } from "../../utils/bearings";

export type EnrichmentHandlerConfig = {
  originLocation: LatLng;
};

export class EnrichmentHandler {
  constructor(
    private domainApi: DomainApi,
    private googleMapsApi: GoogleMapsApi,
    private config: EnrichmentHandlerConfig
  ) {}

  public enrichListings(listings: Listing[]): Promise<EnrichedListing[]> {
    return Promise.all(
      // Await on each iteration to prevent rate limiting
      listings.map(async (listing) => await this.enrichListing(listing))
    );
  }

  private async enrichListing(listing: Listing): Promise<EnrichedListing> {
    return {
      land: await this.getLandSize(listing.propertyId),
      distance: await this.getDistance(listing.geoLocation),
      direction: this.getDirection(listing.geoLocation),
      ...listing,
    };
  }

  private async getLandSize(propertyId: string): Promise<string> {
    let landSize: string;
    try {
      landSize = String(await this.domainApi.getLandSize(propertyId));
    } catch (error) {
      console.error((error as any).toString());
      landSize = "Error getting land size";
    }

    return landSize;
  }

  private async getDistance(geoLocation: ListingLocation): Promise<string> {
    let distance: string;
    try {
      distance = await this.googleMapsApi.getDistance(geoLocation);
    } catch (error) {
      console.error(error);
      distance = "Error getting distance";
    }

    return distance;
  }

  private getDirection(geoLocation: ListingLocation): string {
    return calculateDirection(
      this.config.originLocation.latitude,
      this.config.originLocation.longitude,
      geoLocation.latitude,
      geoLocation.longitude
    );
  }
}
