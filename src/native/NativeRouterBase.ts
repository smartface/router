"use strict";
import Router from "../router/Router";
import HeaderBar from "@smartface/native/ui/headerbar";
/**
 * Native router base
 * @class
 */
export default class NativeRouterBase extends Router {
  protected _renderer: any; //BottomNativationController | NavigationController | Page
  setHeaderbarProps(props: HeaderBar) {
    if(this._renderer?._rootController?.headerBar) {
      this._renderer._rootController.headerBar = props;
    }
  }
}