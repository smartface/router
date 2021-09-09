import System from "@smartface/native/device/system";
import IOSRenderer from "./IOSRenderer";
import AndroidRenderer from "./AndroidRenderer";

export default function createRenderer() {
  let Renderer: typeof AndroidRenderer | typeof IOSRenderer;
  switch (System.OS) {
    case System.OSType.IOS:
      Renderer = IOSRenderer;
      break;
    case System.OSType.ANDROID:
      Renderer = AndroidRenderer;
      break;
    default:
      throw new TypeError(System.OS + " Invalid OS definition.");
  }
  /**
   * The class Renderer shouldn't take any parameters.
   */
  //@ts-ignore
  return new Renderer();
};
