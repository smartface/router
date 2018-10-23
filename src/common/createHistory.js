const createMemoryHistory = require("./history");

function createHistory(
  {
    initialEntries = null,
    initialIndex = null,
    keyLength = null,
    getUserConfirmation = null
  } = {},
  parent = null
) {
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

  class HistoryController {
    constructor() {}

    preventDefault() {
      _preventDefault = true;
      _nodes.forEach(node => node.preventDefault());
    }

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

    get nodes() {
      return new Set(_nodes);
    }

    get skipRender() {
      return _skipRender;
    }

    get history() {
      return _history;
    }

    rollback() {
      _history.rollback();
    }

    unloadHistory() {
      _history = null;
    }

    push(path, state) {
      console.log(`history push ${path}`);
      _history.push(path, state);
    }

    canGoBack() {
      return _history.canGo(-1);
    }

    goBack() {
      this.canGoBack()
        ? _history.goBack()
        : parent &&
          this.onGoBackEmpty &&
          this.onGoBackEmpty(_history.length === 0 ? -1 : 0);
    }

    listen(fn) {
      const unlisten = new Set();
      // if (parent) {
      //   unlisten.add(parent.listen(fn));
      // }

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

    toString() {
      return "[Object HistoryController]";
    }

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
