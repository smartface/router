"use strict";

/**
 * @typedef {RouterParams} NativeStackRouterParams
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {function():HeaderBarParams} headerBarParams See {@link NavigationController}
 */

/**
 * @typedef {object} HeaderBarParams For more info {@link NavigationController}
 * @property {{ transulent: boolean,
 *              alpha: number,
 *              backIndicatorImage: Image,
 *              backIndicatorTransitionMaskImage: Image,
 *              prefersLargeTitles: boolean}} ios
 * @property {boolean} borderVisibility
 * @property {Color} titleColor
 * @property {boolean} transparent
 * @property {boolean} visible
 * @property {Color} backgroundColor
 */

/**
 * @typedef NavigationControllerTransformEvent
 * @property {Page} frompage
 * @property {Page} topage
 * @property {{operation: number}} operation
 */

const NativeRouterBase = require("./NativeRouterBase");
const Router = require("../router/Router");
const NavigationController = require("sf-core/ui/navigationcontroller");
const createRenderer = require("./createRenderer");

/**
 * Creates {@link NavigationController} and manages its behavours and routes.
 *
 * @class
 * @extends {Router}
 * @example
 * const {NativeStackRouter, Route} = require('@smartface/router');
 * const Image = require('sf-core/ui/image');
 * const Color = require('sf-core/ui/color');
 *
 * var router = Router.of({
 *  path: "/",
 *
 *  routes: [
 *    NativeStackRouter.of(
 *      path: '/pages',
 *      headerBarParams: () => ({
 *        ios: {
 *          translucent: true,
 *          alpha: 1
 *        },
 *        backgroundColor: Color.BLUE,
 *        visible: true
 *      }),
 *      routes: [
 *        Route.of({
 *          path: "/pages/page1",
 *          build((router, route) => {
 *            const Page1 = require('/pages/Page1');
 *            return new Page1(state.data, router);
 *          })
 *        }),
 *        Route.of({
 *          path: "/pages/page2",
 *          build((router, route) => {
 *            const Page2 = require('/pages/Page2');
 *            return new Page2(state.data, router);
 *          });
 *        });
 *      ]
 *    )]
 * });
 *
 * @example
 * const extend = require("js-base/core/extend");
 *  const System = require("sf-core/device/system");
 *  const Application = require("sf-core/application");
 *  const AlertView = require("sf-core/ui/alertview");
 *  const {NativeStackRouter} = require('@smartface/router');
 *
 *  // Get generated UI code
 *  const Page1Design = require("ui/ui_page1");
 *
 *  const Page1 = extend(Page1Design)(
 *   // Constructor
 *   function(_super, data, router) {
 *       // Initalizes super class for this page scope
 *       _super(this);
 *       this._router = router;
 *       if(router instanceof NativeStackRouter)
 *         router.setHeaderBarParams({visible: false});
 *
 *       ...
 *   });
 *
 *
 * @since 1.0.0
 */
class NativeStackRouter extends NativeRouterBase {
  /**
   * Builds OS specific NaitveRouter
   *
   * @static
   * @param {NativeStackRouterParams} params
   */
  static of (params) {
    params.renderer = createRenderer();
    return new NativeStackRouter(params);
  }

  /**
   * @constructor
   * @param {NativeStackRouterParams} param0
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    isRoot = false,
    modal = false,
    headerBarParams = () => {},
    routerDidEnter,
    routerDidExit,
    routeShouldMatch
  }) {
    super({
      path,
      build,
      routes,
      exact,
      modal,
      to,
      isRoot,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch
    });

    this._fromRouter = true;
    this._renderer = renderer;
    this._renderer.setRootController(new NavigationController());
    this.addNavigatorChangeListener();
    this.build = () => this._renderer._rootController;
    // this._renderer._rootController.onLoad = () => {
    this._renderer._rootController.headerBar = headerBarParams();
    // };
  }

  /**
   * Applies new params to the headerBar
   *
   * @param {HeaderBarParams} params
   */
  setHeaderBarParams(params) {
    this._renderer._rootController.headerBar = params;
  }

  /**
   * Returns headerBar instance
   *
   * @return {object}
   */
  get headerBar() {
    return this._renderer._rootController.headerBar;
  }

  routeShouldMatch(prevState, nextState) {
    if (this.isUrlCurrent(nextState.match.url, nextState.action)) return false;
    return super.routeShouldMatch(prevState, nextState);
  }

  /**
   * @private
   * Add new listener to listen NavigationController transitions.
   */
  addNavigatorChangeListener() {
    this._unlistener = this._renderer.onNavigationControllerTransition(
      action => {
        // if user presses backbutton or uses gesture to back
        if (action.operation === NavigationController.OperationType.POP) {
          // set Router to skip next history change
          // this._fromRouter = false;
          try {
            this._historyController.preventDefault();
            this._historyController.goBack();
            this._fromRouter = false;
            this.dispatch(
              this._historyController.history.location,
              "POP",
              this
            );
            this._fromRouter = true;
          }
          catch (e) {
            throw e;
          }
          finally {}
        }
      }
    );
  }

  /**
   * @override
   *
   */
  dispose() {
    super.dispose();
    this._unlistener();
  }

  push(path, routeData = {}) {
    if (path === this._currentUrl) {
      Object.assign(
        this._historyController.history.location.state.routeData,
        routeData
      );
      this.dispatch(this._historyController.history.location, "PUSH", this);

      return this;
    }

    return super.push(path, routeData);
  }

  routeWillEnter(route, url, action, exact, target) {
    const state = route.getState();
    console.log(`routeWillEnter ${this} ${route} ${target} $ ${action} ${this._fromRouter} ${this._presented} ${exact}`);

    switch (action) {
      case "REPLACE": 
      case "PUSH":
        if (this._fromRouter) {
          if (route.isModal() && !this._presented) {
            this._renderer.present(route._renderer && route._renderer._rootController || state.view);
            this._presented = true;
          } else if (!route.isModal() && this._currentRoute !== route) {
            this._renderer.pushChild(route._renderer && route._renderer._rootController || state.view);
          }
        }
        break;
      case "POP":
        if (this._fromRouter) {
          if (this._presented && target === this) {
            this._renderer.dismiss();
            this._presented = false;
          }
          else if (!this._presented && !route.isModal() && this._currentUrl !== url) {
            this._renderer.popChild();
          }
        }
        break;
    }

    this._currentRoute = route;
    this._currentUrl = url;
  }

  /**
   * Event handler when a router exits from active state
   *
   * @override
   * @protected
   * @event
   * @param {string} action
   */
  onRouterExit(action) {
    super.onRouterExit(action);
    this._currentRoute = null;
    this._currentUrl = null;
    // if (action === "POP")
    // this._renderer.setRootController(new NavigationController());
  }
}

module.exports = NativeStackRouter;
