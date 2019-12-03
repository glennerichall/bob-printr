
module.exports = function(api) {
  return {
    "plugins": [["@babel/transform-modules-commonjs"]],
    "sourceMaps": api.env("production") ? false : "inline"
  };
}

