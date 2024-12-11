const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');

const app = express();

let corsOptions = {
  origin: "http://localhost:3000", // Allow only this origin
  methods: 'GET,POST,DELETE,PUT,PATCH', // Allow only these methods
  allowedHeaders: 'Content-Type,Authorization', // Allow only these headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(cookieParser());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
app.use('/auth', require('./app/routes/auth.routes'));
app.use('/user', require('./app/routes/user.routes'));
app.use('/annances', require('./app/routes/annanceRoutes'));
app.use('/annancess', require('./app/routes/annanceRoleUserRoutes'));
app.use('/reclamations', require('./app/routes/reclamationRoutes'));
app.use('/grades', require('./app/routes/gradeRoutes'));
app.use('/classes', require('./app/routes/classRoutes'));

app.use('/notifications', require('./app/routes/notificationRoutes'));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebaseServiceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
      new Role({
        name: "student"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'student' to roles collection");
      });
      new Role({
        name: "parent"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'parent' to roles collection");
      });
    }
  });
}
