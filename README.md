# Smartface New Router

## Simple usage
This explains how to use router at very basic level
### Initiation
This happens in `app.js`
```javascript
const Router = require("@smartface/router/src/native/NativeRouter");
const RouterBase = require("@smartface/router/src/router/Router");
const StackRouter = require("@smartface/router/src/native/NativeStackRouter");
const BottomTabBarRouter = require("@smartface/router/src/native/BottomTabBarRouter");
const Route = require("@smartface/router/src/router/Route");
const Color = require('sf-core/ui/color');
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
                ios: {translucent: false},
                itemColor: Color.RED,
                unselectedItemColor: Color.YELLOW,
                backgroundColor: Color.BLUE,
                height: 100
            }),
            items: () => [{title : "Page1"}, {title: "Page2", icon: tabbar1}],
            routes: [
                Route.of({
                    path: "/pages/page1",
                    build: (match, state, router) => {
                        let Page1 = require("pages/page1");
                        return new Page1(router);
                    }
                }),
                Route.of({
                    path: '/pages/page2',
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
                    path: '/user/login',
                    build: (match, state, router, view) => {
                        if(true){
                            return null;
                        }
                        let Page2 = require("pages/page2");
                        return new Page2({message: "user login page"}, router);
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
         buttons: [{
                 text: "Yes",
                 type: AlertView.Android.ButtonType.POSITIVE,
                 onClick: function() {
                     callback(true)
                 },
             },
             {
                 text: "No",
                 type: AlertView.Android.ButtonType.NEGATIVE,
                 onClick: function() {
                     callback(false);
                 },
             }
         ]
     });
});
```
## Listening history changes
```js
const unlisten = router.getHistory().listen((location, action) => {
    // location.state.userState
   console.log(" ---- new route action : "+action+" > "+location.pathname); 
});

unlisten();
```

## Types of Routers
There are 5 types of routers
- NativeRouter
- NativeStackRouter
- NativeBottomTabBarRouter
- NativeModalRouter (in roadmap)
- NativeSplitRouter (in roadmap)


## Common features of Routers
- Nested routes
- Route redirection
- Route blocking
- History listening

# Application
Application needs to start with a router. This is is done by setting up a router to the applicaiton.
`Application.setupRouter` method is to be developed for this.
This method takes an instance of a Router.
This method can be only called once. Otherwise it will throw an Error.

Splash screen should not be hidden before this method is called. Splash should wait the rendering of the initial screen

