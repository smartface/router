import System from "@smartface/native/device/system";
import IOSRenderer from "./IOSRenderer";
import AndroidRenderer from "./AndroidRenderer";
import Renderer from "./Renderer";

export default function createRenderer() {
  let RendererKlass: typeof Renderer;
  switch (System.OS) {
    case System.OSType.IOS:
      RendererKlass = IOSRenderer;
      break;
    case System.OSType.ANDROID:
      RendererKlass = AndroidRenderer;
      break;
    default:
      throw new TypeError(System.OS + " Invalid OS definition.");
  }
  /**
   * The class Renderer shouldn't take any parameters.
   */
  //@ts-ignore
  return new RendererKlass();
};
