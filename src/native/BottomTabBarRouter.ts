"use strict";

/**
 * @typedef {object<string,string|object>} BottomTabBarItem Represents {@link TabBarItem} params
 * @property {Image} icon
 * @property {string} title
 */

/**
 * @typedef {RouterParams} BottomTabBarRouterParams
 * @property {function(router: Router, event: ChangeEvent)} onTabChangedByUser Tab is changed handler
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {object} tabbarParams See {@link BottomTabbarController}
 */

/**
 * @typedef {object} ChangeEvent
 * @property {number} prevTabIndex Previous tab index
 * @property {number} tabIndex Changed tab index
 */
import System from "@smartface/native/device/system";
import NativeRouterBase from "./NativeRouterBase";
import BottomTabBarController from "@smartface/native/ui/bottomtabbarcontroller";
import createRenderer from "./createRenderer";
import TabBarItem from "@smartface/native/ui/tabbaritem";
import functionMaybe from "../utils/funcorVal";
import Router from "../router/Router";
import { RouteParams } from "../router/RouteParams";
import { OnHistoryChange } from "../core/OnHistoryChange";
import { matchRoutes } from "../common";
import { Location } from "../common/Location";
import Page from "@smartface/native/ui/page";
import { HistoryActionType } from "common/HistoryActions";

type BottomTabBarRouterParams<Ttarget> = RouteParams<Ttarget> & {
  isRoot?: boolean;
  items: (Partial<TabBarItem> | TabBarItem)[];
  onTabChangedByUser: (...args: any) => void;
  tabbarParams?: () => Partial<BottomTabBarController['tabBar']>;
};

/**
 * @private
 * @param {TabBarItem} item
 */
function createTabBarItem(item: TabBarItem) {
  return item instanceof TabBarItem ? item : new TabBarItem(item);
}

const userTabStatus = {
  IDLE: 0,
  WAITING: 1,
  DONE: 2,
};

/**
 * @typedef {object<string,string|object>} BottomTabBarItem Represents {@link TabBarItem} params
 * @property {Image} icon
 * @property {string} title
 */
/**
 * @typedef {RouterParams} BottomTabBarRouterParams
 * @property {function(router: Router, event: ChangeEvent)} onTabChangedByUser Tab is changed handler
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {object} tabbarParams See {@link BottomTabbarController}
 */
/**
 * @typedef {object} ChangeEvent
 * @property {number} prevTabIndex Previous tab index
 * @property {number} tabIndex Changed tab index
 */

/**
 * @typedef {object<string,string|object>} BottomTabBarItem Represents {@link TabBarItem} params
 * @property {Image} icon
 * @property {string} title
 */
/**
 * @typedef {RouterParams} BottomTabBarRouterParams
 * @property {function(router: Router, event: ChangeEvent)} onTabChangedByUser Tab is changed handler
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {object} tabbarParams See {@link BottomTabbarController}
 */
/**
 * @typedef {object} ChangeEvent
 * @property {number} prevTabIndex Previous tab index
 * @property {number} tabIndex Changed tab index
 */

