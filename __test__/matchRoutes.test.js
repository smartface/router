const Route = require("../src/router/Route");
const matchRoutes = require("../src/commmon/matchRoutes");

describe("Match Routes", () => {
  it("can match with param", () => {
    const routes = [
      new Route({
        path: "/new-path",
        routes: [new Route({ path: "/new-path/:name" })]
      })
    ];

    const matches = matchRoutes(routes, "/new-path/cenkce").map(
      ({ match, route }) => ({ match, route: route.toObject() })
    );

    expect(matches).toEqual([
      {
        match: {
          isExact: false,
          params: {},
          path: "/new-path",
          url: "/new-path"
        },
        route: {
          path: "/new-path",
          routes: [{ path: "/new-path/:name", routes: [] }]
        }
      },
      {
        match: {
          isExact: true,
          params: { name: "cenkce" },
          path: "/new-path/:name",
          url: "/new-path/cenkce"
        },
        route: { path: "/new-path/:name", routes: [] }
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
      const matches = matchRoutes(routes, "/new-path/cenkce").map(
        ({ match, route }) => ({ match, route: route.toObject() })
      );

      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: {
            path: "/new-path",
            routes: [{ path: "/new-path/:id(\\d+)", routes: [] }]
          }
        }
      ]);
    }
    {
      const matches = matchRoutes(routes, "/new-path/123").map(
        ({ match, route }) => ({ match, route: route.toObject() })
      );
      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: {
            path: "/new-path",
            routes: [{ path: "/new-path/:id(\\d+)", routes: [] }]
          }
        },
        {
          match: {
            isExact: true,
            params: { id: "123" },
            path: "/new-path/:id(\\d+)",
            url: "/new-path/123"
          },
          route: { path: "/new-path/:id(\\d+)", routes: [] }
        }
      ]);
    }
  });
  it("mathes routes if parameter is alphanumeric", () => {
    const routes = [
      new Route({
        path: "/new-path",
        routes: [new Route({ path: "/new-path/:name([A-Za-z0-9]*)" })]
      })
    ];

    {
      const matches = matchRoutes(routes, "/new-path/cenkce").map(
        ({ match, route }) => ({ match, route: route.toObject() })
      );

      [
        {
          match: {
            path: "/new-path",
            url: "/new-path",
            isExact: false,
            params: {}
          },
          route: {
            path: "/new-path",
            routes: [
              {
                path: null,
                routes: []
              }
            ]
          }
        }
      ];
      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: {
            path: "/new-path",
            routes: [{ path: "/new-path/:name([A-Za-z0-9]*)", routes: [] }]
          }
        },
        {
          match: {
            isExact: true,
            params: { name: "cenkce" },
            path: "/new-path/:name([A-Za-z0-9]*)",
            url: "/new-path/cenkce"
          },
          route: { path: "/new-path/:name([A-Za-z0-9]*)", routes: [] }
        }
      ]);
    }
    {
      const matches = matchRoutes(routes, "/new-path/abc123").map(
        ({ match, route }) => ({ match, route: route.toObject() })
      );
      expect(matches).toEqual([
        {
          match: {
            isExact: false,
            params: {},
            path: "/new-path",
            url: "/new-path"
          },
          route: {
            path: "/new-path",
            routes: [{ path: "/new-path/:name([A-Za-z0-9]*)", routes: [] }]
          }
        },
        {
          match: {
            isExact: true,
            params: { name: "abc123" },
            path: "/new-path/:name([A-Za-z0-9]*)",
            url: "/new-path/abc123"
          },
          route: { path: "/new-path/:name([A-Za-z0-9]*)", routes: [] }
        }
      ]);
    }
  });
});
