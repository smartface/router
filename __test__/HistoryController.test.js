const Router = require("../src/router/Router");
const Route = require("../src/router/Route");
const matchRoutes = require("../src/common/matchRoutes");
const createHistory = require("../src/common/createHistory");

describe("HistoryController", () => {
  afterEach(() => {
    // Router.unloadHistory();
  });

  it("can create nested nodes", () => {
    var history = createHistory();
    var node = history.createNode();
    expect(node.constructor.name).toBe("HistoryController");
  });

  it("can check url is valid or not", () => {
    let history = createHistory({ path: "/path" });
    expect(history.canPush("/path")).toBe(true);

    history = createHistory({ path: "/path1" });
    expect(history.canPush("/path")).toBe(false);

    history = createHistory({ path: "/path1" });
    expect(history.canPush("/path2")).toBe(false);

    history = createHistory({ path: "/path/subpath" });
    expect(history.canPush("/path")).toBe(false);

    history = createHistory({ path: "/path" });
    expect(history.canPush("/path/subpath")).toBe(true);
  });

  it("should be fires an event when route is changed", () => {
    var history = createHistory();
    var _location;
    history.listen((location, action) => {
      _location = location;
    });

    history.push("/path");

    expect(_location.url).toBe("/path");
  });

  it("cannot be affected when children's state is chenged", () => {
    var history = createHistory();
    var node = history.createNode();
    var node2 = history.createNode();
    var node3 = history.createNode();
    [node, node2, node3].forEach(listen);
    var res = [];
    var rootUnlisten = history.listen((location, action) => {
      res.push(location.url);
    });

    function listen(node) {
      node.listen((location, action) => {
        res.push(location.url);
      });
    }

    node.push("/path");
    node2.push("/path2");
    node3.push("/path3");

    expect(res).toEqual(["/path", "/path2", "/path3"]);
  });

  // it("can listen grandchild nodes", () => {
  //   var history = createHistory();
  //   var node = history.createNode();
  //   var grandNode1 = node.createNode();
  //   var grandNode2 = node.createNode();w
  //   var res = [];

  //   [history, grandNode1, grandNode2, node].forEach(listen);

  //   function listen(node) {
  //     node.listen((location, action) => {
  //       res.push(location.url);
  //     });
  //   }

  //   grandNode1.push("/path");
  //   grandNode1.push("/path2");
  //   grandNode2.push("/path3");
  //   grandNode2.push("/path4");
  //   grandNode1.goBack();
  //   grandNode2.goBack();

  //   expect(res).toEqual([
  //     "/path",
  //     "/path",
  //     "/path",
  //     "/path2",
  //     "/path2",
  //     "/path2",
  //     "/path3",
  //     "/path3",
  //     "/path3",
  //     "/path4",
  //     "/path4",
  //     "/path4",
  //     "/path",
  //     "/path",
  //     "/path",
  //     "/path3",
  //     "/path3",
  //     "/path3"
  //   ]);
  // });

  // it("can unlisten grandchild nodes", () => {
  //   var history = createHistory();
  //   var node = history.createNode();
  //   var grandNode = node.createNode();
  //   var _location;
  //   var _nodeLocation;
  //   var rootUnlisten = history.listen((location, action) => {
  //     _location = location;
  //   });

  //   var nodeUnlisten = node.listen((location, action) => {
  //     _nodeLocation = location;
  //   });

  //   grandNode.push("/path");
  //   grandNode.push("/path2");
  //   expect(_nodeLocation.url).toBe("/path2");
  //   expect(_location.url).toBe("/path2");
  //   nodeUnlisten();
  //   grandNode.goBack();
  //   expect(_nodeLocation.url).toBe("/path2");
  //   expect(_location.url).toBe("/path");
  // });

  it("can go back", () => {
    var history = createHistory();
    var node = history.createNode();
    var _location;
    var _nodeLocation;
    var rootUnlisten = history.listen((location, action) => {
      _location = location;
    });

    var nodeUnlisten = node.listen((location, action) => {
      _nodeLocation = location;
    });

    node.push("/path");
    node.push("/path2");
    expect(_nodeLocation.url).toBe("/path2");
    node.goBack();
    expect(_nodeLocation.url).toBe("/path");
  });

  it("can't go back if history is empty", () => {
    var history = createHistory();
    var node = history.createNode();
    var _location;
    var _nodeLocation;
    var counter = 0;
    var rootUnlisten = history.listen((location, action) => {
      _location = location;
      counter++;
    });

    var nodeUnlisten = node.listen((location, action) => {
      _nodeLocation = location;
      counter++;
    });

    node.goBack();
    expect(counter).toBe(0);
    expect(_nodeLocation).toBe(undefined);
    expect(_location).toBe(undefined);
  });

  it("can call parent go back if node history is empty", () => {
    var history = createHistory();
    var node = history.createNode();
    var _location;
    var _nodeLocation;
    var counter = 0;
    var rootUnlisten = history.listen((location, action) => {
      _location = location;
      counter++;
    });

    var nodeUnlisten = node.listen((location, action) => {
      _nodeLocation = location;
      counter++;
    });
    history.push("/path/to");
    history.push("/path/to/2");
    node.push("/path/too");
    expect(_nodeLocation.url).toBe("/path/too");
    expect(_location.url).toBe("/path/to/2");
    node.goBack();
    expect(_location.url).toBe("/path/to");
    expect(_nodeLocation.url).toBe("/path/too");
  });
  it("can dispose", () => {
    var history = createHistory();
    var node = history.createNode();
    var _location;
    var _nodeLocation;
    var rootUnlisten = history.listen((location, action) => {
      _location = location;
    });

    var nodeUnlisten = node.listen((location, action) => {
      _nodeLocation = location;
    });
    history.dispose();
    expect(() => history.push("/path/to")).toThrow();
    expect(() => node.push("/path/too")).toThrow();
    expect(_nodeLocation).toBe(undefined);
    expect(_location).toBe(undefined);
  });
});
