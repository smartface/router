// based from react-router
"use strict";

/**
 *
 * @ignore
 *
 * @param {Array<Route>} routes
 * @param {string} pathname
 * @param {Array} branch
 * @param {object} store
 */
const matchRoutes = (store, routes, pathname, /*not public API*/ branch = []) => {
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
      // if (match && route.routeShouldMatch(match)) {
      // console.log('match : '+JSON.stringify(match));
      if(route.__is_router) {
        route.setUrl(match.url);
        branch.push({
          route,
          match
        });
      } else {
        // console.log(`store has ${match.url} : ${store.hasRoute(match.url) }`);
        !store.hasRoute(match.url) && store.saveRoute(match.url, route.clone({url: match.url}));
        branch.push({
          // route: route.clone({url: match.url}),
          route: store.findRoute(match.url),
          match
        });
      }
      
      const children = route.map(child => {
        return child;
      });

      matchRoutes(store, children, pathname, branch);
    }

    return match;
  });

  return branch;
};

module.exports = matchRoutes;
