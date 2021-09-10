// based from react-router
"use strict";

import type Route from "router/Route";
import type Router from "router/Router";
import type { RouteStore } from "router/routeStore";

type MatchReturn = Array<{match: MatchObject, route: Route}>;
type MatchObject = {isExact: boolean,params: object,path: string,url: string};
/**
 *
 * @ignore
 * @param {RouteStore} store
 * @param {Array<Route>} routes
 * @param {string} pathname
 * @param {Array} [branch=[]] not public API
 * @return {Array<{match: RouteMatch, route: Route}>}
 */
const matchRoutes = (store: RouteStore, routes: (Route|Router)[], pathname: string, branch: any[] = []): MatchReturn => {
  routes.some(route => {
    const match = route.hasPath()
      ? route.matchPath(pathname)
      : branch.length
        ? branch[branch.length - 1].match
        : {
            // ensure we're using the exact code for default root match
            path: "/",
            url: "/",
            params: {},
            isExact: pathname === "/"
          };

    if (match) {
      if (Object.prototype.hasOwnProperty.call(route, '__is_router')) {
        branch.push({
          route,
          match
        });
      } else {
        !store.hasRoute(match.url) &&
          store.saveRoute(match.url, route.clone({ url: match.url }));
        branch.push({
          route: store.findRoute(match.url),
          match
        });
      }

      const children = route.map && route.map(child => {
        return child;
      }) || [];

      matchRoutes(store, children, pathname, branch);
    }

    return match;
  });

  return branch;
};

export default matchRoutes;
