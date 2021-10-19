/**
 * Route's path ValueObject
 * For internal use
 * @access private
 * @class
 * @since 1.0.0
 */
export class RoutePath {
  /**
   * Factory method to create a new instance
   *
   * @param {string} path
   * @since 1.0.0
   */
  static of(path: string) {
    return new RoutePath(path);
  }

  /**
   * @constructor
   * @param {string} path
   * @since 1.0.0
   */
  constructor(private _path: string) { }

  /**
   * Returns route path
   * @return {string}
   * @since 1.0.0
   */
  getPath() {
    return this._path;
  }

  /**
   * Returns route is root or not.
   *
   * @returns {boolean}
   * @since 1.0.0
   */
  isRoot() {
    return this._path === "/";
  }

  /**
   * Return quick representaion of the route-path
   *
   * @since 1.0.0
   * @returns {{path: string, isRoot: boolean}}
   */
  toObject() {
    return {
      path: this._path,
      isRoot: this.isRoot,
    };
  }

  /**
   * @since 1.0.0
   * @returns {RoutePath}
   */
  clone() {
    return new RoutePath(this._path);
  }

  /**
   * Return path is empty or not
   *
   * @since 1.0.0
   * @return {boolean}
   */
  hasPath() {
    return this._path !== null || this._path !== undefined || this._path !== "";
  }
}
