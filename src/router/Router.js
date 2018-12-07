"use strict";

const Route = require("./Route");
const matchRoutes = require("../common/matchRoutes");
const createHistory = require("../common/createHistory");
const createStore = require("./routeStore");
const funcorVal = require("../utils/funcorVal");
let tasks = [];

let historyController;

let _lastRoute;
const listeners = new Set();
const history = [];
let store;

const dispatch = (location, action) => {
  history.push([location.pathnamme, action]);
  listeners.forEach(listener => listener(location, action));
  action === "PUSH"
    ? historyController.pushLocation(location) // TODO: not share loaction instance
    : historyController.goBack();
};

function handleRouteUrl(router, url, routeData, action) {
  if (url === router._state.prevUrl) return;

  router._historyController.preventDefault();
  switch (action) {
    case "PUSH":
      router._historyController.push(url, routeData);
      break;
    case "POP":
      router._historyController.goBack();
      break;
  }
}

/**
 * @typedef {object} RouterParams
 * @property {!string} [path]  Routing path
 * @property {!Array<Route>} [routes=[]] Child routes
 * @property {?boolean} [exact=false] If it's only exact match or not
 * @property {?boolean} [isRoot=false] If it's root router
 * @property {?(string|null)} to Redirection path
 * @property {?boolean} [strict=false] strict
 * @property {?boolean} [sensitive=false] sensitive Path is case sensitive or not
 * @property {?function(router: Router, prevUrl: string, currentUrl: stirng, action: string)} routerDidEnter Handles the Router is actived.
 * @property {?function(router: Router, prevUrl: string, action: string)} routerDidExit Handles the Router is deactived.
 * @property {number} homeRoute Home route index of the router's children. If it pushes first when routed to router's.
 */

/**
 * Router Base
 *
 * @description
 * Router implementation creates a thin layer between view and application layers
 * to handle view changes and to create loosely coupled and resuable routing logic.
 *
 * @class
 *
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
 * @example
 * // Homeroute setting
 *
 * ...
 *      StackRouter.of({
 *           path: "/stack",
 *           to: "/stack/path1",
 *           homeRoute: 0, // it's first push if target is path diffrent.
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
 *       })
 * ...
 *
 * @since 1.0.0
 * @extends {Route}
 */
class Router extends Route {
  static getGlobalRouter() {
    return historyController;
  }
  static getHistoryStack() {
    return history.slice();
  }

