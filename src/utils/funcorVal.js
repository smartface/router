module.exports = function funcorVal(val, params = []) {
  return typeof val === "function" ? val.apply(null, params) : val;
};
