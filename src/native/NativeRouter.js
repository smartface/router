const Pages = require("sf-core/ui/pages");
const Invocation = require("sf-core/util/iOS/invocation.js");
const Dialog = require("sf-core/ui/dialog");
const Router = require("../router/Router");
const Route = require("../router/Route");

class NativeRouter extends Router {
  constructor(renderer) {
    /** {Router} */
    this._router = new Router();
    this.renderer = renderer;
  }

  render(matches) {
    const view = super.render(matches);

    this.renderer.show(page);
  }
}

module.exports = NativeRouter;
