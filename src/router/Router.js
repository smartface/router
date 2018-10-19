"use strict";

/**
 * @typedef {function(location: RouteLocation, action: string)} RouterBlockHandler
 *
 */

/**
 * @typedef {function(location: RouteLocation)} HistoryListener
 *
 */

const Route = require("./Route");
const createMemoryHistory = require("../common/history");
const mapComposer = require("../utils/map");
const matchPath = require("../common/matchPath");
const matchRoutes = require("../common/matchRoutes");
let actions = [];

let history;
let _skipRender = false;

/**
 * Router Base
 *
 * @class
 * @extends {Route}
 */
class Router extends Route {
  static initializeHistory({
    initialEntries = null,
    initialIndex = null,
    keyLength = null,
    getUserConfirmation = null
  }) {
    history = createMemoryHistory({
      initialEntries: initialEntries || [], // The initial URLs in the history stack
      initialIndex: initialIndex || 0, // The starting index in the history stack
      keyLength: keyLength || 20, // The length of location.key
      // A function to use to confirm navigation with the user. Required
      // if you return string prompts from transition hooks (see below)
      getUserConfirmation: getUserConfirmation
    });
  }

  static skipRender() {
    _skipRender = true;
  }

  static getHistory() {
    return history;
  }

  static unloadHistory() {
    history = null;
  }
  /**
   * @constructor
   * @param {{ path: string, target: object|null, routes: Array, exact: boolean, isRoot: boolean }} param
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    isRoot = false,
    to = null
  }) {
    super({ path, build, routes, to });

    if (!history) {
      Router.initializeHistory({
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      });
    }

    this._historyUnlisten = () => null;
    if (isRoot) {
      this._historyUnlisten = history.listen((location, action) => {
        // console.log(`History is changed ${_skipRender}`);
        try {
          if (_skipRender === false) {
            this.onHistoryChange(location, action);
          }
        } catch (e) {
          throw e;
        } finally {
          _skipRender = false;
        }

        // ["pathname","search","hash","state","key"]
        // console.log(JSON.stringify(history.entries.map(entry => entry.pathname)));
      });
    }

    this._isRoot = isRoot;
    this._exact = exact;
    // this._cache = new WeakMap();
    this._unblock = () => null;
  }

  /**
   * @param {HistoryListener} fn
   */
  listen(fn) {
    return history.listen(fn);
  }

  /**
   * @return {Object}
   */
  getHistory() {
    return history;
  }

  /**
   * Adds route block handler to history. When history is changed in anywhere
   * then the handler intercepts before history is changed.
   *
   * @param {RouterBlockHandler} fn
   */
  addRouteBlocker(fn) {
    const unblock = history.block((location, action) => callback => {
      unblock();
      fn(location, action, callback);
    });

    return unblock;
  }

  /**
   * Triggered when the current route's parent is another router.
   *
   * @protected
   * @param {string} action
   */
  onRouteExit(action) {}

  /**
   * @param {{ pathname: string, search: string, state: object }} location
   * @param {Object} action
   */
  onHistoryChange(location, action) {
    this._matches = matchRoutes([this].concat(this._routes), location.pathname);

    this.renderMatches(this._matches, location.state, action);
  }

  /**
   * @protected
   * Removes last entry from history.
   */
  routeRollback() {
    this.getHistory().rollback();
  }

  /**
   *
   * @param {Array<{isExact: boolean,params: object,path: string,url: string}>} matches
   * @param {*} state
   * @param {*} action
   */
  renderMatches(matches, state, action) {
    // console.log("matches : " + JSON.stringify(matches.map(({ match }) => match)));
    matches.some(({ match, route }, index) => {
      if (route !== this && route instanceof Router) {
        // console.log("not exact match : " + this);
        // if(index > 0 && this._isRoot)
        this.addChildRouter &&
          actions.push([this.addChildRouter.bind(this), route]);
        // move routes to child router
        route.renderMatches(
          matches.slice(index, matches.length),
          state,
          action
        );

        return true;
      } else if (match.isExact === true) {
        // console.log("exact match : " + this + " : " + route.getRedirectto());
        // route has redirection
        if (route.getRedirectto()) {
          actions = [];
          return this.redirectRoute(route, state, action);
        }

        if (this.onRouteMatch(route, match, state, action)) {
          actions.forEach(item => item[0](item[1]));
        }

        this.onRouterEnter && this.onRouterEnter(action);
        actions = [];

        return true;
      }
    });
  }

