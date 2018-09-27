const Route = require("./Route");
const createMemoryHistory = require("../common/history");
const mapComposer = require("../utils/map");
const matchPath = require("../common/matchPath");
const matchRoutes = require("../common/matchRoutes");
let actions = [];

let history;
/**
 * Router Implementation
 *
 * @class
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

  /**
   * Adds event-listener to listen history changes
   * @param {function} fn - Event-listener callback
   */
  static addListener(fn) {
    return history.listen(fn);
  }

  /**
   * Sets null
   *
   */
  static unloadHistory() {
    history = null;
  }
  /**
   * @constructor
   * @param {{ path: string, target: object|null, routes: Array, exact: boolean, isRoot: boolean }} param0
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
          console.log("confirmation");
          return blockerFn(callback);
        }
      });
    }

    this._historyUnlisten = () => null;
    if (isRoot) {
      this._historyUnlisten = history.listen((location, action) => {
        this.onHistoryChange(location, action);
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
   * @param {function}
   * location = {"pathname","search","hash","state","key"}
   * action = string
   */
  listen(fn) {
    return history.listen(fn);
  }

  /**
   * Returns the history instance
   *
   * @returns {object}
   */
  getHistory() {
    return history;
  }

  /**
   * Adds route block handler to history. When history is changed in anywhere
   * then the handler intercepts before history is changed.
   *
   * @param {function} fn
   */
  addRouteBlocker(fn) {
    const unblock = history.block((location, action) => callback => {
      fn(location, action, callback, this, unblock);
    });

    return unblock;
  }

  /**
   * Blocks path handler for user inteact for example user confirmation
   * @event
   */
  onBlockPath(fn) {
    this._blockPath = fn;
  }

  /**
   * Triggered when the current route's parent is another router.
   *
   * @event
   * @param {string} action
   */
  onRouteExit(action) {}

  /**
   * @param {{ pathname: string, search: string, state: object }} location
   * @param {object} action
   */
  onHistoryChange(location, action) {
    if (this._skipRender) return;

    this._matches = matchRoutes(this._routes, location.pathname);

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
   * @param {Array.<{isExact: boolean,params: object,path: string,url: string}>} matches
   * @param {object} state
   * @param {string} action
   */
  renderMatches(matches, state, action) {
    matches.some(({ match, route }, index) => {
      if (match.isExact !== true && route instanceof Router) {
        // if(index > 0 && this._isRoot)
        actions.length === 0 &&
          this.addChildRouter &&
          actions.push([this.addChildRouter.bind(this), route]);
        // move routes to child router
        if (route !== this) {
          route.renderMatches(
            matches.slice(index + 1, matches.length),
            state,
            action
          );
          // route.addParentRenderer(this._renderer);
        }
        // route.setParent(this);
        // Router.currentRouter = this;

        return true;
      } else if (match.isExact === true) {
        // route has redirection
        if (route.getRedirectto()) {
          actions = [];
          // rollback current route
          this.routeRollback(); // pop current route from history
          this.push(route.getRedirectto()); // redirect to specified route
          return true;
        }

        if (this.onRouteMatch(route, match, state, action)) {
          actions.forEach(item => item[0](item[1]));
          actions = [];

          Router.currentRouter &&
            this != Router.currentRouter &&
            Router.currentRouter.onRouteExit(action);
          Router.currentRouter = this;
        }

        actions = [];

        return true;
      }
    });
  }

  /**
   * @event
   * @protected
   * @param {Route} route
   * @param {{isExact: boolean, params: object, path: string, url: string}} match
   * @param {object} state
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
   * Renders specifeid route
   *
   * @protected
   * @param {Route} route
   * @param {{isExact: boolean, params: object,path: string, url: string}} match
   * @param {object} state
   */
  renderRoute(route, match, state) {
    let view;

    // if (match.isExact === true) {
    view = route.build(match, state.userState || {}, this, state.view);
    state.view = view;

    return view;
    // }

    // return false;
  }

  /**
   * Pushes specified path to history
   *
   * @param {object} path - Path or matches of the route
   * @param {object}  data Routing data
   */
  push(path, data) {
    // this._cache.get(path) ||
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
      // } else {
      //   return (
      //     // (this._parent && this._parent.go(path, data, addtoHistory)) ||
      //     this._go(path, data, addtoHistory)
      //   );
    }

    this.getHistory().push(path, { userState: { data } });

    return this;
  }

  /**
   *
   * @param {string} path
   * @param {data} data
   */
  replace(path, data) {
    this.getHistory().replace(path, { userState: data });
  }

  /**
   * Rewinds history
   *
   */
  goBack() {
    this.getHistory().go(-1);
  }

  /**
   * Returns last location of history
   * @returns {Location}
   */
  getLocation() {
    return this.getHistory().location;
  }

  /**
   * Forwards history
   *
   */
  goForward() {
    this.getHistory().goForward();
  }

  /**
   * Changes route by history index.
   * @param {number} index
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
   * @param {Route} route
   *
   */
  add(route) {
    this._routes.push(route);
  }

  /**
   * Iterates child routes
   *
   * @paramms {function} fn
   */
  map(fn) {
    return this._routes.map(fn);
  }

  /**
   * Unloads the router instance
   *
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
