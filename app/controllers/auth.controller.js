const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken } = db;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');

exports.signup = (req, res) => {
  const user = new User({
    isStudent : 1,
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = async (req, res) => {
  // Find user by username
  User.findOne({ username: req.body.username })
    .populate("roles", "-__v")
    .exec(async (err, user) => {
      // Error handling
      if (err) return res.status(500).send({ message: err });
      if (!user) return res.status(404).send({ message: "User Not found." });

      // Check if password is valid
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ accessToken: null, message: "Invalid Password!" });

      // Generate access token
      let token = jwt.sign({ id: user.id,username: user.username, email: user.email, roles: user.roles,parents:user.parents
                                }, config.secret, { expiresIn: config.jwtExpiration });
      let deviceId = uuidv4(); // Generate a unique device identifier

      // Generate refresh token
      let refreshToken = await RefreshToken.createToken(user, deviceId);
      
      // Set the access token in an HTTP-only cookie
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: true,  
        //secure: process.env.NODE_ENV === 'production', // Secure only in production
        sameSite: 'Strict',
      });
      // Set device ID and refresh token in HTTP-only cookies
      res.cookie('deviceId', deviceId, {
        httpOnly: true,
        secure: true, // Ensure HTTPS is used
        sameSite: 'Strict', // Cookie will only be sent in first-party context
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      });
    
      let authorities = [];

      for (const role of user.roles) {
        authorities.push("ROLE_" + role.name.toUpperCase());
      }
    // Send response without sending the tokens explicitly
    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
    });

      console.log("User logged in"); // Add this line to log the user login
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  const { deviceId } = req.body;

  if (!requestToken) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }
  if (!deviceId) {
    return res.status(403).json({ message: "Device ID is required!" });
  }

  try {
    // Find the refresh token in the database
    let refreshToken = await RefreshToken.findOne({ token: requestToken, deviceId: deviceId });
    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is not in database!" });
    }

    // Verify if the refresh token has expired
    if (RefreshToken.verifyExpiration(refreshToken)) {
      await RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
      return res.status(403).json({ message: "Refresh token was expired. Please make a new signin request" });
    }

    // Generate new access token
    let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, { expiresIn: config.jwtExpiration });

    // Generate new refresh token
    let newRefreshToken = await RefreshToken.createToken(refreshToken.user, deviceId);

    // Remove the old refresh token from the database
    await RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

    // Set the new refresh token as a cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};