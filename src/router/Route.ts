import { matchUrl } from "../common/matchPath";
import mapComposer, { MapFunction } from "../utils/map";
import { MatchOptions } from "../common/MatchOptions";
import Router from "./Router";
import { RoutePath } from "./RoutePath";
import { RouteState } from "./RouteState";
import { RouteParams } from "./RouteParams";
import { OnHistoryChange } from '../core/OnHistoryChange';
import { HistoryActionType } from "common/HistoryActions";

/**
 * Route implementation
 *
 * @since 1.0.0
 * @class
 */
export default class Route<Ttarget = unknown> {
  /**
   * Static helper method to create a new instance of Route
   *
   * @since 1.0.0
   * @static
   * @param {RouteParams} params Route properties
   * @param {RouteState} state Initial state
   * @return {Route<Ttarget=unknown>}
   */
  static of<Ttarget=unknown>(params: RouteParams<Ttarget>, state: Partial<RouteState>={}) {
    return new Route<Ttarget>(params, state);
  }

  public map: MapFunction<Route<any>>;

  protected _options: MatchOptions = {};
  protected _isDIrty = false;
  protected _strict = false;
  protected _path: RoutePath;
  protected _routes: Route[] = [];
  protected _to: (() => {}) | string | undefined;
  private doRouteShouldMatch: RouteParams<Ttarget>['routeShouldMatch'];
  private doRouteDidEnter: RouteParams<Ttarget>['routeDidEnter'];
  private doRouteDidExit: RouteParams<Ttarget>['routeDidExit'];
  protected doRouteWillEnter: RouteParams<Ttarget>['routeWillEnter'];
  protected _modal: boolean = false;
  protected _state: RouteState;
  protected _exact = false;
  protected _build: RouteParams<Ttarget>['build'];
  protected _props: any;
  _isRouter = false;
  /**
   * @constructor
   * @param {RouteParams} param0 Route properties
   * @param {RouteState} param1 Initial state
   */
  constructor(
    {
      path = null,
      to,
      routes = [],
      build,
      exact = false,
      sensitive = false,
      strict = false,
      modal = false,
      routeShouldMatch,
      routeDidEnter,
      routeDidExit,
      routeWillEnter
    }: Omit<RouteParams<Ttarget>, 'path'> & {path?: null | string | RoutePath},
    {
      match = {},
      routeData = {},
      view = null,
      routingState = {},
      action = null,
      url = null,
      active = false,
      query = {},
      rawQuery = "",
      hash = "",
    }: Partial<RouteState> = {}
  ) {
    
    // this._handlers = {
    //   routerDidEnter: routeDidEnter,
    //   routerDidExit: routeDidExit,
    //   routeWillEnter
    // };
    this._exact = exact;
    this._isDIrty = false;
    this._strict = false;
    this._build = build;
    this._path = path instanceof RoutePath ? path : new RoutePath(path || '');
    this._routes = routes;
    this.map = mapComposer<Route<any>>(this._routes)
    this._to = to;
    this.doRouteWillEnter = routeWillEnter;
    this.doRouteShouldMatch = routeShouldMatch;
    this.doRouteDidEnter = routeDidEnter;
    this.doRouteDidExit = routeDidExit;
    this._modal = modal;
    this._options = {
      exact,
      path: this._path.getPath(),
      sensitive,
      strict,
    };
    this._state = Object.seal({
      match,
      query,
      rawQuery,
      hash,
      routeData,
      view,
      routingState,
      action,
      url,
      active,
      prevUrl: undefined
    });
  }

  get state() {
    return this._state;
  }

  initialize(parentHistory: unknown, onHistoryChange: OnHistoryChange, pushHomes: (path: string) => void) {
    return; //Child class uses it.
  }


  /**
   * @deprecated
   */
  isModal() {
    return this._modal;
  }

  /**
   * Merges specified state to current route state
   *
   * @since 1.0.0
   * @param {object} state
   */
  setState(state: Partial<RouteState<any>>) {
    this._state = Object.assign(this._state, state);
  }

  // routeWillEnter(parent: Route){
  //   this.doRouteWillEnter(parent, this);
  // }

  /**
   * Returns Route's current state
   *
   * @since 1.0.0
   * @return {RouteState}
   */
  getState() {
    return this._state;
  }

  /**
   * Simple Object representation of the route
   *
   * @since 1.0.0
   * @return {{path: string, routes: Array<object>}}
   */
  toJSON() {
    return {
      type: "route",
      match: this._state.routeData,
      routeData: this._state.routeData,
      routingState: this._state.routingState,
      path: this._path.getPath(),
      routes: this._routes.slice(),
      state: Object.assign({}, this._state, {
        view:
          (this._state.view && this._state.view.constructor.name) || undefined,
      }),
    };
  }

