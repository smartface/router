"use strict";

const NativeRouterBase = require("./NativeRouterBase");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

/**
 * It creates a root fragment Rotuer adds and removes child routers and pages as application root.
 *
 * @class
 * @example
 * const {NativeRouter: Router, Route} = require('@smartface/router')
 * const Image = require('sf-core/ui/image');
 * const Color = require('sf-core/ui/color');
 *
 * var router = Router.of({
 *  path: "/",
 *  isRoot: true,
 *  to: '/page1',
 *  routes: [
 *    Route.of({
 *      path: "/page1",
 *      build((router, route) => {
 *        const Page1 = require('/pages/Page1');
 *          return new Page1(route.getState().routeData, router);
 *         })
 *      }),
 *      Route.of({
 *        path: "/page2",
 *        build((router, route) => {
 *          const Page2 = require('/pages/Page2');
 *          return new Page2(route.getState().routeData, router);
 *        });
 *      });
 *    ]
 * })
 *
 * @since 1.0.0
 */
class NativeRouter extends NativeRouterBase {
  /**
   * Create OS specific NativeRouter instance
   * @static
   * @param {RouterParams} options
   * @returns {NativeRouter}
   */
  static of(options) {
    options.renderer = createRenderer();
    return new NativeRouter(options);
  }

  /**
   * @constructor
   * @param {RouterParams} param
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    routerDidEnter,
    routerDidExit,
    routeShouldMatch,
    routeWillEnter,
    rootWillChange = null,
  }) {
    super({
      path,
      build,
      routes,
      exact,
      isRoot: true,
      to,
      routeWillEnter,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch
    });
    
    this._rootWillChange = rootWillChange;

    if (!this._isRoot) {
      throw new Error("[NativeRouter] Please only use as root");
    }

    this._renderer = renderer;
  }
  
  canGoBack(n){
    return false;
  }

  /**
   * @override
   */
  routeWillEnter(route, action) {
    const Renderer = require("./Renderer");
    // this._renderer.show(router._renderer._rootController);
    if (this._isRoot && this._route !== route) {
      Renderer.setasRoot(
        // If route is instance of Router
        (route._renderer && route._renderer._rootController) ||
        // else just instance of Route
          route.getState().view
      );
      this._route = route;
    }
    
    super.routeWillEnter(route, action);
  }
}

module.exports = NativeRouter;
