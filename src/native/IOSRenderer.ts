"use strict";

import Renderer from "./Renderer";
import Animator from "./iOSAnimator";
import { ControllerType } from "../core/Controller";
import Page from "@smartface/native/ui/page";
import NavigationController from "@smartface/native/ui/navigationcontroller";
import { ModalType } from "./ModalType";
import { BottomSheetOptions } from "./BottomSheetOptions";
/**
 * Rendering strategy for iOS
 * It encapsulates all logic to display pages on iOS
 *
 * @class
 * @access package
 * @extends {Renderer}
 */
export default class IOSRenderer extends Renderer {
  dispose(): void {

  }
  protected _currentPage?: Page;
 
  /**
   * @override
   */
  setChildControllers(controllers: ControllerType[]) {
    /**
     * Doesn't exist on page and instanceof didn't work
     */
    if (this._rootController && !(this._rootController instanceof Page)) {
      this._rootController.childControllers = controllers
    }
  }

  /**
   * @override
   */
  showWithTransition(
    fromPage: Page,
    toPage: Page,
    duration = 0,
    options = 0 << 20
  ) {
    this._rootController &&
    new Animator(this._rootController)
      .onAnimate((container: any, from: any, to: any, params: any) => {
        this.addChild(to);
      })
      .onFinish(
        (finished: any, container: any, from: any, to: any, params: any) => {
          to.nativeObject.didMoveToParentViewController(container.nativeObject);
          this.removeChild(from);
        }
      )
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
    if (
      this._rootController instanceof NavigationController &&
      // @ts-ignore
      this._rootController?.childControllers?.some((p) => p === page)
    ) {
      return;
    }

    this.makeRootVisible();
    if (this._rootController instanceof NavigationController) {
      // @ts-ignore
      this._rootController.push({ controller: page, animated });
    }
  }

  // present(params: {
  //     type: ModalType,
  //     controller: ControllerType,
  //     animated: boolean,
  //     onComplete: (...args: any) => void,
  //     options?: BottomSheetOptions
  //   }) {
  //   if (this._rootController instanceof Page) {
  //   } else if (this._rootController instanceof NavigationController) {
  //     /**
  //      * Present method actually exists on BottomTabBarController.
  //      * Track the issue on Linear (TYPNG-15)
  //      */
  //     this._rootController.present({
  //       controller: controller as any,
  //       animated,
  //       onComplete,
  //     });
  //   }
  // }

  /**
   * @override
   */
  onNavigationControllerTransition(fn: (...args: any) => void) {
    if (this._rootController && this._rootController instanceof NavigationController) {
      const controller = this._rootController;
      controller.onTransition = fn;
      //@ts-ignore
      return () => {
        controller.onTransition = () => null;
      };
    }
    return () => {};
  }

  /**
   * @override
   */
  popChild(animated = true) {
    this.makeRootVisible();
    if (this._rootController?.nativeObject.viewControllers.length > 1) {
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
