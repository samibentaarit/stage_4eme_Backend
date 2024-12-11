const express = require('express');
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

const router = express.Router();

// CORS middleware to allow headers
router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Public routes
router.get("/api/test/all", controller.allAccess);

// Protected routes requiring token verification
router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

router.get("/api/test/mod",[authJwt.verifyToken, authJwt.isModerator],controller.moderatorBoard);

router.get("/api/test/admin",[authJwt.verifyToken, authJwt.isAdmin],controller.adminBoard);

// Example route to find all students
router.get("/users", controller.findAllUsers);
router.get("/roles", controller.findAllRoles);

router.get("/students", controller.findAllStudents);
router.get("/parents", controller.findAllParents);
router.get('/parent/:id', controller.findParentById);
router.post('/assign-parents', controller.assignParentsToChild);
router.patch('/users/:id', controller.updateUser);


module.exports = router;
