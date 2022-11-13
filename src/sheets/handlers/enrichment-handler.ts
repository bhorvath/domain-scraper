import { GoogleMapsApi } from "../../google-maps/api";
import { Listing } from "../../types/domain";
import { EnrichedListing } from "../../types/enrichment";

export class EnrichmentHandler {
  constructor(private googleMapsApi: GoogleMapsApi) {}

  public enrichListings(listings: Listing[]): Promise<EnrichedListing[]> {
    return Promise.all(listings.map((listing) => this.enrichListing(listing)));
  }

  private async enrichListing(listing: Listing): Promise<EnrichedListing> {
    return {
      distance: await this.googleMapsApi.getDistance(
        `${listing.address.street}, ${listing.address.suburb}`
      ),
      ...listing,
    };
  }
}
