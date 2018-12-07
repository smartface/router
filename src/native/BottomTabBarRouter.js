"use strict";

/**
 * @typedef {object<string,string|object>} BottomTabBarItem Represent {@link TabBarItem} params
 * @property {Image} icon
 * @property {string} title
 */

/**
 * @typedef {RouterParams} BottomTabBarRouterParams
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {object} tabbarParams See {@link BottomTabbarController}
 */

const NativeRouterBase = require("./NativeRouterBase");
const BottomTabBarController = require("sf-core/ui/bottomtabbarcontroller");
const createRenderer = require("./createRenderer");
const TabBarItem = require("sf-core/ui/tabbaritem");
const functionMaybe = require("../utils/funcorVal");

/**
 * @private
 * @param {TabBarItem} item
 */
function createTabBarItem(item) {
  return item instanceof TabBarItem ? item : new TabBarItem(item);
}

const userTabStatus = {
  IDLE: 0,
  WAITING: 1,
  DONE: 2
};

/**
 * It creates {@link BottomTabbarController} and manages its behavours and routes.
 *
 * @class
 * @extends {Router}
 * @example
 * const {BottommTabBarRouter, Route} = require('@smartface/router')
 * const Image = require('sf-core/ui/image');
 * const Color = require('sf-core/ui/color');
 *
 * var router = Router.of({
 *  path: "/",
 *  routes: [
 *    BottomTabBarRouter.of(
 *      path: '/tabs',
 *      tabbarParams: () => ({
 *        itemColor: {normal: Color.BLACK, selected: Color.BLUE},
 *        backgroundColor: Color.BLUE,
 *      }),
 *      tabbarItems: [
 *        { title: "Page1", icon: Image.createFromFile("images://icon1.png") },
 *        { title: "Page2", icon: Image.createFromFile("images://icon2.png") },
 *      ],
 *      routes: [
 *        Route.of({
 *          routeDidEnter: (router, route) => {
 *          },
 *          routeDidExit: (router, route) => {
 *          },
 *          path: "/tabs/page1",
 *          build((router, route) => {
 *            const Page1 = require('/pages/Page1');
 *            return new Page1(route.getState().routeData, router);
 *          })
 *        }),
 *        Route.of({
 *          path: "/tabs/page2",
 *          build((router, route) => {
 *            const Page2 = require('/pages/Page2');
 *            return new Page2(route.getState().routeData, router);
 *          });
 *        });
 *      ]
 *    )]
 * })
 *
 * @since 1.0.0
 */
class BottomTabBarRouter extends NativeRouterBase {
  /**
   * Builds OS specific NaitveRouter
   *
   * @static
   * @param {BottomTabBarRouterParams} params
   */
  static of(params) {
    params.renderer = createRenderer();
    return new BottomTabBarRouter(params);
  }

  /**
   * @constructor
   * @param {BottomTabBarRouterParams} param
   */
  constructor({
    path = "",
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    tabbarParams = {},
    items = [],
    isRoot = false,
    routerDidEnter,
    routerDidExit,
    routeShouldMatch
  }) {
    super({
      path,
      routes,
      exact,
      to,
      isRoot,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch
    });

    this._renderer = renderer;
    this._renderer.setRootController(new BottomTabBarController(tabbarParams));
    this._visitedIndexes = { length: 0 };
    this._items = items;
    this._tabStatus = userTabStatus.IDLE;

    this._renderer._rootController.shouldSelectByIndex = ({ index }) => {
      // TabbarItem should be changed
      return this.shouldSelectByIndex(index);
    };

    this._renderer._rootController.didSelectByIndex = ({ index }) => {
      this.pushRoute(this._routes[index]);
      this._currentIndex = index;
    };

    // Initilaze BottomTabBarController's TabBarItems
    this._renderer._rootController.tabBar = tabbarParams();
  }

  initialize(parentHistory, onHistoryChange, pushHomes) {
    super.initialize(parentHistory, onHistoryChange, pushHomes);
    // Initilaze BottomTabBarController's child controllers
    this._renderer.setChildControllers(
      this._routes.map(route => route.build(this, route))
    );

    this._renderer.setTabBarItems(
      functionMaybe(this._items).map(createTabBarItem)
    );
    this._renderer._rootController.show();
    // Overrides build method
    this.build = () => this._renderer._rootController;
  }

