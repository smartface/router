/**
 * Abstract Renderer
 * @abstract
 */
class Renderer {
  constructor(root) {
    this._rootPage = root;
  }

  onNavigatorChange(fn) {
    throw new Error("onNavigatorChange method must be overridden");
  }

  addChildViewControllers(controllers) {
    throw new Error("addChildViewControllers method must be overridden");
  }

  show(page, animated = true) {
    throw new Error("show method must be overridden");
  }

  removeChild(page) {
    throw new Error("removeChild method must be overridden");
  }

  addChild(page) {
    throw new Error("addChild method must be overridden");
  }

  push(page, animated = true) {
    throw new Error("Push method must be overridden");
  }

  pop(page, animated = true) {
    throw new Error("Pop method must be overridden");
  }
}

module.exports = Renderer;
