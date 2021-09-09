import Renderer from "./Renderer";
import Application from '@smartface/native/application';
import NavigationController from "@smartface/native/ui/navigationcontroller";
import BottomTabBarController from "@smartface/native/ui/bottomtabbarcontroller";
import Page from "@smartface/native/ui/Page";

let stack = [];
let timeout = 0;
/**
 * Rendering strategy for Android
 * It encapsulates all logic to display pages on Android
 *
 * @class
 * @access package
 * @extends {Renderer}
 */
export default class AndroidRenderer extends Renderer {
  protected _activePage?: Page; 
  /**
   * @constructor
   */
  constructor() {
    super();
  }
  
  // present(controller, animated, onComplete) {
  //   // alert('present');
  //   setTimeout(() => {
  //     this._rootController.present({
  //       controller,
  //       animated,
  //       onComplete
  //     });
  //   },300);
  // }

  /**
   * @override
   */
  setChildControllers(controllers: NavigationController[]) {
    if(this._rootController instanceof NavigationController) {
      this._rootController.childControllers = controllers;
    }
  }
  
  setSelectedIndex(index: number) {
  if (this._rootController instanceof BottomTabBarController) {
    if(this._rootController.selectedIndex !== index)
      this._rootController.selectedIndex = index;
    }
  }


  /**
   * @override
   */
  pushChild(page: Page, animated = true) {
    // To avoid Android error
    if (this._rootController instanceof NavigationController) {
      if (this._rootController.childControllers.length !== 0 && this._rootController.childControllers.some((p) => p === page)) {
        return;
      }
      animated = this._rootController.childControllers.length === 0 ? false : animated;
      if (typeof this._rootController.push === 'function') {
        //@ts-ignore Check TYPING-14
        this._rootController.push({ controller: page, animated: animated });
  
      }
    }
    this._activePage = page;
    // stack.push((index) => setTimeout(() => {
    // }, index*10));
    // timeout = setTimeout(() => {
    //   stack.forEach((item, index) => {
    //     item(index);
    //   });
    //   stack = [];
    // }, 16);
  }

  // pushChild(page, animated = true) {
  //   // To avoid Android error
  //   alert('pushChild before');
  //   if (this._rootController.childControllers.length !== 0 && this._rootController.childControllers.some(p => p === page)) {
  //     return;
  //   }
  //   alert('pushChild');
  //   animated = this._rootController.childControllers.length === 0 ? false : animated;
  //   clearTimeout(timeout);
  //   stack.push((index) => setTimeout(() => {
  //     this._rootController.push &&
  //       this._rootController.push({ controller: page, animated: animated });
  //     this._activePage = page;
  //   }, index*10));
  //   timeout = setTimeout(() => {
  //     stack.forEach((item, index) => {
  //       item(index);
  //     });
  //     stack = [];
  //   }, 16);
  // }

  /**
   * @override
   */
  onNavigationControllerTransition(fn: (...args: any) => void) {
    if (this._rootController instanceof NavigationController) {
      if (this._rootController.onTransition) {
        this._rootController.onTransition = fn;
        //@ts-ignore
        return () => (this._rootController.onTransition = () => null);
      }
    }
    return () => null;
  }

  /**
   * @override
   */
  popChild(animated = true) {
    if (this._rootController instanceof NavigationController) {
      if (this._rootController.childControllers.length > 1 && typeof this._rootController.pop === 'function') {
        this._rootController.pop({ animated: animated });
      }
    }
  }

  /**
   * @override
   */
  show(page: Page) {
    if(this._activePage == page) {
      return;
    }
    Application.setRootController(page);
    this._activePage = page;
  }
}