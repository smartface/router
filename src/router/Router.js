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
   * @param {{ path: string, target: object|null, routes: Array, exact: boolean }} param0
   */
  constructor({ path = "", build = null, routes = [], exact = false }) {
    super({ path, build, routes });

    this._exact = exact;
    this._selectedRoutes = [];
    this._cache = new WeakMap();
    this._historyUnlisten = [];
    this._unblock = () => null;

    this._history = createMemoryHistory({
      initialEntries: ["/"], // The initial URLs in the history stack
      initialIndex: 0, // The starting index in the history stack
      keyLength: 20, // The length of location.key
      // A function to use to confirm navigation with the user. Required
      // if you return string prompts from transition hooks (see below)
      getUserConfirmation: (handler, callback) => {
        (this._blockPath && handler(callback, this.onBlockPath.bind(this))) ||
          true;
      }
    });

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

  setHistory() {}

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
    this.render(location);
  }

  render(location) {
    let view;
    const { matches } = location.state;

    matches.some(({ match, route }, index) => {
      // console.log(" route "+(route instanceof Router)+" : "+index+" "+JSON.stringify(match));
      if (route instanceof Router) {
        route._go(match.path, location.state.userState.data, {
          ...location,
          state: {
            userState: location.state.userState,
            matches: matches.slice(index + 1, matches.length)
          }
        });
        route.addParentRenderer(this._renderer);
        return true;
      } else if (match.isExact === true) {
        view = route.build(match.params, location.state.userState || {});
        return true;
      }
    });

    return view;
  }

  /**
   * User block event handler for protected use
   *
   * @protected
   * @param {function} handler
   */
  userBlockListener(handler) {
    this._unblock();
    this._unblock = this._history.block((location, action) => {
      return handler;
    });
  }

  /**
   * @protected
   */
  _go(path, data, location = null, addtoHistory = true) {
    const matches =
      (location && location.state && location.state.matches) ||
      matchRoutes(this._routes, path);

    if (addtoHistory) {
      (location &&
        this._history.push(path, {
          userState: Object.assign({}, location.state.userState),
          matches
        })) ||
        this._history.push(path, { userState: { data }, matches });
    } else {
      this.render(location);
    }

    return matches;
  }

  /**
   * Change history by specified path
   *
   * @params {object|string} path - Path or matches of the route
   * @params {boolean} [=true] addtoHistory
   */
  go(path, data, addtoHistory = true) {
    // this._cache.get(path) ||
    return this._go(path, data, null, addtoHistory);
  }

  /**
   * Rewinds history
   *
   */
  goBack() {
    this._history.goBack();
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
  }
}

/**
 * StackRouter
 *
 * @class
 *
 */
class StackRouter extends Router {
  /**
   * @constructor
   * @param {{options:{initialEntries: Array, initialIndex: number, keyLength: number}}, path: string, target: string, routes: Array} param0
   */
  constructor({
    options: { initialEntries = ["/"], initialIndex = 0, keyLength = 20 },
    path = "",
    build = null,
    routes = []
  }) {
    super({
      options: { initialEntries, initialIndex, keyLength },
      path,
      build,
      routes
    });
  }

  /**
   * Location change event handler
   *
   * @event
   * @param {string} location
   * @param {string} action
   */
  onChange(location, action) {}
}

module.exports = Router;
