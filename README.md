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

There are 3 types of routers

- [NativeRouter](https://smartface.github.io/router/classes/NativeRouter.html)
- [NativeStackRouter](https://smartface.github.io/router/classes/NativeStackRouter.html)
- [NativeBottomTabBarRouter](https://smartface.github.io/router/classes/BottomTabBarRouter.html)

## ChangeLog
- 2.0.0 
  - Router module have been fully converted into TypeScript! 
- 1.2.0
  - Added Replace action to recall current route's lifecycle-methods
    - You could find more in [Replace Example](https://github.com/smartface/router-test/blob/master/scripts/routes/replace.ts)
  - Fix bug #25

## Installation
Router already comes preinstalled in the Smartface Workspace. 
If you have accidently deleted it or want to install at someplace else, use this command
```
yarn add @smartface/router
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

#### Basic Usage of [push](https://smartface.github.io/router/classes/Router.html#push) and [goBack](https://smartface.github.io/router/classes/Router.html#goBack)

##### Push a new page

```typescript
import {
  NativeRouter: Router,
  Router: RouterBase,
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} from "@smartface/router";

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

```typescript
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
            const Page = require("pages/page1");
            return new Page({ label: 1 }, router, "/pages2/page2");
          }
        }),
        Route.of({
          path: "/pages/page2",
          build: (router, route) => {
            const Page = require("pages/page1");
            return new Page({ label: 2 }, router, "/pages2/page3");
          }
        }),
        Route.of({
          path: "/pages/page3",
          build: (router, route) => {
            const Page = require("pages/page1");
            return new Page({ label: 3 }, router, "/pages2/page4");
          }
        }),
        Route.of({
          path: "/pages/page4",
          build: (router, route) => {
            const Page = require("pages/page2");
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

// page2.ts
import System from '@smartface/native/device/system';
import Application from '@smartface/native/application';
import AlertView from '@smartface/native/ui/alertview';
import { NativeStackRouter } from '@smartface/router';

import Page2Design from 'generated/page2';

export default class Page2 {
  router: any;
  constructor(data, router) {
    super();
    this._router = router;
    if (this.router instanceof NativeStackRouter) {
      this.router.setHeaderBarParams({visible: false});
    }
  }
}

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

### Working with StackRouter

```ts
import {
  NativeRouter: Router,
  Router: RouterBase,
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} from "@smartface/router";

const router = Router.of({
  path: "/",
  to: "/pages/page1",
  isRoot: true,
  routes: [
    StackRouter.of({
      path: "/bottom/stack2",
      to: "/bottom/stack2/path1",
      headerBarParams: () =>  ({ ios: { translucent: false } }),
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

```typescript
export = StackRouter.of({
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

// dismiss method may take a callback function as parameter which is called
// right after dismiss operation is completed
router.dismiss(() => router.push("/to/another/page"));
```

### Working with BottomTabBarRouter

```ts
import {
  NativeRouter: Router,
  Router: RouterBase,
  NativeStackRouter: StackRouter,
  BottomTabBarRouter,
  Route
} from "@smartface/router";
import Color from '@smartface/native/ui/color';

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
          headerBarParams: () =>  ({ ios: { translucent: false } }),
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
          headerBarParams: () =>  ({ ios: { translucent: false } }),
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

```typescript
// router
const router = Router.of({
  path: "/",
  routes: [
    StackRouter.of({
      path: "/bottom/stack2",
      to: "/bottom/stack2/path1",
      headerBarParams: () =>  ({ ios: { translucent: false } }),
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
import Page2Design from 'generated/page2';

export default class Page2 {
  sort: any;
  router: any;
  constructor(data, router) {
    super();
    this.sort = routeData.sort;
    this.router = router;
  }
}

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

```typescript
// Other stuff

StackRouter.of({
  path: "/bottom/stack2",
  to: "/bottom/stack2/path1",
  homeRoute: 0, // it means /bottom/stack2/path
  headerBarParams: () =>  ({ ios: { translucent: false } }),
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

```typescript
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
                    const sort = route.getState().query.sort;
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

```typescript
import {
    Route,
    Router: RouterBase,
    NativeRouter: Router
} from "@smartface/router";

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
    const receivedUrl = e.remote.url;
    const domain = 'http://yourdomain.com';

    // url is now equal to "/deeplink/product/12345"
    const url = receivedUrl.replace(domain, '/deeplink');

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

```typescript

Route.of({
  path: "/bottom/page1",
  routeDidEnter: (router, route) => {
    // if view is singleton and visited before
    const { view } = route.getState();
    view?.onRouteEnter && view.onRouteEnter(router, route);
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

```typescript
const unload = router.addRouteBlocker((path, routeData, action, ok) => {
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

```typescript
const unlisten = router.listen((location, action) => {
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

- Clone the repository
- Install dependencies by using `yarn` command
- Compile the project by `yarn run build` or invoke it in watch mode by `yarn run watch`
- Create a symlink in your Smartface Worksace path `scripts/node_modules/@smartface/router`.
Example command(don't forget to delete the installed lib directory): `ln -s /path/to/your/smartface/workspace/scripts/node_modules@smartface/router/lib /path/to/your/router/installation/lib`

> You can also use NPM Workspaces feature to link two directories. However, this method will cause your `node_modules` files to merge and the development environment will increase in size dramatically.

## Test Driven Development(TDD)
Tests will run on before every publish and all of the test cases are required to pass before a new version can be published.
```
yarn test -- --watch
```

## Update Documentation

Documentation will be updated every time when changes are pushed into the `master` branch. 
To do it manually or oversee the documentation beforehand:

```
yarn run docs
open ./docs/index.html // Mac Only
```
