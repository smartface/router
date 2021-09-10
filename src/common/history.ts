// https://github.com/ReactTraining/history
import resolvePathname from "resolve-pathname/umd/resolve-pathname";
import createTransitionManager from "./createTransitionManager";
import parseUrl from "./parseUrl";
import { clamp } from "./clamp";
import { Location } from "./Location";

import warning from "./warning";
const createPath = (location: { url: string, search: string, hash: string }) => {
  const { url, search, hash } = location;

  let path = url || "/";

  if (search && search !== "?")
    path += search.charAt(0) === "?" ? search : `?${search}`;

  if (hash && hash !== "#") path += hash.charAt(0) === "#" ? hash : `#${hash}`;

  return path;
};

/**
 * @typedef {function(location: RouteLocation, action: string)} HistoryListener
 */
export type HistoryListenHandler = (location: Location, action: string) => void;
export type BlockHandler = (prompt?: Function|null) => Function;
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
 * @property {function(fn: BlockHandler):function} block Blocks history changes to ask user or run an another process then resume or break it.
 * @property {function(fn: HistoryListenHandler):function} listen Adds event-handlers to listen history changes.
 *
 */
export type History = {
  length: number,
  action: string,
  index: number,
  entries: Location[],
  createHref: typeof createPath,
  push(path: string|Location, data: object): void,
  replace(path: string, data: object): void,
  rollback(): void,
  go(index: number): void,
  clear(): void,
  goBack(): void,
  goForward():void,
  canGo(index: number): boolean, 
  block: BlockHandler,
  listen(fn: HistoryListenHandler): Function
}


function createLocation(path: string|Location, state?: any, key?: string, currentLocation?: any): Location {
  let location: Location;
  if (typeof path === "string") {
    // Two-arg form: push(path, state)
    location = parseUrl(path);
    location.state = state;
  }
  else {
    // One-arg form: push(location)
    location = Object.assign({}, path);

    if (location.url === undefined) location.url = "";

    if (location.rawQuery) {
      if (location.rawQuery.charAt(0) !== "?")
        location.rawQuery = "?" + location.rawQuery;
    }
    else {
      location.rawQuery = "";
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== "#") location.hash = "#" + location.hash;
    }
    else {
      location.hash = "";
    }

    if (state !== undefined && location.state === undefined)
      location.state = state;
  }

  try {
    location.url = decodeURI(location.url);
  }
  catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        'Pathname "' +
        location.url +
        '" could not be decoded. ' +
        "This is likely caused by an invalid percent-encoding."
      );
    }
    else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.url) {
      location.url = currentLocation.url;
    }
    else if (location.url.charAt(0) !== "/") {
      location.url = resolvePathname(
        location.url,
        currentLocation.url
      );
    }
  }
  else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.url) {
      location.url = "/";
    }
  }

  return location;
};

export type HistoryProps = {
  getUserConfirmation?: any,
  initialEntries?: any[],
  initialIndex?:number,
  keyLength?: number
}

/**
 * Creates a history object that stores locations in memory.
 * @ignore
 * @return {History}
 */
export default function createMemoryHistory(props:HistoryProps = {}): History {
  const {
    getUserConfirmation,
    initialEntries = [],
    initialIndex = 0,
    keyLength = 6
  } = props;

  const transitionManager = createTransitionManager();

  const setState = (nextState?: any) => {
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
    typeof entry === "string" ?
    createLocation(entry, undefined, createKey()) :
    createLocation(entry, undefined, entry.key || createKey())
  );

  // Public interface

  const createHref = createPath;

  const confirmTransitionTo = (
    path: string,
    action: string,
    state: any,
    getUserConfirmation: Function,
    handler: (location: Location, ok: boolean) => void,
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
      (ok: boolean) => handler(location, ok)
    );
  };
  let lastPath;
  const push = (path: Location|string, state: any) => {
    lastPath = path;
    warning(!(
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
      (ok: boolean) => {
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
        }
        else {
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

  const replace = (path: string|Location, state: any) => {
    warning(!(
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
      (ok: boolean) => {
        if (!ok) return;

        history.entries[history.index] = location;

        setState({ action, location });
      }
    );
  };


  const go = (n:number) => {
    const nextIndex = clamp(history.index + n, 0, history.entries.length - 1);

    const action = "POP";
    const location = history.entries[nextIndex];

    transitionManager.confirmTransitionTo(
      location,
      action,
      getUserConfirmation,
      (ok: boolean) => {
        if (ok) {
          setState({
            action,
            location,
            index: nextIndex
          });
        }
        else {
          // Mimic the behavior of DOM histories by
          // causing a render after a cancelled POP.
          setState();
        }
      }
    );
  };

  const getNextLocation = (n: number) => {
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
    history.length = history.entries.length;
    history.index--;
    history.location = history.entries[history.index];
    setState();
  };

  const silencePush = (path: string|Location, state: any) => {
    const action = "PUSH";
    const location = createLocation(path, state, createKey(), history.location);
    history.entries.push(location);
    history.length = history.length;
    history.index++;
  };

  const canGo = (n: number) => {
    const nextIndex = history.index + n;

    return nextIndex >= 0 && nextIndex < history.entries.length;
  };

  const block: BlockHandler = (prompt: Function|boolean|null = false) => transitionManager.setPrompt(prompt);

  const listen = (listener: Function) => transitionManager.appendListener(listener);

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
