# Stack Router
Stack router is the to be used as most commonly router type. It manages showing the pages in stack; A new page is shown it is added to stack. It goes back via the stack.
# Simple usage
Change the initial page of the router

```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
const mainRouter = new StackRouter({
    initialPath: "page1", //optional, if not provided first element of the routes will be used
    routes: [{
        path: "page1",
        target: require("pages/page1")
    }, {
        path: "page2",
        target: require("pages/page2")
    }]
});
Application.setupRouter(mainRouter);
```

# iOS HeaderBar
Normally Routers do not have visual components. Howerver Stack Router is similar to NavigationController for iOS. So Stack Router manages some part the HeaderBar for iOS. For more details please read [HeaderBar](./HeaderBar.md).