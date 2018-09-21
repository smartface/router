const Renderer = require("./Renderer");


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
  
  /**
   * Only use if rootpage is NavigationController
   * @params {Array.<object>} controllers
   */
  addChildViewControllers(controllers) {
    this._rootController.childViewControllers = controllers;
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
   * @params {Array.<object>} controllers
   */
  pushChild(page, animated = true) {
    super.pushChild();
    this._rootController.push && this._rootController.push({ controller: page, animated });
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
   * @params {function} fn
   */
  onNavigatorChange(fn) {
    this._rootController.onTransition = fn;
    return () => (this._rootController.onTransition = () => null);
  }

  /**
   * Only use if rootpage is NavigationController
   *
   * @params {boolean} [=true] animated
   */
  popChild(animated = true) {
    super.popChild();
    this._rootController.pop && this._rootController.pop({ animated });
  }
  
  popTo(index){
    this.setasRoot();
    this._rootController.popTo(index);
  }
  
  popAll(){
    this._rootController.popAll();
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
      this._rootController.nativeObject.view.addSubview(page.nativeObject.view);
  }

  /**
   * Adds ViewController for internal use
   * Only use if rootpage is Page instance
   *
   * @protected
   * @params {Page} page
   */
  addPageViewController(page) {
    this._rootController.nativeObject.addChildViewController(page.nativeObject);
  }

  /**
   * Displays specified page
   * Only use if rootpage is PageController
   *
   * @params {Page} page
   */
  show(page) {
    if (this._currentPage === page) return;
    super.show(page);

    this.addPageViewController(page);

    if (this._currentPage) {
      this.showWithTransition(this._currentPage, page);
    } else {
      this.addChild(page);
      page.nativeObject.didMoveToParentViewController(
        this._rootController.nativeObject
      );
    }

    this._currentPage = page;

    // TODO: this part must be moved to native-layer
  }
}

module.exports = IOSRenderer;
