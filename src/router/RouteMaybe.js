const Route = require("Route");
const 
/**
 * If route is failed and then it runs other route
 */
class RouteMaybe extends Route {
  constructor(route, notRoute) {
    this._route = route;
    this._notRoute = notRoute;
    this.__route = route;
  }

  isAccessable(path) {
    !this._route.isAccessable(path) || (!this._notRoute.isAccessable(path)(this.__route = this._notRoute));

    return true;
  }

  

  getRouteData() {
    return parsePath();
  }
}
