"use strict";
const createMemoryHistory = require("./history");
const { matchUrl } = require("./matchPath");
const createTransitionMManager = require("./createTransitionManager");

/**
 * Creates a new HistoryController instance
 * @param {{?initialEntries: Array, ?initialIndex: number, ?keyLength: number, ?getUserConfirmation: function, sensitive: boolean, strict: boolean}} param0
 * @param {HistoryController} parent
 * @return {HistoryController}
 */
function createHistory(
  {
    initialEntries = null,
    initialIndex = null,
    keyLength = null,
    getUserConfirmation = null,
    exact = false,
    sensitive = true,
    strict = false,
    path
  } = {},
  parent = null
) {
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

    globalListener() {}

    clearBlocker() {
      _unblock && _unblock();
    }

    /**
     * Prevent history change event
     */
    preventDefault() {
      _preventDefault = true;
      // _nodes.forEach(node => node.preventDefault());
    }

    clearPreventDefault() {
      _preventDefault = false;
      // _nodes.forEach(node => node.clearPreventDefault());
    }

    block(prompt) {
      console.log("block : ");
      _prompt = prompt;
      this.clearBlocker();
      _unblock = _history.block(_prompt);

      return () => {
        _prompt = null;
        _unblock();
      };
    }

    /**
     * @param {object} props
     * @return {HistoryController}
     */
    createNode(props = {}) {
      const node = createHistory(props, this);
      // _listeners.forEach(listener => _unlistenAll.add(node.listen(listener)));
      // _unlistenAll.add(node.listen(listener));
      _nodes.add(node);
      // bubbles history goback to root if go back could be possible.
      node.onGoBack = block => {
        if (_history.length > 0) {
          if (block) {
            const unblock = this.block((location, action, okFn) => {
              block(location, action, v => {
                okFn(v);
                unblock();
              });
            });
          }
          _history.go(-1);
        } else this.onGoBack && this.onGoBack(block);
      };
      // bubbles history push to root if push could be possible.
      node.onPush = (path, data, block) => {
        if (this.canPush(path)) {
          if (block) {
            const unblock = _history.block((location, action, okFn) => {
              return block(location, action, v => {
                okFn(v);
                unblock();
              });
            });
          }
          this.push(path, data);
        } else {
          this.onPush && this.onPush(path, data, block);
        }
      };

      return node;
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

    /**
     * Calls history.goBack()
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
     *
     * @param {string} url
     * @param {{path: string, exact: string, }}} param1
     */
    canPush(url) {
      const res = matchUrl(url, _options);
      return res !== null;
    }

    /**
     * Calls history.push
     *
     * @param {string} path
     * @param {object} state
     */
    push(path, state = {}) {
      console.log(`history push ${path}`);
      this.canPush(path)
        ? _history.push(path, state)
        : !_preventDefault && this.onPush && this.onPush(path, state, _prompt);
      _preventDefault && this.clearPreventDefault();
    }

    /**
     * Calls and returns History.canGo to test history can go back.
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
      this.canGoBack()
        ? _history.goBack()
        : !_preventDefault && this.onGoBack && this.onGoBack(_prompt);
      _preventDefault && this.clearPreventDefault();
    }

    /**
     * Adds history change handler and returns unlisten function
     *
     * @param {HistoryListener} fn
     * @return {function}
     */
    listen(fn) {
      const unlisten = new Set();

      _listeners.add(fn);
      const wrapper = (location, action) => {
        !_preventDefault && fn(location, action);
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
      return "[Object HistoryController]";
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
      parent = null;
      this.onGoBack = null;
    }
  }

  return new HistoryController();
}

module.exports = createHistory;
