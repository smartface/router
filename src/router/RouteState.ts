/** @ts-ignore */
import Page from '@smartface/native/ui/Page';
import { RouteMatch } from './RouteMatch';
/**
 * @typedef {object} RouteState
 * @property {?object} [routeData ={}] Requested data by user
 * @property {!string} action Request action 'PUSH', 'POP' or 'REPLACE'
 * @property {object} query Request's query-string
 * @property {string} rawQuery String version of the request's query-string
 * @property {boolean} active If Route is currently displayed or not.
 * @property {string} hash Request's url hash comes after '#' char. For example '/path/to#a-hash'
 * @property {!RouteMatch} match Request's match result
 * @property {!object} view Keeps requested route's view
 * @property {!string} url Requested url
 * @property {!string} prevUrl Previously requested url
 * @property {?object} [routingState={}] Keeps user data when route runs
 */

export type RouteState<Ttarget = Page> = {
  routeData?: object;
  action: string;
  query?: { [key: string]: any };
  rawQuery?: string;
  active: boolean;
  hash?: string;
  view?: Ttarget | null;
  url: string;
  prevUrl?: string;
  routingState?: object;
  match?: Partial<RouteMatch>;
};
