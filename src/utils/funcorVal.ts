export default function funcorVal(val?: any, params: any[] = []) {
  return val && typeof val === "function" ? val.apply(null, params) : val;
};
