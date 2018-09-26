const Page = require("sf-core/ui/page");
const Application = require("sf-core/application");

// var currentChild;

// function addChildController(child){
//   if(Device.deviceOS === 'iOS'){
//     rootController.nativeObject.view.addSubview(child.nativeObject.view);
//     child.nativeObject.didMoveToParentViewController(
//       rootController.nativeObject
//     );
//   }
// }

// function removeChildController(child){
//   if(Device.deviceOS === 'iOS'){
//     child.nativeObject.removeFromParentViewController();
//     child.nativeObject.view.removeFromSuperview();
//   }
// }

/**
 * Abstract Renderer
 * @abstract
 */
class Renderer {
  static setasRoot(rootController){
    // alert("controller"+ rootController.constructor.name);
      // currentChild && removeChildController(currentChild);
      // addChildController(controller);
    if(Device.deviceOS === 'iOS'){
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
          
          if (rootController.nativeObject.childViewControllers[child].view.yoga.isEnabled) {
            rootController.nativeObject.childViewControllers[child].view.yoga.applyLayoutPreservingOrigin(true);
          }
        }
      };
      // currentChild = controller;
    } else {
      Application.setRootController(rootController);
    }
  }
  
  constructor() {
  }
  
  setRootController(controller){
    this._rootController = controller;
  }

  onNavigatorChange(fn) {
    throw new Error("onNavigatorChange method must be overridden");
  }
  
  setTabBarItems(items){
    this._rootController.tabBar.items = items;
  }
  
  setSelectedIndex(index){
    this._rootController.selectedIndex = index;
    // this._rootController.hasOwnProperty('selectedIndex') ? (this._rootController.selectedIndex = index) : (this.setIndex(index));
  }
  
  setChildControllers(children){
    this._rootController.childControllers = children;
  }

  addChildViewControllers(controllers) {
    throw new Error("addChildViewControllers method must be overridden");
  }

  show(page, animated = true) {
    // Renderer.setasRoot(page);
  }
  
  removeChild(page) {
    throw new Error("removeChild method must be overridden");
  }

  addChild(page) {
  }

  pushChild(page, animated = true) {
  }
  
  popChild(animated = true) {
  }
}

module.exports = Renderer;
