// https://github.com/ReactTraining/history
"use strict";

const resolvePathname = require("resolve-pathname/umd/resolve-pathname");
const parseUrl = require("./parseUrl");

const warning = require("./warning");
const createPath = location => {
  const { url, search, hash } = location;

  let path = url || "/";

  if (search && search !== "?")
    path += search.charAt(0) === "?" ? search : `?${search}`;

  if (hash && hash !== "#") path += hash.charAt(0) === "#" ? hash : `#${hash}`;

  return path;
};

const createTransitionManager = require("./createTransitionManager");

const clamp = (n, lowerBound, upperBound) =>
  Math.min(Math.max(n, lowerBound), upperBound);

const createLocation = (path, state, key, currentLocation) => {
  let location;
  if (typeof path === "string") {
    // Two-arg form: push(path, state)
    location = parseUrl(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = Object.assign({}, path);

    if (location.url === undefined) location.url = "";

    if (location.query) {
      if (location.query.charAt(0) !== "?")
        location.query = "?" + location.query;
    } else {
      location.query = "";
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== "#") location.hash = "#" + location.hash;
    } else {
      location.hash = "";
    }

    if (state !== undefined && location.state === undefined)
      location.state = state;
  }

  try {
    location.url = decodeURI(location.url);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        'Pathname "' +
          location.url +
          '" could not be decoded. ' +
          "This is likely caused by an invalid percent-encoding."
      );
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.url) {
      location.url = currentLocation.url;
    } else if (location.url.charAt(0) !== "/") {
      location.url = resolvePathname(
        location.url,
        currentLocation.url
      );
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.url) {
      location.url = "/";
    }
  }

  return location;
};

/**
 * Creates a history object that stores locations in memory.
 * @ignore
 * @return {History}
 */
const createMemoryHistory = (props = {}) => {
  const {
    getUserConfirmation,
    initialEntries = [],
    initialIndex = 0,
    keyLength = 6
  } = props;

  const transitionManager = createTransitionManager();

  const setState = nextState => {
    Object.assign(history, nextState);

    history.length = history.entries.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  const createKey = () =>
    Math.random()
      .toString(36)
      .substr(2, keyLength);

  const index = clamp(initialIndex, 0, initialEntries.length - 1);
  const entries = initialEntries.map(
    entry =>
      typeof entry === "string"
        ? createLocation(entry, undefined, createKey())
        : createLocation(entry, undefined, entry.key || createKey())
  );

  // Public interface

  const createHref = createPath;

  const confirmTransitionTo = (
    path,
    action,
    state,
    getUserConfirmation,
    handler,
    key = ""
  ) => {
    const location = createLocation(
      path,
      state,
      key || createKey(),
      history.location
    );
    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      ok => handler(location, ok)
    );
  };
  let lastPath;
  const push = (path, state) => {
    lastPath = path;
    warning(
      !(
        typeof path === "object" &&
        path.state !== undefined &&
        state !== undefined
      ),
      "You should avoid providing a 2nd state argument to push when the 1st " +
        "argument is a location-like object that already has state; it is ignored"
    );

    const action = "PUSH";
    const location = createLocation(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      ok => {
        if (!ok) return;

        const prevIndex = history.index;
        const nextIndex = prevIndex + 1;

        const nextEntries = history.entries.slice(0);
        if (nextEntries.length > nextIndex) {
          nextEntries.splice(
            nextIndex,
            nextEntries.length - nextIndex,
            location
          );
        } else {
          nextEntries.push(location);
        }

        setState({
          action,
          location,
          index: nextIndex,
          entries: nextEntries
        });
      }
    );
  };

  const replace = (path, state) => {
    warning(
      !(
        typeof path === "object" &&
        path.state !== undefined &&
        state !== undefined
      ),
      "You should avoid providing a 2nd state argument to replace when the 1st " +
        "argument is a location-like object that already has state; it is ignored"
    );

    const action = "REPLACE";
    const location = createLocation(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      ok => {
        if (!ok) return;

        history.entries[history.index] = location;

        setState({ action, location });
      }
    );
  };

  const go = n => {
    const nextIndex = clamp(history.index + n, 0, history.entries.length - 1);

    const action = "POP";
    const location = history.entries[nextIndex];

    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      ok => {
        if (ok) {
          setState({
            action,
            location,
            index: nextIndex
          });
        } else {
          // Mimic the behavior of DOM histories by
          // causing a render after a cancelled POP.
          setState();
        }
      }
    );
  };

  const getNextLocation = n => {
    const nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
    return history.entries[nextIndex];
  };

  const goBack = () => go(-1);

  const goForward = () => go(1);
  const clear = () => {
    lastPath = null;
    history.index = -1;
    history.entries = [];
    history.length = 0;
  };

  const rollback = () => {
    history.entries.pop();
    history.length = history.length;
    history.index--;
  };

  const silencePush = (path, state) => {
    const action = "PUSH";
    const location = createLocation(path, state, createKey(), history.location);

    history.entries.push(location);
    history.length = history.length;
    history.index++;
  };

  const canGo = n => {
    const nextIndex = history.index + n;

    return nextIndex >= 0 && nextIndex < history.entries.length;
  };

  const block = (prompt = false) => transitionManager.setPrompt(prompt);

  const listen = listener => transitionManager.appendListener(listener);

  /**
   * @type History
   */
  const history = {
    length: entries.length,
    action: "POP",
    location: entries[index],
    index,
    entries,
    createHref,
    push,
    silencePush,
    replace,
    rollback,
    go,
    clear,
    goBack,
    goForward,
    canGo,
    block,
    listen,
    dispatchLast: () =>
      transitionManager.notifyListeners(history.location, history.action),
    confirmTransitionTo
  };

  return history;
};

module.exports = createMemoryHistory;
