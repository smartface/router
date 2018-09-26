const Renderer = require("./Renderer");
const Application = require("sf-core/application");

/**
 * Renderer for Android
 * It encapsulates all logic to display pages on Android
 */
class AndroidRenderer extends Renderer {
  /**
   * @constructor
   * @param {Page|NavigationController} root
   */
  constructor() {
    super();
  }

  /**
   * Only use if rootpage is NavigationController
   * @param {Array.<object>} controllers
   */
  addChildViewControllers(controllers) {
    this._rootController.childControllers = controllers;
  }

  /**
   * Pushes a new page to rootpage which is instance of NavigationController
   * Only use if rootpage is NavigationController
   * @param {Array.<object>} controllers
   */
  pushChild(page, animated = true) {
    this._rootController.push &&
      this._rootController.push({ controller: page, animated: animated });
  }

  /**
   * NavigationController child page is changed handler
   * Only use if rootpage is NavigationController
   *
   * @param {function} fn
   */
  onNavigatorChange(fn) {
    if (this._rootController.onTransition) {
      this._rootController.onTransition = fn;
      return () => (this._rootController.onTransition = () => null);
    }

    return () => null;
  }

  /**
   * Only use if rootpage is NavigationController
   *
   * @param {boolean} [=true] animated
   */
  popChild(animated = true) {
    this._rootController.pop &&
      this._rootController.pop({ animated: animated });
  }

  /**
   *
   * Only use if rootpage is Page
   * @param {NavigationController} controller
   */
  show(page) {
    Application.setRootController(page);
  }
}

module.exports = AndroidRenderer;
