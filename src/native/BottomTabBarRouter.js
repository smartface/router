"strict mode";

const Router = require("../router/Router");
const BottomTabBarController = require("sf-core/ui/bottomtabbarcontroller");
const createRenderer = require("./createRenderer");
const TabBarItem = require("sf-core/ui/tabbaritem");

function functionMaybe(val) {
  return typeof val === "function" ? val() : val;
}

function createTabBarItem(item) {
  return item instanceof TabBarItem ? item : new TabBarItem(item);
}

class BottomTabBarRouter extends Router {
  /**
   * Builds OS specific NaitveRouter
   * @static
   * @param {{ path: string, build: function|null, target:object|null, routes: Array, exact: boolean }} param0
   */
  static of({
    path = "",
    routes = [],
    exact = false,
    to = null,
    items = [],
    tabbarParams = {},
    isRoot = false
  }) {
    return new BottomTabBarRouter({
      path,
      routes,
      exact,
      to,
      items,
      tabbarParams,
      isRoot,
      renderer: createRenderer()
    });
  }

  /**
   * @constructor
   * @param {{ path: string, target:object|null, routes: Array, exact: boolean }} param0
   */
  constructor({
    path = "",
    routes = [],
    exact = false,
    renderer = null,
    to = null,
    tabbarParams = {},
    items = [],
    isRoot = false
  }) {
    super({
      path,
      routes,
      exact,
      to,
      isRoot
    });

    this._renderer = renderer;
    this._renderer.setRootController(new BottomTabBarController());
    this._visitedIndexes = {length: 0};
    this._fromRouter = false;
    
    this._renderer._rootController.shouldSelectByIndex = ({ index }) => { // TabbarItem should be changed
      console.log("shouldSelectByIndex  : "+index+" : "+this.resolveRoute(index).getUrlPath()+" : "+this.isVisited(index));
      
      //if specified index has already visited then skip routing
      !this.isVisited(index) && this.routetoIndex(index);
    
      this._skipRender = true;
      this.push(this.resolveRoute(index).getUrlPath());
      // alert(" last history: "+JSON.stringify(this.getHistoryasArray()));
      this._skipRender = false;
      // this._skipRender = true;
      // this.push();
      return this.isVisited(index);
    };
    
    this._renderer._rootController.didSelectByIndex = ({ index }) => { // TabbarItem should be changed
      console.log("didSelectByIndex  : "+index+" : "+this.resolveRoute(index).getUrlPath()+" : "+this.isVisited(index));
      
      //if specified index has already visited then skip routing
      // !this.isVisited(index) && this.routetoIndex(index);
      // 
      
      // alert(this._fromRouter);
        // alert("last history : "+this.resolveRoute(index).getUrlPath());
      // if(!this._fromRouter){
        
      // }
      this._fromRouter = false;
    };
    
    // Assigns BottomTabBar props
    Object.assign(this._renderer._rootController, tabbarParams);
    //Clears child routers onRouteExit because of NatveStackRouter creates new NavigationController to clear all children.
    this._routes.map(route => {
      route.onRouteExit && (route.onRouteExit = () => null);
    });
    // Initilaze BottomTabBarController's child controllers
    this._renderer.setChildControllers(
      this._routes.map(route => route.build(null, null, this))
    );
    // Initilaze BottomTabBarController's TabBarItems
    this._renderer.setTabBarItems(functionMaybe(items).map(createTabBarItem));
    this._renderer._rootController.show();
    // Overrides build method
    this.build = () => this._renderer._rootController;
  }
  
  /**
   * @override
   */
  renderMatches(matches, state, action) {
    console.log("renderMatches :");
    this._fromRouter = true;
    // alert(JSON.stringify(matches.map(({match}) => match)));

    if(matches.length > 1){
      const next = matches[1];
      // alert(JSON.stringify(next.match));
      //TODO: make more performance
      const index = this.resolveIndex(next.match.path);
      this.setVisited(index);

      this._renderer.setSelectedIndex(index);
      this._renderer._rootController.show();
    }
    
    // !this._isRendered && (this._isRendered = true);
    super.renderMatches(matches, state, action);
  }
  
  /**
   * Sets TabBarItems visited by TabBarItem index
   * 
   * @param {number} index
   */
  setVisited(index){
    if(index < 0 || this.isVisited(index))
      return;
    this._visitedIndexes[index] = true;
    this._visitedIndexes.length++; 
  }
  
  /**
   * CHecks if TabBarItem is visited before
   * @param {number} index
   * @returns {boolean}
   */
  isVisited(index){
    return !!this._visitedIndexes[index];
  }
  
  /**
   * @override
   */
  push(path, data){
    console.log("push : "+path);
    super.push(path, data);
  }

  /**
   * Finds child route's index by path
   * @param {string} path
   */
  resolveIndex(path) {
    return this._routes.findIndex(route => route.getUrlPath() === path);
  }

  /**
   * Finds child route by index
   * @param {number} index
   */
  resolveRoute(index) {
    return this._routes.find((route, ind) => ind === index);
  }
  
  /**
   * @override
   */
  dispose() {
    super.dispose();
    this._unlistener();
    this._renderer._rootController.didSelectByIndex = () => null;
  }

  /**
   * History change event handler
   * @protected
   */
  onRouteMatch(route, match, state, action, isExact) {
    console.log("onRouteMatch ");
    if(!match.isExact){
      //TODO: make more performance
      // const index = this.resolveIndex(match.path);
      // console.log("onRouteMatch "+match.path+" : "+match.url+" : "+index);
      // this.setVisited(index);
      
      return false;
    }
    console.log("exact onRouteMatch "+match.path+" : "+match.url+" : ");
    const view = super.onRouteMatch(route, match, state);
    
    if (!view) return false;
    
    //if the path has already opened then skip routing
    if(!this.isInitialPath(match.path)){
      this.routetoIndex(this.resolveIndex(match.path));
      return true;
    }
    return false;
  }
  
  /**
   * Checks specified path is currently opened path
   * @param {stirng} path - Route path
   * @returns {boolean}
   */
  isInitialPath(path){
    return (path === this.getRedirectto() || path === this.getUrlPath()) && !this.isVisited(0);
  }
  
  /**
   * Pushes a new route by index 
   * 
   * @param {number} index
   */
  routetoIndex(index){
    index = index < 0 ? 0 : index;
    console.log("routetoIndex : "+index);
    this.setVisited(index);
    this._renderer.setSelectedIndex(index);
    this._renderer._rootController.show();
    const route = this.resolveRoute(index);
    if(route instanceof Router){
      route.getRedirectto() 
        ? this.redirectRoute(route)
        : this.push(route.getUrlPath());
    }
  }
}

module.exports = BottomTabBarRouter;
