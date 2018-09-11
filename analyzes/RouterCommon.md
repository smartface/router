# Rules & Limitations

## Specific Beats General
If an event or callback is defined in a path or child router, this shadows the parent event or callback.

Escalation of the events or callback is possible.

## No dynamic router configuration
Router configuration is set during the constructor. New paths cannot be added, or paths cannot be removed or replaced.

## Routing Tree
Every router should be added to a router. Otherwise it will not be initiated. The root router should be given to the `Application`. Assigning a router to the Application or adding it as a path to another router triggers the initiation, including the nested routers. An orphan router will not trigger its own nested router initiation, until it is added to another one which links up to the Application.

Lets crate a BottomTabBar router with 3 tabs, and each of them having StackRouters. This BottomTabBar is added to a ModalRouter. This will generate a tree. In the example below most of the code is skipped.
```javascript
const dashboardRouter = new StackRouter({
    routes: [
        {dashboard: pgDashboard},
        {products: pgProducts},
        {details: pgDetails}
    ]
});
const mapRouter = new StackRouter({
    routes: [
        {map: pgMap},
        {storeDetails: pgStoreDetails}
    ]
});
const profileRouter = new StackRouter({
    routes: [
        {viewProfile: pgProfile},
        {editProfile: pgEditProfile}
    ]
});
const tabRouter = new BottomTabBarRouter({
    tabs: [
        {dasboard: dashboardRouter},
        {map: mapRouter},
        {profile: profileRouter}
    ]
});
const loginRegisterRouter = new StackRouter({
    routes: [
        {login: pgLogin},
        {register: pgRegister},
        {forgetPassword: pgForgetPassword}
    ]
});
const rootRouter = new ModalRouter({
    routes: [
        {tab: tabRouter},
        {login: loginRegisterRouter}
    ]
});
Application.setupRouter(rootRouter);
```
Tree of it will be like:
- tab
    - dashboard
        - dashboard
        - products
        - details
    - map
        - map
        - storeDetails
    - profile
        - viewProfile
        - editProfile
- login
    - login
    - register
    - forgetPassword

The leaf paths will be:
- /tab/dashboard/dashboard
- /tab/dashboard/products
- /tab/dashboard/details
- /tab/map/map
- /tab/map/storeDetails
- /tab/profile/viewProfile
- /tab/profile/editProfile
- /login/login
- /login/register
- /login/forgetPassword




# Constructor scaffold
Constructor takes a single object. That object should define the paths. For stack a-like routers `routes`, for bottom tab bar `tabs` key is used for the array of the routes.

## Target
Target can be one of the following:
- **`string`** is used for the **absolute** path for lazy loading of the module. Module is expected to export a `Page` class or intance, or another `Router` instance
- **`function`** is used for lazy loading. Return value is considered as the target. Expecting a `Page` class or instance, or another `Router` instance for the return value
- **`Page`** class
- **`Router`** instance
- **`Page`** instance. If instance is used, using the same instance to show multiple times it is reused. This can cause some problems if it is shown (already in the stack) and deveoper tries to show it again. In that case router should throw error: 
```javascript
Error("Instance cannot be shown again while it is in the stack")
```

