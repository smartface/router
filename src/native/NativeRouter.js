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
    isRoot = false,
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
      isRoot,
      to,
      routerDidEnter,
      routerDidExit,
      routeShouldMatch
    });

    this._renderer = renderer;
    if (isRoot) {
      this._renderer.setRootController(
        new Page({ orientation: Page.Orientation.AUTO })
      );
      const Renderer = require("./Renderer");
      Renderer.setasRoot(this._renderer._rootController);
    }
  }

  /**
   * @protected
   * @param {NativeRouter[]|NativeStackRouter[]|BottomTabBarRouter[]} router
   */
  addChildRouter(router) {
    const Renderer = require("./Renderer");
    // this._renderer.show(router._renderer._rootController);
    Renderer.setasRoot(router._renderer._rootController);
  }

  /**
   * @override
   */
  routeWillEnter(route) {
    const Renderer = require("./Renderer");
    // this._renderer.show(router._renderer._rootController);
    Renderer.setasRoot(route.getState().view);
    // this._renderer.show(route.getState().view);
  }
}

module.exports = NativeRouter;
