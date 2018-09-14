const Renderer = require("./Renderer");
const Page = require("sf-core/ui/page");

class IOSRenderer extends Renderer {
  constructor() {
    super();
    this._rootPage = new Page({ orientation: Page.Orientation.AUTO });
    // get application native window
    var sfWindow = SF.requireClass("UIApplication").sharedApplication()
      .keyWindow;
    sfWindow.rootViewController = this._rootPage.nativeObject;
    const Dialog = require("sf-core/ui/dialog");
    for (var i in sfWindow.subviews) {
      if (sfWindow.subviews[i] && sfWindow.subviews[i].tag == Dialog.iOS.ID) {
        sfWindow.subviews[i].removeFromSuperview();
      }
    }
    sfWindow.makeKeyAndVisible();
  }

  show(page) {
    if(!(page instanceof Page)){
      throw new TypeError("View must be instance of sf-core/ui/page ");
    }
    
    this._currentPage &&
      this._currentPage.nativeObject.removeFromParentViewController();

    this._rootPage.nativeObject.addChildViewController(page.nativeObject);
    if (page.nativeObject.view) {
      this._rootPage.nativeObject.view.addSubview(page.nativeObject.view);
    }
    page.nativeObject.didMoveToParentViewController(
      this._rootPage.nativeObject
    );
    this._currentPage = page;
  }
  
  remmove(){
    
  }
}

module.exports = IOSRenderer;
