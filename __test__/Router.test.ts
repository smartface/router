import Router from "../src/router/Router";
import Route from "../src/router/Route";
import { RouteState } from "../src/router/RouteState";

describe("Router", () => {
  afterEach(() => {
    // Router.unloadHistory();
  });
  it("has routes", () => {
    const router = new Router<any>({
      isRoot: true,
      routes: [
        new Route<any>({ path: "/path/to/:name" }),
        new Route<any>({ path: "/path/to/:id" }),
        new Route<any>({ path: "/path/to" }),
      ],
    });
    let routes = [];
    routes = router.map
      ? router.map((route) => {
          return route;
        })!
      : [];
    expect(routes.length).toBe(3);
  });

  it("fires an event when history is changed", () => {
    const router = new Router<any>({
      path: "/",
      exact: false,
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path/to/:name",
          build: (router, route) => ({
            type: "target1",
          }),
        }),
        new Route<any>({
          path: "/path/to/:id",
          build: (router, route) => ({
            type: "target2",
          }),
        }),
        new Route<any>({
          path: "*",
          build: (props, match) => ({ type: "target3" }),
        }),
      ],
    });
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route!.toObject(), view: route!.build() })
    // );
    router!.push("/path/to/1");
    expect(router!.getHistory()!.length > 0).toBe(true);
  });

  it("should add last route to child owner router!.", () => {
    let _router1: Router;
    let _router2: Router;
    let lastUrl: string | undefined;
    const router = new Router<any>({
      path: "/",
      exact: false,
      isRoot: true,
      routes: [
        new Router<any>({
          path: "/path",
          to: "/path/to/the/3",
          routes: [
            new Router<any>({
              path: "/path/to",
              routes: [
                new Route<any>({
                  path: "/path/to/the/:id",
                  build: (router, route) => {
                    _router1 = router;
                    lastUrl = route!.getState()?.match?.url;
                    return { type: "target2" };
                  },
                }),
              ],
            }),
          ],
        }),
        new Router<any>({
          path: "/path2",
          build: (router, route) => ({
            type: "target1",
          }),
          routes: [
            new Route<any>({
              path: "/path2/to/:id",
              build: (router, route) => {
                lastUrl = route!.getState()?.match?.url;
                _router2 = router;
                return { type: "target2" };
              },
            }),
          ],
        }),
        new Route<any>({
          path: "*",
          build: (props, match) => ({ type: "target3" }),
        }),
      ],
    });
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route!.toObject(), view: route!.build() })
    // );
    router!.push("/path/to/the/1");
    expect(lastUrl!).toBe("/path/to/the/1");

    _router1!.push("/path2/to/1");
    expect(lastUrl!).toBe("/path2/to/1");

    _router2!.push("/path");
    expect(lastUrl!).toBe("/path/to/the/3");

    expect(router!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/3",
    ]);

    _router1!.goBack();
    _router2!.goBack();
    _router2!.goBack();

    expect(router!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/3",
    ]);
    expect(_router1!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path/to/the/3",
    ]);
    expect(_router2!.getHistoryasArray()).toEqual(["/path2/to/1"]);
  });

  it("shouldn't call route's build when history goes back", () => {
    let lastUrl: string | undefined, router1: Router;
    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Router<any>({
          path: "/path2",
          build: (router, route) => ({
            type: "target1",
          }),
          routes: [
            new Route<any>({
              path: "/path2/to/:id",
              build: (router, route) => {
                lastUrl = route!.getState()?.match?.url;
                router1 = router;
                return { type: "target2" };
              },
            }),
          ],
        }),
      ],
    });

    router!.push("/path2/to/0");
    expect(lastUrl!).toBe("/path2/to/0");
    router1!.push("/path2/to/1");
    expect(lastUrl!).toBe("/path2/to/1");
    router1!.goBack();
    expect(lastUrl!).toBe("/path2/to/1");
  });
  it("should add last route to root router whenever a route redirects.", () => {
    let _router1: Router;
    let _router2: Router;
    let lastUrl: string | undefined;
    const router = new Router<any>({
      path: "/",
      to: "/path/to/the/1",
      exact: false,
      isRoot: true,
      routes: [
        new Router<any>({
          path: "/path",
          to: "/path/to/the/2",
          routes: [
            new Router<any>({
              path: "/path/to",
              routes: [
                new Route<any>({
                  path: "/path/to/the/:id",
                  build: (router, route) => {
                    _router1 = router;
                    lastUrl = route!.getState()?.match?.url;
                    return { type: "target2" };
                  },
                }),
              ],
            }),
          ],
        }),
        new Router<any>({
          path: "/path2",
          routes: [
            new Route<any>({
              path: "/path2/to/:id",
              build: (router, route) => {
                lastUrl = route!.getState()?.match?.url;
                _router2 = router;
                return { type: "target2" };
              },
            }),
          ],
        }),
        new Route<any>({
          path: "*",
          build: (props, match) => ({ type: "target3" }),
        }),
      ],
    });

    router!.push("/");
    expect(lastUrl!).toBe("/path/to/the/1");
    expect(_router1!.toString()).toBe(
      "[object Router, path: /path/to, url: /path/to/the/1]"
    );
    expect(_router1!.getHistoryasArray()).toEqual(["/path/to/the/1"]);

    _router1!.push("/path2/to/1");
    expect(lastUrl!).toBe("/path2/to/1");
    expect(_router2!.getHistoryasArray()).toEqual(["/path2/to/1"]);

    _router2!.push("/path");
    expect(lastUrl!).toBe("/path/to/the/2");
    expect(router!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/2",
    ]);

    _router1!.goBack();
    expect(lastUrl!).toBe("/path/to/the/2");
    expect(_router1!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path/to/the/2",
    ]);

    _router2!.goBack();
    _router2!.goBack();

    expect(router!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path2/to/1",
      "/path/to/the/2",
    ]);
    expect(_router1!.getHistoryasArray()).toEqual([
      "/path/to/the/1",
      "/path/to/the/2",
    ]);
    expect(_router2!.getHistoryasArray()).toEqual(["/path2/to/1"]);
  });
  it("can't call build functions of not matched routes", () => {
    let _router1: Router;
    let _router2: Router;
    let call = 0;
    const router = new Router<any>({
      path: "/",
      to: "/path/to/the/1",
      exact: false,
      isRoot: true,
      routes: [
        new Router<any>({
          path: "/path",
          to: "/path/to/the/2",
          routes: [
            new Router<any>({
              path: "/path/to",
              routes: [
                new Route<any>({
                  path: "/path/to/the/:id",
                  build: (router, route) => {
                    call++;
                    return { type: "target2" };
                  },
                }),
              ],
            }),
          ],
        }),
        new Router<any>({
          path: "/path2",
          routes: [
            new Route<any>({
              path: "/path2/to/:id",
              build: (router, route) => {
                call++;
                return { type: "target2" };
              },
            }),
            new Route<any>({
              path: "/path2/to/:id/get",
              build: (router, route) => {
                call++;
                return { type: "target2" };
              },
            }),
          ],
        }),
        new Route<any>({
          path: "*",
          build: (props, match) => {
            call++;
            return { type: "target3" };
          },
        }),
      ],
    });

    router.push("/path");

    expect(call).toBe(1);
  });

  it("finds target by url", () => {
    const router = new Router<any>({
      path: "/",
      exact: false,
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path/to/:name",
          build: (props, match) => ({
            type: "target1",
          }),
        }),
        new Route<any>({
          path: "/path/to/:id",
          build: (props, match) => ({
            type: "target2",
          }),
        }),
        new Route<any>({
          path: "*",
          build: (props, match) => ({ type: "target3" }),
        }),
      ],
    });
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route!.toObject(), view: route!.build() })
    // );
    var matches = router
      .push("/path/to/1", { name: "name" })
      .matches.map(({ match, route }) => ({
        match,
        route: route!.toJSON(),
        view: route!.build(router),
      }));
    expect(JSON.stringify(matches)).toBe(
      JSON.stringify([
        {
          match: {
            path: "/",
            url: "/",
            isExact: false,
            params: {},
          },
          route: {
            type: "route",
            match: {},
            routeData: {},
            routingState: {},
            path: "/",
            routes: [
              {
                type: "route",
                match: {},
                routeData: {},
                routingState: {},
                path: "/path/to/:name",
                routes: [],
                state: {
                  match: {},
                  query: {},
                  rawQuery: "",
                  hash: "",
                  routeData: {},
                  routingState: {},
                  action: null,
                  url: null,
                  active: false,
                },
              },
              {
                type: "route",
                match: {},
                routeData: {},
                routingState: {},
                path: "/path/to/:id",
                routes: [],
                state: {
                  match: {},
                  query: {},
                  rawQuery: "",
                  hash: "",
                  routeData: {},
                  routingState: {},
                  action: null,
                  url: null,
                  active: false,
                },
              },
              {
                type: "route",
                match: {},
                routeData: {},
                routingState: {},
                path: "*",
                routes: [],
                state: {
                  match: {},
                  query: {},
                  rawQuery: "",
                  hash: "",
                  routeData: {},
                  routingState: {},
                  action: null,
                  url: null,
                  active: false,
                },
              },
            ],
            state: {
              match: {
                path: "/",
                url: "/",
                isExact: false,
                params: {},
              },
              rawQuery: "",
              hash: "",
              routeData: {},
              routingState: {},
              action: "PUSH",
              url: null,
              active: false,
            },
          },
          view: null,
        },
        {
          match: {
            path: "/path/to/:name",
            url: "/path/to/1",
            isExact: true,
            params: {
              name: "1",
            },
          },
          route: {
            type: "route",
            match: {
              name: "name",
            },
            routeData: {
              name: "name",
            },
            routingState: {},
            path: "/path/to/:name",
            routes: [],
            state: {
              match: {
                path: "/path/to/:name",
                url: "/path/to/1",
                isExact: true,
                params: {
                  name: "1",
                },
              },
              hash: "",
              routeData: {
                name: "name",
              },
              view: "Object",
              routingState: {},
              action: "PUSH",
              url: "/path/to/1",
              active: false,
              prevUrl: "/path/to/1",
            },
          },
          view: {
            type: "target1",
          },
        },
      ])
    );
  });

  it("return only root path if any route doesn't be matched", () => {
    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path/to/:name",
          build: () => {
            type: "target1";
          },
        }),
        new Route<any>({
          path: "/path/to/:id",
          build: () => {
            type: "target2";
          },
        }),
        new Route<any>({
          path: "*",
          build: () => {
            type: "target3";
          },
        }),
      ],
    });

    let matches = router!.push("/path/to").matches;
    expect(matches.map(({ match }) => match)).toEqual([
      {
        isExact: false,
        params: {},
        path: "/",
        url: "/",
      },
    ]);
  });

  it("sends data and params to specified route", () => {
    let data: RouteState;
    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path/to/:name",
          build: (router, route) => {
            data = route!.getState();
            return { type: "target1" };
          },
        }),
        new Route<any>({
          path: "/path/too/:name",
          build: () => {
            type: "target2";
          },
        }),
        new Route<any>({
          path: "*",
          build: () => {
            type: "target3";
          },
        }),
      ],
    });
    let matches = router!.push("/path/to/1", { name: "name" });
    expect(data!.match?.params).toEqual({ name: "1" });
    expect(data!.routeData).toEqual({ name: "name" });
  });
  it("can get back in its history", () => {
    let data: any;
    let callCount = 0;
    var component: any = {};
    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Router<any>({
          path: "/path",
          routes: [
            new Route<any>({
              routeDidEnter: () => {
                callCount++;
              },
              path: "/path/to/:name",
              build: (router, route) => {
                data = route.getState();
                return { type: "target1" };
              },
            }),
            new Route<any>({
              path: "/path/too/:name",
              routeDidEnter: () => {
                callCount++;
              },
              build: (router, route) => {
                component.router = router;
                return component;
              },
            }),
            new Route<any>({
              path: "*",
              build: () => {
                type: "target3";
              },
            }),
          ],
        }),
      ],
    });

    router!.push("/path/to/1", { name: "name1" });
    expect(data.match?.params).toEqual({ name: "1" });
    expect(data.routeData).toEqual({ name: "name1" });

    router!.push("/path/too/dev", { name: "name2" });
    component.router!.goBack();
    // console.log(data!.match);
    expect(data!.match?.params).toEqual({ name: "1" });
    expect(data!.routeData).toEqual({ name: "name1" });

    expect(component.router === router).toBe(false);
    expect(callCount).toBe(3);
  });

  it("calls back to parent if its history is empty", () => {
    let route: Route;
    let callCount = 0;
    var component: any = {};
    let data: any;
    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path2/to/:name",
          build: (router, _route) => {
            route = _route;
            callCount++;
            return { type: "target1" };
          },
        }),
        new Router<any>({
          path: "/path",
          routes: [
            new Route<any>({
              path: "/path/to/:name",
              build: (router, _route) => {
                route = _route;
                callCount++;
                component.router = router;
                data = route!.getState();
                return component;
              },
            }),
            new Route<any>({
              path: "*",
              build: (router, route) => {
                type: "target3";
              },
            }),
          ],
        }),
      ],
    });

    router!.push("/path2/to/1", { name: "name1" });
    expect(route!.getState()?.routeData).toEqual({ name: "name1" });
    expect(router!.getHistoryasArray()).toEqual(["/path2/to/1"]);

    router!.push("/path/to/dev", { name: "name2" });
    expect(router!.getHistoryasArray()).toEqual([
      "/path2/to/1",
      "/path/to/dev",
    ]);
    expect(route!.getState()?.routeData).toEqual({ name: "name2" });

    component.router!.goBack();
    expect(router!.historyController?.lastLocation.url).toEqual("/path2/to/1");
  });
  it("can call a relative path", () => {
    let data;
    let callCount = 0;
    var component1: any = {};
    var component2: any = {};

    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path2/to/:name",
          build: (router, route) => {
            callCount++;
            return { type: "target1" };
          },
        }),
        new Router<any>({
          path: "/path",
          routes: [
            new Route<any>({
              path: "/path/to/:name([a-zA-Z]*)",
              build: (router, route) => {
                const { match } = route!.getState();
                component1.router = router;
                component1.params = match?.params;
                return component1;
              },
            }),
            new Route<any>({
              path: "/path/to/:id",
              build: (router, route) => {
                const { match } = route!.getState();
                component2.router = router;
                component2.params = match?.params;
                return component2;
              },
            }),
          ],
        }),
      ],
    });

    router!.push("/path/to/cenk", { name: "name" });
    component1.router!.push("/path/to/1123", { name: "name" });

    // expect(component1.router === router).toBe(false);
    // expect(component1.params.name).toBe("cenk");
    expect(component2.params.id).toBe("1123");
    expect(router!.getHistory()!.entries.map((entry) => entry.url)).toEqual([
      "/path/to/cenk",
    ]);
  });

  it("can be blocked", () => {
    let callCount = 0;
    var component1: any = {};
    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        new Route<any>({
          path: "/path/to/:name([a-zA-Z]*)",
          build: (router, route) => {
            component1.router = router;
            component1.params = route!.matchPath;
            return component1;
          },
        }),
        new Route<any>({
          path: "/path/to/:id",
          build: (router, route) => {
            return component1;
          },
        }),
      ],
    });

    const unlisten = router!.addRouteBlocker(
      (path, routeData, action, callback) => {
        callback(false);
      }
    );

    router!.push("/path/to/cenk", { name: "name" });
    expect(router!.getHistory()!.entries).toEqual([]);
    unlisten();
    router!.push("/path/to/cenk", { name: "name" });
    router!.addRouteBlocker((path, routeData, action, callback) => {
      callback(true);
    });

    expect(router!.getHistory()!.entries[0].url).toBe("/path/to/cenk");
  });

  it("can redirect to specified route with route-data when route has 'to' attribute", () => {
    let callCount = 0;
    let component1: any = {};
    let activeRoute: Route | undefined;
    let redirectCount = 0;

    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [
        Router.of({
          path: "/path",
          to: "/path/to/1",
          routes: [
            new Route<any>({
              path: "/path/2",
              build: (router, route) => {
                const { match,  } = route!.getState();
                component1.router = router;
                component1.params = match?.params;
                return component1;
              },
            }),
            new Route<any>({
              path: "/path/to/:id",
              build: (router, route) => {
                redirectCount++;
                console.log(route)
                activeRoute = route;
                return component1;
              },
            }),
          ]
        })
      ],
    });

    router.listen((location, action) => {
      console.log(location);
    });
    router.push("path", { name: "name" });
    router.push("path", { name: "name" });

    expect(redirectCount++).toEqual(2);
    expect(router.getHistory()!.entries[0]?.url).toBe("/path/to/1");
    expect(activeRoute?.getState()?.routeData).toEqual({ name: "name" });
  });
  it("can call child Routers", () => {
    let callCount = 0;
    var component1: any = {};
    var component2: any = {};

    var router1 = Router.of({
      path: "/stack1",
      to: "/stack1/to/1",
      routes: [
        new Route<any>({
          path: "/stack1/to/1",
          build: (router, route) => {
            const { match } = route!.getState();
            component1.router = router;
            component1.params = match?.params;
            return component1;
          },
        }),
        new Route<any>({
          path: "/stack1/to/:id",
          build: () => {
            return component1;
          },
        }),
      ],
    });

    var router2 = Router.of({
      path: "/stack2",
      to: "/stack2/to/1",
      routes: [
        new Route<any>({
          path: "/stack2/to/1",
          build: (router, route) => {
            const { match } = route!.getState();
            component2.router = router;
            component2.params = match?.params;
            return component2;
          },
        }),
        new Route<any>({
          path: "/stack2/to/:id",
          build: (router, route) => {
            return component1;
          },
        }),
      ],
    });

    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [router1, router2],
    });

    router!.push("/stack1", { name: "name" });
    expect(component1.router).toBe(router1);
    router!.push("/stack2", { name: "name" });
    expect(component2.router).toBe(router2);
  });

  it("should be routed from child Routers", () => {
    let callCount = 0;
    let component1: any = {};
    let component2: any = {};

    let router1 = Router.of({
      name: "router1",
      path: "/stack1",
      to: "/stack1/to/1",
      routes: [
        new Route<any>({
          path: "/stack1/to/1",
          build: (router, route) => {
            component1.router = router;
            component1.params = route!.getState()?.match?.params;
            return component1;
          },
        }),
        new Route<any>({
          path: "/stack1/to/:id",
          build: (router, rotue) => {
            return component1;
          },
        }),
      ],
    });

    let router2 = Router.of({
      path: "/stack2",
      name: "router2",
      to: "/stack2/to/1",
      routes: [
        new Route<any>({
          path: "/stack2/to/1",
          build: (router, route) => {
            component2.router = router;
            component2.params = route!.getState()?.match?.params;
            return component2;
          },
        }),
        new Route<any>({
          path: "/stack2/to/:id",
          build: (router, route) => {
            component2.url = route!.getState()?.match?.url;
            return component2;
          },
        }),
      ],
    });

    const router = new Router<any>({
      path: "/",
      isRoot: true,
      routes: [router1, router2],
    });

    router!.push("/stack1", { name: "name" });
    expect(component1.router).toBe(router1);

    component1.router!.push("/stack2", { name: "name" });
    expect(component2.router).toBe(router2);

    component2.router!.push("/stack2/to/2", { name: "name" });
    expect(component2.url).toBe("/stack2/to/2");
  });
});
