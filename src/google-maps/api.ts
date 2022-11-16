import {
  Client,
  DirectionsResponseData,
} from "@googlemaps/google-maps-services-js";
import { LatLng } from "spherical-geometry-js";

export type GoogleMapsApiConfig = {
  key: string;
  originLocation: LatLng;
};

export class GoogleMapsApi {
  private client: Client;

  constructor(private config: GoogleMapsApiConfig) {
    this.client = new Client({});
  }

  public async getDistance(destination: string): Promise<string> {
    const routeResult = await this.getRoute(destination);
    const distance = routeResult.routes[0].legs[0].distance.text.replace(
      /\s/g,
      ""
    );

    return distance;
  }

  private async getRoute(destination: string): Promise<DirectionsResponseData> {
    const params = {
      origin: `${this.config.originLocation.latitude}, ${this.config.originLocation.longitude}`,
      destination,
      key: this.config.key,
    };
    const response = (await this.client.directions({ params })).data;

    return response;
  }
}
