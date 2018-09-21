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
    to = null
  }) {
    return new NativeStackRouter({
      path,
      build,
      routes,
      exact,
      to,
      renderer: createRenderer(new NavigationController())
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
    to = null
  }) {
    super({ path, build, routes, exact, to });
    this._renderer = renderer;
    // this._renderer._rootPage.childControllers = this._routes.map((route) => route.build());
  }
  
  addNavigatorChangeListener(){
    this._unlistener = this._renderer.onNavigatorChange((action) => {
      if(action === 2){
        this._skipRender = true;
        this.goBack();
        this._skipRender = false;
      }
    });
  }
  
  dispose(){
    super.dispose();
    this._unlistener();
  }

  /**
   * History change event handler
   * @protected
   */
  onHistoryChange(location, action) {
    if (location.state === null || this._skipRender) {
      return;
    }
    
    if(action === "POP"){
      this._unlistener();
    }
    
    const view = this.renderLocation(location);

    if (!view) return;
    
    switch (action) {
      case "PUSH":
        this._renderer.pushChild(view);
        break;
      case "POP":
        this._renderer.popChild();
        break;
    }
    
    this.addNavigatorChangeListener();
  }
}

module.exports = NativeStackRouter;
