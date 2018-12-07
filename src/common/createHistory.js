"use strict";
const createMemoryHistory = require("./history");
const { matchUrl } = require("./matchPath");
let rootHistory;

/**
 * Creates a new HistoryController instance
 *
 * @param {{?initialEntries: Array, ?initialIndex: number, ?keyLength: number, ?getUserConfirmation: function, sensitive: boolean, strict: boolean}} param0
 * @return {HistoryController}
 */
function createHistory({
  initialEntries = null,
  initialIndex = null,
  keyLength = null,
  getUserConfirmation = null,
  exact = false,
  sensitive = true,
  strict = false,
  path
} = {}) {
  let routeBlocker = (blockerFn, callback) => {
    // console.log(`--- routeBlocker ${blockerFn} ${_preventDefault}`);
    _preventDefault === false && getUserConfirmation
      ? getUserConfirmation(blockerFn, callback)
      : callback(true);
  };

  let _preventDefault;
  const _options = {
    exact,
    sensitive,
    strict,
    path
  };
  /**
   * @type {History}
   */
  let _history = createMemoryHistory({
    initialEntries: initialEntries || [], // The initial URLs in the history stack
    initialIndex: initialIndex || 0, // The starting index in the history stack
    keyLength: keyLength || 20, // The length of location.key
    // A function to use to confirm navigation with the user. Required
    // if you return string prompts from transition hooks (see below)
    getUserConfirmation: routeBlocker
  });

  const _listeners = new Set();
  const _unlistenAll = new Set();
  const _nodes = new Set();
  let _prompt = null;
  let _unblock;

  function listener(location, action) {
    _preventDefault === false &&
      _listeners.forEach(handler => handler(location, action));
    _preventDefault = false;
  }

  /**
   * History wrapper
   * @access package
   * @class HistoryController
   */
  class HistoryController {
    constructor() {}

    clearBlocker() {
      _unblock && _unblock();
    }

    /**
     * Prevent history change event
     */
    preventDefault() {
      _preventDefault = true;
    }

    clearPreventDefault() {
      _preventDefault = false;
    }

    block(prompt) {
      _prompt = prompt;
      this.clearBlocker();
      _unblock = _history.block(_prompt);

      return () => {
        _prompt = null;
        _unblock();
      };
    }

    clear() {
      _history.clear();
    }

    getHistoryasArray() {
      return _history.entries.map(item => item.url);
    }

    /**
     * @param {object} [={}] props Node properties
     * @return {HistoryController}
     */
    createNode(props = {}) {
      const node = createHistory(props, this);
      _nodes.add(node);
      // bubbles history goback to root if go back could be possible.
      node.onGoBack = () => {
        // console.log(`on go back ${JSON.stringify(this.getHistoryasArray())} ${_history.index}`);
        if (_history.canGo(-1)) {
          // _listeners.forEach(listener => listener(_history.location, 'POP'))
          _history.go(-1);
        } else {
          this.onGoBack && this.onGoBack();
        }
      };
      // bubbles history push to root if push could be possible.
      node.onPush = (path, data) => {
        if (this.canPush(path)) {
          this.push(path, data);
        } else {
          this.onPush && this.onPush(path, data);
        }
      };

      return node;
    }

    get lastLocation() {
      return _history.location;
    }

    /**
     * Return all nodes
     * @return {Set<HistoryController>}
     */
    get nodes() {
      return new Set(_nodes);
    }

    /**
     * @return {History}
     */
    get history() {
      return _history;
    }

    pushLocation(location) {
      _history.push(location);
    }

    /**
     * Removes last history entry
     *
     * @todo notify all listeners as action is rollback
     */
    rollback() {
      _preventDefault = true;
      _history.rollback();
      _preventDefault = false;
    }

    /**
     * Disposes history
     */
    dispose() {
      _history = null;
    }

    /**
     * If the url is available to push or not.
     *
     * @param {string} url - Url will be pushed.
     */
    canPush(url) {
      const res = matchUrl(url, _options);
      return res !== null;
    }

    /**
     * Pushes a new url to history
     *
     * @param {string} url - Url will be pushed.
     * @param {object} routeData - Requested route data
     */
    push(url, routeData = {}) {
      this.canPush(url)
        ? _history.push(url, routeData)
        : !_preventDefault &&
          this.onPush &&
          this.onPush(url, routeData, _prompt);
      _preventDefault && this.clearPreventDefault();
    }

    /**
     * If history can be gone back or not
     *
     * @return boolean
     */
    canGoBack() {
      return _history.canGo(-1);
    }

    /**
     * Calls History.goBack
     */
    goBack() {
      _history.canGo(-1)
        ? _history.goBack()
        : !_preventDefault && this.onGoBack && this.onGoBack();
      _preventDefault && this.clearPreventDefault();
    }

    /**
     * Adds history change handler and returns unlisten function
     *
     * @param {HistoryListener} fn Event handler callback
     * @return {function} unlisten function
     */
    listen(fn) {
      const unlisten = new Set();

      _listeners.add(fn);
      const wrapper = (location, action) => {
        !_preventDefault &&
          fn(location, action, _history.entries[_history.index]);
      };
      unlisten.add(_history.listen(wrapper));
      unlisten.forEach(item => _unlistenAll.add(item));
      return () => {
        unlisten.forEach(item => {
          item();
          _unlistenAll.delete(item);
        });
        _listeners.delete(fn);
      };
    }

    /**
     * Returns string representation of an instance
     *
     * @return {string}
     */
    toString() {
      return `[Object HistoryController, stack: ${JSON.stringify(
        this.getHistoryasArray()
      )},
        length ${_history.length}, 
        index : ${_history.index}]`;
    }

    /**
     * Disposes a instance
     */
    dispose() {
      _nodes.forEach(node => node.dispose());
      _unlistenAll.forEach(item => item());
      _unlistenAll.clear();
      _listeners.clear();
      _history = null;
      this.onGoBack = null;
    }
  }

  return new HistoryController();
}

module.exports = createHistory;
