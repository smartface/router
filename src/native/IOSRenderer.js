"use strict";

const Renderer = require("./Renderer");
const Animator = require("./iOSAnimator");

/**
 * Rendering strategy for iOS
 * It encapsulates all logic to display pages on iOS
 *
 * @class
 * @access package
 * @extends {Renderer}
 */
class IOSRenderer extends Renderer {
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * @override
   */
  setChildControllers(controllers) {
    this._rootController.childControllers = controllers;
  }

  /**
   * @override
   */
  showWithTransition(fromPage, toPage, duration = 0, options = 0 << 20) {
    new Animator(this._rootController)
      .onAnimate((container, from, to, params) => {
        this.addChild(to);
      })
      .onFinish((finished, container, from, to, params) => {
        to.nativeObject.didMoveToParentViewController(container.nativeObject);
        this.removeChild(from);
      })
      .once(true)
      .start(fromPage, toPage, duration, options);
  }

  /**
   * @override
   */
  pushChild(page, animated = true) {
    // prevents to push existing view
    if (this._rootController.childControllers.some(p => p === page) || this._activePage === page) {      return;
      // throw new Error("You can't pass extisting view");
    }
    
    this.makeRootVisible();
    this._rootController.push &&
      this._rootController.push({ controller: page, animated });
    this._activePage = page;
  }

  /**
   * @override
   */
  onNavigationControllerTransition(fn) {
    this._rootController.onTransition = fn;
    return () => (this._rootController.onTransition = () => null);
  }

  /**
   * @override
   */
  popChild(animated = true) {
    this.makeRootVisible();
    if (this._rootController.childControllers.length > 1)
      this._rootController.pop({ animated });
  }

  /**
   */
  popTo(index) {
    this.setasRoot();
    this._rootController.popTo(index);
  }

  /**
   * @override
   */
  removeChild(page) {
    page.nativeObject.removeFromParentViewController();
    page.nativeObject.view.removeFromSuperview();
  }

  /**
   * @override
   */
  addChild(page) {
    this.makeRootVisible();
    page.nativeObject.view &&
      this._rootController.nativeObject.view.addSubview(page.nativeObject.view);
  }

  /**
   * @override
   */
  addPageViewController(page) {
    this._rootController.nativeObject.addChildViewController(page.nativeObject);
  }

  /**
   * @override
   */
  show(page) {
    if (this._currentPage === page) return;

    if (this._currentPage) {
      // this.showWithTransition(this._currentPage, page);
      this.removeChild(this._currentPage);
    }
    // else {
    this.addPageViewController(page);
    this.addChild(page);
    page.nativeObject.didMoveToParentViewController(
      this._rootController.nativeObject
    );
    // }

    this._currentPage = page;

    this.makeRootVisible();
  }
}

module.exports = IOSRenderer;
