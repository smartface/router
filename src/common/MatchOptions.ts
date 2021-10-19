import { RegExpOptions } from "path-to-regexp";

export type MatchOptions = { path?: string; exact?: boolean; } & RegExpOptions;
