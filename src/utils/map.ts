/**
 * @ignore
 *
 */
const mapComposer = <T>(arr: T[]) => {
  return (fn: (item: T, index: number) => T) => arr.map(fn);
};

export type MapFunction<T> = (fn: (item: T, index: number) => T) => T[];

export default mapComposer;