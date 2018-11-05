"use strict";

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
 *          build((match, state, router, view) => {
 *            const Page1 = require('/pages/Page1');
 *            return new Page1(state.data, router);
 *          })
 *        }),
 *        Route.of({
 *          path: "/pages/page2",
 *          build((match, state, router, view) => {
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
   * @param {NativeStackRouterParams} param
   */
  static of (props) {
    props.renderer = createRenderer();
    return new NativeStackRouter(props);
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
      to,
      isRoot,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch
    });
    console.log("new StackRouter created");
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
    if (this.isUrlCurrent(nextState.match.url, nextState.action))
      return false;
    return super.routeShouldMatch(prevState, nextState);
  }

  /**
   * @private
   * Add new listener to listen NavigationController transitions.
   */
  addNavigatorChangeListener() {
    this._unlistener = this._renderer.onNavigationControllerTransition(
      action => {
        console.log('addNavigatorChangeListener');
        // if user presses backbutton or uses gesture to back
        if (action.operation === NavigationController.OperationType.POP) {
          // set Router to skip next history change
          this._fromRouter = false;
          try {
            this._historyController.preventDefault();
            this._historyController.goBack();
          }
          catch (e) {
            throw e;
          }
          finally {
            this._fromRouter = true;
          }
          // and history goes back.
          // this.goBack();
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

  routeWillEnter(route) {
    const state = route.getState();
    switch (state.action) {
      case "REPLACE":
      case "PUSH":
        console.log(
          `PUSH ${typeof view} ${state.action} name : ${this._renderer.constructor.name}`
        );
        this._renderer.pushChild(state.view);
        break;
      case "POP":
        if (Router.currentRouter === this) this._renderer.popChild();
        break;
    }
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
    // if (action === "POP")
    // this._renderer.setRootController(new NavigationController());
    console.log(`onRouterExit ${this}`);
  }
}

module.exports = NativeStackRouter;