/**
 * It creates {@link BottomTabbarController} and manages its behavours and routes.
 *
 * @class
 * @extends {Router}
 * @example
 * const {BottommTabBarRouter, Route} = require('@smartface/router')
 * import Image from '@smartface/native/ui/image';
 * import Color from '@smartface/native/ui/color';
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
export default class BottomTabBarRouter<
  Ttarget = Page
> extends NativeRouterBase<Ttarget> {
  private _onTabChangedByUser: any;
  private _fromUser: boolean;
  private _items: any;
  private _tabStatus = 0;
  private _currentIndex = 0;
  private _visitedIndexes: {
    length: number;
    [key: number]: { url: string; action: HistoryActionType };
  } = { length: 0 };
  private _tabbarParams: () => Partial<BottomTabBarController['tabBar']>;

  /**
   * Helper method
   * @param {BottomTabBarRouterParams} param
   */
  static of<Ttarget = Page>(params: BottomTabBarRouterParams<Ttarget>) {
    params.renderer = createRenderer();
    return new BottomTabBarRouter<Ttarget>(params);
  }

  /**
   * @constructor
   * @param {BottomTabBarRouterParams} param
   */
  constructor({
    path = "",
    routes = [],
    exact = false,
    renderer,
    to = null,
    tabbarParams,
    items = [],
    isRoot = false,
    onTabChangedByUser,
    routerDidEnter,
    routerDidExit,
    routeShouldMatch,
    routeWillEnter,
  }: BottomTabBarRouterParams<Ttarget>) {
    super({
      path,
      routes,
      exact,
      to,
      isRoot,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch,
      routeWillEnter,
    });
    this._renderer = renderer;
    this._onTabChangedByUser = onTabChangedByUser;
    this._fromUser = true;
    this._items = items;
    this._tabbarParams = tabbarParams || (() => ({}));
  }

  initializeRenderer() {
    this._renderer?.setRootController(new BottomTabBarController());
    this._tabStatus = userTabStatus.IDLE;

    if (this._renderer?._rootController instanceof BottomTabBarController) {
      this._renderer._rootController.shouldSelectByIndex = ({ index }) => {
        // TabbarItem should be changed
        return this.shouldSelectByIndex(index);
      };
      this._renderer._rootController.didSelectByIndex = ({ index }) => {
        // tab index is changed by user
        // currentIndex must be checked out because of Android BottombarBarController sends initially zero index without any request.
        // And this behaviour is causing to start a router request using zeroth element of the child routes.
        if (this._currentIndex !== undefined && this._currentIndex !== index) {
          // selected tab is not visited
          if (!this.isVisited(index)) {
            // then push route object
            this.pushRoute(this._routes[index]);
          } else {
            // Notification of the route changing
            // must always dispatch a PUSH action.
            // Because when visited tabbar is revisited,
            // POP and Replace actions come from visisted cache are
            // reproduced in BottomTabbarRouter.
            if (typeof this.dispatch === "function") {
              this.dispatch(
                { url: this._visitedIndexes[index].url },
                "PUSH",
                this
              );
            }
          }
        }

        this._currentIndex = index;
      };

      // Initilaze BottomTabBarController's TabBarItems
      /**
       * Smartface Native says its' read only
       */
      //@ts-ignore
      this._renderer._rootController.tabBar = this._tabbarParams();
    }
  }

  initialize(
    parentHistory: unknown,
    onHistoryChange: OnHistoryChange,
    pushHomes: (path: string) => void
  ) {
    super.initialize(parentHistory, onHistoryChange, pushHomes);
    this.initializeRenderer();
    this._renderer?.setChildControllers(this._routes.map((route) => route.build(this)));
    this._renderer?.setTabBarItems(
      functionMaybe(this._items).map(createTabBarItem)
    );
    this._renderer?.showTab();
    // Overrides build method
    this.build = () => this._renderer?._rootController;
  }

  /**
   * @ignore
   * @protected
   * @param {number} index
   */
  shouldSelectByIndex(index: number) {
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

    if (this._fromUser === true) {
      this._fromRouter = false;
      const current = this._currentIndex;
      setTimeout(() => {
        this._onTabChangedByUser &&
          this._onTabChangedByUser(this, {
            prevTabIndex: current,
            tabIndex: index,
          });
      }, 0);
    }

    this._fromUser = true;

    return Router._lock
      ? false
      : System.OS === "iOS"
      ? this._currentIndex != index
      : true;
  }

  /**
   * Sets TabBarItems visited by TabBarItem index
   *
   * @protected
   * @param {number} index
   * @param {{url:string, action:string}} route
   */
  setVisited(index: number, route: { url: string; action: HistoryActionType }) {
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
  isVisited(index: number) {
    return !!this._visitedIndexes[index];
  }

  /**
   * Finds child route's index by path
   *
   * @protected
   * @param {string} path
   */
  resolveIndex(path: string) {
    return this._routes.findIndex(
      (route) => route.getUrlPath() === path || route.getRedirectto() === path
    );
  }

  /**
   * Finds child route by index
   *
   * @protected
   * @param {number} index
   */
  resolveRoute(index: number) {
    return this._routes.find((route, ind) => ind === index);
  }

  canGoBack(n: number) {
    return this._historyController?.canGoBack(n);
  }

  /**
   * @override
   */
  dispose() {
    super.dispose();
    this._unlistener();
    if (this._renderer?._rootController instanceof BottomTabBarController) {
      this._renderer?.dispose();
      this._renderer._rootController.didSelectByIndex = () => null;
    }
    this._items = null;
    this._renderer = undefined;
  }

  private _unlistener() {
    throw new Error("Method not implemented.");
  }

  push(path: string, routeData = {}) {
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
  renderMatches(
    matches: ReturnType<typeof matchRoutes>,
    location: Location,
    action: HistoryActionType,
    target: Router,
    fromRouter: boolean
  ) {
    super.renderMatches(matches, location, action, target, fromRouter);

    // this._fromRouter = true;
    if (matches.length > 0) {
      const currentIndex = this._currentIndex;
      const { match: next } = matches[matches.length - 1];
      // current url match
      const { match } = matches[1] || matches[0];
      // const lastIndex = this.resolveIndex(next.path);
      // get index of the current url
      const index = this.resolveIndex(match.path);

      if (!this._visitedIndexes[index] || this._currentIndex != index) {
        this._fromUser = false;
        // sets target tabbar item as visited.
        // selects target tabbaritem by index
        this._currentIndex = index;
        // lastLocationUrl for checking out if routing is completed or not with currentIndex.
        // Because visitedIndex of route tab is assigned to this url when routing is completed.
        // Since Android bottomtabbar logic triggered shouldSelectByIndex and didSelectByIndex methods
        // either requests come from user and router. And IOS only triggers if request comes from the user.
        this._renderer?.setSelectedIndex(index);
        this._renderer?.showTab();

        this._fromUser = true;
      }
      this.setVisited(index, { url: location.url, action });
      // if (userTabStatus.WAITING) this._tabStatus = userTabStatus.IDLE;
      // if(System.OS === "Android"){
      // }
    }
  }
}
