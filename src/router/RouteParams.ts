/** @ts-ignore */
import Page = require("sf-core/ui/Page");
import type Router from "./Router";
import type { RouteState } from "./RouteState";
import type Route from "./Route";
import { RoutePath } from "./RoutePath";

/**
 * @typedef {object} RouteParams
 * @property {!string} path Route Path definition
 * @property {?string | ?function(router: Router, route: route)} [to=null] Redirection url
 * @property {?Array<Route>} [routes=[]] Route children
 * @property {?function(router: Router, route: Route)} [build=null] Route's view builder
 * @property {?boolean} [exact=false]  Points that a route match must be exact or not. If a route is exact then it's chld routes cannot be received.
 * @property {?boolean} [sensitive=false] If path matching is case-sensitive or not.
 * @property {?modal} [modal=false] If route is displayed as modal or not.
 * @property {?function(route: Route, nextState: RouteState)} routeShouldMatch Handles if route is mathed as request url
 * @property {?function(Router: Router, route: Route)} routeDidEnter Handles if route is displayed
 * @property {?function(Router: Router, route: Route)} routeDidExit Handles if route is removed
 */
export type RouteParams = {
  path: string | RoutePath;
  to?: string;
  routes?: Route[];
  build?: (router: Router, route: Route) => Page;
  exact?: boolean;
  sensitive?: boolean;
  modal?: boolean;
  strict?: boolean;
  routeShouldMatch?: RouteShouldMatchHandler;
  routeDidEnter?: RouteLifeCycleHandler;
  routeDidExit?: RouteLifeCycleHandler;
  routeWillEnter?: RouteLifeCycleHandler;
};

export type RouteLifeCycleHandler = (Router: Router, route: Route) => void;

/**
 * @typedef {function(route: Route, nextState: RouteState)} RouteShouldMatchHandler
 */
export type RouteShouldMatchHandler = (router: Router, nextRoute: Route) => boolean;