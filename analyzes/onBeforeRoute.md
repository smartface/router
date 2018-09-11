# onBeforeRoute
This callback might be set for the router or to the route or tab. This callback is called in hierarchical order.

Please read [Routing Order](./routing-order.md) first.

Returning, resolving of all `onBeforeRoute` callbacks are required before stating to change the screen.

# What can be done within the callback
- May Change the path to a different path
- May Cancel the routing action
- May Add, remove, modify data
- If possible: Change page opening transtition animation

**The setup**
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
        target: require("pages/page2"),
        enterTranstition: (routingOptions) => "developer defined transtition"
    }],
    onBeforeRoute: tab1OnBeforeRoute
});

const tab2Router = new StackRouter({
    routes: [{
        path: "page3",
        target: require("pages/page3")
    }, {
        path: "page4",
        target: require("pages/page4")
    }]
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
    onBeforeRoute: btbOnBeforeRoute
});

Application.setupRouter(btbRouter);
```

`tab1OnBeforeRoute` and `btbOnBeforeRoute` methods will be set differently on each example. If they are not set in the example scope, assume they are not assigned

## Change path
```javascript
tab1OnBeforeRoute = routingOptions => {
    console.log("tab1Router: "+ routingOptions.path);
    if(routingOptions.path === "page2" && !userLoggedIn) {
     routingOptions.path = "/tab2/page4";
    }
};

btbOnBeforeRoute = routingOptions => {
    console.log("btbRouter: "+ routingOptions.path);
};
```
```javascript
userLoggedIn = false;
page.routing.go("page2");
```
This will log in order:
- `tab1Router: page2`
- `btbRouter: tab2`
- `btbRouter: tab2/page4`

The implementation should check the `path` value of the `routingOptions` after exiting the callback. If the value is changed the new path is used for new routing with original `data` argument which is passed to the `.go` method

## Cancelling routing
```javascript
tab1OnBeforeRoute = routingOptions => {
    console.log("tab1Router: "+ routingOptions.path);
    if(routingOptions.path === "page2" && !userLoggedIn) {
        return false;
    }
};

btbOnBeforeRoute = routingOptions => {
    console.log("btbRouter: "+ routingOptions.path);
};
```
```javascript
userLoggedIn = false;
page.routing.go("page2");
```
This will log in order:
- `tab1Router: page2`

Returning boolean `false` within the callback will cancel the routing.

## Modify Data
It is possible to use `.getData` and `.setData` methods as in the [routing](./routing) property.
```javascript
tab1OnBeforeRoute = routingOptions => {
    let userLoggedIn = routingOptions.getData("userLoggedIn");
    if(routingOptions.path === "page2" && !userLoggedIn) {
        return false;
    }
};
```
```javascript
page.routing.go("page2", {
    userLoggedIn: false
});
```
Remember that `.getData` and `.setData` methods are already bound with the original absolute path. If the path is changed, `.getData` and `.setData` methods will still work on the original path.

## Change opening animation
```javascript
tab1OnBeforeRoute = routingOptions => {
    console.log("tab1Router: "+ routingOptions.path);
    if(routingOptions.path === "page2") {
        if(!userLoggedIn)
            return false;
        console.log(routingOptions.enterTranstition);
        routingOptions.enterTranstition = "One from transtition options";
    }
};

btbOnBeforeRoute = routingOptions => {
    console.log("btbRouter: "+ routingOptions.path);
};
```
```javascript
userLoggedIn = true;
page.routing.go("page2");
```
This will log `"developer defined transtition"`

## Manually bouble-up
```javascript
tab1OnBeforeRoute = routingOptions => {
    console.log("tab1Router: "+ routingOptions.path);
    if(routingOptions.path === "page2" && !userLoggedIn) {
        return routingOptions.routing.onBefoureRoute(routingOptions);

    }
};

btbOnBeforeRoute = routingOptions => {
    console.log("btbRouter: "+ routingOptions.path);
    if(routingOptions.path === "page2")
        return false;
};
```
```javascript
userLoggedIn = false;
page.routing.go("page2");
```
This will log in order:
- `tab1Router: page2`
- `btbRouter: page2`

## Change in HeaderBar
```javascript
tab1OnBeforeRoute = routingOptions => {
    if(routingOptions.path === "page2") {
        routingOptions.headerBar.visible = false; //this handles iOS
        //for android it needs to be done within the page; might set data to do in page:
        routingOptions.setData("androidShouldHideHeaerBar", true);
    }
};
```

# routingOptions
`routingOptions` argument is automatically passed both `onBeforeRoute` and `onBeforeHideTranstition` callbacks and all callback events in [scaffold](./Scaffold.md).

`routingOptions` argument is slightly modified version of [routing](./routing.md) property. It contains all features of routing with slight modifications:

- path
- Transitions: `enterTranstition`, `exitTranstition`
- BottomTabBar related:
    - badge
    - text
    - icon
    - font
    - textColor
    - dispatch

## path
- path can be modified if it passed to the `onBeforeRoute` callback, modified version is used in the future
- path is read-only in all other scenarios

## transtition
`enterTranstition` and `exitTranstition` properties are always present for non-tab routers. Those values are the **System defaults**; those might be different for iOS and Android.

Only the `onBeforeRoute` and `onBeforeHideTranstition` callbacks can set those values, otherwise they are read-only.

If `enterTranstition` and `exitTranstition` are present within the [scaffold](./Scaffold.md) those values are retrieved instead of the _System Defaults_.

If `onBeforeRoute` has changed any of the `enterTranstition` and `exitTranstition` values, that value is read from that on. Such as `onBeforeHideTranstition` will get the value what is set within `onBeforeRoute`.

## BottomTabBar
Similar to the [scaffold of the BottomTabBar](./BottomTabBarRouter.md#tab-scaffold).

`dispatch` can be used because it is already context bound

