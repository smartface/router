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
const Router = require("@smartface/router/src/native/NativeRouter");
const RouterBase = require("@smartface/router/src/router/Router");
const StackRouter = require("@smartface/router/src/native/NativeStackRouter");
const BottomTabBarRouter = require("@smartface/router/src/native/BottomTabBarRouter");
const Route = require("@smartface/router/src/router/Route");
const Color = require("sf-core/ui/color");
const Image = require("sf-core/ui/image");

var tabbar1 = Image.createFromFile("images://tabbar1.png");

const router = Router.of({
  path: "/",
  to: "/pages/page1",
  isRoot: true,
  routes: [
    BottomTabBarRouter.of({
      path: "/pages",
      tabbarParams: () => ({
        ios: { translucent: false },
        itemColor: Color.RED,
        unselectedItemColor: Color.YELLOW,
        backgroundColor: Color.BLUE,
        height: 100
      }),
      items: () => [{ title: "Page1" }, { title: "Page2", icon: tabbar1 }],
      routes: [
        Route.of({
          path: "/pages/page1",
          build: (match, state, router) => {
            let Page1 = require("pages/page1");
            return new Page1(router);
          }
        }),
        Route.of({
          path: "/pages/page2",
          build: (match, state, router, view) => {
            // if (view) {
            //     view.routeData = state.data;
            //     return view;
            // }

            let Page2 = require("pages/page2");
            return new Page2({}, router);
          }
        })
      ]
    }),
    StackRouter.of({
      path: "/user",
      routes: [
        Route.of({
          path: "/user/login",
          build: (match, state, router, view) => {
            // if checked is false
            if (state.data.checked) {
              // then blocks route
              return null;
            }
            let Page2 = require("pages/page2");
            return new Page2({ message: "user login page" }, router);
          }
        })
      ]
    })
  ]
});

router.push("/pages/page1");
```

## Blocking Routes

```js
router.addRouteBlocker((location, action, callback) => {
  alert({
    message: "Would you like to answer?",
    title: "Question", //optional
    buttons: [
      {
        text: "Yes",
        type: AlertView.Android.ButtonType.POSITIVE,
        onClick: function() {
          callback(true);
        }
      },
      {
        text: "No",
        type: AlertView.Android.ButtonType.NEGATIVE,
        onClick: function() {
          callback(false);
        }
      }
    ]
  });
});
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