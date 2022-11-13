import { DomainApi } from "../../domain/api";
import { GoogleMapsApi } from "../../google-maps/api";
import { Listing } from "../../types/domain";
import { EnrichedListing } from "../../types/enrichment";

export class EnrichmentHandler {
  constructor(
    private domainApi: DomainApi,
    private googleMapsApi: GoogleMapsApi
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

      ...listing,
    };
  }
}
