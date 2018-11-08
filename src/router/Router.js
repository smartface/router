"use strict";

const Route = require("./Route");
const matchRoutes = require("../common/matchRoutes");
const createHistory = require("../common/createHistory");
let actions = [];

let historyController;

let _lastRoute;
const listeners = new Set();
const history = [];
const dispatch = (location, action) => {
  history.push([location.pathnamme, action]);
  listeners.forEach(listener => listener(location, action));
};

/**
 * @typedef {object} RouterParams
 * @property {!string} [=false] path Routing path
 * @property {!Array<Route>} [=[]] routes Child routes
 * @property {?boolean} [=false] exact If it's only exact match or not
 * @property {?boolean} [=false] isRoot If it's root router
 * @property {?(string|null)} to Redirection path
 * @property {?boolean} [=false] strict
 * @property {?boolean} [=false] sensitive Path is case sensitive or not
 * @property {?function(router: Router, prevUrl: string, currentUrl: stirng, action: {('PUSH'| 'POP')})} routerDidEnter Handles the Router is actived.
 * @property {?function(router: Router, prevUrl: action: {('PUSH'| 'POP')})} routerDidExit Handles the Router is deactived.
 */

/**
 * Router Base
 * Base Router implementation
 *
 * @class
 * @example
 *  const router = Router.of({
 *   path: "/",
 *   to: "/pages/page2",
 *   isRoot: true,
 *   routes: [
 *       Route.of({
 *           path: "/pages/page2",
 *           build: (match, state) => {
 *               let Page2 = require("pages/page2");
 *               return new Page2();
 *           }
 *       }),
 *       StackRouter.of({
 *           path: "/stack",
 *           to: "/stack/path1",
 *           headerBarParams: () => { ios: { translucent: true } },
 *           routes: [
 *               Route.of({
 *                   path: "/stack/path1",
 *                   build: (match, state, router) => new Page1(state.data, router)
 *               }),
 *               Route.of({
 *                   path: "/stack/path2",
 *                   routeShouldMatch: (route, nextState) => {
 *                       console.log('routeShouldMatch');
 *                       if (!nextState.routeData.applied) {
 *                           // blocks route changing
 *                           return false;
 *                       }
 *                       return false;
 *                   },
 *                   build: (router, route) => {
 *                       const { routeData, view } = route.getState();
 *                       return new Page2(routeData, router);
 *                   }
 *               })
 *           ]
 *       }),
 *       BottomTabBarRouter.of({
 *           path: "/bottom",
 *           to: "/bottom/stack2/path1",
 *           tabbarParams: () => ({
 *               ios: { translucent: false },
 *               itemColor: Color.RED,
 *               unselectedItemColor: Color.YELLOW,
 *               backgroundColor: Color.BLUE
 *           }),
 *           items: () => [{ title: "page1" }, { title: "page2" }, { title: "page3" }],
 *           routes: [
 *               StackRouter.of({
 *                   path: "/bottom/stack",
 *                   to: "/bottom/stack/path1",
 *                   headerBarParams: () => { ios: { translucent: false } },
 *                   routes: [
 *                       Route.of({
 *                           path: "/bottom/stack/path1",
 *                           build: (router, route) => new Page1(route.getState().routeData, router, "/stack/path2")
 *                       }),
 *                       Route.of({
 *                           path: "/bottom/stack/path2",
 *                           build: (router, route) => {
 *                               const { routeData, view } = route.getState();
 *
 *                               return new Page2(routeData, router, "/bottom/stack2/path1");
 *                           }
 *                       })
 *                   ]
 *               }),
 *               StackRouter.of({
 *                   path: "/bottom/stack2",
 *                   to: "/bottom/stack2/path1",
 *                   headerBarParams: () => { ios: { translucent: false } },
 *                   routes: [
 *                       Route.of({
 *                           path: "/bottom/stack2/path1",
 *                           build: (router, route) => new Page1(route.getState().routeData, router, "/bottom/stack/path2")
 *                       }),
 *                       Route.of({
 *                           path: "/bottom/stack2/path2",
 *                           build: (router, route) => {
 *                               return new Page2(route.getState().routeData, router);
 *                           }
 *                       })
 *                   ]
 *               })
 *           ]
 *       })
 *   ]
 * });
 * 
 * @since 1.0.0
 * @extends {Route}
 */
class Router extends Route {
  static getHistoryStack() {
    return history.slice();
  }

  static getHistoryByIndex(index) {
    return history[index];
  }
  /**
   * Factory method to create a new Router instance
   *
   * @param {RouterParams} props
   */
  static of(props = {}) {
    return new Router(props);
  }

  static createBlocker(fn) {
    return (router, path, routeData, action, doneFn) => {
      fn(path, routeData, action, ok => ok && doneFn());
    };
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

    this._historyUnlisten = () => null;
    this._handlers = {
      routerDidEnter,
      routerDidExit
    };

    if (isRoot) {
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

      this.initialize(historyController, (location, action, target) =>
        this.onHistoryChange(location, action, target)
      );
    }

    this._isRoot = isRoot;
    this._exact = exact;
    this._strict = strict;
    this._sensitive = sensitive;
    // this._cache = new WeakMap();
  }

