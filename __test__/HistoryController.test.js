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
  it("should listen child nodes", () => {
    var history = createHistory();
    var node = history.createNode();
    var _location;
    var _nodeLocation;
    history.listen((location, action) => {
      _location = location;
    });

    node.listen((location, action) => {
      _nodeLocation = location;
    });
    node.push("/path");

    expect(_nodeLocation.pathname).toBe("/path");
    expect(_location.pathname).toBe("/path");
  });

  it("can unlisten child nodes", () => {
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

    nodeUnlisten();
    node.push("/path");

    expect(_nodeLocation).toBe(undefined);
    expect(_location.pathname).toBe("/path");
  });

  it("can listen grandchild nodes", () => {
    var history = createHistory();
    var node = history.createNode();
    var grandNode = node.createNode();
    var _location;
    var _nodeLocation;
    var rootUnlisten = history.listen((location, action) => {
      _location = location;
    });

    var nodeUnlisten = node.listen((location, action) => {
      _nodeLocation = location;
    });

    grandNode.push("/path");
    grandNode.push("/path2");
    expect(_nodeLocation.pathname).toBe("/path2");
    expect(_location.pathname).toBe("/path2");
    grandNode.goBack();
    expect(_nodeLocation.pathname).toBe("/path");
    expect(_location.pathname).toBe("/path");
  });

  it("can unlisten grandchild nodes", () => {
    var history = createHistory();
    var node = history.createNode();
    var grandNode = node.createNode();
    var _location;
    var _nodeLocation;
    var rootUnlisten = history.listen((location, action) => {
      _location = location;
    });

    var nodeUnlisten = node.listen((location, action) => {
      _nodeLocation = location;
    });

    grandNode.push("/path");
    grandNode.push("/path2");
    expect(_nodeLocation.pathname).toBe("/path2");
    expect(_location.pathname).toBe("/path2");
    nodeUnlisten();
    grandNode.goBack();
    expect(_nodeLocation.pathname).toBe("/path2");
    expect(_location.pathname).toBe("/path");
  });

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
    expect(_nodeLocation.pathname).toBe("/path2");
    expect(_location.pathname).toBe("/path2");
    node.goBack();
    expect(_nodeLocation.pathname).toBe("/path");
    expect(_location.pathname).toBe("/path");
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
    node.push("/path/too");
    expect(_nodeLocation.pathname).toBe("/path/too");
    expect(_location.pathname).toBe("/path/too");
    node.goBack();
    expect(_location.pathname).toBe("/path/to");
    expect(_nodeLocation.pathname).toBe("/path/too");
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
