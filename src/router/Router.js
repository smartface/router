"use strict";

const Route = require("./Route");
const matchRoutes = require("../common/matchRoutes");
const createHistory = require("../common/createHistory");
let actions = [];

let historyController;

let _skipRender = false;

/**
 * @typedef {object} RouterParams
 * @property {string} path Routing path
 * @property {Array<Route>} routes Child routes
 * @property {boolean} exact If it's only exact match or not
 * @property {boolean} isRoot If it's root or not
 * @property {(string|null)} to Redirection path
 * @property {boolean} strict
 * @property {boolean} sensitive Path is case sensitive or not
 *
 */

/**
 * Router Base
 * Base Router implementation
 *
 * @class
 * @extends {Route}
 */
class Router extends Route {
  /**
   * Factory method to create a new Router instance
   *
   * @param {RouterParams} props
   */
  static of(props = {}) {
    return new Router(props);
  }
  /**
   * @constructor
   * @param {RouterParams} param
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    sensitive = true,
    strict = true,
    isRoot = false,
    to = null
  }) {
    super({ path, build, routes, to, isRoot });
    // console.log("Router created");

    this._historyUnlisten = () => null;

    if (isRoot) {
      console.log("historycontroller create");
      /** @type {HistoryListener} */
      historyController = createHistory({
        sensitive,
        strict,
        exact,
        path,
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      });

      this.initialize(historyController);

