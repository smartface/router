/* from react-router */

import pathToRegexp from "path-to-regexp";
import type {Key, RegExpOptions} from "path-to-regexp";
import parseUrl from "./parseUrl";
import { MatchOptions } from "./MatchOptions";

const patternCache: {[key: string]: any} = {};
const cacheLimit = 10000;
let cacheCount = 0;

/**
 * @ignore
 * @param {*} pattern
 * @param {*} options
 */
export const compilePath = (pattern: string, options: RegExpOptions) => {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) return cache[pattern];

  const keys: Key[] = [];
  const re = pathToRegexp(pattern, keys, options);
  const compiledPattern = {
    re,
    keys
  };

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern;
    cacheCount++;
  }

  return compiledPattern;
};

type Pathname = string;

/**
 * Public API for matching a URL pathname to a path pattern.
 * @ignore
 */
export const matchPath = (pathname: string, options:MatchOptions|Pathname = {}, parent: string) => {
  let _options: MatchOptions;
  if (typeof options === "string")
    _options = {
      path: options
    };
  else
    _options = options;
  
  const { path, exact = false, strict = false, sensitive = false } = _options;

  if (path == null) return parent;

  const { re, keys } = compilePath(path, {
    end: exact,
    strict,
    sensitive
  });
  const match = re.exec(pathname);

  if (!match) return null;

  const url = match.shift();
  const values = match.slice();
  // [url, ...values] = ;
  const isExact = pathname === url;

  if (exact && !isExact) return null;

  return {
    path, // the path pattern used to match
    url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index];
      return memo;
    }, {})
  };
};

/**
 * @ignore
 * @param {*} url
 * @param {*} options
 * @return {RouteMatch}
 */
export const matchUrl = (url: string, options: MatchOptions) => {
  const res = matchPath(parseUrl(url).url, options);
  return res;
};
