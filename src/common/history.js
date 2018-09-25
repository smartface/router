// https://github.com/ReactTraining/history

const resolvePathname = require("resolve-pathname/umd/resolve-pathname");

const warning = require("./warning");
const createPath = location => {
  const { pathname, search, hash } = location;

  let path = pathname || "/";

  if (search && search !== "?")
    path += search.charAt(0) === "?" ? search : `?${search}`;

  if (hash && hash !== "#") path += hash.charAt(0) === "#" ? hash : `#${hash}`;

  return path;
};

const parsePath = path => {
  let pathname = path || "/";
  let search = "";
  let hash = "";

  const hashIndex = pathname.indexOf("#");
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  const searchIndex = pathname.indexOf("?");
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname,
    search: search === "?" ? "" : search,
    hash: hash === "#" ? "" : hash
  };
};

const createLocation = (path, state, key, currentLocation) => {
  let location;
  if (typeof path === "string") {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = Object.assign({}, path);

    if (location.pathname === undefined) location.pathname = "";

    if (location.search) {
      if (location.search.charAt(0) !== "?")
        location.search = "?" + location.search;
    } else {
      location.search = "";
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
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        'Pathname "' +
          location.pathname +
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
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== "/") {
      location.pathname = resolvePathname(
        location.pathname,
        currentLocation.pathname
      );
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = "/";
    }
  }

  return location;
};

const createTransitionManager = require("./createTransitionManager");

const clamp = (n, lowerBound, upperBound) =>
  Math.min(Math.max(n, lowerBound), upperBound);

/**
 * Creates a history object that stores locations in memory.
 */
const createMemoryHistory = (props = {}) => {
  const {
    getUserConfirmation,
    initialEntries = ["/"],
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

  const push = (path, state) => {
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

  const goBack = () => go(-1);

  const goForward = () => go(1);
  const clear = () => {
    history.index = 0;
    history.entries = [];
    history.length = 0;
  };

  const rollback = () => {
    history.entries.pop();
    history.length = history.length;
    history.index -= 1;
  };

  const canGo = n => {
    const nextIndex = history.index + n;

    return nextIndex >= 0 && nextIndex < history.entries.length;
  };

  const block = (prompt = false) => transitionManager.setPrompt(prompt);

  const listen = listener => transitionManager.appendListener(listener);

  const history = {
    length: entries.length,
    action: "POP",
    location: entries[index],
    index,
    entries,
    createHref,
    push,
    replace,
    rollback,
    go,
    clear,
    goBack,
    goForward,
    canGo,
    block,
    listen
  };

  return history;
};

module.exports = createMemoryHistory;
