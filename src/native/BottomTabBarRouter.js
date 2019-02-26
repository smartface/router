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
  static of (params) {
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
    routeShouldMatch,
    routeWillEnter
  }) {
    super({
      path,
      routes,
      exact,
      to,
      isRoot,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch,
      routeWillEnter
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
      // tab index is changed
      if (this._currentIndex !== index) {
        // selected tab is not visited
        if (!this.isVisited(index)) {
          // then push route object
          this.pushRoute(this._routes[index]);
        } else {
          // notification of the route changing
          // Always dispatch action as PUSH
          // Because of POP and Replace actions cannot be reproduced in BottomTabbarRouter.
          // When visited tabbar is revisited
          this.dispatch({url: this._visitedIndexes[index].url}, "PUSH", this);
        }
      }
      
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
    this._renderer.showTab();
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
   * @param {{url:string, action:string}} route
   */
  setVisited(index, route) {
    if (index < 0) return;
    this._visitedIndexes[index] = route;
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

  canGoBack(n) {
    return this._historyController.canGoBack(n);
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
    if (index === this._currentIndex)
      if (this._fromRouter === false) {
        if (this.isVisited(index)) {
          return super.push(this._visitedIndexes[index].url, routeData);
        }
      }

    return super.push(path, routeData);
  }

  /**
   * @override
   */
  renderMatches(matches, location, action, target, fromRouter) {
    // this._fromRouter = true;
    if (matches.length > 0) {
      const { match: next } = matches[matches.length - 1];
      // current url match
      const { match } = matches[1] || matches[0];
      // const lastIndex = this.resolveIndex(next.path);
      // get index of the current url
      const index = this.resolveIndex(match.path);

      // sets target tabbar item as visited.
      // selects target tabbaritem by index
      this._currentIndex = index;
      this._renderer.setSelectedIndex(index);
      this._renderer.showTab();
      this.setVisited(index, {url: location.url, action});
      // if (userTabStatus.WAITING) this._tabStatus = userTabStatus.IDLE;
    }

    super.renderMatches(matches, location, action, target, fromRouter);
  }
}

module.exports = BottomTabBarRouter;
