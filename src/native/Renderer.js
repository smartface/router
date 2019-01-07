"use strict";

const Page = require("sf-core/ui/page");
const Application = require("sf-core/application");

/**
 * Abstract Renderer Strategy
 * It encapsulates displaying strategies for child views.
 *
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
    Application.setRootController({
      controller: rootController,
      animated: true
    });
  }

  makeRootVisible() {
    var sfWindow = SF.requireClass("UIApplication").sharedApplication()
      .keyWindow;
    sfWindow.makeKeyAndVisible();
  }
  
  showTab(){
    this._rootController.show();
  }

  present(controller, animated, onComplete) {
    console.log("call present");
    this._rootController.present({
      controller,
      animated,
      onComplete
    });
  }

  dismiss(onComplete, animated) {
    this._rootController.dismiss({ onComplete, animated });
  }
  
  replaceChild(view, index=null){
    if(!this._rootController.childControllers || !this._rootController.childControllers.length)
      return;
    
    index = index || this._rootController.childControllers.length - 1;
    const controllers = this._rootController.childControllers;
    controllers[index] = view;
    this._rootController.childControllers = controllers;
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
    if(this._rootController.selectedIndex != index)
      this._rootController.selectedIndex = index;
  }

  /**
   * Set NavigationController child controllers.
   * Must be implemented.
   *
   * @params {Array<NavigationController>} children
   */
  setChildControllers(children) {
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
   */
  popTo(n) {
    this._rootController.popTo({ controller: this._rootController.childControllers[n], animated: true });
  }

  /**
   * Displays specified page
   * Only use if root conttroller is a Page instance
   *
   * @param {Page} page
   */
  show(page) {
    throw new Error("popChild must be overridden");
  }
}

module.exports = Renderer;
