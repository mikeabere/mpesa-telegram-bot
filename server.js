const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Callback endpoint for Daraja API
app.post("/callback", (req, res) => {
  const callbackData = req.body;
  console.log("Payment callback received:", callbackData);

  // Process the callback data (e.g., update database, notify user)
  // Example: Check if the payment was successful
  if (callbackData.Body.stkCallback.ResultCode === 0) {
    console.log("Payment was successful!");
  } else {
    console.log("Payment failed.");
  }

  res.status(200).send("Callback received");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
