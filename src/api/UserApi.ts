import { TestImages } from "@fluentui/example-data";
import { spWebContext } from "../providers/SPWebContext";
import { IPerson, Person } from "./DomainObjects";
import { getAPIError } from "./InternalErrors";

export interface IUserApi {
  /**
   * @returns The current, logged in user. It will return a cached version after fetching it the first time.
   */
  getCurrentUser: () => Promise<IPerson>;

  /**
   * Get the Id of the user with the email given
   *
   * @param email The email of the user
   *
   * @returns The Id of the user with the supplied email
   */
  getUserId: (email: string) => Promise<number>;

  /**
   * Get the full details of an IPerson by the email given
   *
   * @param email The email of the user
   *
   * @returns The IPerson of the user with the given email
   */
  getPersonDetails: (email: string) => Promise<IPerson>;

  /**
   * @returns true/false if the current user is a member of the owners group
   */
  isOwner: () => Promise<boolean>;
}

export class UserApi implements IUserApi {
  private currentUser?: IPerson;
  private owner?: boolean;

  getCurrentUser = async (): Promise<IPerson> => {
    try {
      if (!this.currentUser) {
        let user = await spWebContext.currentUser();
        this.currentUser = new Person(
          {
            Id: user.Id,
            Title: user.Title,
            EMail: user.Email,
          },
          user.LoginName
        );
      }
      return this.currentUser;
    } catch (e) {
      throw getAPIError(
        e,
        "Error occurred while trying to fetch the current user"
      );
    }
  };

  isOwner = async (): Promise<boolean> => {
    try {
      if (!this.owner) {
        let groups = await spWebContext.currentUser.groups.get();
        const found = groups.some(
          (group) => group.Title === "Small Business Process Owners"
        );
        this.owner = found;
      }
      return this.owner;
    } catch (e) {
      throw getAPIError(
        e,
        "Error occurred while trying to fetch the current user"
      );
    }
  };

  getUserId = async (email: string) => {
    try {
      return (await spWebContext.ensureUser(email)).data.Id;
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to fetch user with Email ${email}`
      );
    }
  };

  getPersonDetails = async (email: string): Promise<IPerson> => {
    let ensuredUser = (await spWebContext.ensureUser(email)).data;
    return new Person({
      Id: ensuredUser.Id,
      Title: ensuredUser.Title,
      EMail: ensuredUser.Email,
    });
  };
}

export class UserApiDev implements IUserApi {
  sleep() {
    return new Promise((r) => setTimeout(r, 500));
  }

  getCurrentUser = async (): Promise<IPerson> => {
    await this.sleep();
    return new Person({
      Id: 1,
      Title: "Default User",
      EMail: "me@example.com",
      imageUrl: TestImages.personaMale,
    });
  };

  isOwner = async (): Promise<boolean> => {
    await this.sleep();
    return true;
  };

  getUserId = async () => {
    await this.sleep();
    return 1;
  };

  getPersonDetails = async (email: string): Promise<IPerson> => {
    return new Person({ Id: 1, Title: "Default User", EMail: email });
  };
}

export class UserApiConfig {
  private static userApi: IUserApi;

  static getApi(): IUserApi {
    if (!this.userApi) {
      this.userApi =
        process.env.NODE_ENV === "development"
          ? new UserApiDev()
          : new UserApi();
    }
    return this.userApi;
  }
}