  /**
   * Router is initialized by parent
   *
   * @protected
   * @since 1.0.0
   * @param {HistoryListener} parentHistory
   * @param {function} onHistoryChange Root onHistoryChange handler
   */
  initialize(parentHistory, onHistoryChange) {
    this._historyController = parentHistory.createNode(
      Object.assign({}, this._options, {
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      })
    );

    this._routes.forEach(route => {
      // if (route instanceof Router) {
      route.initialize &&
        route.initialize(this._historyController, onHistoryChange);
      // }
    });

    this._unlisten = this._historyController.listen((location, action) => {
      onHistoryChange(location, action, this); // fires root's onHistoryChange
    });

    this.dispatch = (location, action, target) => {
      onHistoryChange(location, action, target);
    };
  }

  /**
   * @ignore
   * @since 1.0.0
   */
  getHistory() {
    return this._historyController.history;
  }

  /**
   * Return current url
   *
   * @since 1.0.0
   * @return {string}
   */
  getCurrentUrl() {
    return this._currentUrl;
  }

  /**
   * Adds eventlisteners to listen history changes
   * @example
   * const unlisten = router.listen((location, action) => {
   *     console.log(` ---- new route location: ${location.pathname} action : ${action}`);
   * });
   *
   * @since 1.0.0
   * @param {HistoryListener} fn
   */
  listen(fn) {
    listeners.add(fn);

    return () => listeners.delete(fn);
  }

  /**
   * Adds route block handler to history. When history is changed in anywhere
   * then the handler intercepts before history is changed.
   * @example
   * var unload = router.addRouteBlocker((path, routeData, action, ok) => {
   * alert({
   *  message: "Would you like to answer?",
   *  title: "Question", //optional
   *  buttons: [{
   *  text: "Yes",
   *      type: AlertView.Android.ButtonType.POSITIVE,
   *      onClick: function() {
   *        ok(true);
   *      }
   *    },
   *    {
   *      text: "No",
   *      type: AlertView.Android.ButtonType.NEGATIVE,
   *      onClick: function() {
   *        ok(false);
   *      }
   *    }
   *  ]
   *  });
   * });
   *
   * @since 1.0.0
   * @param {RouterBlockHandler} fn
   */
  addRouteBlocker(fn) {
    Router.blocker = Router.createBlocker(fn);
    this._unblock = () => (Router.blocker = null);
    /*this._historyController.block(
      (location, action) => callback => {
        fn(location, action, callback);
      }
    );*/

    return this._unblock;
  }

  /**
   * Handles history changes. Just Root router, because routing flow mmust be always root to children,
   * in order to change display logic all the time.
   *
   * @since 1.0.0
   * @protected
   * @param {RouteLocation} location
   * @param {Object} action
   */
  onHistoryChange(location, action, target) {
    this._matches = matchRoutes([this].concat(this._routes), location.pathname);
    this.renderMatches(this._matches, location, action, target);
  }

  /**
   * Removes last entry from history.
   *
   * @since 1.0.0
   * @ignore
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
   * @since 1.0.0
   * @emits RouteShouldMatchHandler
   * @param {Array<{isExact: boolean,params: object,path: string,url: string}>} matches
   * @param {RouteState} state
   * @param {string} action
   */
  renderMatches(matches, location, action, target) {
    const routeData = location.state;
    matches.some(({ match, route }, index) => {
      if (route !== this && route instanceof Router) {
        // if(index > 0 && this._isRoot)
        this.addChildRouter &&
          actions.push(this.addChildRouter.bind(this, route)); // add new router display logic from root to children
        // move routes to child router
        route.renderMatches(
          matches.slice(index, matches.length),
          location,
          action,
          target
        );

        return true;
      } else if (match.isExact === true) {
        if (
          route.routeShouldMatch(route, { match, action, routeData }) === true
        ) {
          if (route.getRedirectto()) {
            actions = [];
            return this.redirectRoute(route, routeData, action);
          }

          const routingState =
            (route.getRoutingState &&
              route.getRoutingState(route._state, {
                match,
                action,
                routeData
              })) ||
            {};
          route.setState({ match, action, routeData, routingState });

          // If child router then push or pop route to child route's history
          if (target != this && this._currentUrl !== match.url) {
            // if (!this.isUrlCurrent(match.url, action)) {
            this._historyController.preventDefault();
            switch (action) {
              case "PUSH":
                this._historyController.push(match.path, routeData);
                break;
              case "POP":
                this._historyController.goBack();
                break;
            }
          }

          _lastRoute && _lastRoute.routeDidExit(this);
          this.routeDidMatch(route); // fires routeDidMatch
          const view = this.renderRoute(route); // build route's view
          route.setState({ view }); // keep view in the route's state
          this.routeWillEnter && this.routeWillEnter(route); // fires routeWillEnter
          actions.forEach(item => item()); // display routers' view
          this.routerDidEnter && this.routerDidEnter(route); // fires routerDidEnter
          route.routeDidEnter(this); // fires routeDidEnter
          _lastRoute = route; // save matched route as last route
          this._currentAction = action;
          this._currentUrl = match.url;
          dispatch(location, action);
        }

        actions = []; // clear display actions
        return true;
      }
    });
  }

