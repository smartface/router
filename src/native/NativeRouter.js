const {Router} = require("../router/Router");
const Route = require("../router/Route");
const IOSRenderer = require("./IOSRenderer");

class NativeRouter extends Router {
  constructor({ path = "", build = null, routes = [], exact = false, renderer= null }) {
    super({path, build, routes, exact});
    this.renderer = new IOSRenderer();
    this._currentPage;
  }

  render(matches) {
    
    const view = super.render(matches);
    if (view === this._currentPage) return;
    
    try{
      this.renderer.show(view);
    } catch(e){
      console.log(e.message+ "" + e.stack);
    }
  }
}

module.exports = NativeRouter;
