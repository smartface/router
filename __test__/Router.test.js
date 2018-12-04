const Router = require("../src/router/Router");
const Route = require("../src/router/Route");
const matchRoutes = require("../src/common/matchRoutes");

describe("Router", () => {
  afterEach(() => {
    // Router.unloadHistory();
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

  it("fires an event when history is changed", () => {
    const router = new Router({
      path: "/",
      exact: false,
      isRoot: true,
      routes: [
        new Route({
          path: "/path/to/:name",
          build: (router, route) => ({
            type: "target1"
          })
        }),
        new Route({
          path: "/path/to/:id",
          build: (router, route) => ({
            type: "target2"
          })
        }),
        new Route({ path: "*", build: (props, match) => ({ type: "target3" }) })
      ]
    });
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route.toObject(), view: route.build() })
    // );
    router.push("/path/to/1");
    expect(router.getHistory().length > 0).toBe(true);
  });

  it("should add last route to child owner router.", () => {
    let _router1;
    let _router2;
    let lastUrl;
    const router = new Router({
      path: "/",
      exact: false,
      isRoot: true,
      routes: [
        new Router({
          path: "/path",
          to: "/path/to/the/3",
          routes: [
            new Router({
              path: "/path/to",
              routes: [
                new Route({
                  path: "/path/to/the/:id",
                  build: (router, route) => {
                    _router1 = router;
                    lastUrl = route.getState().match.url;
                    return { type: "target2" };
                  }
                })
              ]
            })
          ]
        }),
        new Router({
          path: "/path2",
          build: (router, route) => ({
            type: "target1"
          }),
          routes: [
            new Route({
              path: "/path2/to/:id",
              build: (router, route) => {
                lastUrl = route.getState().match.url;
                _router2 = router;
                return { type: "target2" };
              }
            })
          ]
        }),
        new Route({ path: "*", build: (props, match) => ({ type: "target3" }) })
      ]
    });
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route.toObject(), view: route.build() })
    // );
    router.push("/path/to/the/1");
    expect(lastUrl).toBe("/path/to/the/1");

    _router1.push("/path2/to/1");
    expect(lastUrl).toBe("/path2/to/1");

    _router2.push("/path");
    expect(lastUrl).toBe("/path/to/the/3");

    expect(router.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/3"
    ]);

    _router1.goBack();
    expect(lastUrl).toBe("/path/to/the/1");

    _router2.goBack();
    expect(lastUrl).toBe("/path2/to/1");

    _router2.goBack();
    expect(lastUrl).toBe("/path/to/the/1");

    expect(router.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/3"
    ]);
    expect(_router1.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path/to/the/3"
    ]);
    expect(_router2.getHistoryasArray()).toEqual(["/path2/to/1"]);
  });

  it("should call route's build when history goes back", () => {
    let lastUrl, router1;
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Router({
          path: "/path2",
          build: (router, route) => ({
            type: "target1"
          }),
          routes: [
            new Route({
              path: "/path2/to/:id",
              build: (router, route) => {
                lastUrl = route.getState().match.url;
                router1 = router;
                return { type: "target2" };
              }
            })
          ]
        })
      ]
    });

    router.push("/path2/to/0");
    expect(lastUrl).toBe("/path2/to/0");
    router1.push("/path2/to/1");
    expect(lastUrl).toBe("/path2/to/1");
    router1.goBack();
    expect(lastUrl).toBe("/path2/to/0");
  });
  it("should add last route to root router whenever a route redirects.", () => {
    let _router1;
    let _router2;
    let lastUrl;
    const router = new Router({
      path: "/",
      to: "/path/to/the/1",
      exact: false,
      isRoot: true,
      routes: [
        new Router({
          path: "/path",
          to: "/path/to/the/2",
          routes: [
            new Router({
              path: "/path/to",
              routes: [
                new Route({
                  path: "/path/to/the/:id",
                  build: (router, route) => {
                    _router1 = router;
                    lastUrl = route.getState().match.url;
                    return { type: "target2" };
                  }
                })
              ]
            })
          ]
        }),
        new Router({
          path: "/path2",
          routes: [
            new Route({
              path: "/path2/to/:id",
              build: (router, route) => {
                lastUrl = route.getState().match.url;
                _router2 = router;
                return { type: "target2" };
              }
            })
          ]
        }),
        new Route({
          path: "*",
          build: (props, match) => ({ type: "target3" })
        })
      ]
    });

    router.push("/");
    expect(lastUrl).toBe("/path/to/the/1");
    expect(_router1.toString()).toBe(
      "[object Router, path: /path/to, url: /path/to/the/1]"
    );
    expect(_router1.getHistoryasArray()).toEqual(["/path/to/the/1"]);

    _router1.push("/path2/to/1");
    expect(lastUrl).toBe("/path2/to/1");
    expect(_router2.getHistoryasArray()).toEqual(["/path2/to/1"]);

    _router2.push("/path");
    expect(lastUrl).toBe("/path/to/the/2");
    expect(router.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/2"
    ]);

    _router1.goBack();
    expect(lastUrl).toBe("/path/to/the/1");
    expect(_router1.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path/to/the/2"
    ]);

    _router2.goBack();

    expect(lastUrl).toBe("/path2/to/1");

    _router2.goBack();
    expect(lastUrl).toBe("/path/to/the/1");

    expect(router.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/2"
    ]);
    expect(_router1.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path/to/the/2"
    ]);
    expect(_router2.getHistoryasArray()).toEqual(["/path2/to/1"]);
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
        route: route.toJSON(),
        view: route.build()
      }));

    expect(matches).toEqual[
      ({
        match: { isExact: false, params: {}, path: "/", url: "/" },
        route: {
          match: {},
          path: "/",
          routeData: {},
          routes: [
            {
              match: {},
              path: "/path/to/:name",
              routeData: {},
              routes: [],
              routingState: {},
              state: {
                action: null,
                active: false,
                match: {},
                routeData: {},
                routingState: {},
                url: null,
                view: undefined
              },
              type: "route"
            },
            {
              match: {},
              path: "/path/to/:id",
              routeData: {},
              routes: [],
              routingState: {},
              state: {
                action: null,
                active: false,
                match: {},
                routeData: {},
                routingState: {},
                url: null,
                view: undefined
              },
              type: "route"
            },
            {
              match: {},
              path: "*",
              routeData: {},
              routes: [],
              routingState: {},
              state: {
                action: null,
                active: false,
                match: {},
                routeData: {},
                routingState: {},
                url: null,
                view: undefined
              },
              type: "route"
            }
          ],
          routingState: {},
          state: {
            action: "PUSH",
            active: false,
            match: { isExact: false, params: {}, path: "/", url: "/" },
            routeData: {},
            routingState: {},
            url: null,
            view: undefined
          },
          type: "route"
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
        route: {
          match: {},
          path: "/path/to/:name",
          routeData: {},
          routes: [],
          routingState: {},
          state: {
            action: "PUSH",
            active: false,
            match: {
              isExact: true,
              params: { name: "1" },
              path: "/path/to/:name",
              url: "/path/to/1"
            },
            routeData: {},
            routingState: {},
            url: "/path/to/1",
            view: "Object"
          },
          type: "route"
        },
        view: { type: "target1" }
      })
    ];
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
          build: (router, route) => {
            data = route.getState();
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
    expect(data.match.params).toEqual({ name: "1" });
    expect(data.routeData).toEqual({ name: "name" });
  });
  it("can get back in its history", () => {
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
              routeDidEnter: () => {
                callCount++;
              },
              path: "/path/to/:name",
              build: (router, route) => {
                data = route.getState();
                return { type: "target1" };
              }
            }),
            new Route({
              path: "/path/too/:name",
              routeDidEnter: () => {
                callCount++;
              },
              build: (router, route) => {
                component.router = router;
                return component;
              }
            }),
            new Route({ path: "*", build: { type: "target3" } })
          ]
        })
      ]
    });

    router.push("/path/to/1", { name: "name1" });
    expect(data.match.params).toEqual({ name: "1" });
    expect(data.routeData).toEqual({ name: "name1" });

    router.push("/path/too/dev", { name: "name2" });
    component.router.goBack();
    // console.log(data.match);
    expect(data.match.params).toEqual({ name: "1" });
    expect(data.routeData).toEqual({ name: "name1" });

    expect(component.router === router).toBe(false);
    expect(callCount).toBe(3);
  });

  it("calls back to parent if its history is empty", () => {
    let route;
    let callCount = 0;
    var component = {};

    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path2/to/:name",
          build: (router, _route) => {
            route = _route;
            callCount++;
            return { type: "target1" };
          }
        }),
        new Router({
          path: "/path",
          routes: [
            new Route({
              path: "/path/to/:name",
              build: (router, _route) => {
                route = _route;
                callCount++;
                component.router = router;
                data = route.getState();
                return component;
              }
            }),
            new Route({
              path: "*",
              build: (router, route) => {
                type: "target3";
              }
            })
          ]
        })
      ]
    });

    router.push("/path2/to/1", { name: "name1" });
    expect(route.getState().routeData).toEqual({ name: "name1" });
    expect(router.getHistoryasArray()).toEqual(["/path2/to/1"]);

    router.push("/path/to/dev", { name: "name2" });
    expect(router.getHistoryasArray()).toEqual(["/path2/to/1", "/path/to/dev"]);
    expect(route.getState().routeData).toEqual({ name: "name2" });

    component.router.goBack();
    expect(router._historyController.lastLocation.pathname).toEqual(
      "/path2/to/1"
    );
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
              build: (router, route) => {
                const { match } = route.getState();
                component1.router = router;
                component1.params = match.params;
                return component1;
              }
            }),
            new Route({
              path: "/path/to/:id",
              build: (router, route) => {
                const { match } = route.getState();
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
    component1.router.push("/path/to/1123", { name: "name" });

    // expect(component1.router === router).toBe(false);
    // expect(component1.params.name).toBe("cenk");
    expect(component2.params.id).toBe("1123");
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

    const unlisten = router.addRouteBlocker(
      (path, routeData, action, callback) => {
        callback(false);
      }
    );

    router.push("/path/to/cenk", { name: "name" });
    expect(router.getHistory().entries).toEqual([]);
    unlisten();
    router.push("/path/to/cenk", { name: "name" });
    router.addRouteBlocker((path, routeData, action, callback) => {
      callback(true);
    });

    expect(router.getHistory().entries[0].pathname).toBe("/path/to/cenk");
  });

  it("can redirect to specified route with route-data when route has 'to' attribute", () => {
    let callCount = 0;
    var component1 = {};
    var activeRoute;
    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [
        new Route({
          path: "/path",
          to: "/path2/to/1",
          build: (router, route) => {
            const { match } = route.getState();
            component1.router = router;
            component1.params = match.params;
            return component1;
          }
        }),
        new Route({
          path: "/path2/to/:id",
          build: (router, route) => {
            activeRoute = route;
            return component1;
          }
        })
      ]
    });

    router.push("/path", { name: "name" });
    expect(router.getHistory().entries[0].pathname).toBe("/path2/to/1");
    expect(activeRoute.getState().routeData).toEqual({ name: "name" });
  });
  it("can call child Routers", () => {
    let callCount = 0;
    var component1 = {};
    var component2 = {};

    var router1 = Router.of({
      path: "/stack1",
      to: "/stack1/to/1",
      routes: [
        new Route({
          path: "/stack1/to/1",
          build: (router, route) => {
            const { match } = route.getState();
            component1.router = router;
            component1.params = match.params;
            return component1;
          }
        }),
        new Route({
          path: "/stack1/to/:id",
          build: (match, state, router, view) => {
            return component1;
          }
        })
      ]
    });

    var router2 = Router.of({
      path: "/stack2",
      to: "/stack2/to/1",
      routes: [
        new Route({
          path: "/stack2/to/1",
          build: (router, route) => {
            const { match } = route.getState();
            component2.router = router;
            component2.params = match.params;
            return component2;
          }
        }),
        new Route({
          path: "/stack2/to/:id",
          build: (match, state, router, view) => {
            return component1;
          }
        })
      ]
    });

    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [router1, router2]
    });

    router.push("/stack1", { name: "name" });
    expect(component1.router).toBe(router1);
    router.push("/stack2", { name: "name" });
    expect(component2.router).toBe(router2);
  });

  it("should be routed from child Routers", () => {
    let callCount = 0;
    let component1 = {};
    let component2 = {};

    let router1 = Router.of({
      path: "/stack1",
      to: "/stack1/to/1",
      routes: [
        new Route({
          path: "/stack1/to/1",
          build: (router, route) => {
            component1.router = router;
            component1.params = route.getState().match.params;
            return component1;
          }
        }),
        new Route({
          path: "/stack1/to/:id",
          build: (router, rotue) => {
            return component1;
          }
        })
      ]
    });

    router1.name = "router1";

    let router2 = Router.of({
      path: "/stack2",
      to: "/stack2/to/1",
      routes: [
        new Route({
          path: "/stack2/to/1",
          build: (router, route) => {
            component2.router = router;
            component2.params = route.getState().match.params;
            return component2;
          }
        }),
        new Route({
          path: "/stack2/to/:id",
          build: (router, route) => {
            component2.url = route.getState().match.url;
            return component2;
          }
        })
      ]
    });

    router2.name = "router2";

    const router = new Router({
      path: "/",
      isRoot: true,
      routes: [router1, router2]
    });

    router.push("/stack1", { name: "name" });
    expect(component1.router).toBe(router1);

    component1.router.push("/stack2", { name: "name" });
    expect(component2.router).toBe(router2);

    component2.router.push("/stack2/to/2", { name: "name" });
    expect(component2.url).toBe("/stack2/to/2");
  });
});
