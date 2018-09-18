const Router = require("../router/Router");
const NavigationController = require("sf-core/ui/navigationcontroller");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

class NativeStackRouter extends Router {
  /**
   * Builds OS specific NaitveRouter
   * @static
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  static of({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null
  }) {
    return new NativeStackRouter({
      path,
      build,
      routes,
      exact,
      renderer: createRenderer((build && build()) || new NavigationController())
    });
  }

  /**
   * @constructor
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null
  }) {
    super({ path, build, routes, exact });
    this._renderer = renderer;
    // this._renderer._rootPage.childControllers = this._routes.map((route) => route.build());
  }

  /**
   * History change event handler
   * @protected
   */
  onHistoryChange(location, action) {
    if (location.state === null) {
      return;
    }
    const view = this.render(location);
    console.log("stack view : " + view + " : " + action);
    if (!view) return;

    switch (action) {
      case "PUSH":
        this._renderer.pushChild(view);
        break;
      case "POP":
        this._renderer.popChild();
        break;
    }
  }
}

module.exports = NativeStackRouter;
