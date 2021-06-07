/**
 * @typedef {object} RouteMatch Object seperately keeps parsed and matched data of the request for every route
 * @property {boolean} isExact if Requested path is an exact match or not.
 * @property {Object} params Request params like id or name is represented by '/path/:id' or '/path2/:name'
 * @property {string} path Matched route's path
 * @property {string} url Requested route path
 */

export type RouteMatch = {
  isExact: boolean;
  params: object;
  path: string;
  url: string;
};
