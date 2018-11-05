"use strict";

const Router = require("../router/Router");
const NativeRouterBase = require("./NativeRouterBase");
const BottomTabBarController = require("sf-core/ui/bottomtabbarcontroller");
const createRenderer = require("./createRenderer");
const TabBarItem = require("sf-core/ui/tabbaritem");
// const console = {log: _ => _};

function functionMaybe(val) {
  return typeof val === "function" ? val() : val;
}

/**
 * @private
 * @param {TabBarItem} item
 */
function createTabBarItem(item) {
  return item instanceof TabBarItem ? item : new TabBarItem(item);
}

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
 *          path: "/tabs/page1",
 *          build((match, state, router, view) => {
 *            const Page1 = require('/pages/Page1');
 *            return new Page1(state.data, router);
 *          })
 *        }),
 *        Route.of({
 *          path: "/tabs/page2",
 *          build((match, state, router, view) => {
 *            const Page2 = require('/pages/Page2');
 *            return new Page2(state.data, router);
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
   * @param {BottomTabBarRouterParams} param
   */
  static of (props) {
    props.renderer = createRenderer()
    return new BottomTabBarRouter(props);
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
    this._fromRouter = false;
    this._items = items;

    this._renderer._rootController.shouldSelectByIndex = ({ index }) => {
      // TabbarItem should be changed
      return this.shouldSelectByIndex(index);
    };

    this._renderer._rootController.didSelectByIndex = ({ index }) => {
      // TabbarItem did change
      console.log("didSelectByIndex  : " + index + " : " + this._fromRouter);
      if (this._fromRouter === false) {
        const route = this.resolveRoute(index);
        // this._historyController.preventDefault();
        if (this.isVisited(index)) {
          // Will Not trigger next history change
          this._historyController.preventDefault();
          this._historyController.push(this._visitedIndexes[index].path);
        }
        else {
          this._historyController.push(route.getRedirectto() || route.getUrlPath());
        }
      }

      !this.isVisited(index) && this.routetoIndex(index);
    };

    // Initilaze BottomTabBarController's TabBarItems
    this._renderer._rootController.tabBar = tabbarParams();
  }

  initialize(parentHistory, onHistoryChange) {
    super.initialize(parentHistory, onHistoryChange)
    // Assigns BottomTabBar props
    // Clears child routers onRouteExit because of NatveStackRouter 
    // creates new NavigationController to clear all children.
   /* this._routes.map(route => {
      route.routerDidExit && (route.routerDidExit = (action) =>  route._routerDidExit(action));
    });*/
    // Initilaze BottomTabBarController's child controllers
    this._renderer.setChildControllers(
      this._routes.map(route => route.build(this, route))
    );

    this._renderer.setTabBarItems(functionMaybe(this._items).map(createTabBarItem));
    this._renderer._rootController.show();
    // Overrides build method
    this.build = () => this._renderer._rootController;
  }

  /**
   * @ignore
   * @protected
   * @param {*} index
   */
  shouldSelectByIndex(index) {
    // var res = index !== this._currentIndex;
    // // console.log(`shouldSelectByIndex ${index} ${this._currentIndex}`);
    // this._currentIndex = index;
    return true;
  }

  /**
   * @override
   */
  renderMatches(matches, state, action, target) {
    this._fromRouter = true;

    console.log(`Render matches ${matches.length} ${matches.map(match => match.url)}`);
    if (matches.length > 0) {
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

    super.renderMatches(matches, state, action, target);

    this._fromRouter = false;
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
    return this._routes.findIndex(route => route.getUrlPath() === path);
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
    this._renderer._rootController.didSelectByIndex = () => null;
    this._items = null;
  }

  /**
   * Before route entered
   *
   * @event
   * @protected
   */
  routeWillEnter(route) {
    const state = route.getState();
    this.routetoIndex(this.resolveIndex(state.match.path));
  }

  /**
   * Pushes a new route by index
   *
   * @protected
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