  /**
   * Handles a new route activated in the router
   *
   * @since 1.0.0
   * @event
   * @protected
   * @param {Route} route
   */
  routerWillEnter(route) {}

  /**
   * @since 1.0.0
   * @ignore
   * @param {string} url
   * @param {string} action
   */
  isUrlCurrent(url, action) {
    const res = this._currentUrl === url && this._currentAction === action;
    return res;
  }

  /**
   * Life-cycle event handler handles Router is activated
   * @example
   * ....
   * Router.of({
   *  routerDidEnter: (router, route) => {
   *    ...
   *  }
   * })
   *
   * ...
   *
   * @since 1.0.0
   * @emits routerDidEnter
   * @protected
   * @param {RouteState} Route
   */
  routerDidEnter(route) {
    this._handlers.routerDidEnter && this._handlers.routerDidEnter(this, route);
  }

  /**
   * Sets the router statically as active router
   *
   * @since 1.0.0
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

  /**
   * Handles router is deactivated.
   *
   * @since 1.0.0
   * @example
   * ....
   * Router.of({
   *  routerDidExit: (router, action) => {
   *    ...
   *  }
   * })
   *
   * ...
   * @emits routerDidExit
   * @param {string} action
   */
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
    // redirection of a route
    this.routeRollback(); // remove last route from history
    this.push(route.getRedirectto(), state && state.data); // and add new route
  }

  /**
   * @since 1.0.0
   * @private
   * @ignore
   * @param {Page} view
   */
  isViewEmpty(view) {
    return view !== null || view !== undefined;
  }

  /**
   * Route is matched handler
   *
   * @since 1.0.0
   * @protected
   * @param {Route} route
   * @param {RouteState} nextState
   * @return {(object | null)}
   */
  routeDidMatch(route) {
    const { match, action, routeData } = route.getState();
    if (match.isExact) {
      const prevUrl = this._currentUrl;
      this.setasActiveRouter(action);
    }
  }

  /**
   * Render route
   *
   * @since 1.0.0
   * @protected
   * @param {Route} route
   * @throws {TypeError}
   */
  renderRoute(route) {
    const view = route.build(this);
    if (!view) throw new TypeError(`${route} 's View cannot be empty!`);

    return view;
  }

  /**
   * Helper method that pushes the route's url to history
   *
   * @since 1.0.0
   * @protected
   * @param {Route} route
   */
  pushRoute(route) {
    if (!(route instanceof Route))
      throw new TypeError(`route must be instance of Route`);
    this.push(route.getRedirectto() || route.getUrlPath());
  }

  /**
   * Change history by specified path
   *
   * @param {object|string} path - Path or matches of the route
   * @param {!object} [data={}] data - Routing data
   * @return {Router}
   */
  push(path, routeData = {}) {
    if (!path) throw new TypeError(`path must not be empty`);
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
    }

    if (Router.blocker) {
      Router.blocker(this, path, routeData, "PUSH", () =>
        this._historyController.push(path, { routeData })
      );

      return this;
    }
    this._historyController.push(path, { routeData });

    return this;
  }

  /**
   * Replaces specified path's state
   *
   * @since 1.0.0
   * @ignore
   * @param {string} path
   * @param {data} data
   */
  replace(path, routeData) {
    this._historyController.history.replace(path, { routeData });
  }

  /**
   * Rewinds the history
   * @since 1.0.0
   */
  goBack() {
    if (Router.blocker) {
      Router.blocker(this, null, null, "POP", () =>
        this._historyController.goBack()
      );

      return this;
    }

    this._historyController.goBack();
  }

  /**
   * Returns last location of history
   *
   * @since 1.0.0
   * @return {RouteLocation}
   */
  getLocation() {
    return this._historyController.history.location;
  }

  /**
   * Returns History entries as Array
   *
   * @since 1.0.0
   * @return {Array<string>}
   */
  getHistoryasArray() {
    return this._historyController.getHistoryasArray();
  }

  /**
   * Forwards history
   * @since 1.0.0
   */
  goForward() {
    this._historyController.history.goForward();
  }

  /**
   * Changes route by history index.
   *
   * @experimental
   * @since 1.0.0
   * @ignore
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
   * @since 1.0.0
   * @ignore
   * @experimental
   * @param {Route} route
   */
  add(route) {
    this._routes.push(route);
  }

  /**
   * Iterates child routes
   *
   * @since 1.0.0
   * @param {function} fn
   * @return {Array}
   */
  map(fn) {
    return this._routes.map(fn);
  }

  /**
   * Unloads the router
   * @since 1.0.0
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
    this._unlisten && this._unlisten();
    this._listen = null;
  }
}

module.exports = Router;
