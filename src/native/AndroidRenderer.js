const Renderer = require("./Renderer");
const Application = require("sf-core/application");

/**
 * Renderer for Android
 * It encapsulates all logic to display pages on Android
 */
class AndroidRenderer extends Renderer {
  /**
   * @constructor
   * @params {Page|NavigationController} root
   */
  constructor(rootController) {
    super(root);
    Renderer.setasRoot(root);
  }

  /**
   * Only use if rootpage is NavigationController
   * @params {Array.<object>} controllers
   */
  addChildViewControllers(controllers) {
    this._rootPage.childControllers = controllers;
  }

  /**
   * Pushes a new page to rootpage which is instance of NavigationController
   * Only use if rootpage is NavigationController
   * @params {Array.<object>} controllers
   */
  push(page, animated = true) {
    this._rootPage.push && this._rootPage.push({controller: page, animated: animated});
  }

  /**
   * NavigationController child page is changed handler
   * Only use if rootpage is NavigationController
   *
   * @params {function} fn
   */
  onNavigatorChange(fn) {
    if (this._rootPage.onTransition) {
      this._rootPage.onTransition = fn;
      return () => (this._rootPage.onTransition = () => null);
    }

    return () => null;
  }

  /**
   * Only use if rootpage is NavigationController
   *
   * @params {boolean} [=true] animated
   */
  pop(animated = true) {
    this._rootPage.pop && this._rootPage.pop({ animated: animated });
  }

  /**
   *
   * Only use if rootpage is Page
   * @params {NavigationController} controller
   */
  show(page) {
    Application.setRootController(page);
  }
}

module.exports = AndroidRenderer;
