import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import { IWeb, Web } from '@pnp/sp/webs';
import { sp } from "@pnp/sp";

declare var _spPageContextInfo: any;

sp.setup({
  // set ie 11 mode
  ie11: true,
});

export const webUrl = process.env.NODE_ENV === 'development' ? 'http ://localhost:3000' : _spPageContextInfo.webAbsoluteUrl;
export const spWebContext: IWeb = Web(webUrl).configure({ headers: { "Accept": "application/json; odata=verbose" } });