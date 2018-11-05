"use strict";

const Router = require("../router/Router");

/**
 * Native router base
 * @class
 */
class NativeRouterBase extends Router {
  setHeaderbarProps(props) {
    this._renderer._rootController &&
      this._renderer._rootController.headerBar &&
      (this._renderer._rootController.headerBar = props);
  }
}

module.exports = NativeRouterBase;
