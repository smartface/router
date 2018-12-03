const Route = require("../src/router/Route");
const matchRoutes = require("../src/common/matchRoutes");
const createStore = require("../src/router/routeStore");

describe("Route", () => {
  it("can be matched any url", () => {
    var route = new Route({
      path: "/path/to/:id"
    });

    var res = route.matchPath("/path/to/1?type=any");
    expect(res).toEqual({
      isExact: true,
      params: { id: "1" },
      path: "/path/to/:id",
      url: "/path/to/1"
    });
  });
  it("has a path", () => {
    const route = new Route({ path: "/path" });

    expect(route.getPath().getPath()).toBe("/path");
  });

  it("has a target", () => {
    const target = {};
    const route = new Route({ path: "path", build: () => target });

    expect(route._build()).toBe(target);
  });

  it("can match with valid url", () => {
    const target = {};
    const route = new Route({
      path: "/path/to",
      routes: [
        new Route({ path: "/path/to/:id" }),
        new Route({ path: "/path/to/cenk" })
      ]
    });
    const matches = matchRoutes(createStore(), [route], "/path/to/1").map(
      ({ match, route }) => ({ match })
    );

    expect(matches).toEqual([
      {
        match: { isExact: false, params: {}, path: "/path/to", url: "/path/to" }
      },
      {
        match: {
          isExact: true,
          params: { id: "1" },
          path: "/path/to/:id",
          url: "/path/to/1"
        }
      }
    ]);
  });

  it("can run nested build methods", () => {
    const route = Route.of({
      path: "/",
      routes: [
        Route.of({
          path: "/path/to",
          build: () => {
            type: "target1";
          }
        })
      ]
    });
  });

  it("can't match with invalid url", () => {
    const target = {};
    const route = new Route({ path: "/path" });
    const match = route.matchPath("/path/to/1");
    // console.log(match);

    expect(match).toEqual({
      isExact: false,
      params: {},
      path: "/path",
      url: "/path"
    });
  });
});
