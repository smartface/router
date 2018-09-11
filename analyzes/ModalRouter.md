# Modal Router
Modal router is showing pages on top of each other. This is a kind of a Stack Router **without Headerbar**.
- It has a initial path as the background
- Others are opened on top of it

Modal pages are shown as full area or screen.

Main difference between stack with default behaviours:
- Stack opens from right to left
- Modal opens from bottom to top

# Sample
```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
const ModalRouter = require("sf-core/router/modal")

const mainRouter = new StackRouter({
    routes: [{
        path: "page1",
        target: "pages/page1"
    }, {
        path: "page2",
        target: "pages/page2"
    }]
});

const rootRouter = new ModalRouter({
    initialPath: "main", //optional
    routes: [
    {
        path: "main",
        target: mainRouter
    },
     {
        path: "login",
        target: "pages/pgLogin"
    }]
});

Application.setupRouter(rootRouter);
```

# Behaviour
- `goBack` closes the modal page
- A modal can be opened on top of another