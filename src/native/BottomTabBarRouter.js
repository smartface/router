"strict mode";

const Router = require("../router/Router");
const BottomTabBarController = require("sf-core/ui/bottomtabbarcontroller");
const createRenderer = require("./createRenderer");
const TabBarItem = require("sf-core/ui/tabbaritem");

function functionMaybe(val) {
  return typeof val === "function" ? val() : val;
}

function createTabBarItem(item) {
  return item instanceof TabBarItem ? item : new TabBarItem(item);
}

class BottomTabBarRouter extends Router {
  /**
   * Builds OS specific NaitveRouter
   * @static
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  static of({
    path = "",
    routes = [],
    exact = false,
    to = null,
    items = [],
    tabbarParams = {},
    isRoot = false
  }) {
    return new BottomTabBarRouter({
      path,
      routes,
      exact,
      to,
      items,
      tabbarParams,
      isRoot,
      renderer: createRenderer()
    });
  }

  /**
   * @constructor
   * @param {{ path: string, target:object|null, routes: Array, exact: boolean }} param0
   */
  constructor({
    path = "",
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    tabbarParams = {},
    items = [],
    isRoot = false
  }) {
    super({
      path,
      routes,
      exact,
      to,
      isRoot
    });

    this._renderer = renderer;
    this._renderer.setRootController(new BottomTabBarController());
    this._visitedIndexes = {};
    this._renderer._rootController.shouldSelectByIndex = ({ index }) => {
      console.log("shouldSelectByIndex  : "+index+" : "+this.resolveRoute(index).getUrlPath());
      // if(!this._visitedIndexes[index.toString()] && !this._isRendered){
      //   let route = this.resolveRoute(index);
      //   console.log("route.getRedirectto() : "+ route.getRedirectto())
      //   this._visitedIndexes[index.toString()] = true;
      //   this.push(route.getRedirectto() || route.getUrlPath());
      // }
        
      // this._isRendered = false;
      const visited = this._visitedIndexes[index];
      !visited && this.routetoIndex(index);
      return visited;
    };
    Object.assign(this._renderer._rootController, tabbarParams);
    this._renderer.setChildControllers(
      this._routes.map(route => route.build(null, null, this))
    );
    this._renderer.setTabBarItems(functionMaybe(items).map(createTabBarItem));
    this._renderer._rootController.show();
    this.build = () => this._renderer._rootController;
  }

  renderMatches(matches, state, action) {
    console.log("renderMatches :");
    // !this._isRendered && (this._isRendered = true);
    super.renderMatches(matches, state, action);
  }
  
  push(path, data){
    console.log("push : "+path);
    super.push(path, data);
  }

  resolveIndex(path) {
    return this._routes.findIndex(route => route.getUrlPath() === path);
  }

  resolveRoute(index) {
    return this._routes.find((route, ind) => ind === index);
  }

  dispose() {
    super.dispose();
    this._unlistener();
    this._renderer._rootController.didSelectByIndex = () => null;
  }

  /**
   * History change event handler
   * @protected
   */
  onRouteMatch(route, match, state, action, isExact) {
    console.log("onRouteMatch ")
    if(!match.isExact){
      //TODO: make more performance
      const index = this.resolveIndex(match.path);
      console.log("onRouteMatch "+match.path+" : "+match.url+" : "+index);
      if(index >-1){
        this._visitedIndexes[index] = true;
      }
      !this._isRendered && (this._isRendered = true);
      return;
    }
    
    const view = super.onRouteMatch(route, match, state);
    
    if (!view) return false;
    this.routetoIndex(this.resolveIndex(match.path));
    return true;
  }
  
  routetoIndex(index){
    index = index < 0 ? 0 : index;
    console.log("routetoIndex : "+index);
    this._visitedIndexes[index] = true;
    this._renderer.setSelectedIndex(index);
    this._renderer._rootController.show();
    const route = this.resolveRoute(index);
    if(route instanceof Router){
      const path = route.getRedirectto() || route.getPathUrl();
      this.push(path);
    }
  }
}

module.exports = BottomTabBarRouter;