      // routes.forEach(route => {
      //   // if (route instanceof Router) {
      //   route.initialize && route.initialize(historyController);
      //   // }
      // });
    }

    // if(isRoot === false){
    // }

    // if (isRoot) {
    // this._historyUnlisten = this._historyController.listen(
    //   (location, action) => {
    //     console.log(`History is changed ${location.pathname}`);
    //     try {
    //       // if (!_skipRender) {
    //       this.onHistoryChange(location, action);
    //       // }
    //     } catch (e) {
    //       throw e;
    //     } finally {
    //       _skipRender = false;
    //     }
    //   }
    // );
    // }

    this._isRoot = isRoot;
    this._exact = exact;
    this._strict = strict;
    this._sensitive = sensitive;
    // this._cache = new WeakMap();
    this._unblock = () => null;
  }

  /**
   * @ignore
   * @private
   * @param {*} parentHistory
   */
  initialize(parentHistory) {
    console.log("initialze", this.getUrlPath());
    this._historyController = parentHistory.createNode({
      ...this._options,
      getUserConfirmation: (blockerFn, callback) => {
        return blockerFn(callback);
      }
    });

    this._routes.forEach(route => {
      // if (route instanceof Router) {
      route.initialize && route.initialize(this._historyController);
      // }
    });

    this._historyController.listen((location, action) => {
      console.log(
        `new history ${this} ${location.pathname} ${JSON.stringify(
          this._historyController.history.entries.map(entry => entry.pathname)
        )}`
      );
      this.onHistoryChange(location, action);
    });
  }

  getCurrentUrl() {
    return this._currentUrl;
  }

  /**
   * Adds specified eventlistener to handle history changes
   *
   * @param {HistoryListener} fn
   */
  listen(fn) {
    return this._historyController.listen(fn);
  }

  /**
   * Returns History
   *
   * @deprecated
   * @protected
   * @return {Object}
   */
  getHistory() {
    return this._historyController.history;
  }

  /**
   * Adds route block handler to history. When history is changed in anywhere
   * then the handler intercepts before history is changed.
   *
   * @param {RouterBlockHandler} fn
   */
  addRouteBlocker(fn) {
    const unblock = this._historyController.block(
      (location, action) => callback => {
        fn(location, action, callback);
      }
    );

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
   * @listens
   * @protected
   * @param {RouteLocation} location
   * @param {Object} action
   */
  onHistoryChange(location, action) {
    console.log(`onHistoryChange ${this}`);
    this._matches = matchRoutes([this].concat(this._routes), location.pathname);
    this.renderMatches(this._matches, location.state, action);
  }

  /**
   * Removes last entry from history.
   *
   * @protected
   */
  routeRollback() {
    this._historyController.rollback();
  }

  /**
   * Renders route matches by requested path
   *
   * @protected
   * @param {Array<{isExact: boolean,params: object,path: string,url: string}>} matches
   * @param {RouteState} state
   * @param {string} action
   */
  renderMatches(matches, state, action, fromParent = false) {
    matches.some(({ match, route }, index) => {
      console.log("pathname : " + match.path);
      if (route !== this && route instanceof Router) {
        console.log("not exact match : " + this);
        // if(index > 0 && this._isRoot)
        this.addChildRouter &&
          actions.push(this.addChildRouter.bind(this, route));
        // move routes to child router
        route.renderMatches(
          matches.slice(index, matches.length),
          state,
          action,
          true
        );

        return true;
      } else if (match.isExact === true) {
        console.log("exact match : " + route + " : " + route.getRedirectto());
        // route has redirection
        if (route.getRedirectto()) {
          console.log("redirection  : " + route.getRedirectto());
          actions = [];
          return this.redirectRoute(route, state, action);
        }

        if (this.onRouteMatch(route, match, state, action)) {
          actions.forEach(item => item());
        }

        this.onRouterEnter && this.onRouterEnter(match, action);

        actions = [];

        return true;
      }
    });
  }

  /**
   * Handles if Router is activate router
   *
   * @protected
   * @param {?string} [action=null] action
   */
  onRouterEnter(match, action = null) {
    console.log(`onRouterEnter ${match.url}`);
    this.setasActiveRouter(action);
    this._currentUrl = match.url;
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
   *
   * @protected
   * @param {Route} route
   * @param {RouteState} state
   * @param {string} action
   */
  redirectRoute(route, state, action) {
    console.log(`redirectRoute`);
    // redirection of a route
    this.routeRollback(); // remove last route from history
    this.push(route.getRedirectto(), state && state.routeState.data); // and add new route
  }

  /**
   * @ignore
   * @param {*} view
   */
  shouldRouteMatch(view) {
    return view !== null || view !== undefined;
  }

  /**
   * Route is matched event handler
   *
   * @protected
   * @param {Route} route
   * @param {RouteMatch} match
   * @param {RouteState} state
   * @param {string} action
   * @return {(object | null)}
   */
  onRouteMatch(route, match, state, action) {
    const view = this.renderRoute(route, match, state);

    if (!this.shouldRouteMatch(view)) {
      this.routeRollback();

      return null;
    }

    return view;
  }

  /**
   * Render route
   *
   * @protected
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
   * @protected
   * @param {Route} route
   */
  pushRoute(route) {
    this.push(route.getUrlPath());
  }

  /**
   * Change history by specified path
   *
   * @param {object|string} path - Path or matches of the route
   * @param {!object} [data={}] data - Routing data
   * @return {Router}
   */
  push(path, data = {}) {
    console.log(`Push router ${path} ${this}`);
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
    }

    this._historyController.push(path, { routeState: { data } });

    return this;
  }

  /**
   * Replaces specified path's state
   *
   * @param {string} path
   * @param {data} data
   */
  replace(path, data) {
    this._historyController.history.replace(path, { routeState: { data } });
  }

  /**
   * Rewinds history
   * @fires
   */
  goBack() {
    this._historyController.goBack();
  }

  /**
   * Returns last location of history
   *
   * @return {RouteLocation}
   */
  getLocation() {
    return this._historyController.history.location;
  }

  /**
   * Returns History entries as Array
   * @return {Array<string>}
   */
  getHistoryasArray() {
    return this._historyController.history.entries.map(item => item.pathname);
  }

  /**
   * Forwards history
   */
  goForward() {
    this._historyController.history.goForward();
  }

  /**
   * Changes route by history index.
   *
   * @experimental
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
    // if (this._isRoot) {
    this._historyController.dispose();
    this._historyController = null;
    // }
    this._routes.forEach(route => route.dispose());
    this._routes = null;
    this._historyUnlisten = null;
    this._unblock && this._unblock();
    this._unblock = null;
  }
}

module.exports = Router;
