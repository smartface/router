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
 * @property {Page} frompage`
 * @property {Page} topage
 * @property {{operation: number}} operation
 */

import NativeRouterBase from "./NativeRouterBase";
import Router from "../router/Router";
import NavigationController from '@smartface/native/ui/navigationcontroller';
import createRenderer from "./createRenderer";
import { RouteParams } from "../router/RouteParams";
import Route from "router/Route";
import { RouteState } from "router/RouteState";
import Page from "@smartface/native/ui/Page";
import HeaderBar from "@smartface/native/ui/headerbar";

type NativeStackRouterParams = RouteParams & {homeRoute?: number, isRoot: boolean}

/**
 * Creates {@link NavigationController} and manages its behavours and routes.
 *
 * @class
 * @extends {Router}
 * @example
 * const {NativeStackRouter, Route} = require('@smartface/router');
 * import Image from '@smartface/native/ui/image';
 * import Color from '@smartface/native/ui/color';
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
 * import System from '@smartface/native/device/system';
 * import Application from '@smartface/native/application';
 * import AlertView from '@smartface/native/ui/alertview';
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
export default class NativeStackRouter extends NativeRouterBase {
  _currentRouteUrl?: string;
  private _presented: boolean = false;
  private _unlistener: () => void = () => {};
  private _dismiss: any;
  private _headerBarParams?: Partial<HeaderBar>
  private _nextAnimated:boolean;
  /**
   * Builds OS specific NaitveRouter
   *
   * @static
   * @param {NativeStackRouterParams} params
   */
  static of (params: NativeStackRouterParams) {
    params.renderer = createRenderer();
    return new NativeStackRouter(params);
  }

  /**
   * @constructor
   * @param {NativeStackRouterParams} param0
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
   * @property {Page} frompage`
   * @property {Page} topage
   * @property {{operation: number}} operation
   */
  constructor(options: NativeStackRouterParams) {
    super(options);
    this._nextAnimated = true;
    this._homeRoute = options.homeRoute || undefined;
    this._headerBarParams = options.headerBarParams;
    this._renderer = options.renderer || undefined;
    //@ts-ignore
    this._renderer?.setRootController(new NavigationController());
    this.addNavigatorChangeListener();
    this.build = () => {
      if(this._renderer?._rootController instanceof Page) {
        return this._renderer?._rootController
      }
      else {
        return null;
      }
    };
    /**
     * Headerbar is be read-only
     */
    //@ts-ignore
    this._renderer?._rootController.headerBar = headerBarParams();
  }

  /**
   * Applies new params to the headerBar
   *
   * @since 1.0.0
   * @param {HeaderBarParams} params
   */
  setHeaderBarParams(params: Partial<HeaderBar>) {
    if(this._renderer?._rootController instanceof Page) {
      /**
       * Headerbar is be read-only
       */
      //@ts-ignore
      this._renderer._rootController.headerBar = params;
    } 
  }

  /**
   * Returns headerBar instance
   *
   * @return {object}
   */
  get headerBar() {
    if (this._renderer?._rootController instanceof Page) {
      return this._renderer?._rootController.headerBar;
    }
  }

  /**
   * @ignore
   * @param {RouteState} prevState
   * @param {RouteState} nextState
   */
  //@ts-ignore
  routeShouldMatch(prevState: RouteState, nextState: RouteState) {
    //@ts-ignore
    if (this.isUrlCurrent(nextState?.match?.url, nextState.action)) {
      return false;
    }
    /**
     * RouteState and Router does not match
     */
    //@ts-ignore
    return super.routeShouldMatch(prevState);
  }

  /**
   * Closes StackRouter's View if it is opened as modal.
   * @since 1.0.0
   *
   * @param {function | {before: function, after: function}} hooks - Before and after hooks. If Hooks paramter is a function then it is used as before hook. 
   * @param {boolean} [animated=true] - Callback is called before dismissing to trigger another action like routing to an another page.
   */
  dismiss(hooks = {}, animated = true) {
    if(typeof this._dismiss === 'function') {
      this._dismiss(typeof hooks === "function" ? { after: hooks } : hooks, animated);
    }
  }

  /**
   * To Listen page changes are handled by device.
   * @since 1.0.0
   * 
   * @private
   */
  addNavigatorChangeListener() {
    this._unlistener = this._renderer?.onNavigationControllerTransition(
      action => {
        // if user presses backbutton or uses gesture to back
        if (
          //@ts-ignore
          action.operation === NavigationController.OperationType.POP &&
          !this._fromRouter
        ) {
          try {
            // set Router to skip next history change
            this._historyController?.preventDefault();
            this._historyController?.goBack();
            if(typeof this.dispatch === 'function') {
              this.dispatch(
                //@ts-ignore
                this._historyController?.history.location,
                "POP",
                /**
                 * RouteState and Router does not match
                 */
                //@ts-ignore
                this,
                false
              );
            }
          }
          catch (e) {
            throw e;
          }
          finally {}
        }
      }
    ) || (() => {});
  }

  /**
   * @protected
   * @ignore
   * @param {string} path
   */
  pushHomeBefore(path: string) {
    if (
      this.hasHome() &&
      this._renderer?._rootController instanceof NavigationController &&
      this._renderer?._rootController.childControllers.length === 0
    ) {
      const indexRoute = this._routes[this._homeRoute || 0];

      if (path !== indexRoute.getUrlPath()) {
        this._historyController?.push(indexRoute.getUrlPath());
      }
    }

    return true;
  }

  /**
   * @override
   */
  routeWillEnter(route: any, requestedUrl: string) {
    const {
      view,
      match: { isExact: exact},
      url,
      action
    } = route.getState();

    const active = url === this._currentRouteUrl;
    switch (action) {
      case "REPLACE":
        if (this._fromRouter) {
          this._renderer?.replaceChild(
            (route._renderer && route._renderer._rootController) || view, 0
          );
        }
        break;
      case "PUSH":
        if (this._fromRouter) {
          if (route.isModal() && !this._presented && !active) {
            const _backUrl = Router._backUrl;
            Router._backUrl = null;
            if (this._historyController?.lastLocationUrl !== url) {
              this._historyController?.preventDefault();
              this._historyController?.push(url);
            }
            // Router.getGlobalRouter().history.push(url);
            const lastLocationIndex = Router.getGlobalRouter().history.index;
            const lastLocation = Router.getGlobalRouter().history.entries[lastLocationIndex];
            // TODO: change lock logic because of when call nested url from another tab then the tab is blocked.
            Router._lock = true;
            this._renderer?.present(
              (route._renderer && route._renderer._rootController) || view,
              this.isAnimated(),
              () => Router._lock = false
            );
            let disposed = false;

            route._dismiss = ({ before = () => {}, after = () => {} }, animated = true) => {
              if (disposed) return;
              let diff =
                Router.getGlobalRouter().history.index - lastLocationIndex;
              // Rewinds global history by amount of visits while the modal is opened.
              // Because routers in the tree are not aware of modal router will be dismissed.
              // And if they are notified and then their current-urls will be outdated.
              while (diff-- > 1) {
                Router.getGlobalRouter().history.rollback();
              }

              // simulate a pop request to inform all routers
              // regarding route changing
              this._historyController?.rollback();
              if(typeof before === 'function' && typeof this.dispatch === 'function' && this._historyController?.lastLocation) {
                //@ts-ignore
                this.dispatch(this._historyController?.lastLocation, "POP", this, false);
                before();
              }
              route._renderer.dismiss(() => {
                disposed = true;

                route._dismiss = null;
                route._presented = false;

                this._presented = false;
                route.setState({ active: false });
                route.resetView();
                
                if(_backUrl && !after && !before && typeof this.dispatch === 'function') {
                  //@ts-ignore
                  this.dispatch(_backUrl, "PUSH", this, true)
                }
                else {
                  if (!before) {
                    //@ts-ignore
                    this.dispatch(this._historyController?.lastLocation, "POP", this, false);
                  }
                }
                after && after();
              }, animated);
            };

            this._presented = true;
            route.setState({ active: true });
          }
          else if (!route.isModal() && !active) {
            this._currentRouteUrl = url;
            try {
              this._renderer?.pushChild(
                (route._renderer && route._renderer._rootController) || view,
                this.isAnimated()
              );
            }
            catch (e) {
              throw `Error when ${route} is pushed. ${e}`;
            }
            finally {
              route.setState({ active: true });
            }
          }
        }

        break;
      case "POP":
        // TODO: Add dismiss logic
        if (this._fromRouter) {
          if (!route._dismiss && exact && !route.isModal()) {
            this._renderer?.popChild();
          }
        }

        route.setState({ active: false });
        break;
    }

    this._currentRouteUrl = url;
    super.routeWillEnter(route, '');
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
  goBackto(n: number) {
    if (n < 0 && this._historyController?.canGoBack(n)) {
      const back = this._historyController?.currentIndex() + n;
      const location = this._historyController?.find(
        (location, index) => index === back
      );
      this._historyController?.preventDefault();
      this._historyController?.goBackto(n);
      this._renderer?.popTo(back);
      if (location) {
        //@ts-ignore
        this.dispatch(location, "POP", this, false);
      }
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
  goBacktoUrl(url: string) {
    this.goBackto(this.getStepLengthFromCurrent(url));
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
    const currentIndex = this._historyController?.currentIndex() || 0;
    this.goBackto(-currentIndex);
  }

  /**
   * Go back to first page in the same stack
   *
   * @example
   * ...
   * router.goBackHome();
   * ...
   * @since 1.4.0
   */
  goBacktoHome() {
    this.goBackHome();
  }

  /**
   * Returns length of the history steps to be needed to receive from current to specified url
   * 
   * @since 1.1.0
   * @param {string} url
   * @return {number}
   */
  getStepLengthFromCurrent(url: string) {
    const lastIndex = (this._historyController?.getLength() || 0) - 1;
    const index = this._historyController?.findIndex(
      location => location.url === url
    ) || 0;

    return index - lastIndex;
  }

  /**
   * Tests if desired url is available to go back or not
   *
   * @since 1.1.0
   * @param {string} url Desired url to test availability to go back
   * @return {boolean}
   */
  canGoBacktoUrl(url: string): boolean {
    /**
     * Shouldn't this be canGoBack?
     */
    //@ts-ignore
    return this.canGoBackto(this.getStepLengthFromCurrent(url));
  }

  resetView() {
    this.clearUrl();
    this._currentRouteUrl = undefined;
    this._renderer?.setChildControllers([]);
    this._historyController?.clear();
  }
}
