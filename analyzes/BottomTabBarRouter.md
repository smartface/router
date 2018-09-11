# BottomTabBar router
BottomTabbBar router is different router than [Stack Router](./StackRouter.md). It is showing _Pages_ or other _Stack Routers_ as tabs.
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "a page",
        text: "Tab A"
    }, {
        path: "tab2",
        target: {/* A stack router */},
        text: "Tab B"
    }]
});
```

BottomTabBar can have only up to 5 tabs, at least 1 tab.
BottomTabBar does not have `initialPath` property set via constructor.

# Tab Scaffold
Normally paths are defined as in a defined [Scaffold](./Scaffold.md). In addition to those scaffold, tabs has the following additional properties:
- Badge
- Text
- Icon (has states)
- Font (has states)
- Text Color (has states)
- Class (for theming purpose, has states)

## States
Some properties in the scaffold can have states. This is an optional behaviour to set. If propert is set without a state, it is set for all of the states. There are 3 states predefined:
- **normal** _required_ - Default state, tab is not selected
- **active** _optional_ - When the tab is active
- **foussed** _optional_ - When the keyboard focus is on the tab or finger is pressing to the tab

## Path
For limits of the path definition please refer to the [Path](./Path.md#limits-of-definition) guide.
In addition to those limits, it cannot have sub-paths and any paramters

## Badge
_optional_  
HeaderBar has [Badge](https://developer.smartface.io/docs/headerbar#section-headerbar-badge) feature. This badge feature can be used in a tab. Properties of the badge can be set here as an object
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "...",
        badge: {
            backgroundColor: "#ff0000",
            text: "2",
            textColor: "#ffffff",
            visible: false
        }
    }, {
        path: "tab2",
        target: "...",
        badge: ()=> {
            return {/* similar to the other one */}
        }
    }, {
        path: "tab 3",
        target: "...",
        badge: {
            text: "2",
            class: ".tabBarBadge"
        }
    }]
});
```
### Badge Class
- A badge can have a class, this is optional
- Setting other properties are considered as _userProps_

## Text
_optional_  
Text of the tab is given here. If text is not given, Icon must be given
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "...",
        text: "Tab A"
    }, {
        path: "tab2",
        target: "...",
        text: () => "Tab B"
    }]
});
```

## Icon
_optional_  
Icon image of the tab can be given. 
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "...",
        icon: "tab_a.png"
    }, {
        path: "tab2",
        target: "...",
        icon: () => "tab_b.png"
    }, {
        path: "tab3",
        target: "...",
        icon: {
            normal: "tab_c.png",
            active: "tab_c_active.png",
            focussed: "tab_c_focussed.png"
        }
    }, {
        path: "tab4",
        target: "...",
        icon: () => ({
            normal: "tab_d.png",
            active: "tab_d_active.png",
            focussed: "tab_d_focussed.png"
        })
    }]
});
```
It is possible to use [Image](http://ref.smartface.io/#!/api/UI.Image) object instead of string here

## Font
_optional_  
Font of the tab text is given here.
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");

const defaultFont = {
    size: 16,
    bold: false,
    italic: false,
    family: "Default"
};
const activeFont = Object.assign({}, defaultFont, {
    bold: true
});
const focussedFont = Object.assign({}, defaultFont, {
    size: 18
});

const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "...",
        text: "Tab A",
        font: defaultFont
    }, {
        path: "tab2",
        target: "...",
        text: "Tab B",
        font: () => defaultFont
    }, {
        path: "tab3",
        target: "...",
        text: "Tab C",
        font: {
            normal: defaultFont,
            active: activeFont,
            focussed: focussedFont
        }
    }, {
        path: "tab4",
        target: "...",
        text: "Tab D",
        font: () => ({
            normal: defaultFont,
            active: activeFont,
            focussed: focussedFont
        })
    }]
});
```
It is possible to use [Font](http://ref.smartface.io/#!/api/UI.Font) object instead of string here

## Text Color
_optional_  
Font of the tab text is given here.
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");

const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "...",
        text: "Tab A",
        textColor: "#333333"
    }, {
        path: "tab2",
        target: "...",
        text: "Tab B",
        font: () => "rgba(51,51,51,1)"
    }, {
        path: "tab3",
        target: "...",
        text: "Tab C",
        font: {
            normal: "rgba(51,51,51,1)",
            active: "rgba(51,51,51,1)",
            focussed: "rgba(51,51,51,1)"
        }
    }, {
        path: "tab4",
        target: "...",
        text: "Tab D",
        font: () => ({
            normal: "#333333",
            active: "#333333",
            focussed: "#333333"
        })
    }]
});
```
It is possible to use [Color](http://ref.smartface.io/#!/api/UI.Color) object instead of string here

## Class
_optional_  
It is possible to define classes of the TabItem. 
Font of the tab text is given here.
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");

const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "...",
        text: "Tab A",
        class: ".tabBarItem"
    }, {
        path: "tab2",
        target: "...",
        text: "Tab B",
        class: () => ".tabBarItem"
    }, {
        path: "tab3",
        target: "...",
        text: "Tab C",
        class: {
            normal: ".tabBarItem",
            active: ".tabBarItem_active",
            focussed: ".tabBarItem_focussed"
        }
    }, {
        path: "tab4",
        target: "...",
        text: "Tab D",
        class: () => ({
            normal: ".tabBarItem",
            active: ".tabBarItem_active",
            focussed: ".tabBarItem_focussed"
        })
    }]
});
```
Setting other properties are considered as _userProps_


# Tint
It is possible to apply a tint to the all tabs
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const btbRouter = new BottomTabBarRouter({
    tabs: [{
        path: "tab1",
        target: "a page",
        text: "Tab A"
    }, {
        path: "tab2",
        target: {/* A stack router */},
        text: "Tab B"
    }]
});
```

