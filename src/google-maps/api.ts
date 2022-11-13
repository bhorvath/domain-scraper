import {
  Client,
  DirectionsResponseData,
} from "@googlemaps/google-maps-services-js";

export type GoogleMapsApiConfig = {
  key: string;
  originAddress: string;
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
      origin: this.config.originAddress,
      destination,
      key: this.config.key,
    };
    const response = (await this.client.directions({ params })).data;

    return response;
  }
}