  /**
   * @ignore
   * @protected
   * @param {number} index
   */
  shouldSelectByIndex(index) {
    if (this._currentIndex !== index) {
      this._fromRouter = false;
    }

    /*this._fromRouter = false;
    if (
      (this._tabStatus === userTabStatus.IDLE &&
        index !== this._currentIndex) ||
      this._tabStatus === userTabStatus.WAITING
    ) {
      this._tabStatus = userTabStatus.WAITING;*/
    /*(async function(scope) {
      console.log(`${scope} ${scope._routes[index]} ${index}`);
      scope.pushRoute(scope._routes[index]);
      return scope;
    })(this)
      .then(scope => {
        scope._fromRouter = true;
      })
      .catch(e => alert(e.message + " " + e.stack, "Error"));*/

    // setTimeout(() => {
    //   this.pushRoute(this._routes[index]);
    //   this._fromRouter = true;
    // });
    // }

    return this._currentIndex !== index;
    /*return (
      this._currentIndex != index && this._tabStatus === userTabStatus.IDLE
    );*/
  }

  /**
   * Sets TabBarItems visited by TabBarItem index
   *
   * @protected
   * @param {number} index
   * @param {string} path
   */
  setVisited(index, path) {
    if (index < 0) return;
    this._visitedIndexes[index] = {
      path
    };
    this._visitedIndexes.length++;
  }

  /**
   * CHecks if TabBarItem is visited before
   *
   * @protected
   * @param {number} index
   * @return {boolean}
   */
  isVisited(index) {
    return !!this._visitedIndexes[index];
  }

  /**
   * Finds child route's index by path
   *
   * @protected
   * @param {string} path
   */
  resolveIndex(path) {
    return this._routes.findIndex(
      route => route.getUrlPath() === path || route.getRedirectto() === path
    );
  }

  /**
   * Finds child route by index
   *
   * @protected
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
    this._renderer.dispose();
    this._renderer._rootController.didSelectByIndex = () => null;
    this._items = null;
    this._renderer = null;
  }

  push(path, routeData = {}) {
    const index = this.resolveIndex(path);

    if (this._fromRouter === false) {
      if (this.isVisited(index)) {
        return super.push(this._visitedIndexes[index].path, routeData);
      }
    }

    return super.push(path, routeData);
  }

  /**
   * Before route entered
   *
   * @event
   * @protected
   */
  /*routeWillEnter(route, [url, backUrl]) {
    // const { match: next } = matches[matches.length - 1];
    const { match, url: routeUrl } = route.getState();
    console.log(`bottomtabbar ${JSON.stringify(match)} ${JSON.stringify(route.match)} ${url} back to ${backUrl}`)
    // matches[1] || matches[0];
    // const lastIndex = this.resolveIndex(next.path);
    const index = this.resolveIndex(routeUrl);
    // sets target tabbar item as visited.
    // selects target tabbaritem by index
    if (this._currentRouteUrl !== url) {
      this._renderer.setSelectedIndex(index);
      this._renderer._rootController.show();
      this.setVisited(index, backUrl || url);
    }
    // this.isVisited(index) && this.activateIndex(index);
    this._currentIndex = index;
    // if (userTabStatus.WAITING) this._tabStatus = userTabStatus.IDLE;
    this._currentRouteUrl = url;
  }*/

  /**
   * @override
   */
  renderMatches(matches, location, action, target, fromRouter) {
    console.log(`bottomtabbar render ${location.url}`);
    // this._fromRouter = true;
    if (matches.length > 0) {
      const { match: next } = matches[matches.length - 1];
      const { match } = matches[1] || matches[0];
      // const lastIndex = this.resolveIndex(next.path);
      const index = this.resolveIndex(match.path);
      // sets target tabbar item as visited.
      // selects target tabbaritem by index
      this._renderer.setSelectedIndex(index);
      this._renderer._rootController.show();
      // this.isVisited(index) && this.activateIndex(index);
      this.setVisited(index, location.url);
      this._currentIndex = index;
      console.log(`bottomtabbar render ${location.url} ${index}`);
      if (userTabStatus.WAITING) this._tabStatus = userTabStatus.IDLE;
    }

    super.renderMatches(matches, location, action, target, fromRouter);
  }
}

module.exports = BottomTabBarRouter;
