import Route from "./Route";
import matchRoutes from "../common/matchRoutes";
import { HistoryController } from "../common/HistoryController";
import funcorVal from "../utils/funcorVal";
import createRouteStore from "./routeStore";
import type { Location } from "../common/Location";
import { RouteLifeCycleHandler, RouteParams } from "./RouteParams";
import { HistoryListenHandler } from "../common/history";
import { RouteBlockHandler } from "../core/RouteBlockHandler";
import { OnHistoryChange } from "../core/OnHistoryChange";
import Renderer from "native/Renderer";
import { HistoryActionType } from "common/HistoryActions";
import { RouteMatch } from "./RouteMatch";
import NativeStackRouter from "../native/NativeStackRouter";
import parseUrl from "../common/parseUrl";

export type RouterParams<Ttarget = unknown> = RouteParams<Ttarget> & {
  homeRoute?: number;
  isRoot?: boolean;
};

let tasks: any[] = [];

let historyController: HistoryController;

let _lastRoute: Route<any>;
let _backUrl: string | Location | null;
let _activeRouter: Router;

const listeners = new Set<Function>();
const history: any[] = [];
let store: ReturnType<typeof createRouteStore>;

const dispatch = (location: Location, action: string) => {
  history.push([location.url, action]);
  listeners.forEach((listener) => listener(location, action));
  action === "PUSH"
    ? historyController.pushLocation(Object.assign({}, location)) // TODO: not share loaction instance
    : historyController.goBack();
};

