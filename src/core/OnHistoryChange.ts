import { Location } from "common/Location";
import Router from "router/Router";

export type OnHistoryChange = (location: Location, action: string, target: Router, fromRouter: boolean) => void;
