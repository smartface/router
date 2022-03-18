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
import Router, { RouterParams } from "../router/Router";
import NavigationController from "@smartface/native/ui/navigationcontroller";
import createRenderer from "./createRenderer";
import Page from "@smartface/native/ui/page";
import HeaderBar from "@smartface/native/ui/headerbar";
import Route from "router/Route";
import { ControllerType } from "core/Controller";
import { Location } from "common/Location";
import { ModalType } from "./ModalType";
import { BottomSheetOptions } from "./BottomSheetOptions";

type NativeStackRouterParams<Ttarget = any> = RouterParams<Ttarget>
& (
| { modal?: true, modalType?: "bottom-sheet", bottomSheetOptions?: BottomSheetOptions }
| { modal?: true, modalType?: "modal", modalOptions?: any }
| { modal?: false });
type DismissHook = { before?: () => void; after?: () => void };

let ID = 0;
/**
 * Creates NavigationController and manages its behavours and routes.
 *
 * @class
 * @extends {Router}
 * @example
 * ```
 * import { NativeStackRouter, Route } from '@smartface/router';
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
 *```
 * @example
 * ```
 * import System from '@smartface/native/device/system';
 * import Application from '@smartface/native/application';
 * import AlertView from '@smartface/native/ui/alertview';
 * import { NativeStackRouter } from '@smartface/router';
 *
 * import Page1Design from 'generated/page1';
 *
 * export default class Page1 {
 *  constructor(data, router) {
 *    super();
 *    this._router = router;
 *    if (router instanceof NativeStackRouter) {
 *      router.setHeaderBarParams({visible: false});
 *    }
 *  }
 * }
 *```
 *
 * @since 1.0.0
 */
export default class NativeStackRouter<
  Ttarget = Page
