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
    renderer = null,
    to = null,
    isRoot = false
  }) {
    return new NativeStackRouter({
      path,
      build,
      routes,
      exact,
      to,
      isRoot,
      renderer: createRenderer(NavigationController)
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
    renderer = null,
    to = null,
    isRoot = false
  }) {
    super({ path, build, routes, exact, to, isRoot });
    this._renderer = renderer;
    this.addNavigatorChangeListener();
    // this._renderer._rootPage.childControllers = this._routes.map((route) => route.build());
  }

  addNavigatorChangeListener() {
    this._unlistener = this._renderer.onNavigatorChange(action => {
      if (action === 2) {
        this.silencePop();
      }
    });
  }

  dispose() {
    super.dispose();
    this._unlistener();
  }

  /**
   * History change event handler
   * @protected
   */
  onRouteMatch(route, match, state, action) {
    const view = super.onRouteMatch(route, match, state);

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

  onRouteExit(action) {
    if (action === "POP") this._renderer.clear();
  }
}

module.exports = NativeStackRouter;
