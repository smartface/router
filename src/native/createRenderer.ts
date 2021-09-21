import System from "@smartface/native/device/system";
import IOSRenderer from "./IOSRenderer";
import AndroidRenderer from "./AndroidRenderer";
export default function createRenderer(): IOSRenderer | AndroidRenderer {
  /**
   * The class Renderer shouldn't take any parameters.
   */
  return System.OS === System.OSType.IOS ? new IOSRenderer() : new AndroidRenderer();
};
