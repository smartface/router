# Single router to rule them all
Routers are not initialized until one of them is added to the `Applicaiton`.
`Applicaiton.setupRouter(router)` takes a router instance. Until this method is called no page will be shown, application should remain in the splash. If the execution of the `app.js` is finished and and `Applicaiton.setupRouter` is not called:
1. A **black** screen is shown
2. `Error("No router is set up")` is thrown

After setting the router, that router can be accessed via the read-only property `Application.router`.

Calling the `Applicaiton.router.go("absolute path")` will go the target screen. This will cause:
1. Finding all nested routers in the absolute path
2. Making them `.go` to the designated path one by one in order from top to bottom in the tree.

`Application.router.goBack()` will just do fine with finding the active leaf router and go back.

`Application.router.on("event", function() {})` and `Application.router.onBeforeRouting` will be triggered for any child router activity.

The behaviour for the Application level router is applied to all of its childs. So lets assume there is 3 levels of routers:
- rootRouter: Modal
    - mainRouter: Tab
        - dashboardRouter: Stack

A routing event on the dashboardRouter will trigger the event from bottom to top.