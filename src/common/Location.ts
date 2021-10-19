export type Location = {
  query?: { [key: string]: any };
  url: string;
  rawQuery?: string;
  hash?: string;
  state?: any;
  key?: string;
  search?: string;
};
