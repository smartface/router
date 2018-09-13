class IOSRenderer extends Renderer {
  constructor() {
    const Page = require("sf-core/ui/page");
    this._rootPage = new Page({ orientation: Page.Orientation.AUTO });
    // get application native window
    var sfWindow = SF.requireClass("UIApplication").sharedApplication()
      .keyWindow;
    sfWindow.rootViewController = page.nativeObject;
    sfWindow.makeKeyAndVisible();

    this._currentPage = null;
  }

  show(page) {
    if (page === this._currentPage) return;

    this._currentPage &&
      this._currentPage.nativeObject.removeFromParentViewController();

    this._rootPage.nativeObject.addChildViewController(page.nativeObject);
    if (page.nativeObject.view) {
      this._rootPage.nativeObject.view.addSubview(viewController.view);
    }
    page.nativeObject.didMoveToParentViewController(
      this._rootPage.nativeObject
    );
    this._currentPage = page;
  }
}
