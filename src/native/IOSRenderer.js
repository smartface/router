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
  addChildViewControllers(controllers) {
    this._rootController.childViewControllers = controllers;
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
    super.pushChild();
    this._rootController.push &&
      this._rootController.push({ controller: page, animated });
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
    console.log("enter show");
    if (this._currentPage === page) return;

    console.log("show" + page.constructor.name);

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
  }
}

module.exports = IOSRenderer;
