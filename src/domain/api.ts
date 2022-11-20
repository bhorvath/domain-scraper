import axios from "axios";

export type DomainApiConfig = {
  key: string;
};

const BASE_URL = "https://api.domain.com.au";

type PropertyDetails = {
  areaSize: number;
};
export class DomainApi {
  constructor(private config: DomainApiConfig) {}

  public async getLandSize(propertyId: string): Promise<number> {
    const propertyDetails = await this.getPropertyDetails(propertyId);

    return propertyDetails.areaSize;
  }

  private async getPropertyDetails(
    propertyId: string
  ): Promise<PropertyDetails> {
    const params = {
      api_key: this.config.key,
    };
    const response = await axios
      .get(`${BASE_URL}/v1/properties/${propertyId}`, { params })
      .catch((error) => {
        if (error.response.data) {
          throw new Error(JSON.stringify(error.response.data, null, 2));
        } else {
          throw error;
        }
      });

    return response.data;
  }
}
