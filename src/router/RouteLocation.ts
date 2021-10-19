import { RouteState } from "./RouteState";
/**
 * @typedef {object} RouteLocation History entry of a request
 * @property {!string} url Requested url
 * @property {?string} query Url's search data
 * @property {?string} hash Url's hash data
 * @property {?RouteState} state Requested data to destination route
 * @property {!string} key Auto generated unique key
 */

export type RouteLocation = {
  url: string;
  query: string;
  hash: string;
  state: RouteState;
  key: string;
};
