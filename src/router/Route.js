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
 * @property {!string} pathname Requested url
 * @property {?string} search Url's search data
 * @property {?string} hash Url's hash data
 * @property {?RouteState} state Route state
 * @property {!string} key Unique key
 */

/**
 * @typedef {object} RouteParams
 * @property {!string} path Route Path definition
 * @property {?Array<Route>} [=[]] routes Route children
 * @property {?boolean} [=false] exact Points that a route match must be exact or not
 * @property {?function(route: Route, nextState: RouteState)} routeShouldMatch Handles if route is mathed as request url
 * @property {?function(Router: Router, route: Route)} routeDidEnter Handles if route is displayed
 * @property {?function(Router: Router, route: Route)} routeDidExit Handles if route is removed
 */

/**
 * @typedef {object} RouteState
 * @property {?object} [={}] routeData Requested data by user
 * @property {!string} action Request action 'PUSH', 'POP' or 'REPLACE'
 * @property {!RouteMatch} match Request's match result
 * @property {!object} view Keeps requested route's view
 * @property {?object} [={}] routingState Keeps user data when route runs
 */

const matchPath = require("../common/matchPath").matchPath;
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
   * @param {RouteParams} params
   * @return {Route}
   */
  static of(params = {}) {
    return new Route(params);
  }
  /**
   * @constructor
   * @param {RouteParams} param
   */
  constructor({
    path = null,
    to = null,
    routes = [],
    build = null,
    exact = false,
    sensitive = true,
    strict = true,
    modal= false,
    routeShouldMatch = null,
    preload = null,
    routeDidEnter,
    routeDidExit
  }) {
    this._options = {
      exact,
      path,
      sensitive,
      strict
    };
    this._preload = preload;
    this._exact = exact;
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
      match: {},
      routeData: {},
      view: null,
      routingState: {},
      action: null
    });
  }
  
  isModal(){
    return this._modal;
  }
  
  preload(router, route) {
    return this._preload(router, route);
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

  toJSON() {
    return {
      type: "route",
      exac: this._exact,
      strict: this._strict,
      sensitive: this._sensitive,
      path: this._path,
      state: { match: this._state.match }
    };
  }

  /**
   * Simple Object representation of the route
   *
   * @since 1.0.0
   * @return {{path: string, routes: Array<object>}}
   */
  toObject() {
    return {
      path: this._path.getPath(),
      routes: this._routes.map(route => route.toObject())
    };
  }

  /**
   * String representation of the route
   *
   * @since 1.0.0
   * @return {string}
   */
  toString() {
    return `[object ${this.constructor.name}, path: ${this.getUrlPath()}]`;
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
   * Queries if specified url match to the route path
   * @param {string} url
   * @returns {Match}
   */
  matchPath(url) {
    this._match = matchPath(url, {
      path: this._path.getPath(),
      exact: this._exact,
      strict: this._strict
    });

    return this._match;
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
  clone() {
    return Route.of({
      path: this._path,
      routes: this._routes.slice(),
      props: Object.assign({}, this._props),
      build: this._build,
      exact: this._exact,
      strict: this._strict
    });
  }
}

module.exports = Route;
