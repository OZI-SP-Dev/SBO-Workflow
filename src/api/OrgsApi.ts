import { spWebContext } from "../providers/SPWebContext";
import { ParentOrgs } from "./DomainObjects";
import { sleep } from "./ProcessesApiDev";


export interface IOrg {
    Title: string,
    ParentOrg: ParentOrgs
}

export interface IOrgsApi {
    fetchOrgs(): Promise<IOrg[]>
}

export class OrgsApi implements IOrgsApi {

    private orgsList = spWebContext.lists.getByTitle("Orgs");

    fetchOrgs(): Promise<IOrg[]> {
        return this.orgsList.items.select("Title", "ParentOrg").getAll();
    }
}

export class OrgsApiDev implements IOrgsApi {

    private orgsList: IOrg[] = [{
        Title: "AAA",
        ParentOrg: ParentOrgs.AFLCMC
    }, {
        Title: "BBB",
        ParentOrg: ParentOrgs.AFRL
    }, {
        Title: "CCC",
        ParentOrg: ParentOrgs.AFIMSC
    }, {
        Title: "DDD",
        ParentOrg: ParentOrgs.AFSC
    }, {
        Title: "EEE",
        ParentOrg: ParentOrgs.AFNWC
    }, {
        Title: "FFF",
        ParentOrg: ParentOrgs.AFTC
    },]

    async fetchOrgs(): Promise<IOrg[]> {
        await sleep();
        return this.orgsList;
    }
}

export class OrgsApiConfig {
    private static orgsApi: IOrgsApi

    static getApi(): IOrgsApi {
        if (!this.orgsApi) {
            this.orgsApi = process.env.NODE_ENV === 'development' ? new OrgsApiDev() : new OrgsApi();
        }
        return this.orgsApi;
    }
}