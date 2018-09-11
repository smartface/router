# Scaffold
Items in the router are defined in the given scaffold details
## Properties
Properties are set as the styles are set in Style. Such as giving color value as string instead of Color object.

## Giving functions
Some properties are given as primitive values (string, number, boolean), others are pure objects (containing nested properties). Instead of them it is possible to give functions. If a function is provided, that function is called and return value of the function is used as the property value.
```javascript
[{
    path: "xyz",
    target: "page1"
},{ //same
    path: "abc",
    target: () => "page1"
},{
    path: "123",
    target: require("./pages/page1")
}]
```
The difference is, some values of the router are not initialized during creation. Those functions are called when that item is about to be used. This causes the lazy loading of the items.

### Implementing tip
While implementing this behaviour on router side please refer to the JavaScript [new operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new#) for the return values. Call the function with new operator as long as the returned type is a function

# Scaffold properties
Each scaffold object should can have following properties:
- taget (required)
- path (required)
- enterTranstition (optional)
- exitTranstition (optional)
- data (optional)
- onBeforeRoute (callback, optional)
## Target
Same as in [Router Common > Target](./RouterCommon.md#target)
## Path
Paths are given as in URI path spesification. Path is the relative path of the component to the router.
For limits of the path definition please refer to the [Path](./Path.md#limits-of-definition) guide

Similar to the [Express.js](https://expressjs.com/en/guide/routing.html) path parameters can be given.
```javascript {
    routes: [
        {
            path: "user",
            target: "pages/pgUserList"
        },
        {
            path: "user/:userId",
            target: "pages/pgUserDetails"
        }
    ]
}
```
Later on that `:userId` parameter value can be retrieved within `pgUserDetails` using `page.routing.getData("userId")`. For more information please refer to the [data](./data.md) guide

## Transtitions
`enterTranstition` and `exitTranstition` properties can be given. For the given path, those values are considered as the default.

For the possible transtitions please refer to the [transtition](./transtition.md) guide
## Data
`data` should be an `object` or `object` returning `function`. Property names are keys, values are the values of the corresponding keys.

For more information please refer to the [data](./data.md) guide

## Before Route
`onBeforeRoute` callback can be given in the scaffold. This callback is called instead the owner Router's `onBeforeRoute` callback.