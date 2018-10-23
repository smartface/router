"use strict";

const NativeRouterBase = require("./NativeRouterBase");
const Router = require("../router/Router");
const NavigationController = require("sf-core/ui/navigationcontroller");
const createRenderer = require("./createRenderer");

/**
 * @class
 * @extends {Router}
 */
class NativeStackRouter extends NativeRouterBase {
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
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean, headerBarParams: function }} param0
   */
  constructor({
    path = "",
    build = null,
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    isRoot = false,
    headerBarParams=() => {}
  }) {
    super({ path, build, routes, exact, to, isRoot });
    console.log('new StackRouter created');
    this._renderer = renderer;
    this._renderer.setRootController(new NavigationController());
    this.addNavigatorChangeListener();
    this.build = () => this._renderer._rootController;
    this._renderer._rootController.onLoad = () => {
      this._renderer._rootController.headerBar = headerBarParams();
    };
  }

  /**
   * Add new listener to listen NavigationController transitions.
   */
  addNavigatorChangeListener() {
    this._unlistener = this._renderer.onNavigationControllerTransition(action => {
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
    console.log(`onRouteMatch ${typeof view} ${action}`);
    if (!view) return false;
    
    switch (action) {
      case "REPLACE":
      case "PUSH":
        console.log(`PUSH ${typeof view} ${action} name : ${this._renderer.name}`);
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
