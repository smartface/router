/**
 * @param {string} path
 * @param {object} routeParams - gets from routing
 * @param {object} routeData - gets from
 */
export default function createRouteData(path, routeParams, routeData){
  return {
    path,
    routeParams,
    routeData
  }
}
