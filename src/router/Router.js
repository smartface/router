const Route = require("./Route");
const createMemoryHistory = require("history/createMemoryHistory");
const mapComposer = require("../utils/map");
const matchPath = require("../commmon/matchPath");
const matchRoutes = require("../commmon/matchRoutes");

/**
 * Router
 *
 * @class
 */
class Router extends Route {
  /**
   * @param {{ path: string, target: object|null, routes: Array }} param0
   */
  constructor({ path = "", build = null, routes = [], exact = true }) {
    super({ path, build, routes });

    this._exact = exact;
    this._selectedRoutes = [];
    this._cache = new WeakMap();
  }

  render(matches) {
    let view;
    matches.map(({ match, route }) => {
      if (match.isExact === true) view = route.build();
    });

    return view;
  }

  // render(match) {
  //   const matched = this._routes.reduce((acc, _route) => {
  //     const match = _route.matchPath(path);
  //     match && acc.push({ match, route });
  //     return acc;
  //   }, []);
  // }

  go(path) {
    // this._cache.get(path) ||
    const matches = matchRoutes(this._routes, path);
    // !this._cache.has(path) && this._cache.set({}, matches);
    this.render(matches);

    return matches;
  }

  add(route) {
    this._routes.push(route);
  }

  map(fn) {
    return this._routes.map(fn);
  }

  // static register(){
  // }

  // static use(val){
  //   if(val instanceof Route){
  //     routes.add(val);
  //   } else if(typeof val === "object" && val.hasOwnProperty("provide")) {
  //     resolveMiddleware(val);
  //   }
  // }
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
    super({ path, build, routes });
    this._unblock = function() {};
    this._history = createMemoryHistory({
      initialEntries: initialEntries, // The initial URLs in the history stack
      initialIndex: initialIndex, // The starting index in the history stack
      keyLength: keyLength, // The length of location.key
      // A function to use to confirm navigation with the user. Required
      // if you return string prompts from transition hooks (see below)
      getUserConfirmation: (handler, callback) => {
        handler(callback, this._unblock);
      }
    });
    this._historyUnlisten.push(
      history.listen((location, action) => {
        console.log(
          `The current URL is ${location.pathname}${location.search}${
            location.hash
          }`
        );
        console.log(`The last navigation action was ${action}`);
      })
    );
  }

  /**
   * Location change event handler
   *
   * @event
   * @param {string} location
   * @param {string} action
   */
  onChange(location, action) {}

  unblock() {
    this._unblock();
  }

  /**
   * User block event handler
   *
   * @param {function} handler
   */
  userBlockListener(handler) {
    this._unblock();
    this._unblock = history.block((location, action) => {
      return handler;
    });
  }
  goForward() {}
  goBack() {}

  go() {
    this._history.go();
  }

  dispose() {
    this._historyUnlisten.forEach(unlistener => unlistener());
    this._history = null;
    this._historyUnlisten = null;
    this._unblock();
  }
}

module.exports = {
  Router,
  StackRouter
};
