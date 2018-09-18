const Renderer = require("./Renderer");

class AndroidRenderer extends Renderer {
  constructor() {
    const Page = require("sf-core/ui/page");
    this._rootPage = new Page({ orientation: Page.Orientation.AUTO });

    this._currentPage = null;
  }

  show(page) {
    if (page === this._currentPage) return;
  }
}

module.exports = AndroidRenderer;
