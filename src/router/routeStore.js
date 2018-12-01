/**
 * @ignore
 */
module.exports = function createRouteStore() {
  const _routes = new Map();

  return {
    saveRoute(url, route) {
      _routes.set(url, route);
    },
    setState(url, state) {
      return _routes.has(url) && _routes.get(url).setState(state) && true;
    },
    hasRoute(url) {
      return _routes.has(url);
    },
    findRoute(url) {
      return _routes.get(url);
    },
    toString() {
      return `[${Array.from(_routes.keys())}]`;
    }
  };
};
