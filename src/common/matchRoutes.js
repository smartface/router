// code from react-router

/**
 *
 * @param {Array.<Route>} routes
 * @param {string} pathname
 * @param {Array} branch
 */
const matchRoutes = (routes, pathname, /*not public API*/ branch = []) => {
  routes.some(route => {
    const match = route.hasPath() // changed
      ? route.matchPath(pathname) // changed
      : branch.length
        ? branch[branch.length - 1].match
        : {
            // ensure we're using the exact code for default root match
            path: "/",
            url: "/",
            params: {},
            isExact: pathname === "/"
          };

    if (match && route.onPrematch(match)) {
      branch.push({
        route: route,
        match
      });
      const children = route.map(child => {
        return child;
      });

      matchRoutes(children, pathname, branch);
    }

    return match;
  });

  return branch;
};

module.exports = matchRoutes;