  /**
   * String representation of the route
   *
   * @since 1.0.0
   * @return {string}
   */
  toString() {
    return `[object ${
      this.constructor.name
    }, path: ${this.getUrlPath()}, url: ${this._state.url}]`;
  }

  setUrl(url: string) {
    if (typeof url !== 'string') throw new TypeError(`[${this}] url must be string`);
    this.setState({ url, prevUrl: this._state.url });
    this._isDIrty = true;
  }

  clearUrl() {
    this.setState({ url:null, prevUrl: this._state.url });
  }

  clearDirty() {
    this._isDIrty = false;
  }

  getUrl() {
    return this._state.url;
  }

  /**
   * Helper method to return excat path of the component
   *
   * @since 1.0.0
   * @return {string}
   */
  get routePath() {
    return this.getRedirectto() || this.getUrlPath();
  }

  /**
   * Returns redirection path
   *
   * @since 1.0.0
   * @return {string}
   */
  getRedirectto() {
    return this._to;
  }

  /**
   * Builds a route's view.
   * This method is called whenever router is routing into that path.
   * There are some exceptions:
   * - going into a tab, which the tab is created before
   * - for iOS, goingBack via gesture or headerBar back
   *
   * @since 1.0.0
   * @param {Router} router - Not the root router, the router which the route belongs to.
   * @return {Page} view = null - If the route has been built once, the previous view (page) is given. Otherwise it is null. If view is not null, returning the view back makes it singleton.
   */
  build(router: Router<any>): any | null {
    return this._build ? this._build(router, this) : null;
  }

  /**
   * Triggered before when an exact match happends.
   * If the routeShouldMatch eventhandler is set
   * and routeShouldMatch returns 'true' then match happends
   * or routeShouldMatch returns 'false' then match is blocked
   * @example
   * ....
   * Route.of({
   *  routeShouldMatch: (router, route) => {
   *    return true;
   *  }
   * })
   *
   * ...
   *
   * @protected
   * @since 1.0.0
   * @event
   * @emits routeShouldMatch(router: Router, route: Route)
   * @param {Router} router
   * @return {boolean}
   */
  protected routeShouldMatch(router: Router<any>) {
    this.doRouteShouldMatch && this.doRouteShouldMatch(router, this);
  }

  /**
   * Handles route is matched and displayed
   *
   * @example
   * ....
   * Route.of({
   *  routeDidEnter: (router, route) => {
   *    ...
   *  }
   * })
   *
   * ...
   * @emits routeDidEnter
   * @event
   * @param {Router} router
   */
  routeDidEnter(route: Route<Ttarget>) {
    this.doRouteDidEnter && this.doRouteDidEnter(route, this);
  }

  /**
   * Handles that route is removed by router
   * @example
   * ....
   * Route.of({
   *  routeDidExit: (router, route) => {
   *    ...
   *  }
   * })
   *
   * ...
   * @since 1.0.0
   * @emits routeDidExit
   * @event
   * @param {Router} router
   */
   routeDidExit(parent: Route<Ttarget>) {
    this.doRouteDidExit ? this.doRouteDidExit(parent, this) : true;
  }

  /**
   * If Route has a path or not
   *
   * @since 1.0.0
   * @returns {boolean}
   */
  hasPath() {
    return this._path.hasPath();
  }

  /**
   * Checks if the specified url match to the route path
   * @param {string} url
   * @return {RouteMatch}
   */
  matchPath(url: string) {
    return matchUrl(url, this._options);
  }

  /**
   * Returns route path as string
   *
   * @since 1.0.0
   * @returns {string}
   */
  getUrlPath() {
    return this._path.getPath();
  }

  /**
   * Clones route's path and returns
   *
   * @since 1.0.0
   * @return {RoutePath}
   */
  getPath() {
    return this._path.clone();
  }

  /**
   * Clones new instance of the route
   * @since 1.0.0
   * @ignore
   * @returns {Route}
   */
  clone(state = {}) {
    return Route.of<Ttarget>(
      {
        to: this._to,
        modal: this._modal,
        routeDidExit: this.doRouteDidExit,
        routeShouldMatch: this.doRouteShouldMatch,
        routeDidEnter: this.doRouteDidEnter,
        exact: this._exact,
        strict: this._strict,
        path: this._path.clone(),
        props: Object.assign({}, this._props),
        build: this._build,
      },
      Object.assign(
        {
          hash: this._state.hash,
          query: this._state.query,
          rawQuery: this._state.rawQuery,
          action: this._state.action,
          active: this._state.active,
          url: this._state.url,
          view: this._state.view,
        },
        state
      )
    );
  }

  dispose(){
  }
}
