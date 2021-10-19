import createMemoryHistory, { History } from "./history";
import type { BlockHandler, HistoryProps } from "./history";
import { matchUrl } from "./matchPath";
import { Location } from "./Location";
import { HistoryActions } from "common";

type HistoryControllerParams = HistoryProps & {exact: boolean, sensitive: boolean, strict: boolean, path: string};

/**
 * History service wrapper
 * 
 * @access package
 * @class HistoryController
 */
export class HistoryController {
  private _listeners = new Set<Function>();
  private _unlistenAll = new Set<Function>();
  private _nodes = new Set<HistoryController>();
  private _prompt: Function | null = null;
  private _unblock: Function = () => {};
  private _preventDefault: boolean = false;

  /**
   * 
   * @param {{?initialEntries: Array, ?initialIndex: number, ?keyLength: number, ?getUserConfirmation: function, sensitive: boolean, strict: boolean, path: stringg}} _options 
   * @param {?History} _history
   */
  constructor(
    private _options: Partial<HistoryControllerParams>,  
    private _history: History = createMemoryHistory({
    initialEntries: _options.initialEntries || [], // The initial URLs in the history stack
    initialIndex: _options.initialIndex || 0, // The starting index in the history stack
    keyLength: _options.keyLength || 20, // The length of location.key
    // A function to use to confirm navigation with the user. Required
    // if you return string prompts from transition hooks (see below)
    getUserConfirmation: (blockerFn: BlockHandler, callback: Function) => this.routeBlocker(blockerFn, callback)
  })) {
  }
  private routeBlocker(blockerFn: BlockHandler, callback: Function) {
    this._preventDefault === false && this._options.getUserConfirmation !== null
      ? this._options.getUserConfirmation(blockerFn, callback)
      : callback(true);
  };

  
    clearBlocker() {
      this._unblock && this._unblock();
    }

    onGoBack = () => {}
    onPush = (path: string, data: any, prompt?: Function|null) => {}

    /**
     * Prevent history change event
     */
    preventDefault() {
      this._preventDefault = true;
    }

    clearPreventDefault() {
      this._preventDefault = false;
    }

    block(prompt: Function) {
      this._prompt = prompt;
      this.clearBlocker();
      this._unblock = this._history.block(this._prompt);

      return () => {
        this._prompt = null;
        this._unblock();
      };
    }

    clear() {
      this._history.clear();
    }

    getHistoryasArray() {
      return this._history.entries.map(item => item.url) || [];
    }

    /**
     * @param {object} [={}] props Node properties
     * @return {HistoryController}
     */
    createNode(props: Partial<HistoryControllerParams> = {}) {
      const node = new HistoryController(props);
      this._nodes.add(node);
      // bubbles history goback to root until go back could be possible.
      node.onGoBack = () => {
        if (this._history.canGo(-1)) {
          // _listeners.forEach(listener => listener(_history.location, 'POP'))
          this._history.go(-1);
        } else {
          this.onGoBack && this.onGoBack();
        }
      };
      // bubbles the last push up to root until pushing can be possible.
      node.onPush = (path, data) => {
        if (this.canPush(path)) {
          this.push(path, data);
        } else {
          this.onPush && this.onPush(path, data);
        }
      };

      return node;
    }

    get lastLocation() {
      return this._history.entries[this._history.index];
    }
    
    get lastLocationUrl() {
      return this._history.entries[this._history.index].url;
    }

    /**
     * Return all nodes
     * @return {Set<HistoryController>}
     */
    get nodes() {
      return new Set(this._nodes);
    }

    /**
     * @return {History}
     */
    get history() {
      return this._history;
    }

    pushLocation(location: Location, data?: any) {
      this._history.push(location, data);
    }

    /**
     * Removes last history entry
     *
     * @todo notify all listeners as action is rollback
     */
    rollback() {
      this._preventDefault = true;
      this._history.rollback();
      this._preventDefault = false;
    }

    /**
     * If the url is available to push or not.
     *
     * @param {string} url - Url will be pushed.
     */
    canPush(url: string) {
      const res = matchUrl(url, this._options);
      return res !== null;
    }

    /**
     * Pushes a new url to history
     *
     * @param {string|Location} url - Url will be pushed.
     * @param {object} routeData - Requested route data
     */
    push(url: string, routeData = {}) {
      this.canPush(url)
        ? this._history.push(url, routeData)
        : !this._preventDefault &&
          this.onPush &&
          this.onPush(url, routeData, this._prompt);
      this._preventDefault && this.clearPreventDefault();
    }

    /**
     * History can be stepped back or not
     * @param {number} n a negative number is amount of stepping back
     *
     * @return boolean
     */
    canGoBack(n=-1) {
      return this._history.canGo(n);
    }
    
    goBackto(n: number) {
      this._history.go(n) 
      this._preventDefault && this.clearPreventDefault();
    }
    
    currentIndex(){
      return this._history.index;
    }

    /**
     * One step back
     */
    goBack() {
      this._history.canGo(-1)
        ? this._history.goBack()
        : !this._preventDefault && this.onGoBack && this.onGoBack();
      this._preventDefault && this.clearPreventDefault();
    }
    
    getLength(){
      return this._history.length
    }

    /**
     * Adds history change handler and returns unlisten function
     *
     * @param {HistoryListener} fn Event handler callback
     * @return {function} unlisten function
     */
    listen(fn: (location: Location, action: HistoryActions, previous: Location) => void) {
      const unlisten = new Set<Function>();

      this._listeners.add(fn);
      const wrapper = (location: Location, action: HistoryActions) => {
        !this._preventDefault &&
          fn(location, action, this._history.entries[this._history.index]);
      };
      unlisten.add(this._history.listen(wrapper));
      unlisten.forEach(item => this._unlistenAll.add(item));
      return () => {
        unlisten.forEach(item => {
          item();
          this._unlistenAll.delete(item);
        });
        this._listeners.delete(fn);
      };
    }
    
    findIndex:Array<Location>['findIndex'] = (fn) => {
      return this._history.entries.findIndex(fn);
    }

    find(fn: (value: Location, index: number)=> boolean){
      return this._history.entries.find(fn);
    }

    /**
     * Returns string representation of an instance
     *
     * @return {string}
     */
    toString() {
      return `[Object HistoryController, 
        stack: ${JSON.stringify(this.getHistoryasArray())}, 
        length ${this._history.length}, 
        index : ${this._history.index}]`;
    }

    /**
     * Disposes this instance
     */
    dispose() {
      this._nodes.forEach(node => node.dispose());
      this._unlistenAll.forEach(item => item());
      this._unlistenAll.clear();
      this._listeners.clear();
      this._history = {} as any;
      this.onGoBack = ()=>{};
    }
  }
