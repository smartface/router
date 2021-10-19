import type Route from "./Route";
import type { RouteState } from "./RouteState";

/**
 * @ignore
 */
export default function createRouteStore() {
  const _routes = new Map();

  return {
    saveRoute(url: string, route: Route) {
      _routes.set(url, route);
    },
    setState(url: string, state: RouteState) {
      return _routes.has(url) && _routes.get(url).setState(state) && true;
    },
    hasRoute(url: string) {
      return _routes.has(url);
    },
    findRoute(url: string) {
      return _routes.get(url);
    },
    toString() {
      return `[${Array.from(_routes.keys())}]`;
    }
  };
};

export type RouteStore = ReturnType<typeof createRouteStore>;