  static getLastHistory() {
    return history[history.length - 1];
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
    modal = false,
    routerDidEnter,
    routerDidExit,
    routeShouldMatch,
    homeRoute = null
  }) {
    super({ path, modal, build, routes, to, isRoot, routeShouldMatch });
    this._homeRoute = homeRoute;
    this._historyUnlisten = () => null;
    this._handlers = {
      routerDidEnter,
      routerDidExit
    };

    if (isRoot) {
      store = createStore();
      // this._store = createStore();
      /** @type {HistoryListener} */
      listeners.clear();
      historyController = createHistory({
        sensitive,
        strict,
        exact,
        path,
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      });

      const pushHomes = path => {
        const matches = matchRoutes(store, [this].concat(this._routes), path);
        let len = 0;
        while (++len < matches.length) {
          let route = matches[len].route;
          if (route.__is_router && route.hasHome()) {
            route.pushHomeBefore && route.pushHomeBefore(path);
          }
        }
      };

      this.initialize(
        historyController,
        (location, action, target, fromRouter = true) =>
          this.onHistoryChange(location, action, target, fromRouter),
        pushHomes
        // pushIndexes.call(this, path)
      );
    }

    this._isRoot = isRoot;
    this._exact = exact;
    this._strict = strict;
    this._sensitive = sensitive;
    this._fromRouter = false;
  }

  /**
   * Router is initialized by parent
   *
   * @protected
   * @since 1.0.0
   * @param {HistoryListener} parentHistory
   * @param {function} onHistoryChange Root onHistoryChange handler
   * @param {function} pushHomes It uses in order to push routers' home-route
   */
  initialize(parentHistory, onHistoryChange, pushHomes) {
    this._pushHomes = pushHomes;
    /** @type {HistoryController} */
    this._historyController = parentHistory.createNode(
      Object.assign({}, this._options, {
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      })
    );

    this._routes.forEach(route => {
      route.initialize &&
        route.initialize(this._historyController, onHistoryChange, pushHomes);
    });

    this._unlisten = this._historyController.listen((location, action) => {
      onHistoryChange(location, action, this, true); // fires root's onHistoryChange
    });

    // changes route without history
    this.dispatch = (location, action, target, fromRouter = false) => {
      onHistoryChange(location, action, target, fromRouter);
    };
  }

  hasHome() {
    return this._homeRoute !== null;
  }

  /**
   * Fast router's instance checking
   *
   * @since 1.0.0
   * @return {boolean}
   */
  get __is_router() {
    return true;
  }

  /**
   * @ignore
   * @since 1.0.0
   */
  getHistory() {
    return this._historyController.history;
  }

  /**
   * Return current active url
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
   *     console.log(`new route location: ${location.url} action : ${action}`);
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

    return this._unblock;
  }

  getStore() {
    return store;
  }

  /**
   * Handles history changes. Just Root router,
   * because routing flow mmust be always root to children,
   * in order to change display logic all the time.
   *
   * @since 1.0.0
   * @protected
   * @param {RouteLocation} location
   * @param {string} action
   * @param {Router} target Target Router which pushed to its router.
   * @param {boolean} [fromRouter=true]
   */
  onHistoryChange(location, action, target, fromRouter = true) {
    try {
      if(location.url === '/nav/tabs/discover/products/28186')
        throw new Error();
    }catch(e){
      console.log(e.stack)
    }
    console.log('onHistoryChange'+location.p);
    if (this._isRoot) {
      this._matches = matchRoutes(
        this.getStore(),
        [this].concat(this._routes),
        location.url
      );
      this.renderMatches(this._matches, location, action, target, fromRouter);
    }
  }

  /**
   * Removes last entry from history without trigger history is changed.
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
   * @since 1.0.0
   * @emits RouteShouldMatchHandler
   * @param {Array<{isExact: boolean,params: object,path: string,url: string}>} matches Route matches of the current request
   * @param {RouteLocation} location Current location
   * @param {string} action Current history action
   * @param {Router} target Target Router which pushed to its router.
   * @param {boolean} fromRouter If the specified request if from the router or an another source.
   */
  renderMatches(matches, location, action, target, fromRouter) {
    this._fromRouter = fromRouter;

    const routeData = location.state;

    matches.some(({ match, route }, index) => {
      route.setState({
        hash: location.hash,
        query: location.query,
        rawQuery: location.rawQuery,
        action,
        match
      });
      if (match.isExact !== true && route !== this && route.__is_router) {
        // if(index > 0 && this._isRoot)
        tasks.push((url, action) => {
          this.routeWillEnter &&
            this.routeWillEnter(route, url, action, false, target);
          // handleRouteUrl(this, url, routeData, action);
        }); // add new router display logic from root to children

        route.setUrl(location.url);

        // move routes to child router
        route.renderMatches(
          matches.slice(index, matches.length),
          location,
          action,
          target,
          fromRouter,
          this
        );

        return true;
      } else if (match.isExact === true) {
        const redirection = funcorVal(route.getRedirectto(), [this, route]);
        if (redirection && redirection !== match.url) {
          tasks = []; // reset tasks
          target.routeRollback(); // remove redirected path from target Router
          //  because real path can be owned by different router.
          // -----
          // And then trigger redirection path.
          target.redirectRoute(route, routeData, action, target);
          return false;
        }

        const routingState =
          (route.getRoutingState &&
            route.getRoutingState(route._state, {
              match,
              action,
              routeData
            })) ||
          {};
        // change route state to move data to callbacks
        route.setState({
          query: location.search,
          match,
          action,
          routeData,
          routingState
        });
        route.setUrl(location.url);

        // If route owned by current child router which is different from target router
        // then push or pop route to child router's history.
        // Because current router isn't aware of the route.
        if (target != this) {
          handleRouteUrl(this, match.url, routeData, action);
        }

        // View operations must leave to end of rendering,
        // because there must not render any view before route blocking.
        // An another reason is we build views from child to parent but routing happens
        // parent to child.
        tasks.push(
          (url, action) =>
            this.routeWillEnter &&
            this.routeWillEnter(route, url, action, true, target)
        );

        _lastRoute && _lastRoute.routeDidExit(this);
        this.routeDidMatch(route); // fires routeDidMatch
        if (this._fromRouter) {
          const view = this.renderRoute(route); // build route's view
          route.setState({ view }); // keep view in the route's state
        }
        tasks.reverse().forEach(task => task(location.url, action)); // trigger all routers' routeWillEnter in the tasks queue
        this.routerDidEnter && this.routerDidEnter(route); // fires routerDidEnter
        route.routeDidEnter(this); // fires routeDidEnter
        _lastRoute = route; // save exact matched route as last route
        this._currentAction = action;
        this._prevRoute = route;
        dispatch(location, action);

        tasks = []; // clear tasks
        return true;
      }
    });

    this._fromRouter = false;

    return true;
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
   * Life-cycle event handler handles when Router is activated
   * @example
   * ....
   * Router.of({
   *  routerDidEnter: (router, route) => {
   *    ...
   *  }
   * })
   *
   * @since 1.0.0
   * @emits routerDidEnter
   * @protected
   * @param {Route} route
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
   * Redirects route and removes last route record from history.
   *
   * @protected
   * @param {Route} route
   * @param {object} routeData
   * @param {string} action
   */
  redirectRoute(route, routeData, action) {
    // redirection of a route
    this.push(funcorVal(route.getRedirectto(), [this, route]), routeData); // and add new route
    // this._historyController.push(route.getRedirectto(), routeData);
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
   * Route is matched handler.
   *
   * @since 1.0.0
   * @protected
   * @param {Route} route
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
    const view = route.build && route.build(this);
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
    this.push(
      funcorVal(route.getRedirectto(), [this, route]) || route.getUrlPath()
    );
  }

  /**
   * Change history by specified path
   *
   * @since 1.0.0
   * @param {object|string} path - Path or matches of the route
   * @param {!object} [routeData={}] routeData - Routing data
   * @return {Router}
   */
  push(path, routeData = {}) {
    console.log(`push ${path}`);
    if (path === this._state.url) {
      Object.assign(this._historyController.history.location.state, {
        routeData
      });
      this.dispatch(
        this._historyController.history.location,
        "PUSH",
        this,
        true
      );

      return this;
    }

    this._fromRouter = true;
    // if (!this.isValidPath(path)) throw new TypeError(`[${path}] Pat h is invalid`);
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
    }

    if (Router.blocker) {
      Router.blocker(this, path, routeData, "PUSH", () =>
        this._historyController.push(path, routeData)
      );

      return this;
    }
    try {
      this._pushHomes(path);
    } catch (e) {
      throw e;
    }
    this._historyController.push(path, routeData);
    this._fromRouter = false;
    return this;
  }

  isValidPath(path) {
    return /^(\/\w+)+(\.)?\w+(\?(\w+=[\w\d]+(&\w+=[\w\d]+)*)+){0,1}$/.test(
      path
    );
  }

  /**
   * Replaces specified path's state
   *
   * @since 1.0.0
   * @ignore
   * @param {string} path
   * @param {data} routeData
   */
  replace(path, routeData) {
    this._historyController.history.replace(path, routeData);
  }

  /**
   * Rewinds the history
   *
   * @since 1.0.0
   * @param {string | RouteLocation} url This routes an experimental feature. If you use this feature you should use for same StackRouter stack.
   * @return {Router}
   */
  goBack(url) {
    const go = () => {
      this._fromRouter = true;

      url
        ? this.dispatch(
            typeof url === "string"
              ? { url, hash: "", search: "", state: {} }
              : url,
            "POP",
            this,
            true
          )
        : this._historyController.goBack();
      this._fromRouter = false;
    };
    if (Router.blocker) {
      Router.blocker(this, null, null, "POP", () => go());

      return this;
    }

    go();
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
   *
   * @experimental
   * @ignore
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
   */
  go(index) {
    this._historyController.go(index);
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
