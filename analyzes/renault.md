This is the use case for router in Renault Project RS

```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
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
    onBeforeRouting: (routingOptions ) => {
        if(routingOptions.path === "addVehicle") {
            if(userLoggedIn) {
                return true;
            } else {
                rootRouter.go("login");
                return false;
            }
        }
    }
});


const dealersRouter = new StackRouter({
    routes: [{
        path: "cart",
        target: require("pages/dealers")
    }
});

const tabRouter = new BottomTabBarRouter({
    tabs: {
        dashboard: {
            target: dashboardRouter,
            icon: {
                normal: Image.createFromFile("images://dashboard.png");
                active: Image.createFromFile("images://dashboard_active.png");
                focussed: Image.createFromFile("images://dashboard_focussed.png");
            },
            text: "Dashboard"
        },
        dealers: {
            target: dealersRouter,
            icon: {
                normal: Image.createFromFile("images://dealers.png");
                active: Image.createFromFile("images://dealers_active.png");
                focussed: Image.createFromFile("images://dealers_focussed.png");
            },
            text: "Dealers"
        }
    },
    tint: {
        normal: Color.GRAY,
        active: Color.BLACK
    }
});


const mainRouter = new StackRouter({
    initialPath:  userLoggedIn? "tabs": "pgPhoneEntry",
    routes: [{
        path: "pgPhoneEntry",
        target: pgPhoneEntry
    }, {
        path: "pgSMS",
        target: pgSMS
    }, {
        path: "tabs",
        target: tabRouter
    }
    
    ]
});


const loginRouter = new StackRouter({
    initialPath: "pgPhoneEntry",
    routes: [{
        path: "pgPhoneEntry",
        target: pgPhoneEntry
    }, {
        path: "pgSMS",
        target: pgSMS
    }]
});


const rootRouter = new ModalRouter({
    initialPath: "main",
    routes: [
    {
        path: "main",
        target: mainRouter
    },
     {
        path: "login",
        target: loginRouter
    }]
});


Application.setupRouter(rootRouter);

```

If user has skipped the login and needs to login as a modal:
```javascript
//pgDashboard
onPress = () => {
    if(loggedIn)
        page.routing.go("addVehicle");
    else
        page.routing.go("/login");
    page.routing.go("../dealers");
}




```

main
    pgPhoneEntry
    pgSMS
    tabs
        dashboard
            dashboard <--
            addVehicle
        dealers
            cart
login
    pgPhoneEntry
    pgSMS


user
    :id
category
    :id
    product
        id




