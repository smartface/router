"use strict";

/**
 * @typedef {RouterParams} NativeStackRouterParams
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {function():HeaderBarParams} modal
 * @property {function():HeaderBarParams} headerBarParams Properties of NavigationController's headerbar. See {@link NavigationController}.
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
 * const System = require("sf-core/device/system");
 * const Application = require("sf-core/application");
 * const AlertView = require("sf-core/ui/alertview");
 * const {NativeStackRouter} = require('@smartface/router');
 *
 * // Get generated UI code
 * const Page1Design = require("ui/ui_page1");
 *
 * const Page1 = extend(Page1Design)(
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
  static of(params) {
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
    routeWillEnter = null,
    routeShouldMatch,
    homeRoute = null
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
      routeShouldMatch,
      homeRoute,
      routeWillEnter
    });

    this._homeRoute = homeRoute;
    this._headerBarParams = headerBarParams;
    this._renderer = renderer;
    this._renderer.setRootController(new NavigationController());
    this.addNavigatorChangeListener();
    this.build = () => this._renderer._rootController;
    this._renderer._rootController.headerBar = headerBarParams();
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

  /**
   * @ignore
   * @param {RouteState} prevState
   * @param {RouteState} nextState
   */
  routeShouldMatch(prevState, nextState) {
    if (this.isUrlCurrent(nextState.match.url, nextState.action)) return false;
    return super.routeShouldMatch(prevState, nextState);
  }

  /**
   * Closes StackRouter's View if it is opened as modal.
   *
   * @param {function} fn - Callback is called before dismissing to trigger another action like routing to an another page.
   */
  dismiss(fn, animated) {
    this._dismiss && this._dismiss(fn, animated);
  }

  /**
   * To Listen page changes are handled by device.
   *
   * @private
   */
  addNavigatorChangeListener() {
    this._unlistener = this._renderer.onNavigationControllerTransition(
      action => {
        // if user presses backbutton or uses gesture to back
        if (
          action.operation === NavigationController.OperationType.POP &&
          !this._fromRouter
        ) {
          try {
            // set Router to skip next history change
            this._historyController.preventDefault();
            this._historyController.goBack();
            this.dispatch(
              this._historyController.history.location,
              "POP",
              this,
              false
            );
          } catch (e) {
            throw e;
          } finally {
          }
        }
      }
    );
  }

  /**
   * @protected
   * @ignore
   * @param {string} path
   */
  pushHomeBefore(path) {
    if (
      this.hasHome() &&
      this._renderer._rootController.childControllers.length === 0
    ) {
      const indexRoute = this._routes[this._homeRoute];

      if (path !== indexRoute.getUrlPath()) {
        this._historyController.push(indexRoute.getUrlPath());
      }
    }

    return true;
  }

  /**
   * @override
   */
  push(path, routeData = {}) {
    return super.push(path, routeData);
  }

  /**
   * @override
   */
  routeWillEnter(route, requestedUrl, act, ex, target, fromRouter) {
    const {
      view,
      match: { isExact: exact },
      url,
      action
    } = route.getState();
    const active = url === this._currentRouteUrl;
    switch (action) {
      case "REPLACE":
        if (this._fromRouter) {
          this._renderer.replaceChild(
            (route._renderer && route._renderer._rootController) || view
          );
        }
        break;
      case "PUSH":
        if (this._fromRouter) {
          if (route.isModal() && !this._presented && !active) {
            const lastLocation = Router.getGlobalRouter().history.entries[
              Router.getGlobalRouter().history.index
            ];
            const lastLocationIndex = Router.getGlobalRouter().history.index;
            this._renderer.present(
              (route._renderer && route._renderer._rootController) || view
            );
            route._dismiss = (cb = null, animated = true) => {
              console.log("dismiss " + route);
              let diff =
                Router.getGlobalRouter().history.index - lastLocationIndex;
              // Rewinds global history as much as visit in the modal.
              // Because routers in the tree are not aware of modal router will be dismissed.
              // And if they are notified and then their current-urls will be outdated.
              while (diff > 1) {
                Router.getGlobalRouter().history.rollback();
                diff--;
              }

              this._historyController.preventDefault();
              this._historyController.goBack();
              // simulate a pop request to inform all routers
              // regarding route changing
              this.dispatch(lastLocation, "POP", this, false);
              cb && cb();
              route._renderer.dismiss(() => {
                route._dismiss = null;
                route._presented = false;
                route._currentRouteUrl = null;
                this._currentRouteUrl = null;

                this._presented = false;
                route.setState({ active: false });
                route.resetView();
              }, animated);
            };

            this._presented = true;
            route.setState({ active: true });
          } else if (!route.isModal() && !active) {
            this._currentRouteUrl = url;
            try {
              this._renderer.pushChild(
                (route._renderer && route._renderer._rootController) || view
              );
            } catch (e) {
              throw `Error when ${route} is pushed. ${e}`;
            } finally {
              route.setState({ active: true });
            }
          }
        }

        break;
      case "POP":
        // TODO: Add dismiss logic
        if (this._fromRouter) {
          if (!route._dismiss && exact) {
            this._renderer.popChild();
          }
        }

        route.setState({ active: false });
        break;
    }
    this._currentRouteUrl = url;
    super.routeWillEnter(route);
  }

  /**
   * Go back to index
   * @example
   * ...
   * router.goBackto(-2)
   * ...
   * @since 1.1.0
   * @param {number} n Amount of back as negative value. If stack length shorter than specified number then the active router does nothing.
   */
  goBackto(n) {
    if (this._historyController.canGoBack(n)) {
      const back = this._historyController.currentIndex() + n;
      const location = this._historyController.find(
        (location, index) => index === back
      );
      this._historyController.preventDefault();
      this._historyController.goBackto(n);
      this._renderer.popTo(back);
      this.dispatch(location, "POP", this, false);
    }
  }

  /**
   * Go back until the url
   *
   * @example
   * ...
   * router.goBacktoUrl('/back/to/url');
   * ...
   * @since 1.1.0
   * @param {string} url - An url will be matched in the same stack
   */
  goBacktoUrl(url) {
    this.goBackto(this.getStepLengthByCurrent(url));
  }

  /**
   * Go back to first page in the same stack
   *
   * @example
   * ...
   * router.goBackHome();
   * ...
   * @since 1.1.0
   */
  goBackHome() {
    const lastIndex = this._historyController.getLength() - 1;
    const index = this._historyController.currentIndex();
    const back = index - (lastIndex - index);
    this.goBackto(-back);
  }

  /**
   * Returns length of the history steps to be needed to receive from current to specified url
   *
   * @param {string} url
   * @return {number}
   */
  getStepLengthByCurrent(url) {
    const lastIndex = this._historyController.getLength() - 1;
    const index = this._historyController.findIndex(
      location => location.url === url
    );

    return index - lastIndex;
  }

  /**
   * Tests if desired url is available to go back or not
   *
   * @param {string} url Desired url to test availability to go back
   * @return {boolean}
   */
  canGoBacktoUrl(url) {
    return this.canGoBackto(this.getStepLengthByCurrent(url));
  }

  resetView() {
    this.clearUrl();
    this._currentRouteUrl = null;
    this._renderer.setChildControllers([]);
    this._historyController.clear();
  }
}

module.exports = NativeStackRouter;
