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
 * @property {function(router: Router, prevUrl: string, currentUrl: stirng, action: {('PUSH'| 'POP')})} routerDidEnter Handles the Router is actived.
 * @property {function(router: Router, prevUrl: action: {('PUSH'| 'POP')})} routerDidExit Handles the Router is deactived.
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
  static of (props = {}) {
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
    to = null,
    routerDidEnter,
    routerDidExit,
    routeShouldMatch
  }) {
    super({ path, build, routes, to, isRoot, routeShouldMatch });
    // console.log("Router created");

    this._historyUnlisten = () => null;
    this._handlers = {
      routerDidEnter,
      routerDidExit
    };

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

      this.initialize(historyController, (location, action, target) => this.onHistoryChange(location, action, target));

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
   * @param {function} onHistoryChange Root onHistoryChange handler
   */
  initialize(parentHistory, onHistoryChange) {
    console.log("initialze : " + onHistoryChange);

    this._historyController = parentHistory.createNode(
      Object.assign({},
        this._options, {
          getUserConfirmation: (blockerFn, callback) => {
            return blockerFn(callback);
          }
        })
    );

    this._routes.forEach(route => {
      // if (route instanceof Router) {
      route.initialize && route.initialize(this._historyController, onHistoryChange);
      // }
    });

    this._historyController.listen((location, action) => {
      console.log(
        `new history ${this} ${location.pathname} ${JSON.stringify(
          this.getHistoryasArray()
        )}`
      );
      onHistoryChange(location, action, this);
    });
  }

  /**
   * 
   * @ignore
   *
   */
  getHistory() {
    return this._historyController.history;
  }

  /**
   * Return current url path
   * 
   * @return {string}
   */
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

    this._unblock = unblock;

    return unblock;
  }

  /**
   * @listens
   * @protected
   * @param {RouteLocation} location
   * @param {Object} action
   */
  onHistoryChange(location, action, target) {
    console.log(`onHistoryChange ${this} ${target}`);
    this._matches = matchRoutes([this].concat(this._routes), location.pathname);
    this.renderMatches(this._matches, location.state, action, target);
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
   * 
   * @emit {RouteShouldMatchHandler}
   * @param {Array<{isExact: boolean,params: object,path: string,url: string}>} matches
   * @param {RouteState} state
   * @param {string} action
   */
  renderMatches(matches, routeData, action, target) {
    console.log(`renderMatches ${target} ${this}`);
    matches.some(({ match, route }, index) => {
      if (route !== this && route instanceof Router) {
        console.log("not exact match : " + match.url);
        // if(index > 0 && this._isRoot)
        this.addChildRouter &&
          actions.push(this.addChildRouter.bind(this, route));
        // move routes to child router
        route.renderMatches(
          matches.slice(index, matches.length),
          routeData,
          action,
          target
        );

        return true;
      }
      else if (match.isExact === true) {
        console.log("exact match : " + route + " : ");
        // route has redirection
        if (route.routeShouldMatch(route, { match, action, routeData }) === true) {
          if (route.getRedirectto()) {
            console.log("redirection  : " + route.getRedirectto());
            actions = [];
            return this.redirectRoute(route, routeData, action);
          }

          const routingState = route.getRoutingState && route.getRoutingState(route._state, { match, action, routeData }) || {};
          route.setState({ match, action, routeData, routingState });
          if (target != this) {
            console.log(`is not target ${target} ${this}`);
          // if (!this.isUrlCurrent(match.url, action)) {
            this._currentAction = action
            this._currentUrl = match.url;
            
            this._historyController.preventDefault();
            switch (action) {
              case 'PUSH':
                this._historyController.push(match.path, routeData);
                break;
              case 'POP':
                this._historyController.goBack();
                break;
            }
            
            console.log(`is not target ${JSON.stringify(this.getHistoryasArray())}`);
          }

          this.routeDidMatch(route);
          const view = this.renderRoute(route);
          route.setState({ view });
          this.routeWillEnter && this.routeWillEnter(route);
          actions.forEach(item => item());
          this.routerDidEnter && this.routerDidEnter(route);
        }

        actions = [];
        return true;
      }
    });
  }

  isUrlCurrent(url, action) {
    const res = (this._currentUrl === url && this._currentAction === action);
    console.log(`isUrlCurrent ${url} ${action} ${this._currentUrl} ${this._currentAction} ${res}`);
    return res;
  }

  /**
   * Handles if Router is activate router
   *
   * @protected
   * @param {RouteState} Route
   */
  routerDidEnter(route) {
    this._handlers.routerDidEnter && this._handlers.routerDidEnter(this, route);
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
      Router.currentRouter.routerDidExit &&
      Router.currentRouter.routerDidExit(action);
    Router.currentRouter = this;
  }

  routerDidExit(action) {
    this._handlers.routerDidExit && this._handlers.routerDidExit(this, action);
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
    this.push(route.getRedirectto(), state && state.data); // and add new route
  }

  /**
   * @protected
   * @ignore
   * @param {Page} view
   */
  isViewEmpty(view) {
    return view !== null || view !== undefined;
  }

  /**
   * Route is matched handler
   * @protected
   * @param {Route} route
   * @param {RouteState} nextState
   * @return {(object | null)}
   */
  routeDidMatch(route) {
    const { match, action, routeData } = route.getState()
    console.log(`routerDidEnter ${match.url}`);
    if (match.isExact) {
      const prevUrl = this._currentUrl;
      this.setasActiveRouter(action);
    }
  }

  /**
   * Render route
   *
   * @protected
   * @param {Route} route
   * @throw {TypeError}
   */
  renderRoute(route) {
    const view = route.build(this, route);
    if (!view) throw new TypeError('View cannot be empty!');

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
  push(path, routeData = {}) {
    console.log(`Push router ${path} ${this}`);
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
    }

    this._historyController.push(path, { routeData });

    return this;
  }

  /**
   * Replaces specified path's state
   *
   * @param {string} path
   * @param {data} data
   */
  replace(path, routeData) {
    this._historyController.history.replace(path, { routeData });
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
    this._historyController.go(index);
    return false;
  }

  /**
   * Adds new route
   * 
   * @experimental
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
    this._handlers = null;
  }
}

module.exports = Router;