  /**
   * Router is activated event handler
   *
   * @protected
   * @param {?string} [action=null] action
   */
  onRouterEnter(action = null) {
    this.setasActiveRouter(action);
  }

  /**
   * Sets the router statically as active router
   *
   * @protected
   * @param {string} action
   */
  setasActiveRouter(action) {
    Router.currentRouter &&
      this != Router.currentRouter &&
      Router.currentRouter.onRouterExit &&
      Router.currentRouter.onRouterExit(action);
    Router.currentRouter = this;
  }

  /**
   * Redirects route and removes last route record from history
   * @param {Route} route
   * @param {string} action
   */
  redirectRoute(route, state, action) {
    // redirection of a route
    this.routeRollback(); // remove last route from history
    this.push(route.getRedirectto(), state.routeState.data); // and add new route
  }

  /**
   * Route is matched event handler
   *
   * @protected
   * @param {Route} route
   * @param {{isExact: boolean, params: object, path: string, url: string}} match
   * @param {Object} state
   * @param {string} action
   */
  onRouteMatch(route, match, state, action) {
    const view = this.renderRoute(route, match, state);
    if (!view) {
      this.routeRollback();
    }

    return view;
  }

  /**
   * Render route
   *
   * @param {Route} route
   * @param {RouteMatch} match
   * @param {RouteState} state
   */
  renderRoute(route, match, state) {
    let view = route.build(match, state.routeState || {}, this, state.view);
    state.view = view;

    return view;
  }

  /**
   * Helper method that pushes the route's url to history
   *
   * @param {Route} route
   */
  pushRoute(route) {
    // console.log(`Push router ${route}`);
    this.push(route.getUrlPath());
  }

  /**
   * Change history by specified path
   *
   * @param {Object|string} path - Path or matches of the route
   * @param {!Object} [data={}] data
   * @return {Router}
   */
  push(path, data = {}) {
    // this._cache.get(path) ||
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
    }

    this.getHistory().push(path, { routeState: { data } });

    return this;
  }

  /**
   * Replaces specified path's state
   *
   * @param {string} path
   * @param {data} data
   */
  replace(path, data) {
    this.getHistory().replace(path, { routeState: data });
  }

  /**
   * Rewinds history
   *
   */
  goBack() {
    this.getHistory().go(-1);
  }

  /**
   * Return last location of history
   *
   * @return {RouteLocation}
   */
  getLocation() {
    return this.getHistory().location;
  }

  /**
   * @return {Array<string>}
   */
  getHistoryasArray() {
    return history.entries.map(item => item.pathname);
  }

  /**
   * Forwards history
   */
  goForward() {
    this.getHistory().goForward();
  }

  /**
   * Changes route by history index.
   *
   * @param {number} index
   * @return {boolean}
   */
  go(index) {
    if (this.getHistory().canGo(index)) {
      this.getHistory().index();
      return true;
    }

    return false;
  }

  /**
   * Adds new route
   *
   * @param {Route} route
   */
  add(route) {
    this._routes.push(route);
  }

  /**
   * Iterates child routes
   *
   * @paramms {function} fn
   * @return {Array}
   */
  map(fn) {
    return this._routes.map(fn);
  }

  /**
   * Unloads the router
   */
  dispose() {
    this._historyUnlisten();
    if (this._isRoot) {
      history.clear();
      history = null;
    }
    this._routes.forEach(route => route.dispose());
    this._routes = null;
    this._historyUnlisten = null;
    this._unblock && this._unblock();
    this._unblock = null;
  }
}

module.exports = Router;
