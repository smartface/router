const AlertView = require("@smartface/native/ui/alertview");
const Renderer = require("./Renderer");
const Application = require("@smartface/native/application");


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
class AndroidRenderer extends Renderer {
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
  setChildControllers(controllers) {
    this._rootController.childControllers = controllers;
  }
  
  setSelectedIndex(index) {
  if(this._rootController.selectedIndex != index)
    this._rootController.selectedIndex = index;
  }


  /**
   * @override
   */
  pushChild(page, animated = true) {
    // To avoid Android error
    if (this._rootController.childControllers.length !== 0 && this._rootController.childControllers.some(p => p === page)) {
      return;
    }
    animated = this._rootController.childControllers.length === 0 ? false : animated;
    this._rootController.push &&
    this._rootController.push({ controller: page, animated: animated });
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
  onNavigationControllerTransition(fn) {
    if (this._rootController.onTransition) {
      this._rootController.onTransition = fn;
      return () => (this._rootController.onTransition = () => null);
    }

    return () => null;
  }

  /**
   * @override
   */
  popChild(animated = true) {
    this._rootController.childControllers.length > 1 &&
    this._rootController.pop &&
      this._rootController.pop({ animated: animated });
  }

  /**
   * @override
   */
  show(page) {
    if(this._activePage == page)
      return;
    Application.setRootController(page);
    this._activePage = page;
  }
}

module.exports = AndroidRenderer;
