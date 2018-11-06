/**
 * @external {Page} http://docs.smartface.io/#!/api/UI.Page
 */

/**
 * @external {NavigationController} http://docs.smartface.io/#!/api/UI.NavigationController
 */

/**
 * @external {BottomTabbarController} http://docs.smartface.io/#!/api/UI.BottomTabBarController
 */

/**
 * @external {TabBarItem} http://docs.smartface.io/#!/api/UI.TabBarItem
 */

/**
 * @external {Image} http://docs.smartface.io/#!/api/UI.Image
 */

/**
 * @external {Color} http://docs.smartface.io/#!/api/UI.Color
 */

/**
 * @typedef {object<string,string|object>} BottomTabBarItem Represent {@link TabBarItem} params
 * @property {Image} icon
 * @property {string} title
 */

/**
 * @typedef {RouterParams} BottomTabBarRouterParams
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {object} tabbarParams See {@link BottomTabbarController}
 */

/**
 * @typedef {RouterParams} NativeStackRouterParams
 * @property {Array<BottomTabBarItem>} items BottomTabBarItem collection
 * @property {function():HeaderBarParams} headerBarParams See {@link NavigationController}
 */

/**
 * @typedef {object} HeaderBarParams
 * @property {{transulent: boolean, alpha: number, backIndicatorImage: Image, backIndicatorTransitionMaskImage: Image, prefersLargeTitles: boolean}} ios
 * @property {boolean} borderVisibility
 * @property {Color} titleColor
 * @property {boolean} transparent
 * @property {boolean} visible
 * @property {Color} backgroundColor
 */

/**
 * @typedef NavigationControllerTransformEvent
 * @property {Page} frompage
 * @property {Page} topage
 * @property {{operation: number}} operation
 */

/**
 * @typedef {object} RouteMatch
 * @property {boolean} isExact if Requested path is an exact match or not.
 * @property {Object} params
 * @property {string} path
 * @property {string} url
 */

/**
 * @typedef {object} RouteLocation
 * @property {string} pathname
 * @property {string} search
 * @property {string} hash
 * @property {RouteState} state
 * @property {string} key
 */

/**
 * @typedef {object} RouteParams
 * @property {string} path
 * @property {Array<Route>} routes
 * @property {boolean} exact
 * @property {function(route: Route, nextState: RouteState)} routeShouldMatch Handles if route is mathed as request url
 * @property {function(Router: Router, route: Route)} routeDidEnter Handles if route is displayed
 * @property {function(Router: Router, route: Route)} routeDidExit Handles if route is removed
 */

/**
 * @typedef {object} RouteState
 * @property {object} routeData
 * @property {string} action
 * @property {RouteMatch} match
 * @property {object} view 
 * @property {object} routingState Keeps user data when route runs
 */

/**
 * @typedef {function(route: Route, nextState: RouteState)} RouteShouldMatchHandler
 */

/**
 * @typedef {function(route: Route, nextState: RouteState)} RouteBuildHandler
 */

/**
 * @typedef {function(path: string, routeData: object, action: string, okFn: function(ok: boolean))} RouterBlockHandler
 *
 */

/**
 * @typedef {function(location: RouteLocation, action: string)} HistoryListener
 */
/**
 * History implementation
 *
 * @typedef {object} History
 *
 * @property {number} length
 * @property {string} action
 * @property {number} index
 * @property {Array<RouteLocation>} entries
 * @property {function} createHref
 * @property {function(path: string, data: object)} push
 * @property {function(path: string)} silencePush
 * @property {function(path: string, data: object)} replace
 * @property {function} rollback
 * @property {function(index: number)} go
 * @property {function} clear
 * @property {function} goBack
 * @property {function} goForward
 * @property {function(index: number):boolean} canGo
 * @property {function(fn: RouterBlockHandler):function} block
 * @property {function(fn: HistoryListener):function} listen
 *
 */
