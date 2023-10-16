const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
require("dotenv").config();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.set("strictQuery", false);
app.use(express.static("public"));

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const dbName = "EasyPayDB";

mongoose.connect(
  "mongodb+srv://sachinkinha:sachin1234@cluster0.ourbjr9.mongodb.net/EasyPayDB",
  { useNewUrlParser: true }
);

function paginate(data, page = 1, pageSize = 5) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedData = data.slice(startIndex, endIndex);

  return paginatedData;
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
  img: String,
  upi_id: String,
  bankAccount: {
    name: String,
    fund: Number,
  },
});

const User = mongoose.model("User", userSchema);

const paymentSchema = new mongoose.Schema({
  amountPay: Number,
  upi_id: String,
  senderId: String,
  receiverId: String,
  time: Date,
  isSuccessful: Number, // 0 for pending, 1 for successful
});

const Payment = mongoose.model("Payment", paymentSchema);

// Create a new user
app.post("/api/user/create", (req, res) => {
  const userData = req.body;
  const user = new User(userData);

  user.save((err, savedUser) => {
    if (err) {
      res.status(500).json({ error: "Could not create the user", err });
    } else {
      res.json(savedUser);
    }
  });
});

// Get a list of all users
app.get("/api/user/get_all", (req, res) => {
  User.find((err, users) => {
    if (err) {
      res.status(500).json({ error: "Could not fetch users" });
    } else {
      res.json(users);
    }
  });
});

// Get a specific user by ID
app.get("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;

  User.findById(userId, (err, user) => {
    if (err) {
      res.status(500).json({ error: "Could not fetch the user" });
    } else {
      res.json(user);
    }
  });
});

// Update a user by ID
app.put("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  const userData = req.body;

  User.findByIdAndUpdate(userId, userData, { new: true }, (err, user) => {
    if (err) {
      res.status(500).json({ error: "Could not update the user" });
    } else {
      res.json(user);
    }
  });
});

// Delete a user by ID
app.delete("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;

  User.findByIdAndRemove(userId, (err, user) => {
    if (err) {
      res.status(500).json({ error: "Could not delete the user" });
    } else {
      res.json(user);
    }
  });
});

app.post("/api/payments", (req, res) => {
  const { amountPay, upi_id, receiverId } = req.body;
  const time = new Date();
  const isSuccessful = 1;

  const payment = new Payment({
    amountPay,
    upi_id,
    receiverId,
    time,
    isSuccessful,
  });

  payment.save((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to save payment" });
    } else {
      res.json(payment);
    }
  });
});

app.get("/api/recent-transactions", async (req, res) => {
  try {
    const payments = await Payment.find({ isSuccessful: 1 }).exec();
    const modifiedPayments = await Promise.all(
      payments.map(async (payment) => {
        const senderData = await User.findOne({
          upi_id: payment.upi_id,
        }).exec();
        if (senderData) {
          return {
            senderName: senderData.name,
            time: payment.time,
            senderImage: senderData.img,
            bankName: senderData.bankAccount.name,
            amount: payment.amountPay,
          };
        } else {
          // Handle the case where the user is not found.
          return {
            senderName: "N/A",
            time: payment.time,
            senderImage: "N/A",
            bankName: "N/A",
            amount: payment.amountPay,
          };
        }
      })
    );
    res.json(modifiedPayments);
  } catch (err) {
    console.error("Error fetching recent transactions:", err);
    res.status(500).json({ error: "Failed to fetch recent transactions" });
  }
});

app.get("/api/pending-payments", async (req, res) => {
  try {
    const payments = await Payment.find({ isSuccessful: 0 }).exec();
    const modifiedPayments = await Promise.all(
      payments.map(async (payment) => {
        const senderData = await User.findOne({
          upi_id: payment.upi_id,
        }).exec();
        if (senderData) {
          return {
            senderName: senderData.name,
            time: payment.time,
            senderImage: senderData.img,
            bankName: senderData.bankAccount.name,
            amount: payment.amountPay,
          };
        } else {
          // Handle the case where the user is not found.
          return {
            senderName: "N/A",
            time: payment.time,
            senderImage: "N/A",
            bankName: "N/A",
            amount: payment.amountPay,
          };
        }
      })
    );
    res.json(modifiedPayments);
  } catch (err) {
    console.error("Error fetching pending payments:", err);
    res.status(500).json({ error: "Failed to fetch pending payments" });
  }
});

// Add fund to a specific user by ID
app.post("/api/user/add_fund", (req, res) => {
  const { fund_add, userId } = req.body;
  User.findById(userId, (err, user) => {
    if (err) {
      res.status(500).json({ error: "User not found" });
    } else {
      res.json(user);
    }
  });
});

app.listen(process.env.PORT || port, () =>
  console.log("Server is running at port ", port)
);
