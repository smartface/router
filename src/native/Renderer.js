const Page = require("sf-core/ui/page");
const Application = require("sf-core/application");

var rootController = new Page({ orientation: Page.Orientation.AUTO })
Application.setRootController(rootController);
if(Device.deviceOS === 'iOS'){
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
}
var currentChild;

function addChildController(child){
  rootController.nativeObject.view.addSubview(child.nativeObject.view);
  child.nativeObject.didMoveToParentViewController(
    rootController.nativeObject
  );
}

function removeChildController(child){
  child.nativeObject.removeFromParentViewController();
  child.nativeObject.view.removeFromSuperview();
}

/**
 * Abstract Renderer
 * @abstract
 */
class Renderer {
  static setasRoot(controller){
    currentChild && removeChildController(currentChild);
    addChildController(controller);
    currentChild = controller;
  }
  
  constructor(Controller, params={}) {
    this._rootController = new Controller(params);
    Renderer.setasRoot(this._rootController);
    
    this.createNew = () => new Controller(params);
  }

  onNavigatorChange(fn) {
    throw new Error("onNavigatorChange method must be overridden");
  }

  addChildViewControllers(controllers) {
    throw new Error("addChildViewControllers method must be overridden");
  }

  show(page, animated = true) {
    Renderer.setasRoot(this._rootController);
  }
  
  activate(){
    Renderer.setasRoot(this._rootController);
  }

  removeChild(page) {
    throw new Error("removeChild method must be overridden");
  }

  addChild(page) {
    Renderer.setasRoot(this._rootController);
  }

  pushChild(page, animated = true) {
    Renderer.setasRoot(this._rootController);
  }
  
  clear(){
    this._rootController = this.createNew();
    Renderer.setasRoot(this._rootController);
  }

  popChild(page, animated = true) {
    Renderer.setasRoot(this._rootController);
  }
}

module.exports = Renderer;
