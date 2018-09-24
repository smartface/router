const matchPath = require("../common/matchPath").matchPath;
const mapComposer = require("../utils/map");

class RoutePath {
  static of(path) {
    return new RoutePath(path);
  }

  constructor(path) {
    this._path = path;
  }

  getPath() {
    return this._path;
  }

  isRoot() {
    return this._path === "/";
  }

  toObject() {
    return {
      path: this._path,
      isRoot: this.isRoot
    };
  }

  clone() {
    return new RoutePath(this._path);
  }

  hasPath() {
    return this._path !== null || this._path !== undefined || this._path !== "";
  }
}

class Route {
  static of({
    path = null,
    routes = [],
    build = null,
    exact = false,
    strict = false,
    onBeforeMatch = null,
    onBeforePush = null,
    to = null
  }) {
    return new Route({ path, routes, build, exact, strict, onBeforeMatch, onBeforePush, to });
  }

  constructor({
    path = null,
    to = null,
    routes = [],
    build = null,
    exact = false,
    strict = false,
    onBeforeMatch = null,
    onBeforePush = null
  }) {
    this._exact = exact;
    this._strict = strict;
    this._build = build;
    this._path = path instanceof RoutePath ? path : new RoutePath(path);
    this._routes = routes;
    this.map = mapComposer.call(this, this._routes);
    this._to = to;
    this._onBeforeMatch = onBeforeMatch;
    this._onBeforePush = onBeforePush;
  }

  toObject() {
    return {
      path: this._path.getPath(),
      routes: this._routes.map(route => route.toObject())
    };
  }
  
  getRedirectto(){
    return this._to;
  }

  build(params, state, router, view) {
    return (this._build && this._build(params, state, router, view)) || null;
  }

  onPrematch(match) {
    return (this._onBeforeMatch && this._onBeforeMatch(match)) || true;
  }

  hasPath() {
    return this._path.hasPath();
  }

  /**
   *
   * @param {string} url
   */
  matchPath(url) {
    this._match = matchPath(url, {
      path: this._path.getPath(),
      exact: this._exact,
      strict: this._strict
    });

    return this._match;
  }
  
  getUrlPath(){
    return this._path.getPath();
  }

  /**
   * @return {string}
   */
  getPath() {
    return this._path.clone();
  }

  clone() {
    return Route.of({
      path: this._path,
      routes: this._routes.slice(),
      props: Object.assign({}, this._props),
      build: this._build,
      exact: this._exact,
      strict: this._strict
    });
  }
}

module.exports = Route;
