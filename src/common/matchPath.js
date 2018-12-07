/* from react-router */

const pathToRegexp = require("path-to-regexp");
const parseUrl = require("./parseUrl");
const patternCache = {};
const cacheLimit = 10000;
let cacheCount = 0;

/**
 * @ignore
 * @param {*} pattern
 * @param {*} options
 */
const compilePath = (pattern, options) => {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) return cache[pattern];

  const keys = [];
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

/**
 * Public API for matching a URL pathname to a path pattern.
 * @ignore
 */
const matchPath = (pathname, options = {}, parent) => {
  if (typeof options === "string")
    options = {
      path: options
    };

  const { path, exact = false, strict = false, sensitive = false } = options;

  if (path == null) return parent;

  console.log(pathname+" :: "+ path + " " +JSON.stringify(options))

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
const matchUrl = (url, options) => {
  const res = matchPath(parseUrl(url).url, options);
  return res;
};

module.exports = {
  compilePath,
  matchPath,
  matchUrl
};
