"use strict";

const NativeRouterBase = require("./NativeRouterBase");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

/**
 * It creates root {@link Page} and adds and removes child pages.
 *
 * @class
 */
class NativeRouter extends NativeRouterBase {
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
   * @param {{renderer: Renderer, path: string, build: function|null, routes: Array, exact: boolean, isRoot: boolean }} param0
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
    if (isRoot) {
      this._renderer.setRootController(
        new Page({ orientation: Page.Orientation.AUTO })
      );
      const Renderer = require("./Renderer");
      Renderer.setasRoot(this._renderer._rootController);
    }
  }

  /**
   *
   * @param {*} router
   */
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
