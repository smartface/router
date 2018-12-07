const parseUrl = path => {
  let url = path || "/";
  let query = "";
  let rawQuery = "";
  let hash = "";

  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    hash = url.substr(hashIndex);
    url = url.substr(0, hashIndex);
  }

  const queryIndex = url.indexOf("?");
  if (queryIndex !== -1) {
    rawQuery = url.substr(queryIndex);
    query =
      "{" +
      rawQuery
        .replace("?", '"')
        .replace(/\&/gi, '","')
        .replace(/\=/gi, '":"') +
      '"}';
    query = JSON.parse(query);
    url = url.substr(0, queryIndex);
  }

  return {
    query,
    url,
    rawQuery: rawQuery === "?" ? "" : rawQuery,
    hash: hash === "#" ? "" : hash
  };
};

module.exports = parseUrl;
