var loginPageRoute = new Route("login", "login-page"); 
var userProfileRoute = new Route("user/:name/profile", "home-page");

var screens = [
  // ---->
  "login-page",
  (routeData) => require("login-page"),
  // ---->
  "home-page",
  (routeData) => require("home-page"),
  // ---->
  "user-settings",
  new RouteState({
    screen: (routeData, routerState) => require("user-settings-page"),
    drawer: (routeData, routerState) => new SliderDrawerComponent(),
    transition: (routeData, routerState) => "transition type",
    onEnter: (routeData, routerState) => ..., // maybe if it's needed
    onExit: (routeData, routerState, isBack) => ... // maybe if it's needed
    // When history goes back, page can be unloaded
    // if isBack === true screen component can be unloaded
    // onExit: (routeData, routerState, isBack) => isBack && this.screen.unload();
  }),
  // ---->
  "user-profile", 
  (routeData) => require("user-profile-page"),
  // ---->
  "user-permissions", 
  (routeData) => require("user-permissions-page")
];

var stackRoute = new StackRoute(
  "user",
  "user-dashboard", // index screen of the Route
  [
    new StackRoute("settings", "user-settings", [
      new Route("permissions", "user-permissions")
    ]),
    new Route("profile", "user-profile")
  ]
);

Router.use(stackRoute, loginPageRoute, userProfileRoute);

// register page components
Router.register(screens);

// register routes
Router.use(checkLoginMaybe);

//adds new middleware
Router.use({
  provide: (routeData, transition, next) => {
    if (routeData.path.indexOf("user/") === 0 && UserService.getUserRole() === 'admin') {
      routeData.path = "/user/admin/home";
    }

    next();
  }
});

// into user settings page
// if calls 'user' route then inject stackrouter to page automatically 
// ...

var button = new Button();
button.onClick = () => page.router.navigate("/permissions");

// ...

button.onClick = () => page.router.navigate("user/settings/permissions");