## Path
Path is the relative path of the component to the router. Path cannot start with: `/` or `.`. Those are used for relative path resolution.
For limits of the path definition please refer to the [Path](./Path.md#limits-of-definition) guide

# Shared properties & methods & events
- _method_ go
- _callback_ onBeforeRoute
- _method_ setData
- _method_ getData
- _read-only property_ currentItem
- _read-only property_ currentPath
- _method_ getPaths
- _event_ show
- _event_ hide
- _event_ remove
- _event_ create
- _callback_ onBeforeHideTranstition
- _method_ push
- _method_ reset
- _method_ goBack
- _read-only property_ absolutePath
- _event_ noRoute

## go
`go(path [, data])`  
This changes the screen to the target path. After resolving the [path](./path.md) target router is found. Target router changes the screen accordingly.
- **path** is a `string` and required. Details of [path](./path.md) are explained in [path](./path.md) document
- **data** is an `object` and required. Its property names are considered as the keys for data, property values are considered as the values of the corresponding key. If they conflict with other data keys (such as path or existing), those will override. For more information please refer to the [data](./data.md) documentation

If it is a stack a-like router, Going to the path adds it to the stack. If the path is already in the stack, it cannot go to that path again. First it needs to be popped (goBack) from the stack.

## onBeforeRoute
`onBeforeRoute(routingOptions)`  
this callback is used to intercept route changes. If this callback is not assigned there will be no interception, everything will go according to the definition.
For more information refer to the [onBeforeRoute](./onBeforeRoute.md)

## setData
`setData(path, key[, data])`  
For the given path and the key, data is set removed. For more information please refer to [data](./data.md) documentation.
- **path** is a `string`, required.
- **key** is a `string`, required.
- **data** can be any value. If it is `undefined` key and value will be removed

Behaviour:
- Invalid path will throw `Error("Invalid Path")`
- Non existing key to remove will not cause any error.

## getData
`getData(path, key)`  
For the given path and the key, data is retrieved. For more information please refer to [data](./data.md) documentation.
- **path** is a `string`, required.
- **key** is a `string`, required.

Behaviour:
- Invalid path will throw `Error("Invalid Path")`
- Non existing key `undefined` is returned

## currentItem
`currentItem`  
Gets the currentItem value. It can be either a `Page` instance or a `Router` instance.

## currentPath
`currentPath`  
Gets the current path of the router, path as given in the constructor. For the _URI path_ variables, those variables are filled. `user/:userID` will be retrieved as `user/1234` as called in `go` method. This will not retrieve _URI query_ and _URI hash_ values.

## getPaths
`getPaths()`  
This method will return a string array `[string]` contains the list of the paths as defined in the constructor.

## show
`.on("show", function(routingOptions) {...})`  
Is called before the show event of the `Page`. In order to trigger this event, page has to be shown via the `go` method.

For more details about routingOptions please read [onBeforeRoute](./onBeforeRoute.md) guide.

## hide
`.on("hide", function(routingOptions) {...})`  
Is called after the hide event of the `Page`. In order to trigger this event, page has to be hidden via the `goBack` method.

For more details about routingOptions please read [onBeforeRoute](./onBeforeRoute.md) guide.

## remove
`.on("remove", function(instance) {...})`  
A `Page` instance created by the router, is no longer within the stack of the router. This event is called just before removing it from all of the references

## create
`.on("crate", function(instance) {...})`  
A `Page` instance is created by the router.
1. Constructor of the `Page` is called
2. `routing` property of the instnace is set
3. `load` event of the `Page` is not called yet

## onBeforeHideTranstition
`onBeforeHideTranstition(routingOptions)`  
This callback is called to get the custom exit transtition of the page in a non-tab router. If this is callback is not assigned or does not return a value, default transtition is used. For a custom transtition return value is used. For custom transtition options please read [transtition](./transtition.md) guide.

## push
`push(path [, data])`  
Push method is same as go with one difference:
- Target is added to the stack regardless being in the stack.

BottomTabBar router escalates this call.

## reset
`reset()` 
Resets the router to the initial state. Removes all pages from stack, goes back (`goBack`) as much as possible without any transtition. All data values are restored to the original state as in the constructor.

After calling this, router is in the same state as it is created right after the constructor.

## goBack
`goBack([path [, data]])`  
Goes back in the stack of the router. If it is a tab router it goes to the previous tab. (BottomTabBar router needs to keep track of the tabs)

If a router cannot go back, this action is escalted.

Returns: 
- `false` If going back is not ever possible (including escalted ones cannot goBack)
- `true` Otherwise

## absolutePath
`absolutePath`  
A `string` URI path of the router is returned. This property returns `null` if the tree is not built yet.

## noRoute
`.on("noRoute", function(routingOptions) {...})`  
Routing path has not been found in the tree.

# General behaviour

## EventEmiter
Routers are extended from EventEmiter

## Escalation
Each router is added as a child to another router. The most top level router is added to the `Applicaiton`. Some methods and events are not part of the router instance. Such as BottomTabBar router has nothing to do with `push` method. It is escalated to the parent of that router. This goes until to the top level.
In events, setting the event prevents the escalation to the upper level. Child routers can escalate this using `routing.emit` method. Example:
```javascript
rootRouter.on("show", routingOptions => {
    Analytics.add("show", routingOptions.absolutePath);
});

childRouter.on("show", routingOptions => {
    console.log(routingOptions.getData("key"));

    //Escalte
    childRouter.routing.emit("show", routingOptions);
});
```