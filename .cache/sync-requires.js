const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---src-pages-404-js": hot(preferDefault(require("/Users/nickyevers/Desktop/WEB/WORK/JOE-GOOD/DJjoemygoodness/src/pages/404.js"))),
  "component---src-pages-index-js": hot(preferDefault(require("/Users/nickyevers/Desktop/WEB/WORK/JOE-GOOD/DJjoemygoodness/src/pages/index.js"))),
  "component---src-pages-past-experience-js": hot(preferDefault(require("/Users/nickyevers/Desktop/WEB/WORK/JOE-GOOD/DJjoemygoodness/src/pages/past-experience.js")))
}

