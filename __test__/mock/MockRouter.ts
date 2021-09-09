import Router from "../../src/router/Router";
import Route from "../../src/router/Route";
import NativeRouter from '../../src/native/NativeRouter';

class MockRouter extends Router {
  private _renderer: any;
  private _currentPage: any; //Should be page
  /**
   * @static
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean, isRoot: boolean }} param0
   */
  static of({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    isRoot = false
  }) {
    return new NativeRouter({
      path,
      build,
      routes,
      exact,
      renderer: {},
      isRoot: false
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
    isRoot = false
  }) {
    super({ path, build, routes, exact, isRoot });
    this._renderer = renderer;
    this._currentPage;
  }

  render(location) {
    const view = super.render(location);

    if (view === this._currentPage) {
      return;
    }

    try {
      view && (this._renderer = view);
    } catch (e) {
      console.log(e.message + "" + e.stack);
    }
  }
}

module.exports = MockRouter;
