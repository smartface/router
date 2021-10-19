"use strict";

import Page from "@smartface/native/ui/page";
import Application from "@smartface/native/application";
import NavigationController from "@smartface/native/ui/navigationcontroller";
import BottomTabBarController from "@smartface/native/ui/bottomtabbarcontroller";
import View from "@smartface/native/ui/view";
import TabBarItem from "@smartface/native/ui/tabbaritem";
import { ControllerType } from "../core/Controller";
import { runInThisContext } from "vm";

/**
 * Abstract Renderer Strategy
 * It encapsulates displaying strategies for child views.
 *
 * @access package
 * @abstract
 */
export default abstract class Renderer {
  _rootController?: ControllerType;
  /**
   * Helper method sets statically rootController of the Application by DeviceOS
   *
   * @static
   * @param {BottomTabBarController|Page} rootController
   */
  static setasRoot(rootController?: ControllerType | null) {
    /**
     * Wrong typing on @smartface/native, track the issue on Linear (TYPNG-14)
     */
     rootController && Application.setRootController({
      //  @ts-ignore
      controller: rootController,
      animated: true
    });
  }

  abstract dispose():void;

  constructor(controller?: ControllerType){
    this._rootController = controller;
  }

  makeRootVisible() {
    //@ts-ignore
    const sfWindow = SF.requireClass("UIApplication").sharedApplication().keyWindow;
    sfWindow.makeKeyAndVisible();
  }

  showTab() {
    /**
     * Wrong typing, show should exist on BottomTabbarController
     */
    //@ts-ignore
    this._rootController.show();
  }

  present(
    controller: ControllerType,
    animated: boolean,
    onComplete: (...args: any) => void
  ) {
    setTimeout(() => {
      /**
       * Present method actually exists on BottomTabBarController.
       * Track the issue on Linear (TYPNG-15)
       */
      //@ts-ignore
      this._rootController.present({
        controller,
        animated,
        onComplete,
      });
    }, 1);
  }

  dismiss(onComplete: (...args: any) => void, animated: boolean) {
    /**
     * dismiss method actually exists on BottomTabBarController.
       * dismiss method actually exists on BottomTabBarController. 
     * dismiss method actually exists on BottomTabBarController.
     * Track the issue on Linear (TYPNG-15)
     */
    //@ts-ignore
    this._rootController.dismiss({ onComplete, animated });
  }

  /**
   * Template method sets specified controller as root controller
   * @param {BottomTabBarController|Page|NavigationController} controller
   */
  setRootController(controller: ControllerType) {
    this._rootController = controller;
  }

  replaceChild(view: ControllerType, index?: number) {
    if (
      this._rootController?.childControllers === undefined ||
      !this._rootController?.childControllers.length
    ) {
      return;
    }
    const len = this._rootController.childControllers.length;
    index = index !== undefined ? index : len === 0 ? 0 : len - 1;
    const controllers: ControllerType[] = this._rootController.childControllers;
    controllers[index] = view;
    (this._rootController.childControllers as ControllerType[]) = controllers;
  }

  /**
   * Only use if rootpage is Page instance
   *
   * @protected
   * @param {Page} fromPage
   * @param {Page} toPage
   * @param {number} [duration=0] duration
   * @param {number} [options=0] options
   */
  showWithTransition(fromPage: Page, toPage: Page, duration = 0, options = 0) {
    throw new Error("onNavigatorChange method must be overridden");
  }

  /**
   * NavigationController child page is changed handler
   * Only use if rootpage is NavigationController.
   * Must be Implemented
   *
   * @param {function(e:NavigationControllerTransformEvent)} fn
   */
  onNavigationControllerTransition(fn: (...args: any) => void): () => void {
    throw new Error("onNavigatorChange method must be overridden");
  }

  /**
   * Set TabBarItems to BottomTabBarController
   *
   * @param {Array<TabBarItem>} items
   */
  setTabBarItems(items: (TabBarItem | Partial<TabBarItem>)[]) {
    if (this._rootController instanceof BottomTabBarController) {
      this._rootController.tabBar.items = items as TabBarItem[];
    }
  }

  /**
   * Set BottomTabbarController selected index
   *
   * @param {nummer} index
   */
  setSelectedIndex(index: number) {
    if (this._rootController instanceof BottomTabBarController) {
      if (this._rootController.selectedIndex !== index) {
        this._rootController.selectedIndex = index;
      }
    }
  }

  /**
   * Set NavigationController child controllers.
   * Must be implemented.
   *
   * @params {Array<NavigationController>} children
   */
  setChildControllers(children: ControllerType[]) {
    throw new Error("addChildViewControllers method must be overridden");
  }

  /**
   * Remove child from root page
   * Must be implemented.
   *
   * @param {Page} page
   */
  removeChild(page: Page) {
    throw new Error("removeChild must be overridden");
  }

  /**
   * Add child from root page
   * Must be implemented.
   *
   * @param {Page} page
   */
  addChild(page: Page) {
    throw new Error("addChild must be overridden");
  }

  /**
   * Push child from root NavigationController.
   * Must be implemented.
   *
   * @param {Page} page
   * @param {boolean} [animated=true] animmated
   */
  pushChild(page: Page, animated = true) {
    throw new Error("pushChild must be overridden");
  }

  /**
   * Pop child from root NavigationController.
   * Must be implemented.
   *
   * @param {boolean} [animated=true] animmated
   */
  popChild(animated = true) {
    throw new Error("popChild must be overridden");
  }

  /**
   */
  popTo(n: number) {
    if (this._rootController instanceof NavigationController) {
      this._rootController.popTo({
        controller: this._rootController.childControllers[n],
        animated: true,
      });
    }
  }

  /**
   * Displays specified page
   * Only use if root conttroller is a Page instance
   *
   * @param {Page} page
   */
  show(page: Page) {
    throw new Error("show must be overridden");
  }
}