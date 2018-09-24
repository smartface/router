const Router = require("../router/Router");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

class NativeRouter extends Router {
  /**
   * Create OS specific NativeRouter instance
   * @static
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean, isRoot: boolean }} param0
   */
  static of({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    isRoot= false
  }) {
    return new NativeRouter({
      path,
      build,
      routes,
      exact,
      to,
      isRoot,
      renderer: createRenderer(
        Page, { orientation: Page.Orientation.AUTO }
      )
    });
  }

  /**
   * @constructor
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean, isRoot: boolean }} param0
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    isRoot = false,
    to = null
  }) {
    super({ path, build, routes, exact, isRoot, to });
    
    this._renderer = renderer;
    this._currentPage;
  }
  
  onRouteExit(action){
    if(action === 'POP')
      this._renderer.clear();
  }
  
  onRouteMatch(route, match, state, action) {
    const view = this.renderRoute(route, match, state);

    if (view === this._currentPage) return;

    try {
      view && this._renderer.show(view);
    } catch (e) {
      console.log(e.message + "" + e.stack);
    }
  }
}

module.exports = NativeRouter;
