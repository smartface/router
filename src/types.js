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
 * @typedef {function(route: Route, nextState: RouteState)} RouteShouldMatchHandler
 */

/**
 * @typedef {function(route: Route, nextState: RouteState)} RouteBuildHandler
 */

/**
 * @typedef {function(path: string, routeData: object, action: string, okFn: function)} RouterBlockHandler
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
 * @property {number} length Length of the history stack
 * @property {string} action Last action
 * @property {number} index Current active index of the history
 * @property {Array<RouteLocation>} entries
 * @property {function} createHref Creates an appropriate url given data
 * @property {function(path: string, data: object)} push Pushes a new entry
 * @property {function(path: string, data: object)} replace Replaces specified history entry with a desired one
 * @property {function} rollback Rollback last entry
 * @property {function(index: number)} go Jumps to desired history entry by index
 * @property {function} clear Clears all history
 * @property {function} goBack Jumps to previous entry
 * @property {function} goForward Jumps to next entry
 * @property {function(index: number):boolean} canGo Checks if history goes back or not
 * @property {function(fn: RouterBlockHandler):function} block Blocks history changes to ask user or run an another process then resume or break it.
 * @property {function(fn: HistoryListener):function} listen Adds event-handlers to listen history changes.
 *
 */
