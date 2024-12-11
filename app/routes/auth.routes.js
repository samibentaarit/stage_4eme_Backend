const express = require('express');
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

const router = express.Router();

// CORS middleware to allow headers
router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Route definitions
router.post(
  "/api/auth/signup",
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ],
  controller.signup
);

router.post("/api/auth/signin", controller.signin);

router.post("/api/auth/refreshtoken", controller.refreshToken);

module.exports = router;
