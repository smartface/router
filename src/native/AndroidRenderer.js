const Renderer = require("./Renderer");
const Application = require("sf-core/application");

/**
 * Rendering strategy for Android
 * It encapsulates all logic to display pages on Android
 *
 * @class
 * @access package
 * @extends {Renderer}
 */
class AndroidRenderer extends Renderer {
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
  pushChild(page, animated = true) {
    console.log("pageID : " + page.pageID);
    // To avoid Android error
    if (this._rootController.childControllers.some(p => p === page)) {
      return;
    }
    this._rootController.push &&
      this._rootController.push({ controller: page, animated: animated });
  }

  /**
   * @override
   */
  onNavigationControllerTransition(fn) {
    if (this._rootController.onTransition) {
      this._rootController.onTransition = fn;
      return () => (this._rootController.onTransition = () => null);
    }

    return () => null;
  }

  /**
   * @override
   */
  popChild(animated = true) {
    this._rootController.pop &&
      this._rootController.pop({ animated: animated });
  }

  /**
   * @override
   */
  show(page) {
    Application.setRootController(page);
  }
}

module.exports = AndroidRenderer;
