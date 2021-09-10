"use strict";

import NativeRouterBase from "./NativeRouterBase";
import createRenderer from "./createRenderer";
import { RouteParams } from "../router/RouteParams";
import Renderer from "./Renderer";
import type Route from "../router/Route";
import Router from "../router/Router";
import Page from "@smartface/native/ui/Page";

/**
 * It creates a root fragment Rotuer adds and removes child routers and pages as application root.
 *
 * @class
 * @example
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
 *
 * @since 1.0.0
 */
export default class NativeRouter<Ttarget = Page> extends NativeRouterBase<Ttarget> {
  protected _rootWillChange: boolean;
  protected _route?: Route;
  /**
   * Create OS specific NativeRouter instance
   * @static
   * @param {RouterParams} options
   * @returns {NativeRouter}
   */
  static of<Ttarget = Page>(options: any) {
    options.renderer = createRenderer();
    return new NativeRouter<Ttarget>(options);
  }

  /**
   * @constructor
   * @param {RouterParams} param
   */
  constructor({
    path = "",
    build = undefined,
    routes = [],
    exact = false,
    renderer = undefined,
    to = undefined,
    routerDidEnter,
    routerDidExit,
    routeShouldMatch,
    routeWillEnter,
    rootWillChange,
  }: RouteParams<Ttarget>) {
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
    
    this._rootWillChange = !!rootWillChange;

    if (!this._isRoot) {
      throw new Error("[NativeRouter] Please only use as root");
    }

    this._renderer = renderer;
  }
  
  canGoBack(){
    return false;
  }

  /**
   * @override
   */
  routeWillEnter(route: Router | Route, action: string) {
    // this._renderer.show(router._renderer._rootController);
    if (this._isRoot && this._route !== route) {
      //@ts-ignore
      const root = route instanceof Router ? route._renderer?._rootController : route.getState().view;
      Renderer.setasRoot(root);
      this._route = route;
    }
    
    super.routeWillEnter(route, action);
  }
}