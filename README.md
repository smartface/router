# Smartface Router

[Read Documentation](https://smartface.github.io/router/)

# What is a Router

Router is a concept that separates routing/navigation and the pages/views.

## Types of Smartface Routers

There are 5 types of routers

- [NativeRouter](https://smartface.github.io/router/class/src/native/NativeRouter.js~NativeRouter.html)
- [NativeStackRouter](https://smartface.github.io/router/class/src/native/NativeStackRouter.js~NativeStackRouter.html)
- [NativeBottomTabBarRouter](https://smartface.github.io/router/class/src/native/BottomTabBarRouter.js~BottomTabBarRouter.html)
- NativeModalRouter (in roadmap)
- NativeSplitRouter (in roadmap)

## Installation

```
(cd ~/workspace/scripts && npm i @smartface/router)
```

## Common Usage

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
    to: "/pages/page2",
    isRoot: true,
    routes: [
        Route.of(routeBinder({
            path: "/pages/page2",
            build: (match, state) => {
                let Page2 = require("pages/page2");
                return new Page2();
            }
        })),
        Route.of(routeBinder({
            path: "/pages/:name([0-9]*)",
            build: (router, route) => {
                const { routeData, view } = route.getState();
                let Page1 = require("pages/page1");
                return new Page1(routeData, router);
            }
        })),
        StackRouter.of({
            path: "/stack",
            to: "/stack/path1",
            headerBarParams: () => { ios: { translucent: true } },
            routes: [
                Route.of(routeBinder({
                    path: "/stack/path1",
                    build: (match, state, router) => new Page1(state.data, router)
                })),
                Route.of(routeBinder({
                    path: "/stack/path2",
                    routeShouldMatch: (route, nextState) => {
                        if (!nextState.routeData.applied) {
                            // blocks route changing
                            return false;
                        }
                        return false;
                    },
                    build: (router, route) => {
                        const { routeData, view } = route.getState();
                        return new Page2(routeData, router);
                    }
                }))
            ]
        }),
        BottomTabBarRouter.of({
            path: "/bottom",
            to: "/bottom/stack2/path1",
            tabbarParams: () => ({
                ios: { translucent: false },
                itemColor: Color.RED,
                unselectedItemColor: Color.YELLOW,
                backgroundColor: Color.BLUE
            }),
            items: () => [{ title: "page1" }, { title: "page2" }, { title: "page3" }],
            routes: [
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
                Route.of(routeBinder({
                    path: "/bottom/page1",
                    build: (router, route) => {
                        console.log(`route ${route}`);
                        return new Page1(route.getState().routeData, router, "/bottom/stack/path1");
                    }
                }))
            ]
        })
    ]
});

function routeBinder(params){

    return Object.assign({},
        params,
        {
            routeDidEnter: (router, route) => {
                const {view} = route.getState();
                view.onRouteEnter && view.onRouteEnter(router, route);
                params.routeDidEnter && params.routeDidEnter(router, route)
            },
            routeDidExit: (router, route) => {
                const {view} = route.getState();
                view.onRouteExit && view.onRouteExit(router, route);
                params.routeDidExit && params.routeDidExit(router, route)
            }
        });
}

const unlisten = router.listen((location, action) => {
    // location.state.userState
    console.log(` ---- new route location: ${location.pathname}`);
});

router.push("/bottom");
```

## Blocking Routes

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
  console.log(`new route action :  ${action} path : ${location.pathname}`);
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
