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
 *  routes: [
 *    Route.of({
 *      path: "/tabs/page1",
 *      build((router, route) => {
 *        const Page1 = require('/pages/Page1');
 *          return new Page1(route.getState().routeData, router);
 *         })
 *      }),
 *      Route.of({
 *        path: "/tabs/page2",
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
   * @param {object} options -
   * @param {string} [options.path=""] - Absolute path of the router
   * @param {function|null} [options.build=null] - Build method of the route
   * @param {Route[]|NativeRouter[]|NativeStackRouter[]|BottomTabBarRouter[]} [options.routes=[]] - Routes defined within the router
   * @param {boolean} [options.exact=false] - Matching should be done by exact match
   * @param {Renderer} [options.renderer] - Renderer is used to render the routes
   * @param {string|null} [options.to=null] - Redirection path if target path is this router
   * @param {boolean} [options.isRoot=false] - Specifies whether this router is the root router
   * @returns {NativeRouter}
   */
  static of(options) {
    options.renderer = createRenderer();
    return new NativeRouter(options);
  }
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
    this._renderer.show(router._renderer._rootController);
  }

  /**
   * @override
   */
  routeWillEnter(route) {
    this._renderer.show(route.getState().view);
  }
}

module.exports = NativeRouter;
