/**
 * Abstract Renderer
 * @abstract
 */
class Renderer {
  constructor(root) {
    this._rootPage = root;
  }

  addChildViewControllers(controllers) {
    throw new Error("addChildViewControllers method must be overridden");
  }

  show(page) {
    throw new Error("show method must be overridden");
  }
  
  removeChild(page) {
    throw new Error("removeChild method must be overridden");
  }
  
  addChild(page) {
    throw new Error("addChild method must be overridden");
  }
  
  push(page) {
    throw new Error("Push method must be overridden");
  }
  
  pop(page) {
    throw new Error("Pop method must be overridden");
  }
}

module.exports = Renderer;
