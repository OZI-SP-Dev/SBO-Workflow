import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import { IWeb, Web } from '@pnp/sp/webs';

declare var _spPageContextInfo: any;

const webUrl = process.env.NODE_ENV === 'development' ? 'http ://localhost:3000' : _spPageContextInfo.webAbsoluteUrl;
export const spWebContext: IWeb = Web(webUrl).configure({ headers: { "Accept": "application/json; odata=verbose" } });