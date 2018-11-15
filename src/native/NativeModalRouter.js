"use strict";

const NativeRouterBase = require("./NativeRouterBase");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

/**
 * It creates root {@link Page} and adds and removes child pages.
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
class NativeModalRouter extends NativeRouterBase {
  /**
   * Create OS specific NativeRouter instance
   * @static
   * @param {RouterParams} options
   * @returns {NativeRouter}
   */
  static of(options) {
    options.renderer = createRenderer();
    return new NativeModalRouter(options);
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
    routeShouldMatch
  }) {
    super({
      path,
      build,
      routes,
      exact,
      isRoot: false,
      to,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch
    });

    this._renderer = renderer;
  }

  /**
   * @protected
   * @param {NativeRouter[]|NativeStackRouter[]|BottomTabBarRouter[]} router
   */
  addChildRouter(router) {
    this._renderer.show(router._renderer._rootController);
  }

  /**
   * @override
   */
  routeWillEnter(route) {
    this._renderer.show(route.getState().view);
  }
}

module.exports = NativeModalRouter;