"use strict";
require('../types');

const Route = require("./Route");
const createMemoryHistory = require("../common/history");
const mapComposer = require("../utils/map");
const matchPath = require("../common/matchPath");
const matchRoutes = require("../common/matchRoutes");
let actions = [];

let _historyController;

function createHistory({
  initialEntries = null,
  initialIndex = null,
  keyLength = null,
  getUserConfirmation = null
}, parent=null) {

  let _history = createMemoryHistory({
    initialEntries: initialEntries || [], // The initial URLs in the history stack
    initialIndex: initialIndex || 0, // The starting index in the history stack
    keyLength: keyLength || 20, // The length of location.key
    // A function to use to confirm navigation with the user. Required
    // if you return string prompts from transition hooks (see below)
    getUserConfirmation: getUserConfirmation
  });

  let _skipRender = false;
  const _listeners = new Set();
  const _unlistenAll = new Set();


  return new class HistoryController {
    constructor() {
    }

    set skipRender(val) {
      _skipRender = val;
    }

    createNode(props={}) {
      const node = createHistory(props, _history);
      _listeners.forEach(listener => _unlistenAll.add(node.listen(listener)));
      
      return node;
    }

    get skipRender() {
      return _skipRender;
    }

    get history() {
      return _history;
    }
    
    rollback(){
      _history.rollback();
    }

    unloadHistory() {
      _history = null;
    }

    push(path, state) {
      console.log(`history push ${path}`);
      _history.push(path, state);
    }
    
    canGoBack(){
      return _history.canGo(-1);
    }

    goBack(){
      if(this.canGoBack())
        _history.goBack();
      else if(parent)
        parent.goBack();
    }

    listen(fn) {
      const unlisten = new Set();
      if(parent){
        unlisten.add(parent.listen(fn));
      }
      
      _listeners.add(fn);
      unlisten.add(_history.listen(fn));
      console.log(_unlistenAll.constructor.name);
      unlisten.forEach(item => _unlistenAll.add(item));
      return () => {
        unlisten.forEach(item => { item(); _unlistenAll.delete(item); });
        _listeners.delete(fn);
      };
    }

    toString() {
      return '[Object HistoryController]';
    }
    
    dispose(){
      _unlistenAll.forEach(item => item());
      _unlistenAll.clear();
      _listeners.clear();
      _history = null;
      parent = null;
    }
  };
}
// let _skipRender = false;

/**
 * Router Base
 * Base Router implementation
 *
 * @class
 * @extends {Route}
 */
class Router extends Route {
  /**
   * @constructor
   * @param {{ path: string, routes: Array, exact: boolean, isRoot: boolean, to: (string|null) }} param
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
    console.log('Router created')
    if (!_historyController) {
      console.log('Router history is creating');
      _historyController = createHistory({
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      });
      this._historyController = _historyController;
    } else {
      this._historyController = _historyController.createNode({
        getUserConfirmation: (blockerFn, callback) => {
          return blockerFn(callback);
        }
      });
    }
    

    this._historyUnlisten = () => null;
    if (isRoot) {
      this._historyUnlisten = this._historyController.listen((location, action) => {
        console.log(`History is changed ${location.pathname}`);
        try {
          if (!this._historyController.skipRender) {
            this.onHistoryChange(location, action);
          }
        }
        catch (e) {
          throw e;
        }
        finally {
          this._historyController.skipRender = false;
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
    return this._historyController.listen(fn);
  }

  /**
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
    const unblock = this._historyController.history.block((location, action) => callback => {
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
   * @param {RouteLocation} location
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
    this._historyController.rollback();
  }

  /**
   *
   * @param {Array<{isExact: boolean,params: object,path: string,url: string}>} matches
   * @param {*} state
   * @param {*} action
   */
  renderMatches(matches, state, action) {
    console.log("matches : " + JSON.stringify(matches.map(({ match }) => match)));
    matches.some(({ match, route }, index) => {
      if (route !== this && route instanceof Router) {
        console.log("not exact match : " + this);
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
      }
      else if (match.isExact === true) {
        console.log("exact match : " + this + " : " + route.getRedirectto());
        // route has redirection
        if (route.getRedirectto()) {
          console.log("redirection  : " + route.getRedirectto());
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
    // this.routeRollback(); // remove last route from history
    this.push(route.getRedirectto(), state.routeState.data); // and add new route
  }

  shouldRouteMatch(view) {
    return view !== null || view !== undefined;
  }

  /**
   * Route is matched event handler
   *
   * @protected
   * @param {Route} route
   * @param {{isExact: boolean, params: object, path: string, url: string}} match
   * @param {Object} state
   * @param {string} action
   * @returns {(object | null)}
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
    console.log(`Push router ${path} ${this._historyController}`);
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
    return this._historyController.history.entries.map(item => item.pathname);
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
      this._historyController.dispose();
      this._historyController = null;
    }
    this._routes.forEach(route => route.dispose());
    this._routes = null;
    this._historyUnlisten = null;
    this._unblock && this._unblock();
    this._unblock = null;
  }
}

module.exports = Router;
