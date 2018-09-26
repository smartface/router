"strict mode"

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
      renderer: createRenderer()
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
    this._renderer.setRootController(new BottomTabBarController());
    Object.assign(this._renderer._rootController, tabbarParams);
    this._renderer.setChildControllers(
      this._routes.map(route => route.build(null, null, this))
    );
    this._renderer.setTabBarItems(functionMaybe(items).map(createTabBarItem));
    this._renderer._rootController.show();
    // this._renderer._rootController.shouldSelectByIndex = (params) => {
    //   this._skipRender = true;
    //   this.getHistory().push(this.resolvePath(params.index).getUrlPath());
    //   this._skipRender = false;
      
    //   return true;
    // };
  }

  renderMatches(matches, state, action) {
    super.renderMatches(matches, state, action);
  }

  resolveIndex(path) {
    return this._routes.findIndex(route => route.getUrlPath() === path);
  }

  resolvePath(index) {
    return this._routes.find((route, ind) => ind === index);
  }

  dispose() {
    super.dispose();
    this._unlistener();
  }

  /**
   * History change event handler
   * @protected
   */
  onRouteMatch(route, match, state, action) {
    const view = super.onRouteMatch(route, match, state);
    if (!view) return false;

    this._renderer._rootController.selectedIndex = this._renderer.setSelectedIndex(this.resolveIndex(match.path));
    this._renderer._rootController.show();
    
    return true;
  }
}

module.exports = BottomTabBarRouter;
