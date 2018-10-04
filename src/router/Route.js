"use strict";

/**
 * @typedef {Object} RouteMatch
 * @property {boolean} isExact
 * @property {Object} params
 * @property {string} path
 * @property {string} url
 */

/**
 * @typedef {Object} RouteLocation
 * @property {string} pathname
 * @property {string} search
 * @property {string} hash
 * @property {RouteState} state
 * @property {string} key
 */

/**
 * @typedef {Object} RouteParams
 * @property {string} path
 * @property {Array<Route>} routes
 * @property {boolean} exact
 * @property {boolean} exact
 * @property {function(match: RouteMatch)} onBeforeMatch 
 */
 
/**
 * @typedef {Object} RouteState
 * @property {objec} userState
 * @property {Object} view
 */
 
/**
 * @typedef {function(match: RouteMatch, state: object, router: Router, view: Page)} RouteBuildHandler
 */
 

const matchPath = require("../common/matchPath").matchPath;
const mapComposer = require("../utils/map");

/**
 * Route's path ValueObject
 * For internal use
 * @access private
 * @class
 */
class RoutePath {
  /**
   * Factory method to create a new instance
   *
   * @param {string} path
   */
  static of(path) {
    return new RoutePath(path);
  }

  /**
   * @constructor
   * @param {string} path
   */
  constructor(path) {
    this._path = path;
  }

  /**
   * @return {string}
   */
  getPath() {
    return this._path;
  }

  /**
   * @returns {boolean}
   */
  isRoot() {
    return this._path === "/";
  }

  /**
   * @returns {Object}
   */
  toObject() {
    return {
      path: this._path,
      isRoot: this.isRoot
    };
  }

  /**
   * @returns {RoutePath}
   */
  clone() {
    return new RoutePath(this._path);
  }

  /**
   * @return {boelean}
   */
  hasPath() {
    return this._path !== null || this._path !== undefined || this._path !== "";
  }
}

/**
 * Route implementation
 * @class
 */
class Route {
  /**
   * Static helper method to create a new instance of Route
   * 
   * @static
   * @param {RouteParams} param
   * @return {Route}
   */
  static of({
    path = null,
    routes = [],
    build = null,
    exact = false,
    onBeforeMatch = null,
    onBeforePush = null,
    to = null
  }) {
    return new Route({
      path,
      routes,
      build,
      exact,
      onBeforeMatch,
      onBeforePush,
      to
    });
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
    onBeforeMatch = null,
    onBeforePush = null
  }) {
    this._exact = exact;
    this._strict = false;
    this._build = build;
    this._path = path instanceof RoutePath ? path : new RoutePath(path);
    this._routes = routes;
    this.map = mapComposer.call(this, this._routes);
    this._to = to;
    this._onBeforeMatch = onBeforeMatch;
    this._onBeforePush = onBeforePush;
  }

  /**
   * @return {Object}
   */
  toObject() {
    return {
      path: this._path.getPath(),
      routes: this._routes.map(route => route.toObject())
    };
  }

  /**
   * String presentation of the component
   *
   * @return {string}
   */
  toString() {
    return `[object ${this.constructor.name}, path: ${this.getUrlPath()}]`;
  }

  /**
   * Helper method to return excat path of the component
   *
   * @return {string}
   */
  get routePath() {
    return this.getRedirectto() || this.getUrlPath();
  }

  /**
   * Returns redirection path
   *
   * @return {string}
   */
  getRedirectto() {
    return this._to;
  }

  /**
   * Builds a route's view
   *
   * @param {RouteMatch} match
   * @param {RouteState} state
   * @param {Router} router
   * @param {Page} view
   */
  build(match, state, router, view) {
    return (this._build && this._build(match, state, router, view)) || null;
  }

  /**
   * Triggered before when an exact match happends.
   * If the onBeforeMatch eventhandler is set
   * and onBeforeMatch returns 'true' then match happends
   * or onBeforeMatch returns 'false' then match is blocked
   *
   * @param {RouteMatch} match
   * @return {boolean}
   */
  onPrematch(match) {
    return (this._onBeforeMatch && this._onBeforeMatch(match)) || true;
  }

  /**
   * Route has a path
   *
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
   * @returns {string}
   */
  getUrlPath() {
    return this._path.getPath();
  }

  /**
   * Clones route's path and returns
   *
   * @return {RoutePath}
   */
  getPath() {
    return this._path.clone();
  }

  /**
   * Clones new instance of the route
   *
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
