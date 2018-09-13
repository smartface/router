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
    sfWindow.makeKeyAndVisible();
  }

  show(page) {
    this._currentPage &&
      this._currentPage.nativeObject.removeFromParentViewController();

    this._rootPage.nativeObject.addChildViewController(page.nativeObject);
    if (page.nativeObject.view) {
      this._rootPage.nativeObject.view.addSubview(page.nativeObject.viewController.view);
    }
    page.nativeObject.didMoveToParentViewController(
      this._rootPage.nativeObject
    );
    this._currentPage = page;
  }
}

module.exports = IOSRenderer;
