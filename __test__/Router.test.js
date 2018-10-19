const Router = require("../src/router/Router");
const Route = require("../src/router/Route");
const matchRoutes = require("../src/common/matchRoutes");

describe("Router", () => {
  afterEach(() => {
    Router.unloadHistory();
  });
  it("has routes", () => {
    const router = new Router({
      isRoot: true,
      routes: [
        new Route("/path/to/:name"),
        new Route("/path/to/:id"),
        new Route("/path/to")
      ]
    });
    let routes = [];
    router.map(route => {
      routes.push(route);
    });
    expect(routes.length).toBe(3);
  });
  it("finds target by url", () => {
    const router = new Router({
      path: "/",
      exact: false,
      isRoot: true,
      routes: [
        new Route({
          path: "/path/to/:name",
          build: (props, match) => ({
            type: "target1"
          })
        }),
        new Route({
          path: "/path/to/:id",
          build: (props, match) => ({
            type: "target2"
          })
        }),
        new Route({ path: "*", build: (props, match) => ({ type: "target3" }) })
      ]
    });
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route.toObject(), view: route.build() })
    // );
    var matches = router
      .push("/path/to/1")
      ._matches.map(({ match, route }) => ({
        match,
        route: route.toObject(),
        view: route.build()
      }));

    expect(matches).toEqual([
      {
        match: { isExact: false, params: {}, path: "/", url: "/" },
        route: {
          path: "/",
          routes: [
            { path: "/path/to/:name", routes: [] },
            { path: "/path/to/:id", routes: [] },
            { path: "*", routes: [] }
          ]
        },
        view: null
      },
      {
        match: {
          isExact: true,
          params: { name: "1" },
          path: "/path/to/:name",
          url: "/path/to/1"
        },
        route: { path: "/path/to/:name", routes: [] },
        view: { type: "target1" }
      }
    ]);
  });
  it("return only root path if any route doesn't be matched", () => {
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path/to/:name",
          build: () => {
            type: "target1";
          }
        }),
        new Route({
          path: "/path/to/:id",
          build: () => {
            type: "target2";
          }
        }),
        new Route({ path: "*", build: { type: "target3" } })
      ]
    });

    let matches = router.push("/path/to")._matches;
    expect(matches.map(({ match }) => match)).toEqual([
      {
        isExact: false,
        params: {},
        path: "/",
        url: "/"
      }
    ]);
  });

  it("sends data and params to specified route", () => {
    let data;
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path/to/:name",
          build: (match, state) => {
            data = {
              params: match.params,
              state
            };
            return { type: "target1" };
          }
        }),
        new Route({
          path: "/path/too/:name",
          build: () => {
            type: "target2";
          }
        }),
        new Route({ path: "*", build: { type: "target3" } })
      ]
    });
    let matches = router.push("/path/to/1", { name: "name" });
    expect(data).toEqual({
      params: { name: "1" },
      state: { data: { name: "name" } }
    });
  });
  it("gets history back", () => {
    let data;
    let callCount = 0;
    var component = {};
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Router({
          path: "/path",
          routes: [
            new Route({
              path: "/path/to/:name",
              build: (match, state, router) => {
                data = {
                  params: match.params,
                  state
                };

                callCount++;
                return { type: "target1" };
              }
            }),
            new Route({
              path: "/path/too/:name",
              build: (params, state, router) => {
                component.router = router;
                return component;
              }
            }),
            new Route({ path: "*", build: { type: "target3" } })
          ]
        })
      ]
    });

    router.push("/path/to/1", { name: "name" });
    router.push("/path/too/dev", { name: "name" });
    component.router.goBack();

    expect(data).toEqual({
      params: { name: "1" },
      state: { data: { name: "name" } }
    });

    expect(component.router === router).toBe(false);
    expect(callCount).toBe(2);
  });

  it("calls back to parent if its history is empty", () => {
    let data;
    let callCount = 0;
    var component = {};

    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path2/to/:name",
          build: (match, state, router) => {
            data = {
              params: match.params,
              state
            };
            // component.router = router;
            callCount++;
            return { type: "target1" };
          }
        }),
        new Router({
          path: "/path",
          routes: [
            new Route({
              path: "/path/to/:name",
              build: (params, state, router) => {
                component.router = router;
                return component;
              }
            }),
            new Route({ path: "*", build: { type: "target3" } })
          ]
        })
      ]
    });

    router.push("/path2/to/1", { name: "name" });
    router.push("/path/to/dev", { name: "name" });
    component.router.goBack();

    expect(data).toEqual({
      params: { name: "1" },
      state: { data: { name: "name" } }
    });
    expect(callCount).toBe(2);
  });
  it("can call a relative path", () => {
    let data;
    let callCount = 0;
    var component1 = {};
    var component2 = {};

    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path2/to/:name",
          build: (match, state, router) => {
            data = {
              params: match.params,
              state
            };
            // component.router = router;
            callCount++;
            return { type: "target1" };
          }
        }),
        new Router({
          path: "/path",
          routes: [
            new Route({
              path: "/path/to/:name([a-zA-Z]*)",
              build: (match, state, router) => {
                component1.router = router;
                component1.params = match.params;
                return component1;
              }
            }),
            new Route({
              path: "/path/to/:id",
              build: (match, state, router, view) => {
                component2.router = router;
                component2.params = match.params;
                return component2;
              }
            })
          ]
        })
      ]
    });

    router.push("/path/to/cenk", { name: "name" });
    component1.router.push("to/1123", { name: "name" });

    expect(component1.router === router).toBe(false);
    expect(component1.params.name).toBe("cenk");
    expect(component2.params.id).toBe("1123");
  });
  it("can call a relative path", () => {
    let data;
    let callCount = 0;
    var component1 = {};
    var component2 = {};
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path2/to/:name",
          build: (match, state, router) => {
            data = {
              params: match.params,
              state
            };
            // component.router = router;
            callCount++;
            return { type: "target1" };
          }
        }),
        new Router({
          path: "/path",
          routes: [
            new Route({
              path: "/path/to/:name([a-zA-Z]*)",
              build: (match, state, router) => {
                component1.router = router;
                component1.params = match.params;
                return component1;
              }
            }),
            new Route({
              path: "/path/to/:id",
              build: (match, state, router, view) => {
                return null;
              }
            })
          ]
        })
      ]
    });

    router.push("/path/to/cenk", { name: "name" });
    component1.router.push("to/1123", { name: "name" });
    expect(router.getHistory().entries.map(entry => entry.pathname)).toEqual([
      "/path/to/cenk"
    ]);
  });

  it("can be blocked", () => {
    let callCount = 0;
    var component1 = {};
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path/to/:name([a-zA-Z]*)",
          build: (match, state, router) => {
            component1.router = router;
            component1.params = match.params;
            return component1;
          }
        }),
        new Route({
          path: "/path/to/:id",
          build: (match, state, router, view) => {
            return component1;
          }
        })
      ]
    });

    router.addRouteBlocker((location, action, callback) => {
      callback(false);
    });

    router.push("/path/to/cenk", { name: "name" });
    expect(router.getHistory().entries).toEqual([]);

    router.push("/path/to/cenk", { name: "name" });
    router.addRouteBlocker((location, action, callback) => {
      callback(true);
    });

    expect(router.getHistory().entries[0].pathname).toBe("/path/to/cenk");
  });

  it("can redirect to specified route when route has 'to' attribute", () => {
    let callCount = 0;
    var component1 = {};
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path",
          to: "/path/to/1",
          build: (match, state, router) => {
            component1.router = router;
            component1.params = match.params;
            return component1;
          }
        }),
        new Route({
          path: "/path/to/:id",
          build: (match, state, router, view) => {
            return component1;
          }
        })
      ]
    });

    router.push("/path", { name: "name" });
    expect(router.getHistory().entries[0].pathname).toBe("/path/to/1");
    expect(router.getHistory().entries[0].state).toEqual({
      routeState: { data: { name: "name" } }
    });
  });
});
