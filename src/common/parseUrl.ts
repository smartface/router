const parseUrl = (path: string): {url: string, rawQuery: string, hash: string, query?: { [key: string]: any }} => {
  let url = path || "/";
  let rawQuery = "";
  let hash = "";
  let query;

  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    hash = url.substr(hashIndex);
    url = url.substr(0, hashIndex);
  }

  const queryIndex = url.indexOf("?");
  if (queryIndex !== -1) {
    rawQuery = url.substr(queryIndex);
    query = JSON.parse("{" +
      rawQuery
        .replace("?", '"')
        .replace(/\&/gi, '","')
        .replace(/\=/gi, '":"') +
      '"}');
    url = url.substr(0, queryIndex);
  }

  return {
    query,
    url,
    rawQuery: rawQuery === "?" ? "" : rawQuery,
    hash: hash === "#" ? "" : hash
  };
};

export default parseUrl;
