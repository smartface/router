const Router = require("../router/Router");
const BottomTabBarController = require("sf-core/ui/bottomtabbarcontroller");
const createRenderer = require("./createRenderer");
const TabBarItem = require('sf-core/ui/tabbaritem');

function functionMaybe(val){
  return typeof val === 'function' ? val() : val;
}

function createTabBarItem(item){
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
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    items = [],
    tabbarParams = {},
    isRoot = false
  }) {
    return new BottomTabBarRouter({
      path,
      build,
      routes,
      exact,
      to,
      items,
      tabbarParams,
      isRoot,
      renderer: createRenderer(BottomTabBarController)
    });
  }

  /**
   * @constructor
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    tabbarParams = {},
    items = [],
    isRoot = false
  }) {
    super({ path, build, routes, exact, to, isRoot });
    
    this._renderer = renderer;
    Object.assign(this._renderer._rootController, tabbarParams);
    this._renderer.setChildControllers(this._routes.map(route => route.build(null, null, this)));
    this._renderer.setTabBarItems(functionMaybe(items).map(createTabBarItem));
    this._renderer._rootController.show();
  }
  
  renderMatches(matches, state, action){
    super.renderMatches(matches, state, action);
  }
  
  resolveIndex(path){
    return this._routes.findIndex(route => route.getUrlPath() === path);
  }
  
  dispose(){
    super.dispose();
    this._unlistener();
  }

  /**
   * History change event handler
   * @protected
   */
  onRouteMatch(route, match, state, action) {
    // if(action === "POP"){
    //   this._unlistener();
    // }
    
    this._renderer.setSelectedIndex(this.resolveIndex(match.path));
    
    // const view = this.renderLocation(location);

    // if (!view) return;
    
    // switch (action) {
    //   case "PUSH":
    //     this._renderer.pushChild(view);
    //     break;
    //   case "POP":
    //     this._renderer.popChild();
    //     break;
    // }
    
    // this.addNavigatorChangeListener();
  }
}

module.exports = BottomTabBarRouter;
