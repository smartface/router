# Data sources
There are several sources that data is set:
- set parameters
- routing parameters
- hash parameter
- path parameter
- query parameter
- scaffold parameter

Each of them are setting the key.
Keys should not contain cloumn `:` chracter

## Routing parameters
Those parameters are given as an optional argument to `go`, `goBack`, `push`


Values are set:
```javascript
page.routing.go("page2", {
    key1: "value",
    key2: {
        // this will not set a nested key, will fetch the object later
        prop1: "value"
    }
});
```

Retrieved:
```javascript
console.log(page.routing.getData("key1")); // value
console.log(JSON.stringify(page.routing.getData("key2"))); // {"prop1":"value"}
```

## Hash Parameter
This is set within the URL of the routing path.
```javascript
page.routing.go("page2#alper");
```

Retrieved:
```javascript
console.log(page.routing.getData("hash")); // alper
```
## Path parameter
A page is defined with a path parameter such as `user/:userId`. Than `userID` is the key to that.

```javascript
page.routing.go("user/1234");
```

Retrieved:
```javascript
console.log(page.routing.getData("userId")); // 1234
```

## Query parameter
Query parameter is defined within the URL:
```javascript
page.routing.go("page2?key1=x&key2=y");
```

Retrieved:
```javascript
console.log(page.routing.getData("key1")); // x
console.log(page.routing.getData("key2")); // y
```

## Scaffold parameter
Those parameters are defind within the scaffold of the route.
```javascript
[{
    path: "page2",
    target: "pages/page2",
    data: {
        key1: "value",
        key2: {
            // this will not set a nested key, will fetch the object later
            prop1: "value"
        }
    }
}, {
    path: "page3",
    target: "pages/page3",
    data: (routingOptions) => ({
        key1: "value",
        key2: {
            // this will not set a nested key, will fetch the object later
            prop1: "value"
        }
    })
}]
```

```javascript
console.log(page.routing.getData("key1")); // value
console.log(JSON.stringify(page.routing.getData("key2"))); // {"prop1":"value"}
```
## Set parameters (setData)
Those parameters set via the `setData` method.

# Conflicting keys
It is possible to have same keys can shadow one another. Order of them are defined at the top of the document.

`key1` is conflicted
```javascript
page.routing.go("page2?key1=x&key2=y", {
    key1: "a"
});
```

Routing parameters are in more high priority
Retrieved:
```javascript
console.log(page.routing.getData("key1")); // a
console.log(page.routing.getData("key2")); // y
console.log(page.routing.getData("query:key1")); // x
console.log(page.routing.getData("routing:key1")); // a
```

When there is a conflict adding a prefix to the key will solve the problem. Prefixes are:
- routing
- hash
- path
- query
- scaffold

There is not need a prefix for the keys set via the `setData` method.

