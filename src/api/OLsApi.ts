import { spWebContext } from "../providers/SPWebContext";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";

export interface IOL {
  Title: string;
  Archived: boolean;
}

export interface IOLsApi {
  fetchOLs(): Promise<IOL[]>;
}

export class OLsApi implements IOLsApi {
  private olsList = spWebContext.lists.getByTitle("OLs");

  fetchOLs(): Promise<IOL[]> {
    try {
      return this.olsList.items
        .select("Title", "Archived")
        .top(5000)
        .orderBy("Title")
        .get();
    } catch (e) {
      throw getAPIError(
        e,
        "Error occurred while trying to fetch the list of OLs"
      );
    }
  }
}

export class OLsApiDev implements IOLsApi {
  private olsList: IOL[] = [
    {
      Title: "Robins",
      Archived: false,
    },
    {
      Title: "Tinker",
      Archived: true,
    },
    {
      Title: "WPAFB",
      Archived: false,
    },
  ];

  async fetchOLs(): Promise<IOL[]> {
    await sleep();
    return this.olsList;
  }
}

export class OLsApiConfig {
  private static olsApi: IOLsApi;

  static getApi(): IOLsApi {
    if (!this.olsApi) {
      this.olsApi =
        process.env.NODE_ENV === "development" ? new OLsApiDev() : new OLsApi();
    }
    return this.olsApi;
  }
}
