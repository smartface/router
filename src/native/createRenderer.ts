import System from "@smartface/native/device/system";
import IOSRenderer from "./IOSRenderer";
import AndroidRenderer from "./AndroidRenderer";
import { ControllerType } from "core/Controller";
export default function createRenderer(controller?: ControllerType): IOSRenderer | AndroidRenderer {
  /**
   * The class Renderer shouldn't take any parameters.
   */
  return System.OS === System.OSType.IOS ? new IOSRenderer(controller) : new AndroidRenderer(controller);
};
