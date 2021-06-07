// https://github.com/ReactTraining/history

import warning from "./warning";
import { Location } from "./Location";

/**
 * @ignore
 */
const createTransitionManager = () => {
  let prompt: Function | null = null;

  const setPrompt = (nextPrompt: Function) => {
    warning(prompt == null, "A history supports only one prompt at a time");

    prompt = nextPrompt;

    return () => {
      if (prompt === nextPrompt) prompt = null;
    };
  };

  const confirmTransitionTo = (
    location: Location,
    action: string,
    getUserConfirmation: Function,
    callback: Function
  ) => {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      const result =
        typeof prompt === "function" ? prompt(location, action) : prompt;

      // if (typeof result === "string") {
      if (typeof getUserConfirmation === "function") {
        getUserConfirmation(result, callback);
      } else {
        warning(
          false,
          "A history needs a getUserConfirmation function in order to use a prompt message"
        );

        callback(true);
      }
      // } else {
      //   // Return false from a transition hook to cancel the transition.
      //   callback(result !== false);
      // }
    } else {
      callback(true);
    }
  };

  let listeners: Function[] = [];

  const appendListener = (fn: Function) => {
    let isActive = true;

    const listener = (...args: Function[]) => {
      if (isActive) fn(...args);
    };

    listeners.push(listener);

    return () => {
      isActive = false;
      listeners = listeners.filter(item => item !== listener);
    };
  };

  const notifyListeners = (...args: Function[]) => {
    listeners.forEach(listener => listener(...args));
  };

  return {
    setPrompt,
    confirmTransitionTo,
    appendListener,
    notifyListeners
  };
};

module.exports = createTransitionManager;
