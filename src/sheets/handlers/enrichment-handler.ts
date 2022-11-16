import { LatLng } from "spherical-geometry-js";
import { DomainApi } from "../../domain/api";
import { GoogleMapsApi } from "../../google-maps/api";
import { Listing } from "../../types/domain";
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
    return Promise.all(listings.map((listing) => this.enrichListing(listing)));
  }

  private async enrichListing(listing: Listing): Promise<EnrichedListing> {
    return {
      land: `${await this.domainApi.getLandSize(listing.propertyId)}m2`,
      distance: await this.googleMapsApi.getDistance(
        `${listing.address.street}, ${listing.address.suburb}`
      ),
      direction: calculateDirection(
        this.config.originLocation.latitude,
        this.config.originLocation.longitude,
        listing.geoLocation.latitude,
        listing.geoLocation.longitude
      ),
      ...listing,
    };
  }
}
