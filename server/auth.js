var checkAuth = (apiKey) => {
  if (apiKey === process.env.API_KEY) {
    console.log("auth successful");
    return true;
  } else {
    console.log("auth failure");
    return false;
  }
};

var auth = (req, res, next) => {
  let authenticated;
  if (req.query["auth"]) {
    authenticated = checkAuth(req.query["auth"]);
  } else {
    authenticated = checkAuth(req.headers["api-key"]);
  }
  if (authenticated) {
    return next();
  } else {
    res.sendStatus(403);
  }
};

module.exports = auth;
