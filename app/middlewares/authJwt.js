const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

// Updated verifyToken middleware
const verifyToken = (req, res, next) => {
  console.log('Cookies:', req.cookies); // Log cookies to debug
  let token = req.cookies.accessToken;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (const role of roles) {
          if (role.name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
      }
    );
  });
};

const isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (const role of roles) {
          if (role.name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};
module.exports = authJwt;
