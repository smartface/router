# Routing order
This documment refers to [onBeforeRoute](./onBeforeRoute.md) callback
## With all routers onBeforeRoute is set
```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
const mainRouter = new StackRouter({
    routes: [{
        path: "page1",
        target: require("pages/page1")
    }, {
        path: "page2",
        target: require("pages/page2")
    }],
    onBeforeRoute: (routingOptions) => {
        console.log(routingOptions.path);
    }
});
Application.setupRouter(mainRouter);
```
Calling the code bellow
```javascript
Application.router.go("page2");
```
This will log `page2`

In a nested scenario:
```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const tab1Router = new StackRouter({
    routes: [{
        path: "page1",
        target: require("pages/page1")
    }, {
        path: "page2",
        target: require("pages/page2")
    }],
    onBeforeRoute: (routingOptions) => {
        console.log("tab1Router: "+ routingOptions.path);
    }
});

const tab2Router = new StackRouter({
    routes: [{
        path: "page3",
        target: require("pages/page3")
    }, {
        path: "page4",
        target: require("pages/page4")
    }],
    onBeforeRoute: (routingOptions) => {
        console.log("tab2Router: "+ routingOptions.path);
    }
});

const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: tab1Router,
        text: "Tab A"
    }, {
        path: "tab2",
        target: tab2Router,
        text: "Tab B"
    }],
    onBeforeRoute: (routingOptions) => {
        console.log("btbRouter: "+ routingOptions.path);
    }
});

Application.setupRouter(btbRouter);
```
Our current absolute path is `/tab1/page1`. It will not matter `page.routing.go` or `Application.router.go`
```javascript
Application.router.go("/tab1/page2");
//OR
Application.router.go("tab1/page2");
//OR
page.routing.go("/tab1/page2");
//OR
page.routing.go("page2");
//OR
page.routing.go("./page2");
```
All of them will log `tab1Router: page2`

However a different path might lead to different results (we are in `/tab1/page2` now)
```javascript
Application.router.go("/tab2/page4");
//OR
Application.router.go("tab2/page4");
//OR
page.routing.go("/tab2/page4");
//OR
page.routing.go("../tab2/page4");
```
This will first make the `btbRouter` to route. Than the corresponding path router is the `tab2Router` will route.
This will log `btbRouter: tab2` first, then `tab2Router: page4`

Going back now will behave different
```javascript
page.routing.goBack();
```
The example above This will talk with `tab2Router`, so it will log: `tab2Router: page3`

```javascript
Application.router.goBack();
```
The example above will talk with `btbRouter`, so it will log `btbRouter: tab1`

`tab1Router` currentPath was already `page2`so `page2` is shown without causing any routing effect on `tab1Router`.

```javascript
Application.router.go("tab2");
//OR
Application.router.go("/tab2");
//OR
page.routing.go("/tab2");
//OR
page.routing.go("../tab2");
```
This will log `btbRouter: tab2`

## Parent router has the onBeforeRoute set
In the previous setup all of the routers have the `onBeforeRoute` callback is set. This was also showing which router is taking action. Do not confuse the following behavior, this one is used to how the events are boubled to the top

```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const tab1Router = new StackRouter({
    routes: [{
        path: "page1",
        target: require("pages/page1")
    }, {
        path: "page2",
        target: require("pages/page2")
    }],
    //this one is kept
    onBeforeRoute: (routingOptions) => {
        console.log("tab1Router: "+ routingOptions.path);
    }
});

const tab2Router = new StackRouter({
    routes: [{
        path: "page3",
        target: require("pages/page3")
    }, {
        path: "page4",
        target: require("pages/page4")
    }]
    //this one is removed
    }
});

const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: tab1Router,
        text: "Tab A"
    }, {
        path: "tab2",
        target: tab2Router,
        text: "Tab B"
    }],
    onBeforeRoute: (routingOptions) => {
        console.log("btbRouter: "+ routingOptions.path);
    }
});

Application.setupRouter(btbRouter);
```
Our current absolute path is `/tab1/page1`. It will not matter `page.routing.go` or `Application.router.go`
```javascript
Application.router.go("/tab1/page2");
//OR
Application.router.go("tab1/page2");
//OR
page.routing.go("/tab1/page2");
//OR
page.routing.go("page2");
//OR
page.routing.go("./page2");
```
This will will log `tab1Router: page2`

```javascript
Application.router.go("/tab2/page4");
//OR
Application.router.go("tab2/page4");
//OR
page.routing.go("/tab2/page4");
//OR
page.routing.go("../tab2/page4");
```
This will log:
- `btbRouter: tab2` -> This is originally from btbRouter routing
- `btbRouter: tab2/page4` -> This is boubled up from `tab2Router` to the `btbRouter.onBeforeRoute`

```javascript
Application.router.push("/tab2/page4");
//OR
Application.router.push("tab2/page4");
//OR
page.routing.push("./page4");
//OR
page.routing.push("page4");
```
This will log `btbRouter: tab2/page4`