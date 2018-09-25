const Route = require("./Route");
const createMemoryHistory = require("../common/history");
const mapComposer = require("../utils/map");
const matchPath = require("../common/matchPath");
const matchRoutes = require("../common/matchRoutes");

let history;
/**
 * Router
 *
 * @class
 */
class Router extends Route {
  static initializeHistory({initialEntries=null, initialIndex=null, keyLength=null, getUserConfirmation=null}){
      history = createMemoryHistory({
          initialEntries: initialEntries || [], // The initial URLs in the history stack
          initialIndex: initialIndex || 0, // The starting index in the history stack
          keyLength: keyLength ||  20, // The length of location.key
          // A function to use to confirm navigation with the user. Required
          // if you return string prompts from transition hooks (see below)
          getUserConfirmation: getUserConfirmation || ((handler, callback) => {
            // (this._blockPath && handler(callback, this.onBlockPath.bind(this))) ||
            //   true;
          })
        });
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
    
    if(!history) {
      Router.initializeHistory({});
    }
    
    if(isRoot){
      this._historyUnlisten = history.listen((location, action) => {
          this.onHistoryChange(location, action);
          // ["pathname","search","hash","state","key"]
          // console.log(JSON.stringify(history.entries.map(entry => entry.pathname)));
        })
    } else {
      this._historyUnlisten = () => null;
    }
    
    this._isRoot = isRoot;
    this._exact = exact;
    this._selectedRoutes = [];
    this._cache = new WeakMap();
    this._unblock = () => null;
  }
  
  getHistory(){
    return history;
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
   * @event
   *
   */
  onRouteExit(action){
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
    if(this._skipRender) return;
    
    const matches = matchRoutes(this._routes, location.pathname);

    this.renderMatches(matches, location.state, action);
  }
  
  silencePop(){
    this._skipRender = true;
    this.getHistory().pop();
    this._skipRender = false;
  }

  renderMatches(matches, state, action) {
    matches.some(({ match, route }, index) => {
    
      if (match.isExact !== true && route instanceof Router) {
        // move routes to child router
        if(route !== this){
          route.renderMatches(matches.slice(index + 1, matches.length), state, action);
          // route.addParentRenderer(this._renderer);
        }
        // route.setParent(this);
        // Router.currentRouter = this;
        
        return true;
      } else if (match.isExact === true) {
        // route has redirection
        if(route.getRedirectto()) {
          // redirection of a route
          this._skipRender = true; // no render route when history is changed.
          this.getHistory().pop(); // pop current route from history
          this._skipRender = false; // and set again renderable history
          this.go(route.getRedirectto()); // go to new route
          
          return true;
        }
        
        
        Router.currentRouter = this;
        if (route !== this && route instanceof Router) {
          // if(Router.currentRouter === route){
          // }
          // TODO: change this
          Router.currentRouter = route;
          //------<
          route.renderMatches(matches, state, action);
          return true;
        }
        
        // this.renderRoute(route, match, state);
        
        this.onRouteMatch(route, match, state, action);
        Router.currentRouter && this != Router.currentRouter && Router.currentRouter.onRouteExit(action);

        return true;
      }
    });
  }

  renderRoute(route, match, state) {
    let view;
    // const { matches } = location.state;

    // matches.some(({ match, route }, index) => {
      if (match.isExact === true) {
        view = route.build(
          match,
          state.userState || {},
          this,
          state.view
        );
        state.view = view;
        
        return view;
      }
    // });

    return false;
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
    this._unblock = this.getHistory().block((location, action) => {
      return handler;
    });
  }

  /**
   * Goes to route for internal use
   * @protected
   */
  _go(path, data, addtoHistory = true) {
    this.getHistory().push(path, { userState: { data } });
  }

  /**
   * Change history by specified path
   *
   * @params {object|string} path - Path or matches of the route
   * @params {boolean} [=true] addtoHistory
   */
  go(path, data, addtoHistory = true) {
    // this._cache.get(path) ||
    if (path.charAt(0) !== "/") {
      path = this._path.getPath() + "/" + path;
    // } else {
    //   return (
    //     // (this._parent && this._parent.go(path, data, addtoHistory)) ||
    //     this._go(path, data, addtoHistory)
    //   );
    }
    
    return this._go(path, data, addtoHistory);
  }
  
  replace(path, data){
    this.getHistory().replace(path, data);
  }

  /**
   * Rewinds history
   *
   */
  goBack(index = 1) {
    // alert("back to "+index);
    if (this.getHistory().canGo(-index))
      this.getHistory().go(-1);
    // } else {
    //   this.goBackToParent();
    // }
  }
  
  activate(){
    this._renderer.activate();
  }

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
    this._historyUnlisten();
    this._historyUnlisten = null;
    this._unblock();
    this._parrent = null;
  }
}

module.exports = Router;
