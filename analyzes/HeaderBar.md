# Changes in headerbar
Some headerbar properties of iOS reside in NavigationController, some of them are in NavigationItem. NavigationControl is equvalent of the StackRouter; NavigationItem is equvalent of Page.headerBar.

## iOS & Android concepts
iOS & Android related properties will not be accessed via .ios nor .android

## Spliting HeaderBar properties
This change will only occur for iOS side. Android will retain all of its HeaderBar properties. Just need to apply the removal of .android properties

Those changes also will remove the confusion when to set the headerBar properties

### Items to keep in HeaderBar (iOS) - navigationItem --> Page
- title
- leftItemEnabled
- leftBarButtonItem
- backBarButtonItem
- largeTitleDisplayMode
- titleLayout
- setItem
- setRightItems

### Items to remove from HeaderBar (iOS) - navigationController --> Router
Following items will now be the property of StackRouter
- titleColor
- visible
- itemColor
- backgroundColor
- backgroundImage
- height (read-only)
- borderVisibility

## Removal of headerBar limitations

Splitting the headerBar properties will enable the developers to use the HeaderBar items onLoad during constructor.

## Theming
The `headerBar` property of the **Stack** and **Split** routers are created context bound.
- They can have classes
- `dispatch` method can be used

# Samples
## Setting headerbar properties in Router
The flollowing code just updates the HeaderBar backgroundColor for iOS only.
```javascript
const StackRouter = require("sf-core/router/stack");
const mainRouter = new StackRouter({
    routes: [{
        path: "page1",
        target: require("pages/page1")
    }, {
        path: "page2",
        target: require("pages/page2")
    }],
    headerBar: {
        classNames: ".headerBar",
        backgroundColor: Color.RED
    }
});

...


```
In order to set the same color for Android, following code should be added for each page (page1, page2)
```javascript

page.onLoad = () => {
    page.headerBar.backgroundColor = Color.RED;
};
```

## Setting HeaderBar properties from page
Each page can acces to the router which is showing them. Through that it is possible to set the backgroundColor.
```javascript
const StackRouter = require("sf-core/router/stack");
const mainRouter = new StackRouter({
    routes: [{
        path: "page1",
        target: require("pages/page1")
    }, {
        path: "page2",
        target: require("pages/page2")
    }]
});
```
```javascript

page.onLoad = () => {
    page.headerBar.backgroundColor = Color.RED; //Just the Android
    page.routing.headerBar.backgroundColor = Color.RED; //Just the iOS
};
```
However the code above is changing the headerBar.backgroundColor for all pages for the same router in iOS.