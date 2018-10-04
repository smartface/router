"use strict";

const Router = require("../router/Router");
const NavigationController = require("sf-core/ui/navigationcontroller");
const createRenderer = require("./createRenderer");
const Page = require("sf-core/ui/page");

/**
 * @class
 * @extends {Router}
 */
class NativeStackRouter extends Router {
  /**
   * Builds OS specific NaitveRouter
   * 
   * @static
   * @param {RouterParams} param
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
      renderer: createRenderer()
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
    this._renderer.setRootController(new NavigationController());
    this.addNavigatorChangeListener();
    this.build = () => this._renderer._rootController;
  }

  /**
   * Add new listener to listen NavigationController transitions.
   */
  addNavigatorChangeListener() {
    this._unlistener = this._renderer.onNavigatorChange(action => {
      // if user presses backbutton or uses gesture to back
      if (action.operation === NavigationController.OperationType.POP) {
        // set Router to skip next history change
        Router.skipRender();
        // and history goes back.
        this.goBack();
      }
    });
  }

  /**
   * @override
   *
   */
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

    if (!view) return false;

    switch (action) {
      case "REPLACE":
      case "PUSH":
        this._renderer.pushChild(view);
        break;
      case "POP":
        if (Router.currentRouter === this) this._renderer.popChild();
        break;
    }

    return true;
  }

  /**
   * Current router is changed
   * @event
   * @param {string} action
   */
  onRouterExit(action) {
    if (action === "POP")
      this._renderer.setRootController(new NavigationController());
    console.log(`onRouterExit ${this}`);
  }
}

module.exports = NativeStackRouter;