# Altering tabs after creation
If needed tab properties can be altered later.

1. Access to the tab
2. Make necessary modification or get the value


- **Alternative 1:** Each `BottomTabBarRouter` has a `getTab(index)` method. Index is an integer between 0 and 4; 
- **Alternative 2:** Each `BottomTabBarRouter` has `tabs` property. Path of it is used as property name to access to the tab.


**returns** the [TabBarItem](http://ref.smartface.io/#!/api/UI.TabBarItem). In addition to existing properties, it has:
- **dispatch** (from theming)
- **badge** property (similar to the `HeaderBarItem.badge`)
- **index** _read-only_ is giving the tab index


# Example
```javascript
const BottomTabBarRouter = require("sf-core/router/bottomtabbar");
const StackRouter = require("sf-core/router/stack");
const Image = require('sf-core/ui/image');
const Font = require('sf-core/ui/font');
const Color = require('sf-core/ui/color');


const fontNormal = Font.create("Default", 14, Font.NORMAL);
const fontActive =
    Font.create("Default", 16, Font.BOLD);


const dashboardRouter = new StackRouter({
    routes: [{
        path: "dashboard",
        target: require("pages/pgDashboard")
    }, {
        path: "addVehicle",
        target: require("pages/pgAddVehicle")
    }]
});


const cartRouter = new StackRouter({
    routes: [{
        path: "cart",
        target: require("pages/pgCart")
    }, {
        path: "checkout",
        target: require("pages/pgCheckout")
    }]
});

const btbRouter = new BottomTabBarRouter({
    tabs: [{
            path: "dashboard",
            target: dashboardRouter,
            icon: {
                normal: Image.createFromFile("images://dashboard.png"),
                active: Image.createFromFile("images://dashboard_active.png"),
                focussed: Image.createFromFile("images://dashboard_focussed.png")
            },
            text: "Dashboard",
            font: {
                normal: fontNormal,
                active: fontActive,
                foussed: fontActive
            },
            textColor: {
                normal: Color.BLUE,
                active: Color.RED,
                focussed: Color.GREEN
            },
            badge: { //Optional
                visible: false
            }
        },
        {
            path: "cart",
            target: cartRouter,
            icon: {
                normal: Image.createFromFile("images://cart.png"),
                active: Image.createFromFile("images://cart_active.png"),
                focussed: Image.createFromFile("images://cart_focussed.png")
            },
            text: "Cart",
            // Some other stuff
            badge: { //They can be manged later over navigation
                backroundColor: Color.RED,
                text: "1",
                textColor: Color.WHITE,
                borderWidth: 2,
                borderColor: Color.WHITE
            }
        }
    ],
    tint: {
        normal: Color.GRAY,
        active: Color.BLACK
    }
});
```

Using ths in the pages are explained below:

## pgDashoard
```javascript
function addItemToCart(/*arguments*/) {
    const page = this;

    const cartBadge = 
    page.routing // --> gives access to dashboardRouter
        .routing // --> gives access to btbRouter
        .tabs.cart.badge;
    cartBadge.text = "2";
}

function goToCart() {
    const page = this;

    page.routing.routing.tabs.cart.routing.go("cart"); //Make sure that cartRouter is on the cart page
    page.routing.routing.go("cart");
}
```