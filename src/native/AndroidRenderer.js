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
    // To avoid Android error
    if (this._rootController.childControllers.length !== 0 && this._rootController.childControllers.some(p => p === page)) {
      return;
    }
    animated = this._rootController.childControllers.length === 0 ? false : animated;
    this._rootController.push &&
      this._rootController.push({ controller: page, animated: animated });
    this._activePage = page;
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
    if(this._activePage == page)
      return;
    Application.setRootController(page);
    this._activePage = page;
  }
}

module.exports = AndroidRenderer;
