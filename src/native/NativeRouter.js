const {Router} = require("../router/Router");
const Route = require("../router/Route");
const DEVICE_OS = {
  ios: "iOS",
  android: "Android"
}

class NativeRouter extends Router {
  /**
   * Create NativeRouter instace by device's 
   *
   * @params {string} 
   */
  static of(deviceOS, { path = "", build = null, routes = [], exact = false, renderer= null }){
    let Renderer;
    switch (deviceOS) {
      case DEVICE_OS.ios:
        Renderer = require("./IOSRenderer");
        break;
      case DEVICE_OS.android:
        Renderer = require("./AndroidRenderer");
        break;
      default: 
        throw new TypeError(deviceOS+" Invalid OS definition.");
    }

    return new NativeRouter({path, build, routes, exact, renderer: new Renderer()});
  }
  
  constructor({ path = "", build = null, routes = [], exact = false, renderer= null }) {
    super({path, build, routes, exact});
    this._renderer = renderer;
    this._currentPage;
  }

  render(matches) {
    const view = super.render(matches);
    if (view === this._currentPage) return;
    
    try{
      view && this._renderer.show(view);
    } catch(e){
      console.log(e.message+ "" + e.stack);
    }
  }
}

module.exports = NativeRouter;
