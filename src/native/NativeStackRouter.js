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
      homeRoute
    });
    
    this._homeRoute = homeRoute;
    this._headerBarParams = headerBarParams;
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
        if (action.operation === NavigationController.OperationType.POP && !this._fromRouter) {
          // set Router to skip next history change
          console.log(`--- go back from device ${this._fromRouter}`);
          try {
            this._historyController.preventDefault();
            this._historyController.goBack();
            this.dispatch(
              this._historyController.history.location,
              "POP",
              this,
              false
            );
            // this._fromRouter = true;
          }
          catch (e) {
            throw e;
          }
          finally {}
        }
      }
    );
  }

  push(path, routeData = {}) {
    return super.push(path, routeData);
  }

  /**
   * @override
   */
  routeWillEnter(route, requestedUrl, act, ex, target, fromRouter) {
    const { view, match: { isExact: exact }, url, action } = route.getState();
    const active = url === this._currentRouteUrl;
    console.log(`routeWillEnter route : ${route} url: ${url} ${this._currentRouteUrl} active: ${active} exact : ${exact} action : ${action} _fromRouter : ${this._fromRouter}`);
    if(this.isModal())
      console.log(`routeWillEnter array : ${this.getHistoryasArray().length}`);
      
    switch (action) {
      case "REPLACE":
        break;
      case "PUSH":
        if (this._fromRouter) {
          if (route.isModal() && !this._presented && !active) {
            console.log('present '+this+" "+route);
            const lastLocation = Router.getGlobalRouter().history.entries[Router.getGlobalRouter().history.index];
            const lastLocationIndex = Router.getGlobalRouter().history.index;
            this._renderer.present(route._renderer && route._renderer._rootController || view);
            route.dismiss = this._dismiss = () => {
              route._renderer.dismiss(() => {
                console.log(`dismiss ${route}`);
                route.dismiss = null;
                route._presented = false;
                route._currentRouteUrl = null;
                this._currentRouteUrl = null;
                
                this._presented = false;
                let diff = Router.getGlobalRouter().history.index - lastLocationIndex;
                // exits all locations in the modal router
                while(diff > 1){
                  Router.getGlobalRouter().history.rollback();
                  diff--;
                }
                console.log('nav dismiss 1 '+this._historyController);
                this._historyController.preventDefault();
                this._historyController.goBack();
                console.log('nav dismiss 1 '+this._historyController);
                this.dispatch(
                  lastLocation,
                  "POP",
                  this,
                  false
                ); 
                
                console.log(`dismiss oncomplete 1.5 last : ${lastLocation.pathname} ${Router.getGlobalRouter().history.location.pathname}`);
                console.log(`dismiss oncomplete 2 ${this}`);
                route.setState({ active: false });
                route.resetView();
              });
            };
            
            this._presented = true;
            route.setState({ active: true });
          }
          else if (!route.isModal() && !active) {
            this._currentRouteUrl = url;
            try {
              this._renderer.pushChild(route._renderer && route._renderer._rootController || view);
            } catch(e) {
              console.log(`Error when ${route} is pushed ${this} ${e.messagr} ${e.stack}`);
            } finally {
              route.setState({ active: true });
            }
            // route.__goBack = () => this._renderer.popChild();
            // this.goBack = () => {
            //   this._renderer.popChild();
            //   this.goBack = () => null;
            // };
            // route.setState({ active: true });
          }
        }
        
        
        // this._currentRouteUrl = route.getUrl();

        break;
      case "POP":
        if (this._fromRouter) {
          // if (this._presented && target === this) {
          //   console.log('dismiss '+this);
          //   this._dismiss && this._dismiss();
          //   this._presented = false;
          // }
          // else 
          if (!route.dismiss && exact) {
            console.log('navcontroller pop '+this);
            this._renderer.popChild();
          }
        }

        route.setState({ active: false });
        break;
    }
    this._currentRouteUrl = url;
  }

  resetView() {
    this.clearUrl();
    this._currentRouteUrl = null;
    this._renderer.setChildControllers([]);
    this._historyController.clear();
  }

  /**
   * Event handler when a router exits from active state
   *
   * @override
   * @protected
   * @event
   * @emits routerWillReset
   * @param {string} action
   */
  routerDidExit(action) {
    if (action === 'POP') {
      // this._currentRouteUrl = null;
    }

    super.routerDidExit(action);
  }
}

module.exports = NativeStackRouter;
