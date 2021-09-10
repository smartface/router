export default function funcorVal(val?: string|Function, params: any[] = []) {
  return val && typeof val === "function" ? val.apply(null, params) : val;
};
