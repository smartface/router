const Renderer = require("./Renderer");
const Animator = require("./iOSAnimator");

/**
 * Renderer for iOS
 * It encapsulates all logic to display pages on iOS
 */
class IOSRenderer extends Renderer {
  /**
   * @constructor
   * @param {Page|NavigationController} root
   */
  constructor() {
    super();
    // get application native window
  }

  /**
   * Only use if rootpage is NavigationController
   * @param {Array.<object>} controllers
   */
  addChildViewControllers(controllers) {
    this._rootController.childViewControllers = controllers;
  }

  /**
   * Only use if rootpage is Page instancea
   *
   * @protected
   * @param {Page} fromPage
   * @param {Page} toPage
   * @param {number} [=1] duration
   * @param {number} [=0] options
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
   * Pushes a new page to rootpage which is instance of NavigationController
   * Only use if rootpage is NavigationController
   * @param {Array.<object>} controllers
   */
  pushChild(page, animated = true) {
    super.pushChild();
    this._rootController.push &&
      this._rootController.push({ controller: page, animated });
    // this._rootController.nativeObject.view.addFrameObserver();
    // this._rootController.nativeObject.view.frameObserveHandler = (e) => {
    //   for (var child in this._rootController.nativeObject.childViewControllers) {
    //     this._rootController.nativeObject.childViewControllers[child].view.frame = { x: 0, y: 0, width: e.frame.width, height: e.frame.height };
    //     if (this._rootController.nativeObject.childViewControllers[child].view.yoga.isEnabled) {
    //       this._rootController.nativeObject.childViewControllers[child].view.yoga.applyLayoutPreservingOrigin(true);
    //     }
    //   }
    // };
  }

  /**
   * NavigationController child page is changed handler
   * Only use if rootpage is NavigationController
   *
   * @param {function} fn
   */
  onNavigatorChange(fn) {
    this._rootController.onTransition = fn;
    return () => (this._rootController.onTransition = () => null);
  }

  /**
   * Only use if rootpage is NavigationController
   *
   * @param {boolean} [=true] animated
   */
  popChild(animated = true) {
    this._rootController.pop({ animated });
  }

  popTo(index) {
    this.setasRoot();
    this._rootController.popTo(index);
  }

  popAll() {
    this._rootController.popAll();
  }

  /**
   * Only use if rootpage is Page instancea
   *
   * @param {Page} page
   */
  removeChild(page) {
    page.nativeObject.removeFromParentViewController();
    page.nativeObject.view.removeFromSuperview();
  }

  /**
   * Only use if rootpage is Page instancea
   *
   * @param {Page} page
   */
  addChild(page) {
    page.nativeObject.view &&
      this._rootController.nativeObject.view.addSubview(page.nativeObject.view);
  }

  /**
   * Adds ViewController for internal use
   * Only use if rootpage is Page instance
   *
   * @protected
   * @param {Page} page
   */
  addPageViewController(page) {
    this._rootController.nativeObject.addChildViewController(page.nativeObject);
  }

  /**
   * Displays specified page
   * Only use if rootpage is PageController
   *
   * @param {Page} page
   */
  show(page) {
    console.log("enter show");
    if (this._currentPage === page) return;
    
    console.log("show"+page.constructor.name);

    if (this._currentPage) {
      // this.showWithTransition(this._currentPage, page);
      this.removeChild(this._currentPage)
    } 
    // else {
    this.addPageViewController(page);
    this.addChild(page);
    page.nativeObject.didMoveToParentViewController(
      this._rootController.nativeObject
    );
    // }

    this._currentPage = page;

    // TODO: this part must be moved to native-layer
  }
  
}

module.exports = IOSRenderer;
