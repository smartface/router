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
    - [Current route state](#current-route-state)
    - [Listening history changes](#listening-history-changes)
      - [Replace active route's view using Replace action](#replace-active-routes-view-using-replace-action)
    - [Modal Page](#modal-page)
      - [Present & dismiss StackRouter's view as modal](#present--dismiss-stackrouters-view-as-modal)
      - [Navigating between different stacks](#navigating-between-different-stacks)
      - [iOS Specific Bottom Sheet](#ios-specific-bottom-sheet)
        - [How to define bottom sheet route on Smartface](#how-to-define-bottom-sheet-route-on-smartface)
    - [Working with BottomTabBarRouter](#working-with-bottomtabbarrouter)
    - [Working with Pages](#working-with-pages)
        -[Extending the onLoad and onShow method of the page](#extending-the-onload-and-onshow-method-of-the-page)
    - [Setting home-route to StackRouter](#setting-home-route-to-stackrouter)
    - [How to get the instance of current page on elsewhere in project](#how-to-get-the-instance-of-current-page-on-elsewhere-in-project)
    - [Working with deeplinking](#working-with-deeplinking)
    - [Working with life-cycle methods](#working-with-life-cycle-methods)
    - [Blocking Routes](#blocking-routes)
    - [Limitations of blockers](#limitations-of-blockers)
  - [Common features of Routers](#common-features-of-routers)
- [Contribute to Repository](#contribute-to-repository)

## Getting Started

When you created a new Smartface project by using our default [Helloworld-Boilerplate](https://github.com/smartface/helloworld-boilerplate) project, a simple routing logic already comes preconfigured inside of it. Let's examine that to take the first steps with the routing of Smartface projects.

Firstly, we can check for all router-related stuff on the file structure. The first file we will have an eye on is placed under the **scripts/routes/index.ts**.

```typescript
import { NativeRouter, NativeStackRouter, Route } from '@smartface/router';
import * as Pages from 'pages';
import Application from '@smartface/native/application';

Application.on(Application.Events.BackButtonPressed, () => {
    NativeRouter.getActiveRouter()?.goBack();
});

const router = NativeRouter.of({
  path: '/',
  isRoot: true,
  routes: [
    NativeStackRouter.of({
      path: '/pages',
      routes: [
        Route.of<Pages.Page1>({
          path: '/pages/page1',
          build(router, route) {
            return new Pages.Page1(router, route);
          }
        }),
        Route.of<Pages.Page2>({
          path: '/pages/page2',
          build(router, route) {
            return new Pages.Page2(router, route);
          },
        }),
        NativeStackRouter.of({
          path: '/pages/page3',
          to: '/pages/page3/main',
          modal: true,
          routes: [
            Route.of<Pages.Page3>({
              path: '/pages/page3/main',
              build(router, route) {
                return new Pages.Page3(router, route);
              }
            })
          ]
        })
      ]
    })
  ]
});

export default router;
```

Though it looks like a complex set of definitions at the start, for now, I only want to point out that we create an object called **router** and export that as default from the file. Then we can have a look up to `scripts/start.ts` file which will be the main startup file of the application.

```typescript
import '@smartface/native';
import 'theme';
import router from 'routes';

router.push('/pages/page1');
```

What we can see from here is that we import the newly created router object from the **routes** folder and use it to push a new route on the app's startup. Actually, that's all you need to do for showing your page on the mobile device. But how does this really work? To get more understanding about it, now we will dive a bit deeper into the router definitions we have talked about above.

- `NativeRouter` is the root router

While we are creating the **router** object, we have used **NativeRouter.of** and gave it both path and an isRoot=true values at the start. By giving **/** as the path value, it will be our root path and will stand there for all our routes. And by assigning isRoot value to true we became able to create the router object that we are going to use application-wide.  
After this, a routes array is defined for our root router. In this array, we will define all of our paths and routes for the pages we will implement.
- `NativeStackRouter` is to create route stack

```typescript
NativeStackRouter.of({
      path: '/pages',
      routes: [
        Route.of<Pages.Page1>({
          path: '/pages/page1',
          build(router, route) {
            return new Pages.Page1(router, route);
          }
        }),
        ...
```

NativeStackRouter is providing for your app to move to different pages and hold their route history by keeping the latest pushed page on top of the stack. To move directly from one page to another, both of these pages have to be defined in the same NativeStackRouter.

> **WARNING**: Directly navigating between two pages that are defined in different stacks is not allowed and the only way to achieve this behavior is that first, you need to pop out from your current stack and then push to the target page in the routing definition.


In the first stack, we give a path value of **/pages** and all of the routes that are defined in this stack will have this path as a prefix. Then the routes array is defined for the pages that will belong to this stack.

- `Route` is a definition of a path

By using **Route**, we are defining a path and returning a page for the incoming navigation call (pushing to a page or going back to previous ones) to this path. And the function **build** provides you the current **router** and **route** objects which you can pass to the page and also use inside there.

After all of these definitions, now we can see that using ***router.push('/pages/page1')*** on the app's startup will lead our application to return a new Page1 instance for given path.


### Basic Usage of [push](https://smartface.github.io/router/classes/Router.html#push) and [goBack](https://smartface.github.io/router/classes/Router.html#goBack)

- ##### `Push a new page`

To achieve this behavior and navigate between different screens, we are using the router object which works like an application-wide navigator and is responsible for making some routing actions.

Basic usage is for example when your current route is **/pages/page1** and if you want to move to the **page2** in your page code, you can simply use the router object been passed to your page like ***this.router.push('page2')*** and this way you will move to page2.

One more thing to point out in here is that we have pushed the other file by giving a relative path to the push method. (only 'page2'), instead of providing the whole path for the route(which would be '/pages/page2' in this case).

This way, the router object checks for the given parameter and replaces it with the last param on the current route path. And it is really a better and highly recommended practice while working with different stacks on your routing definitions. 

```typescript
// routes/index.ts
import {
  NativeRouter,
  NativeStackRouter: StackRouter,
  Route
} from "@smartface/router";
import * as Pages from 'pages';


const router = NativeRouter.of({
    path: "/",
    to: "/pages/page1",
    isRoot: true,
    routes: [
        Route.of({
            path: "/pages/page1",
            build: (router, route) => {
                return new Pages.Page1(router, route);
            }
        }),
        Route.of({
            path: "/pages/page2",
            build: (router, route) => {
                const { routeData, view } = route.getState();
                return new Pages.Page2(routeData, router);
            }
        })
    ]})


// page1.ts
import Page1Design from 'generated/pages/page1';
import PageTitleLayout from 'components/PageTitleLayout';
import System from '@smartface/native/device/system';
import Label from '@smartface/native/ui/label';
import { Route, Router } from '@smartface/router';
import { withDismissAndBackButton } from '@smartface/mixins';
import Button from '@smartface/native/ui/button';
import { themeService } from 'theme';


export default class Page1 extends withDismissAndBackButton(Page1Design) {
  constructor(private router?: Router, private route?: Route) {
    // router and route objects are passed to constructor
    // while building the route for the path of this file.
    super({});
  }

  /**
   * @event onShow
   * This event is called when a page appears on the screen (everytime).
   */
  onShow() {
    super.onShow();
      this.btnNext.on(Button.Events.Press, () => {
        this.router.push('page2', { message: 'Hello World!' }); // Pushes to page2
      })
    );
  }

  /**
   * @event onLoad
   * This event is called once when page is created.
   */
  onLoad() {
    super.onLoad();
  }

}
```

By calling this pushing a new page, we mean pushing a new page into the stack. By this way we will have a route history for the stack and will be able to move back and forth between this history.

- ##### `Go back to a desired page in same history stack`

goBack method is functional only if it's used on a StackRouter. And if provided,
related page of the url parameter must be in the same stack history. Otherwise
goBack does nothing.

```typescript
// Add essential require statements

const router = Router.of({
  path: "/",
  isRoot: true,
  routes: [
    NativeStackRouter.of({
      path: "/pages",
      routes: [
        Route.of({
          path: "/pages/page1",
          build: (router, route) => {
            return new Page1({ label: 1 }, router, "/pages2/page2");
          }
        }),
        Route.of({
          path: "/pages/page2",
          build: (router, route) => {
            return new Page2({ label: 2 }, router, "/pages2/page3");
          }
        }),
        Route.of({
          path: "/pages/page3",
          build: (router, route) => {
            return new Page3({ label: 3 }, router, "/pages2/page4");
          }
        }),
        Route.of({
          path: "/pages/page4",
          build: (router, route) => {
            return new Page4({}, router, -2);
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

export default class Page2 extends Page2Design {
  constructor(router, route) {
    super({});
    if (this.router instanceof NativeStackRouter) {
      btn_onPress();
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

-  `Back&Dismiss button on HeaderBar of the Page`

Since we have learned how we can go back to the desired page on the history with code examples, we can also mention the back or dismiss buttons (depending on whether it is a modal page or not) on the headerbar of the page. It is very common for mobile apps and users to go back to previous pages 
by only touching the back button on the top-left corner of the screen. To learn how to control this behavior for your pages you can refer to [this documentation](https://docs.smartface.io/smartface-ide/page-management#usage-of-mixins-and-changing-backdismiss-buttons)

### Current route state

While moving between different pages, It is a very common need to know more about the state of the current route and be able to pass some useful data between the transitioning pages. In this section, we will learn about what kind of data can be reached from the target page and how to reach them.

First, let's consider pushing a new page to the route with the following code.

```typescript
this.router.push('page2?sort=ASC&page=3', { message: 'Hello World!' });
```

In the first argument of the push method, we see that the string is providing a url-like path with a pathname and the query parameters. In the second argument, we are passing some object(can have anything inside) data that could be useful for the target page.

Then let's see what we are able to get and how we can get it on the target page, which is the **page2** in this case.

By using the route object that is passed to the page within the constructor, we are able to reach the ***RouteState*** object that has the all information about our current route stack.
```typescript
export default class Page2 extends withDismissAndBackButton(Page2Design) {
  routeData: Record<string, any>;
  parentController: any;
  private disposeables: (() => void)[] = [];
  constructor(private router?: Router, private route?: Route) {
    super({});
    console.log(this.route.getState()); // Returns us the RouteState
}
```

When we log the RouteState object we got the following object:

```json
{
  "match": {
    "path": "/pages/page2",
    "url": "/pages/page2",
    "isExact": true,
    "params": {}
  },
  "query": {
    "sort": "ASC",
    "page": "3"
  },
  "hash": "",
  "routeData": {
    "message": "Hello World!"
  },
  "view": null,
  "routingState": {},
  "action": "PUSH",
  "url": "/pages/page2",
  "active": false,
  "prevUrl": "/pages/page2"
}
```

We can see that RouteState has different kinds of information that can be useful. 

The **match** object in it, has the info about paths of the route and if we navigated to this path with an exact match.

The **query** object, as you can understand easily has the parsed querystring information that we send to this page inside the push() method.

**Action** is also something that can be useful to know if you have reached to this page by a push or pop related to your navigating flow.

And the **routeData** entry is very useful and widely used on Smartface projects for passing data between different pages.

For a common use-case of routeData usage, we can consider showing a list of items, let's say a set of Airline companies will be listed on the UI page and if one of the listed items is selected by the user, we will redirect user to the Airline's detail page. While pushing a page by using navigator-like router object we can send a data about the selected Airline item.

```typescript
this.router.push('detail', { id: '<airlines_unique_id>' });

// On the detail page
export default class PageAirlineDetail extends withDismissAndBackButton(PageAirlineDetailDesign) {
  routeData: Record<string, any>;
  parentController: any;
  private disposeables: (() => void)[] = [];
  constructor(private router?: Router, private route?: Route) {
    super({});
    this.routeData = this.route?.getState().routeData || {};
  }
  getAirlineInfo() {
    const airline = getAirlineById(this.routeData.id);
    ...
  }
```

With this kind of approach, you will be able to make a reusable detail page by only changing the listed detail information depending upon the id property that has been passed. 

> **INFO**: Though we can easily pass data with routeData usage while pushing other pages, It is not possible to do while using goBack function. For this, you may think of using global state management tools (e.g. redux) as an alternative.



### Listening history changes

After learning how we can navigate between different screens we can also implement a route listener for our router. This will be very useful to developers for testing purposes.

```typescript
let listenerCounter = 0;
router.listen((location, action) => {
  console.log(`[ROUTER] Counter: ${listenerCounter++} | location url: ${location.url}`);
});
```

#### Replace active route's view using Replace action

Replace action provides rerendering for opened route.

### Modal Page

Modal or in other words a Pop-up page, act like full-screen dialog, but also it is a fully-fledged page. After using the pop-up page, you can dismiss the pop-up page and will return the page that used before pop-up. To use pop-up page, set modal property of route in your NativeStackRouter. You can find an example below.

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
            return new Page1(router, route);
          }
        }),
        Route.of({
          path: "/example/modal/modalpages/page2",
          build: (router, route) => {
            return new Page2(router, route);
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
#### Navigating between different stacks

As mentioned on above sections, there is no way to directly push our router to a path that is defined in a different NativeStackRouter. As a demonstration let's consider the following example.

```typescript
import { NativeRouter, NativeStackRouter, Route } from '@smartface/router';
import * as Pages from 'pages';
import Application from '@smartface/native/application';

const router = NativeRouter.of({
  path: '/',
  isRoot: true,
  routes: [
    NativeStackRouter.of({
      path: '/pages',
      routes: [
        Route.of<Pages.Page1>({
          path: '/pages/page1',
          build(router, route) {
            return new Pages.Page1(router, route);
          }
        }),
        NativeStackRouter.of({
          path: '/pages/page2',
          to: '/pages/page2/main',
          modal: true,
          routes: [
            Route.of<Pages.Page2>({
              path: '/pages/page2/main',
              build(router, route) {
                return new Pages.Page2(router, route);
              }
            })
          ]
        }),
        NativeStackRouter.of({
          path: '/pages/page3',
          to: '/pages/page3/main',
          modal: true,
          routes: [
            Route.of<Pages.Page3>({
              path: '/pages/page3/main',
              build(router, route) {
                return new Pages.Page3(router, route);
              }
            })
          ]
        })
      ]
    })
  ]
});

export default router;
```

Assume a scenario that our current route is **/pages/pages3/main** and we want to navigate to page2 which is declared in another NativeStackRouter. In this case, a usage like ***this.router.push('page2')*** will try to navigate **pages/page3/page2** and it won't be sufficient. Also, trying to push exact route of page2 with an absolute path doesn't work either(***this.router.push('/pages/page2')***). When you encounter this kind of situations, first thing you need to do is popping out from your current stack and then push to a target stack after the pop-out process is complete.

```typescript
// WILL NOT WORK AS EXPECTED
this.router.dismiss();
this.router.push('page2');
```
At first, you may think of implementing a code like above but this won't work either. The right way to do is using the after callback of the dismiss() method.

```typescript
import { Router } from '@smartface/router';
this.router.dismiss({
  after: () => {
    Router.currentRouter.push('page2');
  }
})
```
> **Note**: We assumed that the both of our stacks are modal value set to true and used dismiss method for this case. In your case the pages might not be modal and you could need to use goBack() method instead. This situation needs to be handled programmatically on runtime by checking if the current page is a modal or not. (canGoBack method etc.) 

By using after callback, we are now sure that we have successfully dismissed the current stack and then ready to push to a different path.

> **Note**: Router.currentRouter has been used to push to a different route instead of the this.router, the purpose of this is router object might not work as expected inside the after callback depending upon the operating system of the mobile device.


#### iOS Specific Bottom Sheet

With new iOS version 15.0 Apple brought us a new modal page-like feature bottom-sheets that helps us pop-up a new cool looking page for performing distinct tasks that's related to its parent page.

For more information about what the bottom-sheets are you can refer to this [official Apple documentation](https://developer.apple.com/design/human-interface-guidelines/ios/views/sheets/).

##### How to define bottom sheet route on Smartface

For usage, just like defining a NativeStackRouter for a modal page, we set path, to, modal and routes of the NativeStackRouter and additionally there is also a few more option we need to set.
First the modalType property, this property is actually does everything for us to show a bottom-sheet with a NativeStackRouter. After this being set to **bottom-sheet**, our modal page will open up as a bottom-sheet with default values on supported device and OS versions.

> **INFO**: On Android and on iOS devices with version smaller than 15.0, modalType property won't affect anything and your page will be opened up as a normal Modal page. 

If we want, we can also set different bottomSheetOptions to our page according to our need.

BottomSheetOptions:

- cornerRadius: Sets the top-right and top-left cornerRadius of your bottom-sheet
- detents: Takes an array of strings **large** or **medium** or both. When it is set to only one of them, bottom-sheet will only be opened at that size and we won't be able to change it by grabbing the page down or up with grabber. When it is set with both values (e.g. ['large', 'medium']), bottom-sheet will open up at large size first (could also be medium, depends on the sequence of the elements in array) and the user will be able to change its size by using grabber. 
- isGrabberVisible: As the name implies, it changes the visibility of grabber component on top of the bottom-sheet.


```typescript
NativeStackRouter.of({
  path: `${path}/bottomSheet`,
  to: `${path}/bottomSheet/page`,
  modal: true,
  modalType: 'bottom-sheet',
  bottomSheetOptions: {
    cornerRadius: 20,
    detents: ['large', 'medium'],
    isGrabberVisible: true
  },
  routes: [
    Route.of({
      path: `${path}/bottomSheet/page`,
      build: (router, route) => new PgModalBottomSheet(router, route)
    })
  ]
})
```

### Working with BottomTabBarRouter

BottomTabBar is a UI object. It is used for navigating between pages using tab bar items. Each tab bar item has title, icon and page. If the individual tab has an Icon, icons must be set two types as selected and normal.

For usage, we define our BottomTabbarRouter, the only difference of its definition than NativeStackRouter is you also need to configure the tabbar items for this usage.

Then after, we define routes for the tabs (a NativeStackRouter or something else) by paying attention to the order of the items in the array.

```ts
import {
  NativeRouter,
  NativeStackRouter,
  BottomTabBarRouter,
  Route
} from "@smartface/router";
import Color from '@smartface/native/ui/color';

const router = NativeRouter.of({
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
      items: () => [
       { title: "Profile", icon: Image.createFromFile('images://profile.png') },
       { title: "Messages", icon: Image.createFromFile('images://messages.png') }, 
       { title: "Settings", icon: Image.createFromFile('images://settings.png') }
      ],
      // tab routes
      routes: [
        // tab 1
        NativeStackRouter.of({
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
        NativeStackRouter.of({
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

For more detailed usage you can refer to [this documentation](https://docs.smartface.io/smartface-native-framework/ui-elements/bottomtabbar/). 

### Working with Pages

##### Extending the onLoad and onShow method of the page

To Extend lifecycle methods of the pages, the approach you can take is creating a new mixin for your page to have the ability to execute different code blocks within the lifecycle events without breaking anything on the original (base) onShow and onLoad methods.

To learn how to create your own mixins you can refer to [this documentation](https://docs.smartface.io/smartface-ide/page-management#usage-of-mixins-and-changing-backdismiss-buttons)

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

### How to get the instance of current page on elsewhere in project

On mobile apps, sometimes you need to reach out to the instance of the current view page that is displayed, on different timelines than the current routing flow (e.g. some asynchronous calls, events, etc.). Smartface Router gives you a way to achieve this in a slightly easy fashion.  
To see what the use-case can be and how to achieve this case in a good manner you can refer to [this documentation](https://docs.smartface.io/smartface-native-framework/tips-and-tricks/how-to-get-instance-of-current-page-on-elsewhere-in-project).


### Working with deeplinking

In this section we will explain how you can implement a deeplinking into your app. Smartface Framework provides an event called [onApplicationcallReceived](https://ref.smartface.io/#!/api/Application-static-event-onApplicationCallReceived) where universal links are received.  

Since this is an event, you can invoke this anywhere but be aware that your events will not be registered until the the code reaches there. Therefore, the best practice is to invoke this event in **/scripts/app.ts** file in order to be invoked right away at the beginning..

> **INFO**: On iOS, you have to declare&return a value on UserActivityWithBrowsingWeb event. Then, you can use ApplicationCallReceived method freely. Otherwise the call will not trigger.


```typescript
// app.ts file

import "lib/deeplink.ts";
```

```typescript
// lib/deeplink.ts file

import Application from '@smartface/native/application';
import { NativeRouter } from '@smartface/router';

type ApplicationCallReceivedParams = {
    url: string;
};

Application.on(Application.Events.ApplicationCallReceived, (params: ApplicationCallReceivedParams) => deeplinkHandler(params));

Application.ios.onUserActivityWithBrowsingWeb = (url) => {
    deeplinkHandler({ url });
    return true;
};

export function deeplinkHandler(params: ApplicationCallReceivedParams) {
        ...
}

```
For a sample scenario, let's think of an airline app and in this app, users will be redirected to the detail page of a selected airline which depends on the URL of the deeplink.

For this case, we will receive the incoming activity with event handlers, then we will get the desired airline id from the incoming URL by parsing It.

```typescript
// lib/deeplink.ts file

import Application from '@smartface/native/application';
import { NativeRouter } from '@smartface/router';

type ApplicationCallReceivedParams = {
    url: string;
};

Application.on(Application.Events.ApplicationCallReceived, (params: ApplicationCallReceivedParams) => deeplinkHandler(params));

Application.ios.onUserActivityWithBrowsingWeb = (url) => {
    deeplinkHandler({ url });
    return true;
};

export function deeplinkHandler(params: ApplicationCallReceivedParams) {
        const { airlineId } = URI(params?.url || '').query(true); // Will change based on your generated URL
        if(airlineId) {
          airlineDetailHandler();
        }
}

export async function airlineDetailHandler(airlineId: string) {
      const airline = await getAirline(airlineId);
      if (!!airline) {
          Router.currentRouter.push('deeplink/airline', { // Will change based on your routing definitions
              airlineId: airlineId//Could also be send by :id param on push
          });
      } else {
          throw new Error('Airline not found');
      }
}
```

Now that we see how we can handle the incoming request, the one last thing to have an eye on is how are our routing definitions going to be?

The important thing to be aware of the routing definition of deeplinks is that your app needs to be able to redirect (push) to your target page from wherever your current router is. 

One way to achieve this is that you can define a new Router Stack for Airline Detail pages and give this to other distinct NativeStackRouters.


```typescript
import { NativeRouter, NativeStackRouter, Route } from '@smartface/router';
import * as Pages from 'pages';
import Application from '@smartface/native/application';

Application.on(Application.Events.BackButtonPressed, () => {
    NativeRouter.getActiveRouter()?.goBack();
});

const deeplinkRouter = new NativeStackRouter({
    path: "/deeplink",
    routes: [
        Route.of({
            path: "/deeplink/airline",
            build: (router, route) => {
                return PageAirlineDetail(router, route)
            }
        }),
        ...
    ]
});

const router = NativeRouter.of({
  path: '/',
  isRoot: true,
  routes: [
    NativeStackRouter.of({
      path: '/pages',
      routes: [
        deeplinkRouter,
        Route.of<Pages.Page1>({
          path: '/pages/page1',
          build(router, route) {
            return new Pages.Page1(router, route);
          }
        }),
        Route.of<Pages.Page2>({
          path: '/pages/page2',
          build(router, route) {
            return new Pages.Page2(router, route);
          },
        }),
        NativeStackRouter.of({
          path: '/pages/page3',
          to: '/pages/page3/main',
          modal: true,
          routes: [
            Route.of<Pages.Page3>({
              path: '/pages/page3/main',
              build(router, route) {
                return new Pages.Page3(router, route);
              }
            }),
            deeplinkRouter
          ]
        })
      ]
    })
  ]
});

export default router;
```
This way you can navigate between different route stacks.

The other way is that you can push to one of your already defined routes and in this case, you might face such cases that you need to manually decide which route you are on and POP - PUSH to routes for moving on different stacks in your deeplinkHandler.

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

Smartface Router provides different handy routing standarts and RouteBlockers is one of them. Adding a route blocker lets you block moving away from the current page based on what your condition is.

To add a new blocker we use the **addRouteBlocker** method on the router object, and it gives you path, routeData, action, and ok parameters on the go.
The parameter ok is to decide if the transition is permitted or not. When it is called with true, then the transition will be permitted.

```typescript
const unload = router.addRouteBlocker((path: string, routeData: { [key: string]: any }, action: string, ok: (go: boolean) => void) => {
  alert({
    message: `Are you sure you want to go to ${path}`,
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

On a real world project, we would have a different kinds of blockers, for this you can define your blocker functions to return boolean value and use them in your addRouteBlocker method.

```typescript
// routes/blocker/authorization.ts
export async function authorizationBlocker(options: { path: string, routeData: { [key: string]: any }, action: string }): Promise<boolean> {
  const { path, action, routeData } = options;
  if(action === 'POP') {
    return true;
  }

  try {
    await checkAccess(userId, path);
    return true;
  } catch (error) {
    return false;
  }
}
```

In the above code, we have defined a helper function to decide if the user has an access to reach the target path. If the action is **POP** then we always return true and let the user go back to a previous page. We can have different custom functions like this on a large project.

```typescript
// routes/blocker/index.ts
import { authorizationBlocker } from "./authorization";

export function initRouteBlockers(router?: any): void {
  router.addRouteBlocker(async (path: string, routeData: { [key: string]: any }, action: string, ok: (go: boolean) => void) => {

    const authorizationBlock = authorizationBlocker({path, routeData, action});
    if(!authorizationBlock) {
      return ok(false); // Permission not granted.
    };

    const anotherCustomBlock = anotherCustomBlocker({path, routeData, action});
    if(!anotherCustomBlock) {
      return ok(false); // Permission not granted.
    }

    return ok(true); // Permission granted. 
  }
}
```

In above, we have defined an initRouteBlockers functions that adds the routeBlockers by using our custom helper functions.

And the last thing to do is initializing our route blockers with the application-wide router object.

```typescript
// routes/index.ts

import {
  NativeRouter,
  NativeStackRouter: StackRouter,
  Route
} from "@smartface/router";
import * as Pages from 'pages';
import initRouteBlockers from './blocker';

const router = NativeRouter.of({
    path: "/",
    to: "/pages/page1",
    isRoot: true,
    routes: [
        Route.of({
            path: "/pages/page1",
            build: (router, route) => {
                return new Pages.Page1(router, route);
            }
        }),
        Route.of({
            path: "/pages/page2",
            build: (router, route) => {
                const { routeData, view } = route.getState();
                return new Pages.Page2(routeData, router);
            }
        })
    ]});

initRouteBlockers(router);
export default router;
```

### Limitations of blockers

Following cases cannot be handled by the blocker:

- **iOS HeaderBar**: Back gesture of the page & back button action of HeaderBar cannot be prevented. If user wants to use blockers in these cases, custom back button must be used.
- **BottomTabBar**: Switching between tabs cannot be prevented

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
