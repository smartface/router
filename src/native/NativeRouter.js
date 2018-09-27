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
    isRoot = false
  }) {
    return new NativeRouter({
      path,
      build,
      routes,
      exact,
      to,
      isRoot,
      renderer: createRenderer()
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
    this._renderer.setRootController(
      new Page({ orientation: Page.Orientation.AUTO })
    );
    if (isRoot) {
      const Renderer = require("./Renderer");
      Renderer.setasRoot(this._renderer._rootController);
    }
  }

  addChildRouter(router) {
    this._renderer.show(router._renderer._rootController);
  }

  onRouteExit(action) {
    // if (action === "POP") this._renderer.clear();
  }

  onRouteMatch(route, match, state, action) {
    const view = super.onRouteMatch(route, match, state);

    if (!view) return false;

    try {
      view && this._renderer.show(view);
    } catch (e) {
      console.log(e.message + "" + e.stack);
    }

    return true;
  }
}

module.exports = NativeRouter;
