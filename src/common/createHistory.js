const createMemoryHistory = require("./history");

/**
 * Creates a new HistoryController instance
 * @param {{?initialEntries: Array, ?initialIndex: number, ?keyLength: number, ?getUserConfirmation: function}} param0
 * @param {HistoryController} parent
 * @return {HistoryController}
 */
function createHistory(
  {
    initialEntries = null,
    initialIndex = null,
    keyLength = null,
    getUserConfirmation = null
  } = {},
  parent = null
) {
  /**
   * @type History
   */
  let _history = createMemoryHistory({
    initialEntries: initialEntries || [], // The initial URLs in the history stack
    initialIndex: initialIndex || 0, // The starting index in the history stack
    keyLength: keyLength || 20, // The length of location.key
    // A function to use to confirm navigation with the user. Required
    // if you return string prompts from transition hooks (see below)
    getUserConfirmation: getUserConfirmation
  });

  const _listeners = new Set();
  const _unlistenAll = new Set();
  const _nodes = new Set();
  let _preventDefault = false;

  function listener(location, action) {
    !_preventDefault &&
      _listeners.forEach(listener => listener(location, action));
    _preventDefault = false;
  }

  /**
   * History wrapper
   * @access package
   * @class HistoryController
   */
  class HistoryController {
    constructor() {}

    /**
     * Prevent history change event
     */
    preventDefault() {
      _preventDefault = true;
      _nodes.forEach(node => node.preventDefault());
    }

    /**
     * @param {object} props
     * @return {HistoryController}
     */
    createNode(props = {}) {
      const node = createHistory(props, this);
      // _listeners.forEach(listener => _unlistenAll.add(node.listen(listener)));
      _unlistenAll.add(node.listen(listener));
      _nodes.add(node);
      node.onGoBackEmpty = index => {
        _history.length > 0
          ? _history.go(index)
          : this.onGoBackEmpty && this.onGoBackEmpty(index);
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
     * @return History
     */
    get history() {
      return _history;
    }

    /**
     * Calls history.goBack()
     */
    rollback() {
      _history.rollback();
    }

    /**
     * Disposes history
     */
    dispose() {
      _history = null;
    }

    /**
     * Calls history.push
     *
     * @param {string} path
     * @param {object} state
     */
    push(path, state = {}) {
      console.log(`history push`);
      _history.push(path, state);
      _preventDefault = false;
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
        : parent &&
          this.onGoBackEmpty &&
          this.onGoBackEmpty(_history.length === 0 ? -1 : 0);
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
    }
  }

  return new HistoryController();
}

module.exports = createHistory;
