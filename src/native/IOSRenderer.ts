"use strict";

import Renderer from "./Renderer";
import Animator from "./iOSAnimator";
import { ControllerType } from "core/Controller";
import Page from "@smartface/native/ui/Page";
import NavigationController from "@smartface/native/ui/navigationcontroller";
/**
 * Rendering strategy for iOS
 * It encapsulates all logic to display pages on iOS
 *
 * @class
 * @access package
 * @extends {Renderer}
 */
export default class IOSRenderer extends Renderer {
  protected _currentPage?: Page;
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * @override
   */
  setChildControllers(controllers: ControllerType[]) {
    /**
     * Doesn't exist on page and instanceof didn't work
     */
    //@ts-ignore
    this._rootController.childControllers = controllers;
  }

  /**
   * @override
   */
  showWithTransition(fromPage: Page, toPage: Page, duration = 0, options = 0 << 20) {
    new Animator(this._rootController)
      .onAnimate((container: any, from: any, to: any, params: any) => {
        this.addChild(to);
      })
      .onFinish((finished: any, container: any, from: any, to: any, params: any) => {
        to.nativeObject.didMoveToParentViewController(container.nativeObject);
        this.removeChild(from);
      })
      .once(true)
      .start(fromPage, toPage, duration, options);
  }

  /**
   * @override
   */
  pushChild(page: Page, animated = true) {
    /**
     * prevents to push existing view
     * Note: This isn't supposed to work, since two object instances can never be equal? 
     */
    //@ts-ignore
    if (this._rootController.childControllers.some(p => p === page)) {
      return;
    }
    
    this.makeRootVisible();
    //@ts-ignore
    if(typeof this._rootController.push === 'function') {
      //@ts-ignore
      this._rootController.push({ controller: page, animated });
    }
  }
  
  present(controller: ControllerType, animated: boolean, onComplete: (...args: any) => void) {
    if(this._rootController instanceof Page) {}
    else {
      /**
      * Present method actually exists on BottomTabBarController. 
      * Track the issue on Linear (TYPNG-15)
      */
      //@ts-ignore
      this._rootController.present({
        controller,
        animated,
        onComplete
      });
    }
  }

  /**
   * @override
   */
  onNavigationControllerTransition(fn: (...args: any) => void) {
    if (this._rootController instanceof NavigationController) {
      this._rootController.onTransition = fn;
      //@ts-ignore
      return () => (this._rootController.onTransition = () => null);
    }
  }

  /**
   * @override
   */
  popChild(animated = true) {
    this.makeRootVisible();
    //@ts-ignore
    if (this._rootController.nativeObject.viewControllers.length > 1) {
      //@ts-ignore
      this._rootController.pop({ animated });
    }
  }

  /**
   * @override
   */
  removeChild(page: Page) {
    /**
     * nativeObject actually exists on page.
     */
    //@ts-ignore
    page.nativeObject.removeFromParentViewController();
    //@ts-ignore
    page.nativeObject.view.removeFromSuperview();
  }

  /**
   * @override
   */
  addChild(page: Page) {
    this.makeRootVisible();
    //@ts-ignore
    this._rootController.nativeObject.view?.addSubview(page.nativeObject.view);
  }

  /**
   * @override
   */
  addPageViewController(page: Page) {
    //@ts-ignore
    this._rootController.nativeObject.addChildViewController(page.nativeObject);
  }

  /**
   * @override
   */
  show(page: Page) {
    if (this._currentPage === page) {
      return;
    }

    if (this._currentPage) {
      // this.showWithTransition(this._currentPage, page);
      this.removeChild(this._currentPage);
    }
    // else {
    this.addPageViewController(page);
    this.addChild(page);
    //@ts-ignore
    page.nativeObject.didMoveToParentViewController(
      //@ts-ignore
      this._rootController.nativeObject
    );
    // }

    this._currentPage = page;

    this.makeRootVisible();
  }
}