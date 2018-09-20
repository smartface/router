const Route = require("./Route");
const createMemoryHistory = require("../common/history");
const mapComposer = require("../utils/map");
const matchPath = require("../common/matchPath");
const matchRoutes = require("../common/matchRoutes");

/**
 * Router
 *
 * @class
 */
class Router extends Route {
  /**
   * @constructor
   * @param {{ path: string, target: object|null, routes: Array, exact: boolean, isRoot: boolean }} param0
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    isRoot = false
  }) {
    super({ path, build, routes });

    this._exact = exact;
    this._selectedRoutes = [];
    this._cache = new WeakMap();
    this._historyUnlisten = [];
    this._unblock = () => null;
    this._isRoot = isRoot;

    this.setHistory(
      createMemoryHistory({
        initialEntries: [], // The initial URLs in the history stack
        initialIndex: 0, // The starting index in the history stack
        keyLength: 20, // The length of location.key
        // A function to use to confirm navigation with the user. Required
        // if you return string prompts from transition hooks (see below)
        getUserConfirmation: (handler, callback) => {
          (this._blockPath && handler(callback, this.onBlockPath.bind(this))) ||
            true;
        }
      })
    );
  }

  setHistory(history) {
    this._history = history;

    // if (this._isRoot)
    this._historyUnlisten.push(
      /**
       * @params {{
            pathname: string,
            search: string,
            state: object
          }} location
       *
       */
      this._history.listen((location, action) => {
        this.onHistoryChange(location, action);
      })
    );
  }

  addParentRenderer(parent) {
    parent && parent.show(this._renderer._rootPage);
  }

  setRenderer(renderer) {
    this._renderer = renderer;
  }

  /**
   * Blocks path handler for user inteact for example user confirmation
   *
   */
  onBlockPath(fn) {
    this._blockPath = fn;
  }

  /**
   * @params {{
        pathname: string,
        search: string,
        state: object
      }} location
   * @params {object} action
   */
  onHistoryChange(location, action) {
    this.renderLocation(location, action);
  }
  
  renderSelf(){
    
  }

  renderMatches(matches, state, action) {
    matches.some(({ match, route }, index) => {
      if (route instanceof Router) {
        // move routes to child router
        route.renderMatches(matches.slice(index + 1, matches.length), state);
        route.addParentRenderer(this._renderer);
        route.setParent(this);
        Router.currentRouter = this;
        return true;
      } else if (match.isExact === true) {
        if(route.to){
          // redirection of a route
          this.go(route.to);
          
          return true;
        }
        // if route is exact then create new history
        this._history.push(match.url, {
          userState: state.userState,
          matches
        });
        return true;
      }
    });
  }

  renderLocation(location) {
    let view;
    const { matches } = location.state;

    matches.some(({ match, route }, index) => {
      if (match.isExact === true) {
        view = route.build(
          match,
          location.state.userState || {},
          this
          // location.state.view
        );
        // location.state.view = view;
        return true;
      }
    });

    return view;
  }

  setParent(parent) {
    this._parent = parent;
  }

  /**
   * User block event handler for protected use
   *
   * @protected
   * @param {function} handler
   */
  onBeforeRouteChange(handler) {
    this._unblock();
    this._unblock = this._history.block((location, action) => {
      return handler;
    });
  }

  /**
   * Goes to route for internal use
   * @protected
   */
  _go(path, data, addtoHistory = true) {
    const matches = matchRoutes(this._routes, path);

    this.renderMatches(matches, { userState: { data } });
    return matches;
  }

  /**
   * Change history by specified path
   *
   * @params {object|string} path - Path or matches of the route
   * @params {boolean} [=true] addtoHistory
   */
  go(path, data, action="PUSH", addtoHistory = true) {
    // this._cache.get(path) ||
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
      return this._go(path, data, {}, addtoHistory);
    } else {
      return (
        (this._parent && this._parent.go(path, data, addtoHistory)) ||
        this._go(path, data, {}, addtoHistory)
      );
    }
  }

  /**
   * Rewinds history
   *
   */
  goBack() {
    if (this._history.canGo(-1)) {
      this._history.goBack();
    } else {
      this._parent && this._parent._history.go(0);
    }
  }

  getLocation() {
    return this._history.location;
  }

  /**
   * Forwards history
   *
   */
  goForward() {
    this._history.goForward();
  }

  /**
   * Adds new route
   * @params {Route} route
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
   * Unloads the router
   *
   */
  dispose() {
    this._historyUnlisten.forEach(unlistener => unlistener());
    this._history = null;
    this._historyUnlisten = null;
    this._unblock();
    this._parrent = null;
  }
}

module.exports = Router;
