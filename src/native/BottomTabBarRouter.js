'use strict';

const Router = require("../router/Router");
const NativeRouterBase = require("./NativeRouterBase");
const BottomTabBarController = require("sf-core/ui/bottomtabbarcontroller");
const createRenderer = require("./createRenderer");
const TabBarItem = require("sf-core/ui/tabbaritem");
// const console = {log: _ => _};

function functionMaybe(val) {
  return typeof val === "function" ? val() : val;
}

function createTabBarItem(item) {
  return item instanceof TabBarItem ? item : new TabBarItem(item);
}

/**
 * It creates BottomTabbarController and pushes Routes' views.
 * 
 * @class
 * @extends {Router}
 */
class BottomTabBarRouter extends NativeRouterBase {
  /**
   * Builds OS specific NaitveRouter
   * 
   * @static
   * @param {RouteParams} param
   */
  static of ({
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
    this._renderer.setRootController(new BottomTabBarController(tabbarParams));
    this._visitedIndexes = { length: 0 };
    this._fromRouter = false;

    this._renderer._rootController.shouldSelectByIndex = ({ index }) => {
      // TabbarItem should be changed
      return this.shouldSelectByIndex(index);
    };

    this._renderer._rootController.didSelectByIndex = ({ index }) => {
      // TabbarItem did change
      console.log("didSelectByIndex  : " + index + " : " + this._fromRouter);
      if (this._fromRouter === false) {
        const route = this.resolveRoute(index);
        this._historyController.preventDefault();
        if (this.isVisited(index)) {
          // Will Not trigger next history change
          // this._historyController.preventDefault();
          this._historyController.push(this._visitedIndexes[index].path);
        } else {
          this._historyController.push(this.resolveRoute(index).getUrlPath());
        }
        if (route instanceof Router) {
          route.onRouterEnter("PUSH");
        }
      }

      !this.isVisited(index) && this.routetoIndex(index);
    };

    // Assigns BottomTabBar props
    // Clears child routers onRouteExit because of NatveStackRouter creates new NavigationController to clear all children.
    this._routes.map(route => {
      route.onRouterExit && (route.onRouteExit = () => null);
    });
    // Initilaze BottomTabBarController's child controllers
    this._renderer.setChildControllers(
      this._routes.map(route => route.build(null, null, this))
    );
    // Initilaze BottomTabBarController's TabBarItems
    this._renderer.setTabBarItems(functionMaybe(items).map(createTabBarItem));
    // this._renderer.setTabBarItems(functionMaybe(items).map(createTabBarItem));
    this._renderer._rootController.show();
    this._renderer._rootController.tabBar = tabbarParams();

    // Overrides build method
    this.build = () => this._renderer._rootController;
  }

  shouldSelectByIndex(index) {
    // var res = index !== this._currentIndex;
    // // console.log(`shouldSelectByIndex ${index} ${this._currentIndex}`);
    // this._currentIndex = index;
    return true;
  }

  /**
   * @override
   */
  renderMatches(matches, state, action) {
    this._fromRouter = true;

    if (matches.length > 0) {
      // console.log(`Render matches ${matches.map(match => match.path)}`);
      const { match: next } = matches[matches.length - 1];
      const { match } = matches[1] || matches[0];
      const lastIndex = this.resolveIndex(next.path);
      const index = this.resolveIndex(match.path);
      // sets target tabbar item as visited.
      // selects target tabbaritem by index
      this._renderer.setSelectedIndex(index);
      this._renderer._rootController.show();
      // console.log(`current : ${match.path} - next : ${next.path}`);
      this.setVisited(index, next.path);
    }

    super.renderMatches(matches, state, action);

    this._fromRouter = false;
  }

  /**
   * Sets TabBarItems visited by TabBarItem index
   *
   * @param {number} index
   * @param {string} path
   */
  setVisited(index, path) {
    console.log(`setVisited ${index} ${path}`);
    if (index < 0) return;
    this._visitedIndexes[index] = {
      path
    };
    this._visitedIndexes.length++;
  }

  /**
   * CHecks if TabBarItem is visited before
   * 
   * @param {number} index
   * @returns {boolean}
   */
  isVisited(index) {
    return !!this._visitedIndexes[index];
  }

  /**
   * Finds child route's index by path
   * 
   * @param {string} path
   */
  resolveIndex(path) {
    return this._routes.findIndex(route => route.getUrlPath() === path);
  }

  /**
   * Finds child route by index
   * 
   * @param {number} index
   */
  resolveRoute(index) {
    return this._routes.find((route, ind) => ind === index);
  }

  /**
   * @override
   */
  dispose() {
    super.dispose();
    this._unlistener();
    this._renderer._rootController.didSelectByIndex = () => null;
  }

  /**
   * Handler of requested path is matched to route 
   * 
   * @override
   * @event
   * @protected
   */
  onRouteMatch(route, match, state, action) {
    // const view = super.onRouteMatch(route, match, state);

    // if (!view) return false;

    //if the path has already opened then skip routing
    // if (!this.isInitialPath(match.path)) {
    this.routetoIndex(this.resolveIndex(match.path));
    // return true;
    // }

    return super.onRouteMatch(route, match, state);
  }

  /**
   * Pushes a new route by index
   *
   * @param {number} index
   */
  routetoIndex(index) {
    index = index < 0 ? 0 : index;
    console.log("routetoIndex : " + index);
    this._renderer.setSelectedIndex(index);
    this._renderer._rootController.show();
    const route = this.resolveRoute(index);
    this.setVisited(index, route.getUrlPath());
    route instanceof Router && this.pushRoute(route);
    console.log("end of routetoIndex : " + route);
  }
}

module.exports = BottomTabBarRouter;
