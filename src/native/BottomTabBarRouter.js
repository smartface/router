'use strict';

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
      this._currentIndex = index;
      return true;
    };
    
    this._renderer._rootController.didSelectByIndex = ({ index }) => { // TabbarItem should be changed
      console.log("didSelectByIndex  : "+index+" : "+this+" : "+this.isVisited(index));
      if(this._fromRouter != true){
        const route = this.resolveRoute(index);
        if(route instanceof Router){
          route.onRouteEnter();
        }
      } else {
        !this.isVisited(index) && this.routetoIndex(index);
      }
    };
    
    // Assigns BottomTabBar props
    Object.assign(this._renderer._rootController, tabbarParams);
    //Clears child routers onRouteExit because of NatveStackRouter creates new NavigationController to clear all children.
    this._routes.map(route => {
      route.onRouterExit && (route.onRouteExit = () => null);
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
  
  setCurrentUrl(url){
    this._visitedIndexes[this._currentIndex] = {
      url
    };
  }

  /**
   * @override
   */
  renderMatches(matches, state, action) {
    this._fromRouter = true;
    // alert(JSON.stringify(matches.map(({match}) => match)));

    if(matches.length > 1){
      const {match: next} = matches[matches.length - 1];
      const index = this.resolveIndex(next.path);
      // if(index != this._currentIndex && action === 'POP'){
      //   return;
      // }
      // sets taraet as visited.
      this.setVisited(index);
      // selects target tabbaritem by index
      this._renderer.setSelectedIndex(index);
      this._renderer._rootController.show();
      this._currentPath = next.path;
      console.log(`renderMatches ${next.path}`);
      // if(this.isInitialPath(next.path))
      //   return;
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
  onRouteMatch(route, match, state, action) {
    // if(!match.isExact){
    //   //TODO: make more performance
    //   // const index = this.resolveIndex(match.path);
    //   // console.log("onRouteMatch "+match.path+" : "+match.url+" : "+index);
    //   // this.setVisited(index);
      
    //   return false;
    // }
    
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
    console.log(`isInitialPath : ${path} : redirection : ${this.getRedirectto()} : url : ${this.getUrlPath()}`);
    return (path === this.getRedirectto() || path === this.getUrlPath());
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
    (route instanceof Router) && this.pushRoute(route)
  }
}

module.exports = BottomTabBarRouter;
