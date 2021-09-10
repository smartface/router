import { Location } from "common/Location";
import Router from "router/Router";

export type OnHistoryChange<TRouteTarget = any> = (location: Location, action: string, target: Router<TRouteTarget>, fromRouter: boolean) => void;
