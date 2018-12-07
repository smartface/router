# Smartface Router

[Read Documentation](https://smartface.github.io/router/)

# What is a Router

Router is a concept that decouples application's page-routing logic than view layer in order to make application more manageable, maintainable, easy understanding and useful.

## Types of Smartface Routers

There are 4 types of routers

- [NativeRouter](https://smartface.github.io/router/class/src/native/NativeRouter.js~NativeRouter.html)
- [NativeStackRouter](https://smartface.github.io/router/class/src/native/NativeStackRouter.js~NativeStackRouter.html)
- [NativeBottomTabBarRouter](https://smartface.github.io/router/class/src/native/BottomTabBarRouter.js~BottomTabBarRouter.html)
- NativeTopTabBarRouter (in roadmap)

## Installation

```
(cd ~/workspace/scripts && npm i @smartface/router)
```

## Usages

## Table of Contents

- [Smartface Router](#smartface-router)
- [What is a Router](#what-is-a-router)
    - [Types of Smartface Routers](#types-of-smartface-routers)
    - [Installation](#installation)
    - [Usages](#usages)
    - [Table of Contents](#table-of-contents)
        - [Getting Started](#getting-started)
            - [Basic Usage](#basic-usage)
        - [Working with StackRouter](#working-with-stackrouter)
        - [Working with BottomTabBarRouter](#working-with-bottomtabbarrouter)
        - [Working with Pages](#working-with-pages)
        - [Setting home-route to StackRouter](#setting-home-route-to-stackrouter)
        - [Send and recevice query-string](#send-and-recevice-query-string)
        - [Working with deeplinking](#working-with-deeplinking)
        - [Working with life-cycle methods](#working-with-life-cycle-methods)
            - [Usage :](#usage)
        - [Blocking Routes](#blocking-routes)
        - [Limitation](#limitation)
    - [Listening history changes](#listening-history-changes)
    - [Common features of Routers](#common-features-of-routers)
- [Contribute to Repository](#contribute-to-repository)

### Getting Started

- `NativeRouter` is the root router
- `StackRouter` is to create route stack
- `Route` is a definition of a path
- `BottomTabBarRouter` is to manage BottomTabBarController's

#### Basic Usage

```javascript
const {
  NativeRouter: Router,
  Router: RouterBase
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} = require("@smartface/router");
const Color = require("sf-core/ui/color");
const Image = require("sf-core/ui/image");

const router = Router.of({
    path: "/",
    to: "/pages/page1",
    isRoot: true,
    routes: [
        Route.of({
            path: "/pages/page1",
            build: (router, route) => {
                let Page2 = require("pages/page2");
                return new Page2();
            }
        }),
        Route.of({
            path: "/pages/page2",
            build: (router, route) => {
                const { routeData, view } = route.getState();
                let Page1 = require("pages/page1");
                return new Page1(routeData, router);
            }
        })
    ]})

// push path with data
router.push("/pages/page1");
```

### Working with StackRouter

```js
const {
  NativeRouter: Router,
  Router: RouterBase
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} = require("@smartface/router");
const Color = require("sf-core/ui/color");
const Image = require("sf-core/ui/image");

const router = Router.of({
    path: "/",
    to: "/pages/page1",
    isRoot: true,
    routes: [
        StackRouter.of({
            path: "/bottom/stack2",
            to: "/bottom/stack2/path1",
            headerBarParams: () => { ios: { translucent: false } },
            routes: [
                Route.of({
                    path: "/pages/page1",
                    build: (router, route) => {
                        let Page2 = require("pages/page2");
                        return new Page2();
                    }
                }),
                Route.of({
                    path: "/pages/page2",
                    build: (router, route) => {
                        const { routeData, view } = route.getState();
                        let Page1 = require("pages/page1");
                        return new Page1(routeData, router);
                    }
                })
            ]})
    ]});

// push path
router.push("/pages/page1");
```

### Working with BottomTabBarRouter

```js
const {
  NativeRouter: Router,
  Router: RouterBase
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} = require("@smartface/router");
const Color = require("sf-core/ui/color");
const Image = require("sf-core/ui/image");

const router = Router.of({
    path: "/",
    to: "/pages/page1",
    isRoot: true,
    routes: [BottomTabBarRouter.of({
            path: "/bottom",
            to: "/bottom/stack2/path1",
            // ui propperties of the BottomTabBarController
            tabbarParams: () => ({
                ios: { translucent: false },
                itemColor: {
                    normal: Color.RED,
                    selectd: Color.YELLOW
                },
                backgroundColor: Color.BLUE
            }),
            // tabbar items of the BottomTabBarController
            items: () => [{ title: "page1" }, { title: "page2" }, { title: "page3" }],
            // tab routes
            routes: [
                // tab 1
                StackRouter.of({
                    path: "/bottom/stack",
                    to: "/bottom/stack/path1",
                    headerBarParams: () => { ios: { translucent: false } },
                    routes: [
                        Route.of(routeBinder({
                            path: "/bottom/stack/path1",
                            build: (router, route) => new Page1(route.getState().routeData, router, "/stack/path2")
                        })),
                        Route.of(routeBinder({
                            path: "/bottom/stack/path2",
                            build: (router, route) => {
                                const { routeData, view } = route.getState();

                                return new Page2(routeData, router, "/bottom/stack2/path1");
                            }
                        }))
                    ]
                }),
                // tab 2
                StackRouter.of({
                    path: "/bottom/stack2",
                    to: "/bottom/stack2/path1",
                    headerBarParams: () => { ios: { translucent: false } },
                    routes: [
                        Route.of(routeBinder({
                            path: "/bottom/stack2/path1",
                            build: (router, route) => new Page1(route.getState().routeData, router, "/bottom/stack/path2")
                        })),
                        Route.of(routeBinder({
                            path: "/bottom/stack2/path2",
                            build: (router, route) => {
                                return new Page2(route.getState().routeData, router);
                            }
                        }))
                    ]
                }),
                // tab 3
                Route.of(routeBinder({
                    path: "/bottom/page1",
                    build: (router, route) => {
                        console.log(`route ${route}`);
                        return new Page1(route.getState().routeData, router, "/bottom/stack/path1");
                    }
                }))
            ]
        })
    ]});

// push path
router.push("/pages/page1");
```

### Working with Pages

```js
// router
const router = Router.of([
    path: "/",
    routes: [
...

    StackRouter.of({
        path: "/bottom/stack2",
        to: "/bottom/stack2/path1",
        headerBarParams: () => { ios: { translucent: false } },
        routes: [
            Route.of({
                path: "/bottom/stack2/path1",
                build: (router, route) => new Page1(route.getState().routeData, router)
            }),
            Route.of({
                path: "/bottom/stack2/path2",
                build: (router, route) => {
                    return new Page2(route.getState().routeData, router);
                }
            })
        ]
    }),

...
]})

router.push("/bottom/stack2/path1", {sort: "ASC"});

// page1.js

const extend = require("js-base/core/extend");
const System = require("sf-core/device/system");
const Application = require("sf-core/application");
const AlertView = require("sf-core/ui/alertview");

// Get generated UI code
const Page1Design = require("ui/ui_page1");

const Page1 = extend(Page1Design)(
    // Constructor
    function(_super, routeData, router) {
        // Initalizes super class for this page scope
        _super(this);
        this.onShow = onShow.bind(this, this.onShow.bind(this));
        this.sort = routeData.sort;
        this.router = router;
    }
...
    // when user clicks a button in the Page1
    function btnNext_onPress() {
        const page = this;
        this._router.push('/path/to/another', {
            message: "Hello World!"
        });
    }
```

### Setting home-route to StackRouter

StackRouter has homeRoute attribute to push before when route is matched to an another path in the router.

```js
...
    StackRouter.of({
        path: "/bottom/stack2",
        to: "/bottom/stack2/path1",
        homeRoute: 0, // it means /bottom/stack2/path
        headerBarParams: () => { ios: { translucent: false } },
        routes: [
            Route.of(routeBinder({
                path: "/bottom/stack2/path1",
                build: (router, route) => new Page1(route.getState().routeData, router, "/bottom/stack/path2")
            })),
            Route.of(routeBinder({
                path: "/bottom/stack2/path2",
                build: (router, route) => {
                    return new Page2(route.getState().routeData, router);
                }
            }))
        ]
    })
...
```

### Send and recevice query-string

```js
const route = Router.of({
...
    StackRouter.of({
        path: "/bottom/stack2",
        to: "/bottom/stack2/path1",
        homeRoute: 0, // it means /bottom/stack2/path
        headerBarParams: () => { ios: { translucent: false } },
        routes: [
            Route.of(routeBinder({
                path: "/bottom/stack2/path1",
                build: (router, route) => {
                    var sort = route.getState().query.sort;
                    return new Page1(route.getState().routeData, router, sort, "/bottom/stack/path2")
                }
            })),
            Route.of(routeBinder({
                path: "/bottom/stack2/path2",
                build: (router, route) => {
                    return new Page2(route.getState().routeData, router);
                }
            }))
        ]
    })
]})
...

router.push('/bottom/stack2/path1?sort=ASC&groupby=user')
```

### Working with deeplinking

```js
const {
  Route,
  Router: RouterBase,
  NativeRouter: Router
} = require("@smartface/router");
const DeepLinkService = require("../services/deeplink");

const deeplinkRouter = new RouterBase({
  path: "/deeplink",
  routes: [
    Route.of({
      path: "/deeplink/products/:id",
      to: (router, route) => {
        const state = route.getState();
        return "/nav/tabs/discover/products" + state.match.params.id+'/'+state.rawQuery;
      }
    }),
    Route.of({
      path: "/deeplink/product/:id",
      to: (router, route) => {
        return "/nav/product/display/" + route.getState().match.params.id;
      }
    }),
    Route.of({
      path: "/deeplink/search",
      to: "/nav/tabs/shop/searchResults"
    })
  ]
});

const router = Router.of({
    ...
    routes: [deeplinkRouter, ...],
    ...
});

Application.onReceivedNotification = function(e) {
    var receivedUrl = e.remote.url;
    // if received url has a domain like http://yourdomain.com/your/url
    // and if you can set a domain variable like
    const domain = 'http://yourdomain.com';
    // remove domain part then you can push
    receivedUrl.replace(domain, '/deeplink');
    // and new url is /deeplink/your/url.
    // if you want to check params before push
    // then you can create a router to use just redirection
    deeplinkRouter.push(receivedUrl);
    // or you can direct push the url using any another router
    router.push(receivedUrl);
};
```

### Working with life-cycle methods

Routes have some life-cycle events :

- `routeDidEnter` is life-cycle method is triggered when route is activated by exact match to the requested url
- `routeDidExit` is life-cycle method is triggered when route is deactivated by exact match to an another route
- `build` is a builder function to create view instance associated with specified router and route or not.
- `routeShouldMatch` is life-cycle method is triggered when route is matched as exact and then route will be blocked or not by return value of the method.

#### Usage :

```js
...

    Route.of({
        path: "/bottom/page1",
        routeDidEnter: (router, route) => {
            // if view is singleton and visited before
            const {view} = route.getState();
            view && view.onRouteEnter && view.onRouteEnter(router, route);
        },
        routeDidExit: (router, route) => {
            const {view} = route.getState();
            view.onRouteExit && view.onRouteExit(router, route);
        },
        routeShouldMatch: (route, nextState) => {
            if (!nextState.routeData.applied) {
                // blocks route changing
                return false;
            }
            return false;
        },
        build: (router, route) => {
            const {view} = route.getState();
            // singleton view
            return view || new Page1(route.getState().routeData, router, "/bottom/stack/path1");
        }
    })
...
```

### Blocking Routes

```js
var unload = router.addRouteBlocker((path, routeData, action, ok) => {
  alert({
    message: "Would you like to answer?",
    title: "Question", //optional
    buttons: [
      {
        text: "Yes",
        type: AlertView.Android.ButtonType.POSITIVE,
        onClick: function() {
          ok(true);
        }
      },
      {
        text: "No",
        type: AlertView.Android.ButtonType.NEGATIVE,
        onClick: function() {
          ok(false);
        }
      }
    ]
  });
});

unload();
```

### Limitation

There are several actions that user can take, which cannot be blocked by the blocker. Those cases include:

- **iOS HeaderBar**: It doesn't work with iOS default headerbar's back-button and back gesture. If you want to use in these cases, you must use custom back button and disable back gesture.
- **Bottom TabBar**: Switching between the tabs cannot be prevented.

## Listening history changes

```js
const unlisten = router.getHistory().listen((location, action) => {
  console.log(`new route action :  ${action} path : ${location.url}`);
});

unlisten();
```

## Common features of Routers

- Nested routes
- Route redirection
- Route blocking
- History listening

# Contribute to Repository

- Clone repo to workspace root folder. (Feel free to clone into the /workspace/scripts/node_modules/@smartface folder)

```
cd ~/workspace && git clone git@github.com:smartface/router.git
```

- TDD

```
npm test -- --watch
```

- Syncronize router to scripts/node_modules/@smmartface/router (If you clone repo to /scripts/node_modules and you must not use that.)

```
npm run dev:link
```

- Update documentation

```
npx esdoc
```
