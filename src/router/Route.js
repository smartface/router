"use strict";

/**
 * @typedef {object} RouteMatch Object seperately keeps parsed and matched data of the request for every route
 * @property {boolean} isExact if Requested path is an exact match or not.
 * @property {Object} params Request params like id or name is represented by '/path/:id' or '/path2/:name'
 * @property {string} path Matched route's path
 * @property {string} url Requested route path
 */

/**
 * @typedef {object} RouteLocation History entry of a request
 * @property {!string} url Requested url
 * @property {?string} query Url's search data
 * @property {?string} hash Url's hash data
 * @property {?RouteState} state Requested data to destination route
 * @property {!string} key Auto generated unique key
 */

/**
 * @typedef {object} RouteParams
 * @property {!string} path Route Path definition
 * @property {?string | ?function(router: Router, route: route)} [to=null] Redirection url
 * @property {?Array<Route>} [routes=[]] Route children
 * @property {?function(router: Router, route: Route)} [build=null] Route's view builder
 * @property {?Array<Route>} [build=null] Route's view builder
 * @property {?boolean} [exact=false]  Points that a route match must be exact or not. If a route is exact then it's chld routes cannot be received.
 * @property {?boolean} [sensitive=false] If path matching is case-sensitive or not.
 * @property {?modal} [modal=false] If route is displayed as modal or not.
 * @property {?function(route: Route, nextState: RouteState)} routeShouldMatch Handles if route is mathed as request url
 * @property {?function(Router: Router, route: Route)} routeDidEnter Handles if route is displayed
 * @property {?function(Router: Router, route: Route)} routeDidExit Handles if route is removed
 */

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

const matchUrl = require("../common/matchPath").matchUrl;
const mapComposer = require("../utils/map");

/**
 * Route's path ValueObject
 * For internal use
 * @access private
 * @class
 * @since 1.0.0
 */
class RoutePath {
  /**
   * Factory method to create a new instance
   *
   * @param {string} path
   * @since 1.0.0
   */
  static of(path) {
    return new RoutePath(path);
  }

  /**
   * @constructor
   * @param {string} path
   * @since 1.0.0
   */
  constructor(path) {
    this._path = path;
  }

  /**
   * Returns route path
   * @return {string}
   * @since 1.0.0
   */
  getPath() {
    return this._path;
  }

  /**
   * Returns route is root or not.
   *
   * @returns {boolean}
   * @since 1.0.0
   */
  isRoot() {
    return this._path === "/";
  }

  /**
   * Return quick representaion of the route-path
   *
   * @since 1.0.0
   * @returns {{path: string, isRoot: boolean}}
   */
  toObject() {
    return {
      path: this._path,
      isRoot: this.isRoot
    };
  }

  /**
   * @since 1.0.0
   * @returns {RoutePath}
   */
  clone() {
    return new RoutePath(this._path);
  }

  /**
   * Return path is empty or not
   *
   * @since 1.0.0
   * @return {boelean}
   */
  hasPath() {
    return this._path !== null || this._path !== undefined || this._path !== "";
  }
}

/**
 * Route implementation
 *
 * @since 1.0.0
 * @class
 */
class Route {
  /**
   * Static helper method to create a new instance of Route
   *
   * @since 1.0.0
   * @static
   * @param {RouteParams} params Route properties
   * @param {RouteState} state Initial state
   * @return {Route}
   */
  static of(params = {}, state = {}) {
    return new Route(params, state);
  }
  /**
   * @constructor
   * @param {RouteParams} param0 Route properties
   * @param {RouteState} param1 Initial state
   */
  constructor(
    {
      path = null,
      to = null,
      routes = [],
      build = null,
      exact = false,
      sensitive = false,
      strict = false,
      modal = false,
      routeShouldMatch = null,
      routeDidEnter,
      routeDidExit
    } = {},
    {
      match = {},
      routeData = {},
      view = null,
      routingState = {},
      action = null,
      url = null,
      active = false,
      query = "",
      rawQuery = null,
      hash = ""
    } = {}
  ) {
    this._options = {
      exact,
      path,
      sensitive,
      strict
    };
    this._exact = exact;
    this._isDIrty = false;
    this._strict = false;
    this._build = build;
    this._path = path instanceof RoutePath ? path : new RoutePath(path);
    this._routes = routes;
    this.map = mapComposer.call(this, this._routes);
    this._to = to;
    this._routeShouldMatch = routeShouldMatch;
    this._routeDidEnter = routeDidEnter;
    this._routeDidExit = routeDidExit;
    this._modal = modal;
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
      prevUrl: null
    });
  }

  /**
   *
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
  setState(state) {
    this._state = Object.assign(this._state, state);
  }

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
    // const {
    //   match,
    //   routeData,
    //   routingState,
    //   action,
    //   url,
    //   view,
    //   active,
    //   prevUrl
    // } = this._state;
    return {
      type: "route",
      match: this._state.routeData,
      routeData: this._state.routeData,
      routingState: this._state.routingState,
      path: this._path.getPath(),
      routes: this._routes.slice(),
      state: Object.assign({}, this._state, {
        view:
          (this._state.view && this._state.view.constructor.name) || undefined
      })
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

  setUrl(url) {
    if (!url) throw new TypeError(`[${this}] Route url cannot be empty`);
    this.setState({ url, prevUrl: this._state.url });
    this._isDIrty = true;
  }

  clearUrl() {
    this.setState({ url: "", prevUrl: this._state.url });
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
  build(router) {
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
  routeShouldMatch(router) {
    return this._routeShouldMatch ? this._routeShouldMatch(router, this) : true;
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
  routeDidEnter(router) {
    return this._routeDidEnter ? this._routeDidEnter(router, this) : true;
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
  routeDidExit(router) {
    return this._routeDidExit ? this._routeDidExit(router, this) : true;
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
  matchPath(url) {
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
    return Route.of(
      {
        to: this._to,
        modal: this._modal,
        routeDidExit: this._routeDidExit,
        routeShouldMatch: this._routeShouldMatch,
        routeDidEnter: this._routeDidEnter,
        exact: this._exact,
        strict: this._strict,
        path: this._path.clone(),
        path: this._path,
        props: Object.assign({}, this._props),
        build: this._build
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
          query: this._state.query
        },
        state
      )
    );
  }
}

module.exports = Route;
