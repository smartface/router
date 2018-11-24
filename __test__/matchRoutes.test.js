const Route = require("../src/router/Route");
const Router = require("../src/router/Router");
const createStore = require("../src/router/routeStore");
const matchRoutes = require("../src/common/matchRoutes");

describe("Match Routes", () => {
  it("can match with param", () => {
    const routes = [
      new Route({
        path: "/new-path",
        routes: [new Route({ path: "/new-path/:name" })]
      })
    ];

    const matches = matchRoutes(createStore(), routes, "/new-path/cenkce").map(
      ({ match, route }) => ({ match, route: route.toString() })
    );

    expect(matches).toEqual([
      {
        match: {
          isExact: false,
          params: {},
          path: "/new-path",
          url: "/new-path"
        },
        route: "[object Route, path: /new-path, url: /new-path]"
      },
      {
        match: {
          isExact: true,
          params: { name: "cenkce" },
          path: "/new-path/:name",
          url: "/new-path/cenkce"
        },
        route: "[object Route, path: /new-path/:name, url: /new-path/cenkce]"
      }
    ]);
  });
  it("gets routes if parameter is just numeric", () => {
    const routes = [
      new Route({
        path: "/new-path",
        routes: [new Route({ path: "/new-path/:id(\\d+)" })]
      })
    ];

    {
      const matches = matchRoutes(
        createStore(),
        routes,
        "/new-path/cenkce"
      ).map(({ match, route }) => ({ match, route: route.toString() }));

      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: "[object Route, path: /new-path, url: /new-path]"
        }
      ]);
    }
    {
      const matches = matchRoutes(createStore(), routes, "/new-path/123").map(
        ({ match, route }) => ({ match, route: route.toString() })
      );
      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: "[object Route, path: /new-path, url: /new-path]"
        },
        {
          match: {
            isExact: true,
            params: { id: "123" },
            path: "/new-path/:id(\\d+)",
            url: "/new-path/123"
          },
          route: "[object Route, path: /new-path/:id(\\d+), url: /new-path/123]"
        }
      ]);
    }
  });
  it("mathes routes if parameter is alphanumeric", () => {
    const routes = [
      new Router({
        path: "/new-path",
        routes: [new Route({ path: "/new-path/:name([A-Za-z0-9]*)" })]
      })
    ];

    {
      const matches = matchRoutes(
        createStore(),
        routes,
        "/new-path/cenkce"
      ).map(({ match, route }) => ({ match, route: route.toString() }));

      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: "[object Router, path: /new-path, url: null]"
        },
        {
          match: {
            isExact: true,
            params: { name: "cenkce" },
            path: "/new-path/:name([A-Za-z0-9]*)",
            url: "/new-path/cenkce"
          },
          route:
            "[object Route, path: /new-path/:name([A-Za-z0-9]*), url: /new-path/cenkce]"
        }
      ]);
    }
    {
      const matches = matchRoutes(
        createStore(),
        routes,
        "/new-path/abc123"
      ).map(({ match, route }) => ({ match, route: route.toString() }));
      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: "[object Router, path: /new-path, url: null]"
        },
        {
          match: {
            isExact: true,
            params: { name: "abc123" },
            path: "/new-path/:name([A-Za-z0-9]*)",
            url: "/new-path/abc123"
          },
          route:
            "[object Route, path: /new-path/:name([A-Za-z0-9]*), url: /new-path/abc123]"
        }
      ]);
    }
  });
});
