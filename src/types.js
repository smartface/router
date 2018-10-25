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
 * @external {BottomTabBarItem} http://docs.smartface.io/#!/api/UI.BottomTabBarItem
 */

/**
 * @typedef NavigationControllerTransformEvent
 * @property {Page} frompage
 * @property {Page} topage
 * @property {{operation: number}} operation
 */

/**
 * @typedef {Object} RouteMatch
 * @property {boolean} isExact if Requested path is an exact match or not.
 * @property {Object} params
 * @property {string} path
 * @property {string} url
 */

/**
 * @typedef {Object} RouteLocation
 * @property {string} pathname
 * @property {string} search
 * @property {string} hash
 * @property {RouteState} state
 * @property {string} key
 */

/**
 * @typedef {Object} RouteParams
 * @property {string} path
 * @property {Array<Route>} routes
 * @property {boolean} exact
 * @property {function(match: RouteMatch)} onBeforeMatch
 */

/**
 * @typedef {Object} RouteState
 * @property {objec} userState
 * @property {Object} view
 */

/**
 * @typedef {function(match: RouteMatch, state: object, router: Router, view: Page)} RouteBuildHandler
 */

/**
 * @typedef {function(location: RouteLocation, action: string)} RouterBlockHandler
 *
 */

/**
 * @typedef {function(location: RouteLocation)} HistoryListener
 *
 */
