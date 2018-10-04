const Page = require("sf-core/ui/page");
const Application = require("sf-core/application");

/**
 * @external {Page} http://docs.smartface.io/#!/api/UI.Page
 */

/**
 * @external {NavigationController} http://docs.smartface.io/#!/api/UI.NavigationController
 */

/**
 * @external {BottomTabBarController} http://docs.smartface.io/#!/api/UI.BottomTabBarController
 */

/**
 * @external {BottomTabBarItem} http://docs.smartface.io/#!/api/UI.BottomTabBarItem
 */
 
/**
 * @typedef NavigationControllerTransformEvent
 * @property {Page} frompage
 * @property {Page} topage
 * @property {{operation: number}} operation
 */

/**
 * Abstract Renderer Strategy
 * @access package
 * @abstract
 */
class Renderer {
  /**
   * Helper method sets statically rootController of the Application by DeviceOS
   * 
   * @static
   * @param {BottomTabBarController|Page|NavigationController} rootController
   */
  static setasRoot(rootController) {
    if (Device.deviceOS === "iOS") {
      var sfWindow = SF.requireClass("UIApplication").sharedApplication()
        .keyWindow;
      sfWindow.rootViewController = rootController.nativeObject;
      sfWindow.makeKeyAndVisible();

      rootController.nativeObject.view.addFrameObserver();
      rootController.nativeObject.view.frameObserveHandler = e => {
        for (var child in rootController.nativeObject.childViewControllers) {
          rootController.nativeObject.childViewControllers[child].view.frame = {
            x: 0,
            y: 0,
            width: e.frame.width,
            height: e.frame.height
          };

          if (
            rootController.nativeObject.childViewControllers[child].view.yoga
              .isEnabled
          ) {
            rootController.nativeObject.childViewControllers[
              child
            ].view.yoga.applyLayoutPreservingOrigin(true);
          }
        }
      };
      // currentChild = controller;
    } else {
      Application.setRootController(rootController);
    }
  }
  
  /**
   * Only use if rootpage is Page instancea
   *
   * @protected
   * @param {Page} fromPage
   * @param {Page} toPage
   * @param {number} [duration=0] duration
   * @param {number} [options=0] options
   */
  showWithTransition(fromPage, toPage, duration = 0, options = 0) {
    throw new Error("onNavigatorChange method must be overridden");
  }
  
  /**
   * Template method sets specified controller as root controller
   * @param {BottomTabBarController|Page|NavigationController} controller
   */
  setRootController(controller) {
    this._rootController = controller;
  }
  
  /**
   * NavigationController child page is changed handler
   * Only use if rootpage is NavigationController.
   * Must be Implemented
   * 
   * @param {function(e:NavigationControllerTransformEvent)} fn
   */
  onNavigationControllerTransition(fn) {
    throw new Error("onNavigatorChange method must be overridden");
  }

  /**
   * Set TabBarItems to BottomTabBarController
   * 
   * @param {Array<TabBarItem>} items
   */
  setTabBarItems(items) {
    this._rootController.tabBar.items = items;
  }
  
  /**
   * Set NavigationController selected index
   * 
   * @param {nummer} index
   */
  setSelectedIndex(index) {
    this._rootController.selectedIndex = index;
    // this._rootController.hasOwnProperty('selectedIndex') ? (this._rootController.selectedIndex = index) : (this.setIndex(index));
  }
  
  /**
   * Set NavigationController child controllers.
   * Must be implemented.
   * 
   * @params {Array<NavigationController>} children
   */
  addChildViewControllers(children) {
    throw new Error("addChildViewControllers method must be overridden");
  }

  /**
   * Remove child from root page
   * Must be implemented.
   * 
   * @param {Page} page
   */
  removeChild(page) {
    throw new Error("removeChild must be overridden");
  }
  
  /**
   * Add child from root page
   * Must be implemented.
   * 
   * @param {Page} page
   */
  addChild(page) {
    throw new Error("addChild must be overridden");
  }
  
  /**
   * Push child from root NavigationController.
   * Must be implemented.
   * 
   * @param {Page} page
   * @param {boolean} [animated=true] animmated
   */
  pushChild(page, animated = true) {
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
   * Displays specified page
   * Only use if root conttroller is a Page instance
   *
   * @param {Page} page
   */
  show(page){
    throw new Error("popChild must be overridden");
  }
}

module.exports = Renderer;
