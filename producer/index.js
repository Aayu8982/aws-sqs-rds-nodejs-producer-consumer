// Package
require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const app = express();

const region = "us-east-1";

const { ACCESS_KEY, SECRET_KEY } = process.env;
// aws configure
AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: region,
});

// PORT
const port = 8000 || process.env.PORT;

app.use(bodyParser.json());

// SQS Configuration
const sqs = new AWS.SQS({ apiVersion: "2012-11-05", region });
const queueUrl = process.env.SQS_QUEUE_URL;

// APIS
app.post("/send", async (req, res) => {
  let orderData = {
    userName: req.body["name"],
    userEmail: req.body["email"],
    userMessage: req.body["message"],
  };

  let sqsOrderData = {
    MessageAttributes: {
      userName: {
        DataType: "String",
        StringValue: orderData.userName,
      },
      userEmail: {
        DataType: "String",
        StringValue: orderData.userEmail,
      },
      userEmail: {
        DataType: "String",
        StringValue: orderData.userMessage,
      },
    },
    MessageBody: JSON.stringify(orderData),
    QueueUrl: queueUrl,
  };

  // Send the order data to the SQS queue
  let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

  sendSqsMessage
    .then((data) => {
      console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
      res.send("Thank you for your details.");
    })
    .catch((err) => {
      console.log(`OrdersSvc | ERROR: ${err}`);

      // Send email to emails API
      res.send("We ran into an error. Please try again.");
    });
});

// SERVER
app.listen(port, () => {
  console.log(`Producer is running on Port ${port}`);
});
