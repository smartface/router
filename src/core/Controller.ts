import Page from "@smartface/native/ui/page";
import NavigationController from "@smartface/native/ui/navigationcontroller";
import BottomTabBarController from "@smartface/native/ui/bottomtabbarcontroller";
import HeaderBar from "@smartface/native/ui/headerbar";
import { BottomSheetOptions } from "native/BottomSheetOptions";
import { EventEmitterNativeComponent } from "@smartface/native/core/eventemitter";

export type ControllerType = (
  | (Omit<Page, "headerBar"> & { childControllers: undefined })
  | (Omit<NavigationController, "headerBar" | 'childControllers'> & {childControllers: ControllerType[] })
  | (Omit<BottomTabBarController,  "headerBar" | 'childControllers'> & {childControllers: ControllerType[] })
) & { headerBar?: Partial<HeaderBar>, nativeObject: any, present(options: any): void, applySheetOptions(controller: any, options: BottomSheetOptions): void, presentBottomSheet(
  controller: ControllerType,
  animated: boolean,
  onComplete: (...args: any) => void,
  options?: BottomSheetOptions
): void} & EventEmitterNativeComponent<Page.Events | "dismissComplete", any>;

export type HeaderBartype = ControllerType['headerBar']