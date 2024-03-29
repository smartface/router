/** @ts-ignore */
import Page from "@smartface/native/ui/Page";
import type Router from "./Router";
import type Route from "./Route";
import { RoutePath } from "./RoutePath";
import Renderer from "../native/Renderer";
import HeaderBar from "@smartface/native/ui/headerbar";

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
export type RouteParams<Ttarget = unknown> = {
  name?: string;
  path?: string | RoutePath;
  to?: (() => string) | string;
  routes?: Route[];
  build?: (router: Router<any>, route: Route<any>) => any;
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
  routeShouldMatch?: RouteShouldMatchHandler<any>;
  routeDidEnter?: RouteLifeCycleHandler;
  routeDidExit?: RouteLifeCycleHandler;
  routeWillEnter?: RouteLifeCycleHandler;
  props?: any;
  renderer?: Renderer;
  isRoot?: boolean;
  headerBarParams?: () => Partial<HeaderBar>;
};

export type RouteLifeCycleHandler<
  T extends Route<any> = Route<any>
> = (parent: T, route: T) => void;

/**
 * @typedef {function(route: Route, nextState: RouteState)} RouteShouldMatchHandler
 */
export type RouteShouldMatchHandler<Ttarget> = (
  router: Router<Ttarget>,
  nextRoute: Route<Ttarget>
) => boolean;
