import NativeRouterBase from "./NativeRouterBase";
import createRenderer from "./createRenderer";
import { RouteParams } from "../router/RouteParams";
import Renderer from "./Renderer";
import type Route from "../router/Route";
import Router, { RouterParams } from "../router/Router";
import Page from "@smartface/native/ui/page";
import { HistoryActionType } from "common/HistoryActions";

/**
 * It creates a root fragment Rotuer adds and removes child routers and pages as application root.
 *
 * @class
 * @example
 * ```
 * const {NativeRouter: Router, Route} = require('@smartface/router')
 * import Image from '@smartface/native/ui/image';
 * import Color from '@smartface/native/ui/color';
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
 *```
 * @since 1.0.0
 */
export default class NativeRouter<
  Ttarget = Page
> extends NativeRouterBase<Ttarget> {
  protected _route?: Route;
  /**
   * Create OS specific NativeRouter instance
   * @static
   * @param {RouterParams} options
   * @returns {NativeRouter}
   */
  static of<Ttarget = Page>(params: RouterParams<Ttarget>) {
    params.renderer = createRenderer();
    return new NativeRouter<Ttarget>(params);
  }

  /**
   * @constructor
   * @param {RouterParams} param
   */
  constructor(params: RouteParams<Ttarget>) {
    super(params);

    if (!this._isRoot) {
      throw new Error("[NativeRouter] Please only use as root");
    }
  }

  canGoBack() {
    return false;
  }

  /**
   * @override
   */
  onRouteEnter(route: Router | Route, action: HistoryActionType) {
    if (this._isRoot && this._route !== route) {
      const root =
        route instanceof Router && route.renderer?._rootController
          ? route.renderer._rootController
          : route.getState().view;
      Renderer.setasRoot(root);
      this._route = route;
    }

    super.onRouteEnter(route, action);
  }
}
