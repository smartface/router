const { Router, StackRouter } = require("../src/router/Router");
const Route = require("../src/router/Route");
const matchRoutes = require("../src/commmon/matchRoutes");

describe("Router", () => {
  it("has routes", () => {
    const router = new Router({
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
    let matches = matchRoutes([router], "/path/to/1").map(
      ({ match, route }) => ({ match, route: route.toObject(), view: route.build() })
    );
    // console.log(JSON.stringify(matches, " ", "\t"));
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
        view: {
            type: "target1"
          }
      }
    ]);
  });
  it("return false if any route doesn't be matched", () => {
    const router = new Router({
      path: "/",
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
    let matches = matchRoutes([router], "/path/to");
    expect(matches).toEqual([]);
  });
});
