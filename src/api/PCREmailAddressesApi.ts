import { spWebContext } from "../providers/SPWebContext";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";

export interface IPCREmailAddress {
  Title: string;
}

interface IPCREmailAddressesApi {
  fetchAddresses(): Promise<IPCREmailAddress[]>;
}

class PCREmailAddressesApi implements IPCREmailAddressesApi {
  private pcrEmailAddressesList =
    spWebContext.lists.getByTitle("PCREmailAddresses");

  fetchAddresses = (): Promise<IPCREmailAddress[]> => {
    try {
      return this.pcrEmailAddressesList.items.get();
    } catch (e) {
      throw getAPIError(
        e,
        "Error occurred while trying to fetch the PCR Email Addresses"
      );
    }
  };
}

class PCREmailAddressesApiDev implements IPCREmailAddressesApi {
  fetchAddresses = async (): Promise<IPCREmailAddress[]> => {
    await sleep();
    return [{ Title: "noreply@us.af.mil" }];
  };
}

export class PCREmailAddressesApiConfig {
  private static PCREmailAddresesApi: IPCREmailAddressesApi;

  static getApi(): IPCREmailAddressesApi {
    if (!this.PCREmailAddresesApi) {
      this.PCREmailAddresesApi =
        process.env.NODE_ENV === "development"
          ? new PCREmailAddressesApiDev()
          : new PCREmailAddressesApi();
    }
    return this.PCREmailAddresesApi;
  }
}
