const matchPath = require("../commmon/matchPath").matchPath;
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
    props = {},
    build = null,
    exact = false,
    strict = false
  }) {
    return new Route({ path, routes, props, build, exact, strict });
  }

  constructor({
    path = null,
    routes = [],
    props = {},
    build = null,
    exact = false,
    strict = false
  }) {
    this._exact = exact;
    this._strict = strict;
    this._build = build;
    this._path = path instanceof RoutePath ? path : new RoutePath(path);
    this._routes = routes;
    this._props = props;
    this.map = mapComposer.call(this, this._routes);
  }

  toObject() {
    return {
      path: this._path.getPath(),
      routes: this._routes.map(route => route.toObject())
    };
  }

  build() {
    return (this._match && this._build(this._props, this.match)) || null;
  }

  onPrematch(match) {
    return true;
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
