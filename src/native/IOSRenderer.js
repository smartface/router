const Renderer = require("./Renderer");
const TransitionOptions = require("./IOSTransitions");
const Page = require("sf-core/ui/page");

class Animator {
  constructor(containerView) {
    this._containerView = containerView;
    this._options = 0 << 20;
  }

  onAnimate(fn) {
    this._onAnimate = fn;
    return this;
  }

  onFinish(fn) {
    this._onFinish = fn;
    return this;
  }

  start(from, to, duration = 0, params = {}) {
    // options && (this._options = this._options | options);
    // this.getTime();
    this._containerView.nativeObject.transitionFromToDurationOptionsAnimationsCompletion(
      from.nativeObject,
      to.nativeObject,
      duration,
      TransitionOptions.UIViewAnimationOptionCurveEaseOut,
      () => {
        this._onAnimate &&
          this._onAnimate(
            this._containerView,
            from,
            to,
            duration,
            this._options,
            params
          );
      },
      finished => {
        this._onFinish &&
          this._onFinish(
            finished,
            this._containerView,
            from,
            to,
            duration,
            this._options,
            params
          );
        this._once && this.dispose();
      }
    );
  }

  dispose() {
    this._containerView = null;
    this._onFinish = null;
    this._onAnimate = null;
    this._easingFn = null;
  }

  once(val) {
    this._once = val;
    return this;
  }
}

var hasRoot = false;

/**
 * Renderer for iOS
 * It encapsulates all logic to display pages on iOS
 */
class IOSRenderer extends Renderer {
  /**
   * @constructor
   * @params {Page|NavigationController} root
   */
  constructor(root) {
    super(root);
    // get application native window
    
  }
  
  setasRoot(){
    var sfWindow = SF.requireClass("UIApplication").sharedApplication()
      .keyWindow;
    sfWindow.rootViewController = this._rootPage.nativeObject;

    sfWindow.makeKeyAndVisible();
  }

  /**
   * Only use if rootpage is NavigationController
   * @params {Array.<object>} controllers
   */
  addChildViewControllers(controllers) {
    this._rootPage.childViewControllers = controllers;
  }

  /**
   * Only use if rootpage is Page instancea
   *
   * @protected
   * @params {Page} fromPage
   * @params {Page} toPage
   * @params {number} [=1] duration
   * @params {number} [=0] options
   */
  showWithTransition(fromPage, toPage, duration = 1, options = 0 << 20) {
    this.setasRoot();
    new Animator(this._rootPage)
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
   * Pushes a new page to rootpage which is instance of NavigationController
   * Only use if rootpage is NavigationController
   * @params {Array.<object>} controllers
   */
  pushChild(page, animated = true) {
    this.setasRoot();
    this._rootPage.push && this._rootPage.push({ controller: page, animated });
    // this._rootPage.nativeObject.view.addFrameObserver();
    // this._rootPage.nativeObject.view.frameObserveHandler = (e) => {
    //   for (var child in this._rootPage.nativeObject.childViewControllers) {
    //     this._rootPage.nativeObject.childViewControllers[child].view.frame = { x: 0, y: 0, width: e.frame.width, height: e.frame.height };
    //     if (this._rootPage.nativeObject.childViewControllers[child].view.yoga.isEnabled) {
    //       this._rootPage.nativeObject.childViewControllers[child].view.yoga.applyLayoutPreservingOrigin(true);
    //     }
    //   }
    // };
  }

  /**
   * NavigationController child page is changed handler
   * Only use if rootpage is NavigationController
   *
   * @params {function} fn
   */
  onNavigatorChange(fn) {
    this._rootPage.onTransition = fn;
    return () => (this._rootPage.onTransition = () => null);
  }

  /**
   * Only use if rootpage is NavigationController
   *
   * @params {boolean} [=true] animated
   */
  popChild(animated = true) {
    this.setasRoot();
    this._rootPage.pop && this._rootPage.pop({ animated });
  }

  /**
   * Only use if rootpage is Page instancea
   *
   * @params {Page} page
   */
  removeChild(page) {
    page.nativeObject.removeFromParentViewController();
    page.nativeObject.view.removeFromSuperview();
  }

  /**
   * Only use if rootpage is Page instancea
   *
   * @params {Page} page
   */
  addChild(page) {
    page.nativeObject.view &&
      this._rootPage.nativeObject.view.addSubview(page.nativeObject.view);
  }

  /**
   * Adds ViewController for internal use
   * Only use if rootpage is Page instance
   *
   * @protected
   * @params {Page} page
   */
  addPageViewController(page) {
    this._rootPage.nativeObject.addChildViewController(page.nativeObject);
  }

  /**
   * Displays specified page
   * Only use if rootpage is Page instance
   *
   * @params {Page} page
   */
  show(page) {
    if (this._currentPage === page) return;

    this.addPageViewController(page);

    if (this._currentPage) {
      this.showWithTransition(this._currentPage, page);
    } else {
      this.addChild(page);
      page.nativeObject.didMoveToParentViewController(
        this._rootPage.nativeObject
      );
    }

    this._currentPage = page;

    // TODO: this part must be moved to native-layer
    this._rootPage.nativeObject.view.addFrameObserver();
    this._rootPage.nativeObject.view.frameObserveHandler = e => {
      for (var child in this._rootPage.nativeObject.childViewControllers) {
        this._rootPage.nativeObject.childViewControllers[child].view.frame = {
          x: 0,
          y: 0,
          width: e.frame.width,
          height: e.frame.height
        };
        if (
          this._rootPage.nativeObject.childViewControllers[child].view.yoga
            .isEnabled
        ) {
          this._rootPage.nativeObject.childViewControllers[
            child
          ].view.yoga.applyLayoutPreservingOrigin(true);
        }
      }
    };
  }
}

module.exports = IOSRenderer;