function handleRouteUrl(
  controller: HistoryController,
  prevUrl: string | null | undefined,
  url: string,
  routeData: object,
  action: HistoryActionType
) {
  if (url === prevUrl) return;

  controller.preventDefault();
  switch (action) {
    case "PUSH":
      controller.push(url, routeData);
      break;
    case "POP":
      controller.goBack();
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
 * @property {?function(router: Router, route: Route, viewController : NavigationController)} [routeWillEnter=null] A route or a router which is called by request in the router will be entered.
 * @property {number} homeRoute Home route index of the router's children. If it pushes first when routed to router's.
 */

/**
 * Router Core Implemantation
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
export default class Router<Ttarget = unknown> extends Route<Ttarget> {
  _isRoot: boolean;
  protected _exact: boolean;
  protected _strict: boolean;
  protected _sensitive: boolean;
  protected _fromRouter = false;
  protected _pushHomes: (path: string) => void;
  static _lock: boolean;
  dispatch?: (
    location: Location,
    action: HistoryActionType,
    target: Router<any>,
    fromRouter?: boolean
  ) => void;
  static _nextAnimated: any;
  static currentRouter: Router<any> | NativeStackRouter;
  protected _renderer?: Renderer;
  get renderer() {
    return this._renderer;
  }

  _handlers: {
    routerDidEnter?: RouteLifeCycleHandler<any>;
    routerDidExit?: RouteLifeCycleHandler<any, string>;
    routeWillEnter?: RouteLifeCycleHandler<any>;
  };
  static getGlobalRouter() {
    return historyController;
  }

  static getHistoryStack() {
    return history.slice();
  }

  static getLastHistory() {
    return history[history.length - 1];
  }

  static getlocationHistoryByIndex(index: number) {
    return history[history.length - 1];
  }

  static getHistoryByIndex(index: number) {
    return index < 0 ? history[history.length - index] : history[index];
  }
  /**
   * Factory method to create a new Router instance
   *
   * @param {RouterParams} props
   */
  static of<Ttarget = unknown>(props: RouterParams<Ttarget>) {
    return new Router<Ttarget>(props);
  }

  // TODO: Make type RouteBlockHandler
  static createBlocker(fn: Function) {
    return (
      router: Router,
      path: string,
      routeData: object,
      action: HistoryActionType,
      doneFn: Function
    ) => {
      fn(path, routeData, action, (ok: boolean) => ok && doneFn());
    };
  }

  static getActiveRouter() {
    return _activeRouter;
  }

  static get _backUrl(): string | Location | null {
    return _backUrl;
  }
  static set _backUrl(value: string | Location | null) {
    _backUrl = value;
  }

  static _activeRouter: Router;

  static blocker: ReturnType<typeof Router.createBlocker> | null;
  private _matches: ReturnType<typeof matchRoutes> = [];
  get matches() {
    return this._matches;
  }
  protected _historyController?: HistoryController;

  get historyController() {
    return this._historyController;
  }
  protected _homeRoute?: number;

  private _historyUnlisten: Function = () => null;
  private _currentUrl?: string;
  // private _routes: Route[] = []
  private _unlisten: () => void;
  private _unblock: () => void;

  private _currentAction?: string;
  private _prevRoute?: Route<any>;
  /**
   * @constructor
   * @param {RouterParams} param
   */
  constructor(params: RouterParams<Ttarget> = {}) {
    super(params, {});
    this._homeRoute = params.homeRoute;
    this._pushHomes = () => {};
    this._unlisten = () => {};
    this._unblock = () => {};
    this._handlers = {
      routerDidEnter: params.routeDidEnter,
      routerDidExit: params.routerDidExit,
      routeWillEnter: params.routeWillEnter,
    };
    if (params.isRoot) {
      store = createRouteStore();
      // this._store = createStore();
      /** @type {HistoryListener} */
      listeners.clear();
      historyController = new HistoryController({
        sensitive: params.sensitive,
        strict: params.strict,
        exact: params.exact,
        //@ts-ignore
        path: params.path,
        getUserConfirmation: (blockerFn: Function, callback: Function) => {
          return blockerFn(callback);
        },
      });

      const pushHomes = (path: string) => {
        //@ts-ignore ???
        const matches = matchRoutes(store, [this].concat(this._routes), path);
        let len = 0;
        while (++len < matches.length) {
          //@ts-ignore
          let route = matches[len].route;
          if (route instanceof Router && route.hasHome()) {
            route.pushHomeBefore && route.pushHomeBefore(path);
          }
        }
      };

      this.initialize(
        historyController,
        (
          location: Location,
          action: HistoryActionType,
          target: any,
          fromRouter = true
        ) => this.onHistoryChange(location, action, target, fromRouter),
        pushHomes
        // pushIndexes.call(this, path)
      );
    }

    this._isRoot = !!params.isRoot;
    this._exact = !!params.exact;
    this._strict = !!params.strict;
    this._sensitive = !!params.sensitive;
    this._fromRouter = false;
  }

  pushHomeBefore(path: string) {}

  /**
   * Finds and returns child Route or undefined
   *
   * @since 1.4.1
   * @param {function(child:(Route|Router), index:number)}
   */
  findChild(fn: Parameters<Array<Route | Router>["find"]>[0]) {
    return this._routes.find(fn);
  }

  historyPreventDefault() {
    this._historyController?.preventDefault();
  }

  pushAndBack(url: string, routeData: any) {
    Router._backUrl = Router.getGlobalRouter().lastLocation;
    this.push(url, routeData);
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
  initialize(
    parentHistory: unknown,
    onHistoryChange: OnHistoryChange<any>,
    pushHomes: (path: string) => void
  ) {
    this._pushHomes = pushHomes;
    /**
     * parentHistory is supposed to be a function, idk why it acts like an object.
     */
    //@ts-ignore
    this._historyController = parentHistory.createNode(
      Object.assign({}, this._options, {
        getUserConfirmation: (
          blockerFn: (...args: any) => void,
          callback: (...args: any) => void
        ) => {
          return blockerFn(callback);
        },
      })
    );

    this._routes.forEach((route) => {
      //TODO: This comes from one of the parents
      if (route.initialize) {
        //@ts-ignore
        route.initialize(this._historyController, onHistoryChange, pushHomes);
      }
    });

    this._unlisten =
      this._historyController?.listen((location, action) => {
        onHistoryChange(location, action, this, true); // fires root's onHistoryChange
      }) || this._unlisten;

    // changes route without history
    this.dispatch = (
      location: Location,
      action,
      target: Router<Ttarget>,
      fromRouter = false
    ) => {
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
    return this._historyController?.history;
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
   * it tests that Whether router can go back as n
   * @example
   * ...
   * router.canGoBack(-3) ? router.goBackto(-3) : // if not, do anything else
   *
   * @since 1.1.0
   * @param {number} n Amount of back as negative value
   * return {boolean}
   */
  canGoBack(n: number) {
    return this._historyController?.canGoBack(n);
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
  listen(fn: HistoryListenHandler) {
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
  addRouteBlocker(fn: RouteBlockHandler) {
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
  onHistoryChange(
    location: Location,
    action: HistoryActionType,
    target: Router,
    fromRouter = true
  ) {
    
    if (!location) throw new Error("Location cannot be empty.");
    if (this._isRoot) {

      this._matches = matchRoutes(
        this.getStore(),
        [this, ...this._routes],
        location.url
      );
      // console.log('onHistoryChange : ', location, action);
      // var err = new Error();
      this.renderMatches(this._matches, location, action, target, fromRouter);
    }

    dispatch(location, action);
  }

  /**
   * Removes last entry from history without trigger history is changed.
   *
   * @since 1.0.0
   * @ignore
   * @protected
   */
  routeRollback() {
    this._historyController?.rollback();
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
  renderMatches(
    matches: ReturnType<typeof matchRoutes>,
    location: Location,
    action: HistoryActionType,
    target: Router,
    fromRouter: boolean
  ): void {
    this._fromRouter = fromRouter;
    const routeData = location.state;

    /**
     * Either matches param type or this match and route is incorrect
     */
    //@ts-ignore
    matches.some(
      (
        {
          match,
          route,
        }: { match?: Partial<RouteMatch>; route: Route<Ttarget> },
        index
      ) => {
        route.setState({
          hash: location.hash,
          query: location.query,
          rawQuery: location.rawQuery,
          action,
          match,
        });
        const self: Router<Ttarget> = this;
        // @ts-ignore
        const isSelf = route === self;
        if (!isSelf && match?.isExact !== true && route instanceof Router) {
          // route.initializeWaiting && route.initializeWaiting();
          tasks.push((url: string, action: string) => {
            if (typeof this.routeWillEnter === "function") {
              /**
               * Argument count
               */
              //@ts-ignore
              this.routeWillEnter(route, url, action, false, target);
            }
            // handleRouteUrl(this, url, routeData, action);
          }); // add new router display logic from root to children

          route.setUrl(location.url);

          // move routes to child router
          route.renderMatches(
            matches.slice(index, matches.length),
            location,
            action,
            target,
            fromRouter
          );

          return true;
        } else if (match?.isExact === true) {
          const to = route.getRedirectto();
          const redirection = !!to && funcorVal(to, [this, route]);

          if (redirection && redirection !== match?.url) {
            tasks = []; // reset tasks
            target.routeRollback(); // remove redirected path from target Router
            //  because real path can be owned by different router.
            // -----
            // And then trigger redirection path.
            //@ts-ignore
            target.redirectRoute(route, routeData, action, target);
            return false;
          }

          // @ts-ignore
          Router._activeRouter = this;
          // @ts-ignore
          const routingState =
            // @ts-ignore
            (route.getRoutingState &&
              // @ts-ignore
              route.getRoutingState(route._state, {
                match,
                action,
                routeData,
              })) ||
            {};
          // change route state to move data to callbacks
          route.setState({
            rawQuery: location.search,
            query: location.query,
            match,
            action,
            routeData,
            routingState,
          });
          route.setUrl(location.url);

          // If route owned by current child router which is different from target router
          // then push or pop route to child router's history.
          // Because current router isn't aware of the route.
          // @ts-ignore
          if (target != this) {
            //@ts-ignore
            this._historyController && match && match.url &&
              handleRouteUrl(
                this._historyController,
                this.state.prevUrl,
                match.url,
                routeData,
                action
              );
          }

          // Views' tasks must be end of the matches rendering,
          // because there must not be rendered any view before route blocking.
          // An another reason is that we build views from child to parent
          // but we need to build from parent to child.
          tasks.push((url: string, action: string) => {
            if (typeof this.routeWillEnter === "function") {
              //@ts-ignore
              this.routeWillEnter(route, url, action, true, target);
            }
          });

          if (_lastRoute) {
            // notify current route to exit
            _lastRoute.setState({ action });
            // @ts-ignore
            _lastRoute.routeDidExit(this);
          }

          this.routeDidMatch(route); // fires routeDidMatch
          if (this._fromRouter && action !== "POP") {
            const view = this.renderRoute(route); // build route's view
            route.setState({ view }); // keep view in the route's state
          }
          // reverse views' tasks because of rendering must be from bottom to top
          tasks.reverse().forEach((task) => task(location.url, action)); // trigger all routers' routeWillEnter in the tasks queue
          typeof this.routerDidEnter === "function" &&
            this.routerDidEnter(route); // fires routerDidEnter
          route.routeDidEnter(this); // fires routeDidEnter
          _lastRoute = route; // save exact matched route as last route
          this._currentAction = action;
          this._prevRoute = route;
          tasks = []; // clear tasks
          return true;
        }
      }
    );

    this._fromRouter = false;
  }

  /**
   * Handles a new route which is activated in the router
   *
   * @since 1.0.0
   * @event
   * @protected
   * @param {Router} router
   * @param {string} action
   */
  routeWillEnter(route: Router | Route, action: string) {
    //@ts-ignore
    const viewConroller =
      route instanceof Router
        ? route.renderer?._rootController
        : route.getState().view;
    //@ts-ignore
    if (typeof this._handlers?.routeWillEnter === "function") {
      //@ts-ignore
      this._handlers.routeWillEnter(this, route, viewConroller);
    }
  }

  /**
   * @since 1.0.0
   * @ignore
   * @param {string} url
   * @param {string} action
   */
  isUrlCurrent(url?: string, action?: string | null) {
    const res = action && this._currentUrl && this._currentUrl === url && this._currentAction === action;
    return res;
  }

  /**
   * Life-cycle handler emits when Router is activated
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
  routerDidEnter(route: Route<any>) {
    typeof this._handlers?.routerDidEnter === "function" &&
      this._handlers.routerDidEnter(this, route);
  }

  /**
   * Sets the router statically as active router
   *
   * @since 1.0.0
   * @protected
   * @param {string} action
   */
  setasActiveRouter(action: string | null) {
    // @ts-ignore
    if (
      this != Router.currentRouter &&
      typeof Router.currentRouter?.routerDidExit === "function"
    ) {
      action && Router.currentRouter.routerDidExit(action);
    }
    //
    Router.currentRouter = this;
  }

  /**
   * Emits when the router is deactivated.
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
  routerDidExit(action: string) {
    this._handlers.routerDidExit && this._handlers.routerDidExit(this, action);
  }

  /**
   * Redirects route and removes last route's record from the history.
   *
   * @protected
   * @param {Route} route
   * @param {object} routeData
   * @param {string} action
   */
  redirectRoute(route: Route, routeData: Record<string, any>, action: string) {
    // redirection of a route
    //@ts-ignore
    this.push(funcorVal(route.getRedirectto(), [this, route]), routeData); // and add new route
    // this._historyController.push(route.getRedirectto(), routeData);
  }

  /**
   * @since 1.0.0
   * @private
   * @ignore
   * @param {Page} view
   */
  isViewEmpty(view: any) {
    return view !== null || view !== undefined;
  }

  /**
   * Route matched to requested url
   *
   * @since 1.0.0
   * @protected
   * @param {Route} route
   */
  routeDidMatch(route: Route<any>) {
    // alert(this.getUrlPath()+" "+Router._backUrl);
    const { match, action, routeData } = route.getState();
    // this.setState({
    //   backUrl: Router._backUrl
    // });
    // this._backUrl = Router._backUrl;
    // Router._backUrl = null;
    // if (match.isExact) {
    // const prevUrl = this._currentUrl;
    this.setasActiveRouter(action);
    // }
  }

  /**
   * Render route
   *
   * @since 1.0.0
   * @protected
   * @param {Route} route
   * @throws {TypeError}
   */
  renderRoute(route: Route<any>) {
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
  pushRoute(route: Route) {
    if (!(route instanceof Route)) {
      throw new TypeError(`route must be instance of Route`);
    }
    const to = route.getRedirectto();
    //@ts-ignore
    const url =
    to && funcorVal(to, [this, route]) || route.getUrlPath();
    this.push(url);
  }

  isAnimated() {
    return Router._nextAnimated;
  }

  /**
   * Pushes new history entry with specified path
   *
   * @since 1.0.0
   * @param {object|string} path - Path or matches of the route
   * @param {!object} [routeData={}] routeData - Routing data
   * @param {!boolean} [animated={}] routeData - Routing data
   * @return {Router}
   */
  push(path: string, routeData = {}, animated = true) {
    Router._nextAnimated = animated;

    this._fromRouter = true;
    if (typeof path === "string" && path.charAt(0) !== "/") {
      path = this._path.getPath() === "/" ? "/" + path : this._path.getPath() + path;
    }

    if (Router.blocker) {
      Router.blocker(this, path, routeData, "PUSH", () => {
        this._pushHomes(path);
        this._historyController?.push(path, routeData);
        this._fromRouter = false;
      });

      return this;
    }
    try {
      this._pushHomes(path);
    } catch (e) {
      throw e;
    }
    this._historyController?.push(path, routeData);
    this._fromRouter = false;
    return this;
  }

  isValidPath(path: string) {
    return /^(\/\w+)+(\.)?\w+(\?(\w+=[\w\d]+(&\w+=[\w\d]+)*)+){0,1}$/.test(
      path
    );
  }

  /**
   * Replaces specified path's state
   *
   * @experimental
   * @since 1.0.0
   * @ignore
   * @param {string} path
   * @param {data} routeData
   */
  replace(path: string, routeData: Record<string, any>) {
    this._historyController?.history.replace(path, routeData);
  }

  /**
   * Rewinds the history
   *
   * @since 1.0.0
   * @param {string | RouteLocation} url This is an experimental feature. If you use this feature you should use for same StackRouter stack.
   * @param {boolean} [animmated=true]
   * @return {Router}
   */
  goBack(url?: string | Location, animated = true) {
    const go = () => {
      Router._nextAnimated = animated;
      this._fromRouter = true;
      if (url) {
        this.dispatch?.(
          typeof url === "string"
            ? parseUrl(url)
            : url,
          "POP",
          this,
          true
        );
      } else {
        this._historyController?.goBack();
      }
      this._fromRouter = false;
    };
    if (Router.blocker) {
      //@ts-ignore
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
    //@ts-ignore
    return this._historyController?.history.location;
  }

  /**
   * Returns History entries as Array
   *
   * @since 1.0.0
   * @return {Array<string>}
   */
  getHistoryasArray() {
    return this._historyController?.getHistoryasArray() || [];
  }

  /**
   * Forwards history
   *
   * @experimental
   * @ignore
   * @since 1.0.0
   */
  goForward() {
    this._historyController?.history.goForward();
  }

  /**
   * Changes route by history index.
   *
   * @experimental
   * @since 1.0.0
   * @ignore
   * @param {number} index
   */
  go(index: number) {
    //@ts-ignore
    this._historyController?.go(index);
  }

  /**
   * Adds new route
   *
   * @since 1.0.0
   * @ignore
   * @experimental
   * @param {Route} route
   */
  add(route: Route) {
    this._routes.push(route);
  }

  // /**
  //  * Iterates child routes
  //  *
  //  * @since 1.0.0
  //  * @param {function} fn
  //  * @return {Array}
  //  */
  // map(fn) {
  //   return this._routes.map(fn);
  // }

  /**
   * Unloads the router
   * @since 1.0.0
   */
  dispose() {
    this._historyUnlisten();
    // if (this._isRoot) {
    this._historyController?.dispose();
    this._historyController = undefined;
    // }
    //@ts-ignore
    this._routes.forEach((route) => route.dispose());
    //@ts-ignore
    this._routes = null;
    //@ts-ignore
    this._historyUnlisten = null;
    this._unblock && this._unblock();
    //@ts-ignore
    this._unblock = null;
    //@ts-ignore
    this._handlers = null;
    this._unlisten && this._unlisten();
    //@ts-ignore
    this._listen = null;
  }
}

Router._lock = false;
Router._nextAnimated = true;
//@ts-ignore
Router._activeRouter = null;
