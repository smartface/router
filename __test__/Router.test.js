const Router = require("../src/router/Router");
const Route = require("../src/router/Route");
const matchRoutes = require("../src/common/matchRoutes");

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
    // let matches = matchRoutes([router], "/path/to/1").map(
    //   ({ match, route }) => ({ match, route: route.toObject(), view: route.build() })
    // );
    var matches = router.go("/path/to/1").map(({match, route}) => ({match, route: route.toObject(), view: route.build()}));

    expect(matches).toEqual([
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
    let matches = router.go("/path/to");
    expect(matches).toEqual([]);
  });
  it("sends data and params to specified route", () => {
    let data;
    const router = new Router({
      path: "/",
      routes: [
        new Route({
          path: "/path/to/:name",
          build: (params, state) => {
            data = {
              params,
              state
            }
            return {type: "target1"}
          }
        }),
        new Route({
          path: "/path/to/dev",
          build: () => {
            type: "target2";
          }
        }),
        new Route({ path: "*", build: { type: "target3" } })
      ]
    });
    let matches = router.go("/path/to/1", {name: "name"});
    expect(data).toEqual({"params": {"name": "1"}, "state": {"data": {"name": "name"}}});
  });
  it("sends data and params to nested router's route", () => {
    let data;
    let callCount = 0;
    const router = new Router({
      path: "/",
      routes: [
        new Router({
          path: '/path',
          routes: [
            new Route({
              path: "/path/to/:name",
              build: (params, state) => {
                data = {
                  params,
                  state
                }
                callCount++;
                return {type: "target1"}
              }
            }),
            new Route({
              path: "/path/to/dev",
              build: () => {
                type: "target2";
              }
            }),
            new Route({ path: "*", build: { type: "target3" } })
          ]          
        })
      ]
    });
    
    let matches = router.go("/path/to/1", {name: "name"});
    expect(data).toEqual({"params": {"name": "1"}, "state": {"data": {"name": "name"}}});
    expect(callCount).toBe(1);
  });
});
