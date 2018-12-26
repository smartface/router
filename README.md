# Smartface Router

- [Read API Documentation](https://smartface.github.io/router/)
- [Router Playground](https://github.com/smartface/router-test)

# What is a Router

Router is a concept that decouples application's page-routing logic than view layer in order to make application more

- Manageable
- Maintainable
- Flexible for future growth and change
- Readable
- Useful

## Types of Smartface Routers

There are 4 types of routers

- [NativeRouter](https://smartface.github.io/router/class/src/native/NativeRouter.js~NativeRouter.html)
- [NativeStackRouter](https://smartface.github.io/router/class/src/native/NativeStackRouter.js~NativeStackRouter.html)
- [NativeBottomTabBarRouter](https://smartface.github.io/router/class/src/native/BottomTabBarRouter.js~BottomTabBarRouter.html)
- NativeTopTabBarRouter (in roadmap)

## ChangeLog

- 1.2.0

  - Added Replace action to recall current route's lifescycle-methods
    - You could find more in [Replace Example](https://github.com/smartface/router-test/blob/master/scripts/routes/replace.js)
  - Fix bug #25

## Installation

```
(cd ~/workspace/scripts && npm i @smartface/router)
```

## Table of Contents

- [Smartface Router](#smartface-router)
  - [ChangeLog](#changelog)
- [What is a Router](#what-is-a-router)
  - [Types of Smartface Routers](#types-of-smartface-routers)
  - [Installation](#installation)
  - [Table of Contents](#table-of-contents)
    - [Getting Started](#getting-started)
      - [Basic Usage of push and goBack](#basic-usage-of-push-and-goback)
        - [Push a new page](#push-a-new-page)
        - [Go back to a desired page in same history stack](#go-back-to-a-desired-page-in-same-history-stack)
      - [Replace active route's view using Replace action](#replace-active-routes-view-using-replace-action)
    - [Working with StackRouter](#working-with-stackrouter)
      - [Present & dismiss StackRouter's view as modal](#present--dismiss-stackrouters-view-as-modal)
    - [Working with BottomTabBarRouter](#working-with-bottomtabbarrouter)
    - [Working with Pages](#working-with-pages)
    - [Setting home-route to StackRouter](#setting-home-route-to-stackrouter)
    - [Send and recevice query-string](#send-and-recevice-query-string)
    - [Working with deeplinking](#working-with-deeplinking)
    - [Working with life-cycle methods](#working-with-life-cycle-methods)
    - [Blocking Routes](#blocking-routes)
    - [Limitations of blockers](#limitations-of-blockers)
  - [Listening history changes](#listening-history-changes)
  - [Common features of Routers](#common-features-of-routers)
- [Contribute to Repository](#contribute-to-repository)

### Getting Started

- `NativeRouter` is the root router
- `StackRouter` is to create route stack
- `Route` is a definition of a path
- `BottomTabBarRouter` is to manage BottomTabBarController's

#### Basic Usage of [push](https://smartface.github.io/router/class/src/router/Router.js~Router.html#instance-method-push) and [goBack](https://smartface.github.io/router/class/src/router/Router.js~Router.html#instance-method-goBack)

##### Push a new page

```javascript
const {
  NativeRouter: Router,
  Router: RouterBase
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} = require("@smartface/router");

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

// push path
router.push("/pages/page1");
```

##### Go back to a desired page in same history stack

goBack method is functional only if it's used on a StackRouter. And if provided,
related page of the url parameter must be in the same stack history. Otherwise
goBack does nothing.

```js
// Add essential require statements

const router = Router.of({
  path: "/",
  isRoot: true,
  routes: [
    StackRouter.of({
      path: "/pages",
      routes: [
        Route.of({
          path: "/pages/page1",
          build: (router, route) => {
            let Page = require("pages/page1");
            return new Page({ label: 1 }, router, "/pages2/page2");
          }
        }),
        Route.of({
          path: "/pages/page2",
          build: (router, route) => {
            let Page = require("pages/page1");
            return new Page({ label: 2 }, router, "/pages2/page3");
          }
        }),
        Route.of({
          path: "/pages/page3",
          build: (router, route) => {
            let Page = require("pages/page1");
            return new Page({ label: 3 }, router, "/pages2/page4");
          }
        }),
        Route.of({
          path: "/pages/page4",
          build: (router, route) => {
            let Page = require("pages/page2");
            return new Page({}, router, -2);
          }
        })
      ]
    })
  ]
});

router.push("/pages/page1");
router.push("/pages/page2");
router.push("/pages/page3");
router.push("/pages/page4");

// page2.js

const Page2 = extend(Page2Design)(
  // Constructor
  function(_super, data, router, back = -1) {
    // Initalizes super class for this page scope
    _super(this);
    this.back - back;
    this.router = router;
    // Overrides super.onShow method
    this.onShow = onShow.bind(this, this.onShow.bind(this));
    // Overrides super.onLoad method
    this.onLoad = onLoad.bind(this, this.onLoad.bind(this));
  }
);

// Other stuff

function btn_onPress() {
  // Go back "/pages/page1" which is in history stack
  this.router.goBacktoUrl("/pages/page1");
  // Go to the first page in the stack
  this.router.goBacktoHome();
  // Go 3 steps back
  this.router.goBackto(-3);

  // Test if router can go 2 steps back
  if (this.router.canGoBack(-2)) {
    // do something
  } else if (this.router.canGoBacktoUrl("/some/path/to/back")) {
    // do something else
  } else {
    // do something else
  }
}
```

#### Replace active route's view using Replace action

Replace action provides rerendering for opened route.
You could find more in [Replace Example](https://github.com/smartface/router-test/blob/master/scripts/routes/replace.js)

### Working with StackRouter

```js
const {
  NativeRouter: Router,
  Router: RouterBase,
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} = require("@smartface/router");

const router = Router.of({
  path: "/",
  to: "/pages/page1",
  isRoot: true,
  routes: [
    StackRouter.of({
      path: "/bottom/stack2",
      to: "/bottom/stack2/path1",
      headerBarParams: () => {
        ios: {
          translucent: false;
        }
      },
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
      ]
    })
  ]
});

// Go to page1
router.push("/pages/page1");
```

#### Present & dismiss StackRouter's view as modal

```js
module.exports = StackRouter.of({
  path: "/example/modal",
  to: "/example/modal/page1",
  routes: [
    StackRouter.of({
      path: "/example/modal/modalpages",
      modal: true,
      routes: [
        Route.of({
          path: "/example/modal/modalpages/page1",
          build: (router, route) => {
            let Page = require("pages/page1");
            return new Page({ label: 1 }, router);
          }
        }),
        Route.of({
          path: "/example/modal/modalpages/page2",
          build: (router, route) => {
            let Page = require("pages/page2");
            return new Page({ label: 2 }, router);
          }
        })
      ]
    })
  ]
});

// To close a modal StackRouter, call dismiss method
router.dismiss();

<<<<<<< HEAD
// dismiss method may take a callback function as parameter which is called
// right after dismiss operation is completed
router.dismiss(() => router.push("/to/another/page"));
=======
// If you want to push a new page while router does dismissing.
// You can use a callback by passing to dismiss method
// to propagate in series.
router.dismiss(() => router.push('/to/another/page'));
>>>>>>> Fix #25
```

### Working with BottomTabBarRouter

```js
const {
  NativeRouter: Router,
  Router: RouterBase,
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} = require("@smartface/router");
const Color = require("sf-core/ui/color");

const router = Router.of({
  path: "/",
  to: "/pages/page1",
  isRoot: true,
  routes: [
    BottomTabBarRouter.of({
      path: "/bottom",
      to: "/bottom/stack2/path1",
      // UI propperties of the BottomTabBarController
      tabbarParams: () => ({
        ios: { translucent: false },
        itemColor: {
          normal: Color.RED,
          selected: Color.YELLOW
        },
        backgroundColor: Color.BLUE
      }),
      // TabBarItem's of the BottomTabBarController
      items: () => [{ title: "page1" }, { title: "page2" }, { title: "page3" }],
      // tab routes
      routes: [
        // tab 1
        StackRouter.of({
          path: "/bottom/stack",
          to: "/bottom/stack/path1",
          headerBarParams: () => {
            ios: {
              translucent: false;
            }
          },
          routes: [
            Route.of({
              path: "/bottom/stack/path1",
              build: (router, route) =>
                new Page1(route.getState().routeData, router, "/stack/path2")
            }),
            Route.of({
              path: "/bottom/stack/path2",
              build: (router, route) => {
                const { routeData, view } = route.getState();

                return new Page2(routeData, router, "/bottom/stack2/path1");
              }
            })
          ]
        }),
        // tab 2
        StackRouter.of({
          path: "/bottom/stack2",
          to: "/bottom/stack2/path1",
          headerBarParams: () => {
            ios: {
              translucent: false;
            }
          },
          routes: [
            Route.of({
              path: "/bottom/stack2/path1",
              build: (router, route) =>
                new Page1(
                  route.getState().routeData,
                  router,
                  "/bottom/stack/path2"
                )
            }),
            Route.of({
              path: "/bottom/stack2/path2",
              build: (router, route) => {
                return new Page2(route.getState().routeData, router);
              }
            })
          ]
        }),
        // tab 3
        Route.of({
          path: "/bottom/page1",
          build: (router, route) => {
            console.log(`route ${route}`);
            return new Page1(
              route.getState().routeData,
              router,
              "/bottom/stack/path1"
            );
          }
        })
      ]
    })
  ]
});

// Go to page1
router.push("/pages/page1");
```

### Working with Pages

```js
// router
const router = Router.of({
  path: "/",
  routes: [
    StackRouter.of({
      path: "/bottom/stack2",
      to: "/bottom/stack2/path1",
      headerBarParams: () => {
        ios: {
          translucent: false;
        }
      },
      routes: [
        Route.of({
          path: "/bottom/stack2/path1",
          build: (router, route) =>
            new Page1(route.getState().routeData, router)
        }),
        Route.of({
          path: "/bottom/stack2/path2",
          build: (router, route) => {
            return new Page2(route.getState().routeData, router);
          }
        })
      ]
    })
  ]
});

router.push("/bottom/stack2/path1", { sort: "ASC" });

// page1.js

const extend = require("js-base/core/extend");

// Get generated UI code
const Page1Design = require("ui/ui_page1");

const Page1 = extend(Page1Design)(
  // Constructor
  function(_super, routeData, router) {
    // Initalizes super class for this page scope
    _super(this);
    this.sort = routeData.sort;
    this.router = router;
  }
);

// Other stuff

// When btnNext is pressed in Page1
function btnNext_onPress() {
  const page = this;
  page.router.push("/path/to/another", {
    message: "Hello World!"
  });
}
```

### Setting home-route to StackRouter

**homeRoute** property of StackRouter is the index of the first route in the stack.

```js
// Other stuff

StackRouter.of({
  path: "/bottom/stack2",
  to: "/bottom/stack2/path1",
  homeRoute: 0, // it means /bottom/stack2/path
  headerBarParams: () => {
    ios: {
      translucent: false;
    }
  },
  routes: [
    Route.of({
      path: "/bottom/stack2/path1",
      build: (router, route) =>
        new Page1(route.getState().routeData, router, "/bottom/stack/path2")
    }),
    Route.of({
      path: "/bottom/stack2/path2",
      build: (router, route) => {
        return new Page2(route.getState().routeData, router);
      }
    })
  ]
});

// Other stuff
```

### Send and recevice query-string

```js
const route = Router.of({
    StackRouter.of({
        path: "/bottom/stack2",
        to: "/bottom/stack2/path1",
        homeRoute: 0, // it means /bottom/stack2/path
        headerBarParams: () => { ios: { translucent: false } },
        routes: [
            Route.of({
                path: "/bottom/stack2/path1",
                build: (router, route) => {
                    var sort = route.getState().query.sort;
                    return new Page1(route.getState().routeData, router, sort, "/bottom/stack/path2")
                }
            }),
            Route.of({
                path: "/bottom/stack2/path2",
                build: (router, route) => {
                    return new Page2(route.getState().routeData, router);
                }
            })
        ]
    })
});

router.push('/bottom/stack2/path1?sort=ASC&groupby=user')
```

### Working with deeplinking

```js
const {
    Route,
    Router: RouterBase,
    NativeRouter: Router
} = require("@smartface/router");

const deeplinkRouter = new RouterBase({
    path: "/deeplink",
    routes: [
        Route.of({
            path: "/deeplink/products/:id",
            to: (router, route) => {
                const state = route.getState();
                return "/nav/tabs/discover/products" + state.match.params.id + '/' + state.rawQuery;
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
    ///
    routes: [deeplinkRouter, ...]
    ///
});

// Handle push notification
Application.onReceivedNotification = function(e) {
    // assume that receivedUrl is equal to "http://yourdomain.com/product/12345"
    var receivedUrl = e.remote.url;
    const domain = 'http://yourdomain.com';

    // url is now equal to "/deeplink/product/12345"
    var url = receivedUrl.replace(domain, '/deeplink');

    deeplinkRouter.push(receivedUrl);

    // or you can directly push the url using any other router
    router.push(receivedUrl);
};
```

### Working with life-cycle methods

Routes have some life-cycle events :

- `routeDidEnter` is triggered when route is activated by exact match to the requested url
- `routeDidExit` triggered when route is deactivated by exact match to an another route
- `build` is a builder function to create view instance associated with specified router and route or not
- `routeShouldMatch` is triggered when route is matched as exact and then route will be blocked or not by regarding the return value of the method

```js
///

Route.of({
  path: "/bottom/page1",
  routeDidEnter: (router, route) => {
    // if view is singleton and visited before
    const { view } = route.getState();
    view && view.onRouteEnter && view.onRouteEnter(router, route);
  },
  routeDidExit: (router, route) => {
    const { view } = route.getState();
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
    const { view } = route.getState();
    // singleton view
    return (
      view ||
      new Page1(route.getState().routeData, router, "/bottom/stack/path1")
    );
  }
});

///
```

### Blocking Routes

```js
var unload = router.addRouteBlocker((path, routeData, action, ok) => {
  alert({
    message: "Would you like to answer?",
    title: "Question",
    buttons: [
      {
        text: "Yes",
        type: AlertView.Android.ButtonType.POSITIVE,
        onClick: () => {
          ok(true);
        }
      },
      {
        text: "No",
        type: AlertView.Android.ButtonType.NEGATIVE,
        onClick: () => {
          ok(false);
        }
      }
    ]
  });
});

unload();
```

### Limitations of blockers

Following cases cannot be handled by the blocker:

- **iOS HeaderBar**: Back gesture of the page & back button action of HeaderBar cannot be prevented. If user wants to use blockers in these cases, custom back button must be used.
- **BottomTabBar**: Switching between tabs cannot be prevented

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

- Clone repository to root folder of the workspace

```
cd ~/workspace && git clone git@github.com:smartface/router.git
```

- TDD

```
cd ~/workspace/router
npm test -- --watch
```

- Syncronize router to _scripts/node_modules/@smartface/router_

```
cd ~/workspace/router
npm run dev:link
```

- Update documentation

```
cd ~/workspace/router
npx esdoc
```
