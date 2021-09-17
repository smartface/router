import { HistoryActionType } from "common/HistoryActions";
import { Location } from "../common/Location";
import Router from "../router/Router";

export type OnHistoryChange<TRouteTarget = any> = (location: Location, action: HistoryActionType, target: Router<TRouteTarget>, fromRouter: boolean) => void;
