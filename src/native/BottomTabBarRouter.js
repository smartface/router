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
    this._renderer._rootController.didSelectByIndex = ({ index }) => {
      !this._visitedIndexes[index.toString()] &&
        !this._isRendered &&
        this.push(this.resolvePath(index).getUrlPath());
      this._isRendered = false;
      this._visitedIndexes[index.toString()] = true;
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
    console.log("didSelectByIndex : " + this._isRendered);
    this._isRendered = true;
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
    this._renderer._rootController.didSelectByIndex = () => null;
  }

  /**
   * History change event handler
   * @protected
   */
  onRouteMatch(route, match, state, action) {
    const view = super.onRouteMatch(route, match, state);
    if (!view) return false;

    this._renderer._rootController.selectedIndex = this._renderer.setSelectedIndex(
      this.resolveIndex(match.path)
    );
    this._renderer._rootController.show();

    return true;
  }
}

module.exports = BottomTabBarRouter;
