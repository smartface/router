# routing property
Before every target is shown, `routing` property is assigned by the router.

# routing features
Except every feature defined below goes to the owner router. Features defined below are shadowing the properties of the owner router.
```javascript
page.routing.go("page2"); //this will be the router.go

console.log(page.routing.absolutePath); //this will be the overridden (shadowed) property from the routing
```
Following properties are the properties of the routing:
- getData
- setData
- absolutePath
- path
- stack
- setQuery
- setHash

## absolutePath
Absolute full path of the routed item. Does not include any _URI query_ or _URI hash_ values if the target is not a page.
## path
Path relative to the absolute path of the owner router. Does not include any _URI query_ or _URI hash_ values if the target is not a page.

## getData
This is a special bound version of the [Router.getData](./RouterCommon.md#getData). 
This can get all of the _URI_ parameter values. `absolutePath` is not to be given while calling the function.

For more information please refer to the [data](./data.md) guide
## setData
This is a special bound version of the [Router.setData](./RouterCommon.md#setData). `absolutePath` is not to be given while calling the function. 

For more information please refer to the [data](./data.md) guide

## Set query and hash
Those metods are used for rewriting the query and hash segments of the URI. This will not cause changing of screen. This will just update the `path` and `absolutePath` values

```javascript
console.log(page.routing.path); // will log a?x=1
page.routing.setQuery({
    y: 4
});
console.log(page.routing.path); // will log a?y=4
page.routing.setQuery("z=5&t=6");
console.log(page.routing.path); // will log a?z=5&t=6
page.routing.setQuery();
console.log(page.routing.path); // will log a
page.routing.setHash("alper");
console.log(page.routing.path); // will log a#alper
page.routing.setHash();
console.log(page.routing.path); // will log a
```
- `setQuery` takes `object` or `string`
    - if `object` is provided it will be automatically URI encoded.
    - if `string` is provided it will not be automatically URI encoded. If the URL is not valid by the standarts of [Path Limits of Calling](./path#limits-of-calling) an error will be thrown
- `setHash` takes `string`
- all other types for both they will be converted to `string`
    - it will be automatically URI encoded.
- calling both of them without argument or with `undefined` will clear
- both of them will fully replace query or hash

## stack
If the owner router is not a tab router, stack property will be present (not `undefined`). Stack is an `array` containing all paths (relative to the router) including _URI path_ values. First item of the stack, is the first item of the array. By definition, last item in the array (stack) is same as the `path` property

# Deciding the same path or not
If the `go("path")` contains some elements, it is considered same path or not.
- Same constant values makes it same path
- Same _URI path_ values makes it same path
- _URI query_ and _URI hash_ values not taken into account

Example:
- A path is defined: `"user/:userId"`
- `router.go("user/123")` will go to `instace X`
- `router.go("user/456")` will go to `instace Y`
- `router.go("user/123?name=alper")` will go to `instace X`

## Using push
If `router.push` is used instead of `router.go` this **same path check** will not take place.
- `router.push("user/123")` will go to `instace X`
- `router.push("user/456")` will go to `instace Y`
- `router.push("user/123?name=alper")` will go to `instace Z`

# Routing Order
For routing order it is kept in a separate file:
[Routing Order](./routing-order.md)
