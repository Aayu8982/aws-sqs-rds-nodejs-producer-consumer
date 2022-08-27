require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const db = require("./models");
const cors = require("cors");
const { USER } = require("./config/db.config");
const app = express();
const region = "us-east-1";
const User = db.user;
const Op = db.Sequelize.Op;

const { ACCESS_KEY, SECRET_KEY } = process.env;
// aws configure
AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: region,
});

// SQS Configuration
const sqs = new AWS.SQS({ apiVersion: "2012-11-05", region });
const queueUrl = process.env.SQS_QUEUE_URL;

// PORT
const port = 8001 || process.env.PORT;

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// DB Connection
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// to force sync during development use below
db.sequelize.sync();

app.get("/receive", async (req, res) => {
  const params = {
    QueueUrl: queueUrl,
    MessageAttributeNames: ["All"],
  };
  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      const user = JSON.parse(data.Messages[0].Body);
      User.create(user)
        .then((data) => {
          res.send({
            status: 200,
            data: data,
          });
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the blog.",
          });
        });
    }
  });
});

app.listen(port, () => {
  console.log(`Consumer is running on port ${port}`);
});
