import Page from "@smartface/native/ui/page";
import NavigationController from "@smartface/native/ui/navigationcontroller";
import BottomTabBarController from "@smartface/native/ui/bottomtabbarcontroller";
import HeaderBar from "@smartface/native/ui/headerbar";

export type ControllerType = (
  | (Omit<Page, "headerBar"> & { childControllers: undefined })
  | (Omit<NavigationController, "headerBar" | 'childControllers'> & {childControllers: ControllerType[] })
  | (Omit<BottomTabBarController,  "headerBar" | 'childControllers'> & {childControllers: ControllerType[] })
) & { headerBar?: Partial<HeaderBar>, nativeObject: any};

export type HeaderBartype = ControllerType['headerBar']