> extends NativeRouterBase<Ttarget> {
  /**
   * Builds OS specific NaitveRouter
   *
   * @static
   * @param {NativeStackRouterParams} params
   */
  static of<Ttarget = Page>(params: NativeStackRouterParams<Ttarget>) {
    params.renderer = createRenderer(
      new NavigationController() as ControllerType
    );

    return new NativeStackRouter(params);
  }
  
  private _currentRouteUrl?: string;
  private _modal: boolean = false;
  private _presented: boolean = false;
  private _unlistener: () => void = () => {};
  private _modalType: ModalType = "modal";
  private _bottomSheetOptions?: BottomSheetOptions;
  private _modalOptions?: any;
  private _id = ID++;
  /**
   * @ignore
   */
  _dismiss?: null | ((hook?: DismissHook, animated?: boolean) => void);
  private _headerBarParams?: () => Partial<HeaderBar>;

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
  constructor(params: NativeStackRouterParams<Page>) {
    super(params);
    this._modal = !!params.modal;
    params.modal && 
    console.log("NativeStackRouter ", this._id, params.modalType);
    if(params.modal)
      this._modalType = params.modalType || "modal";
    if(params.modal && params.modalType === "bottom-sheet"){
      this._bottomSheetOptions = params.bottomSheetOptions
    } else if(params.modal && params.modalType === "modal"){
      this._modalOptions = params.modalOptions;
    }
    this._homeRoute = params.homeRoute || undefined;
    this._headerBarParams = params.headerBarParams;
    this._renderer = params.renderer;
    this.addNavigatorChangeListener();
    this.build = () => this._renderer?._rootController || null;
    /**
     * Headerbar is be read-only
     */
    if (
      this._renderer?._rootController instanceof NavigationController &&
      typeof this._headerBarParams === "function"
    ) {
      (this._renderer._rootController as ControllerType).headerBar =
        this._headerBarParams();
    }
  }

  /**
   * Applies new params to the headerBar
   *
   * @since 1.0.0
   * @param {HeaderBarParams} params
   */
  setHeaderBarParams(params: Partial<HeaderBar>) {
    if (this._renderer?._rootController?.headerBar)
      this._renderer._rootController.headerBar = params;
  }

  /**
   * Returns headerBar instance
   *
   * @return {object}
   */
  get headerBarParams() {
    return this._renderer?._rootController?.headerBar;
  }

  /**
   * Closes StackRouter's View if it is opened as modal.
   * @since 1.0.0
   *
   * @param {function | {before: function, after: function}} hooks - Before and after hooks. If Hooks paramter is a function then it is used as before hook.
   * @param {boolean} [animated=true] - Callback is called before dismissing to trigger another action like routing to an another page.
   */
  dismiss(hooks?: DismissHook | (() => void), animated = true) {
    if (typeof this._dismiss === "function") {
      this._dismiss(
        typeof hooks === "function" ? { after: hooks } : hooks,
        animated
      );
    }
  }

  goBack(url?: string | Location, animated: boolean = true) {
    const currentIndex = this._historyController?.currentIndex() || 0;
    if (!url && currentIndex === 0) {
      this._dismiss?.();
    } else {
      super.goBack(url, animated);
    }

    return this;
  }

  /**
   * To Listen page changes are handled by device.
   * @since 1.0.0
   *
   * @private
   */
  private addNavigatorChangeListener() {
    this._unlistener =
      this._renderer?.onNavigationControllerTransition((action) => {
        // if user pressed backbutton or uses gesture to back
        if (
          action.operation === NavigationController.OperationType.POP &&
          !this._fromRouter
        ) {
          try {
            // set Router to skip next history change
            this._historyController?.preventDefault();
            this._historyController?.goBack();
            if (typeof this.dispatch === "function") {
              this._historyController?.history &&
                this.dispatch(
                  this._historyController.history.location,
                  "POP",
                  this,
                  false
                );
            }
          } catch (e) {
            throw e;
          }
        }
      }) || (() => {});
  }

  /**
   * @ignore
   */
  isModal() {
    return this._modal;
  }

  get modalType() {
    return this._modalType;
  }

  /**
   * For internal use
   *
   * @ignore
   * @param path
   */
  pushHomeRouteBefore(path: string) {
    if (
      this.hasHome() &&
      this._renderer?._rootController &&
      this._renderer?._rootController instanceof NavigationController
    ) {
      this._renderer?._rootController.childControllers;
      const indexRoute = this._routes[this._homeRoute || 0];

      if (path !== indexRoute.getUrlPath()) {
        this._historyController?.push(indexRoute.getUrlPath());
      }
    }
  }

  /**
   * @override
   */
  onRouteEnter(route: Route, requestedUrl: string) {
    const { view, match, url, action } = route.getState();
    const exact = !!match?.isExact;

    const active = url === this._currentRouteUrl;
    switch (action) {
      case "REPLACE":
        if (this._fromRouter) {
          this._renderer?.replaceChild(
            (route instanceof Router &&
              route.renderer &&
              route.renderer._rootController) ||
              view,
            0
          );
        }
        break;
      case "PUSH":
        if (this._fromRouter) {
          if (
            route instanceof NativeStackRouter &&
            route.isModal() &&
            !this._presented &&
            !active
          ) {
            try {
              const _backUrl = Router._backUrl;
              const onDismissComplete = (hooks?: DismissHook) => {
                disposed = true;
                route._dismiss = null;
                route._presented = false;

                this._presented = false;
                route.setState({ active: false });
                route.resetView();

                if (
                  _backUrl &&
                  !hooks?.after &&
                  !hooks?.before &&
                  typeof this.dispatch === "function"
                ) {
                  this.dispatch(_backUrl, "PUSH", this, true);
                } else {
                  if (
                    !hooks?.before &&
                    this._historyController?.lastLocation
                  ) {
                    this.dispatch?.(
                      this._historyController?.lastLocation,
                      "POP",
                      this,
                      false
                    );
                  }
                }
                hooks?.after && hooks?.after();
              }

              const normalizeHistory = (hooks?: DismissHook) => {
                if (disposed) return;
                let diff =
                  Router.getGlobalRouter().history.index - lastLocationIndex;
                // Rewinds global history by amount of visits while the modal is opened.
                // Because routers in the tree are not aware of modal router will be dismissed.
                // And if they are notified and then their current-urls will be outdated.
                while (diff-- > 1) {
                  // clear modal's history
                  Router.getGlobalRouter().history.rollback();
                }

                // simulate a pop request to inform all routers
                // regarding route changing
                this._historyController?.rollback();
                if (
                  hooks?.before &&
                  typeof this.dispatch === "function" &&
                  this._historyController?.lastLocation
                ) {
                  this.dispatch(
                    this._historyController?.lastLocation,
                    "POP",
                    this,
                    false
                  );
                  hooks.before();
                }
              }

              const dismiss = (hooks?: DismissHook, animated: boolean = true): void => {
                console.log("dismiss")
                normalizeHistory(hooks);
                
                route.renderer?.dismiss(() => {
                  onDismissComplete(hooks);                  
                }, animated);
              };
              Router._backUrl = null;
              if (this._historyController?.lastLocationUrl !== url) {
                this._historyController?.preventDefault();
                url && this._historyController?.push(url);
              }
              const lastLocationIndex = Router.getGlobalRouter().history.index;
              // TODO: change lock logic because of when call nested url from another tab then the tab is blocked.
              Router._lock = true;

              this._renderer?.present({
                controller: route instanceof Router && route.renderer
                  ? route.renderer._rootController
                  : view,
                animated: this.isAnimated(),
                onDismissStart: () => {
                  normalizeHistory();
                  onDismissComplete();
                },
                onComplete: () => (Router._lock = false),
                type: route.modalType,
                options: this._bottomSheetOptions || this._modalOptions
              });
              let disposed = false;

              route._dismiss = (hooks, animated) => {
                dismiss(hooks, animated)
              }
            } catch (error) {
              // @ts-ignore
              console.log(error);
              throw error;
            }

            this._presented = true;
            route.setState({ active: true });
          } else if (
            (!(route instanceof NativeStackRouter) || !route.isModal()) &&
            !active
          ) {
            this._currentRouteUrl = url || undefined;
            try {
              this._renderer?.pushChild(
                ((route as Router).renderer &&
                  (route as Router).renderer?._rootController) ||
                  view,
                this.isAnimated()
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
          if (
            (!(route instanceof NativeStackRouter) ||
              (route instanceof NativeStackRouter &&
                !route._dismiss &&
                !route.isModal())) &&
            exact
          ) {
            this._renderer?.popChild();
          }
        }

        route.setState({ active: false });
        break;
    }

    this._currentRouteUrl = url || undefined;
    super.onRouteEnter(route, "");
  }

  /**
   * Go back to index
   * @example
   * ```
   * router.goBackto(-2)
   * ```
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
   * ```
   * router.goBacktoUrl('/back/to/url');
   * ```
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
   * ```
   * router.goBackHome();
   * ```
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
    const index =
      this._historyController?.findIndex((location) => location.url === url) ||
      0;

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
