const DeviceOS = require("../common/DeviceOS");

module.exports = function createRenderer(root, params = {}) {
  let Renderer;
  switch (Device.deviceOS) {
    case DeviceOS.ios:
      Renderer = require("./IOSRenderer");
      break;
    case DeviceOS.android:
      Renderer = require("./AndroidRenderer");
      break;
    default:
      throw new TypeError(Device.deviceOS + " Invalid OS definition.");
  }

  return new Renderer(root, params);
};
