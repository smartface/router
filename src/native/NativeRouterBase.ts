"use strict";
import Router from "../router/Router";
import HeaderBar from "@smartface/native/ui/headerbar";
import Renderer from "./Renderer";
import Page from "@smartface/native/ui/Page";
/**
 * Native router base
 * @class
 */
export default class NativeRouterBase<Ttarget = Page> extends Router<Ttarget> {
  protected _renderer?: Renderer;
  setHeaderbarProps(props: HeaderBar) {
    if(this._renderer?._rootController instanceof Page) {
    if(this._renderer?._rootController?.headerBar) {
      /**
       * On Page type, headerBar is read-only property
       */
      //@ts-ignore
      this._renderer._rootController.headerBar = props;
    }
    }
  }
}