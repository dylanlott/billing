module.exports = {
  "env": {
    "node": true,
    "es6": true,
    "browser": true
  },
  "globals": {},
  "rules": {
    "no-bitwise": 0,
    "camelcase": 0,
    "curly": 2,
    "eqeqeq": 2,
    "no-extend-native": 2,
    "wrap-iife": [
      2,
      "any"
    ],
    "indent": [
      2,
      2,
      {
        "SwitchCase": 1
      }
    ],
    "no-use-before-define": [
      2,
      {
        "functions": false
      }
    ],
    "new-cap": 0,
    "no-caller": 2,
    "no-empty": 2,
    "no-new": 2,
    "quotes": [
      2,
      "single"
    ],
    "strict": [
      2,
      "global"
    ],
    "no-undef": 2,
    "no-unused-vars": 2,
    "complexity": [
      2,
      6
    ],
    "max-depth": [
      2,
      3
    ],
    "max-len": [
      2,
      {
        "code": 80,
        "ignoreComments": true
      }
    ],
    "no-multi-str": 2,
    "no-trailing-spaces": 2
  }
}
