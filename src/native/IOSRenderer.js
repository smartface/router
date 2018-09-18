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
        this._onAnimate && this._onAnimate(this._containerView, from, to, duration, this._options, params);
      },
      (finished) => {
        this._onFinish && this._onFinish(finished, this._containerView, from, to, duration, this._options, params);
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

class IOSRenderer extends Renderer {
  constructor(root) {
    super(root);
    // get application native window
    var sfWindow = SF.requireClass("UIApplication").sharedApplication()
      .keyWindow;
    sfWindow.rootViewController = this._rootPage.nativeObject;

    sfWindow.makeKeyAndVisible();
  }
  
  addChildViewControllers(controllers){
    this._rootPage.childViewControllers = controllers;
  }

  showWithTransition(fromPage, toPage, duration = 1, options = 0 << 20) {
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
  
  pushChild(page){
    this._rootPage.push && this._rootPage.push(page);
  }
  
  popChild(){
    this._rootPage.pop && this._rootPage.pop();
  }

  removeChild(page) {
    page.nativeObject.removeFromParentViewController();
    page.nativeObject.view.removeFromSuperview();
  }

  addChild(page) {
    page.nativeObject.view && this._rootPage.nativeObject.view.addSubview(page.nativeObject.view);
  }

  addPageViewController(page) {
    this._rootPage.nativeObject.addChildViewController(page.nativeObject);
  }

  show(page) {
    if (!(page instanceof Page)) {
      throw new TypeError("View must be instance of sf-core/ui/page ");
    }

    this.addPageViewController(page);

    if (this._currentPage) {
      this.showWithTransition(this._currentPage, page);
    }
    else {
      this.addChild(page);
      page.nativeObject.didMoveToParentViewController(this._rootPage.nativeObject);
    }

    this._currentPage = page;

    // TODO: this part must be moved to native-layer
    this._rootPage.nativeObject.view.addFrameObserver();
    this._rootPage.nativeObject.view.frameObserveHandler = (e) => {
      for (var child in this._rootPage.nativeObject.childViewControllers) {
        this._rootPage.nativeObject.childViewControllers[child].view.frame = { x: 0, y: 0, width: e.frame.width, height: e.frame.height };
        if (this._rootPage.nativeObject.childViewControllers[child].view.yoga.isEnabled) {
          this._rootPage.nativeObject.childViewControllers[child].view.yoga.applyLayoutPreservingOrigin(true);
        }
      }
    };
  }
}

module.exports = IOSRenderer;
