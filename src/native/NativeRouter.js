const Router = require("../router/Router");
const Route = require("../router/Route");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

class NativeRouter extends Router {
  /**
   * Create OS specific NativeRouter instance
   * @static
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  static of({ path = "", build = null, routes = [], exact = false, renderer= null }){
    return new NativeRouter({path, build, routes, exact, renderer: createRenderer(new Page({ orientation: Page.Orientation.AUTO }))});
  }
  
  /**
   * @constructor
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  constructor({ path = "", build = null, routes = [], exact = false, renderer= null }) {
    super({path, build, routes, exact});
    this._renderer = renderer;
    this._currentPage;
  }

  render(matches) {
    const view = super.render(matches);
    console.log("view : "+view)
    if (view === this._currentPage) return;
    
    try{
      view && this._renderer.show(view);
    } catch(e){
      console.log(e.message+ "" + e.stack);
    }
  }
}

module.exports = NativeRouter;
