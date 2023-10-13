const express = require("express");
const bodyParser = require("body-parser"); // Require body-parser
const app = express();
const port = 3000; // Replace with your desired port number

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded form data

const submittedData = []; // Array to store submitted data

app.post("/api/data", (req, res) => {
  const { sender, senderUpiId, amount, bankName, time } = req.body;

  // You can perform any desired operations with the received data here

  const receivedData = {
    sender,
    senderUpiId,
    amount,
    bankName,
    time,
  };

  submittedData.push(receivedData); // Add the received data to the array

  const responseData = {
    message: "Added Successfully",
    receivedData: receivedData,
  };

  res.json(responseData);
});

app.get("/api/data", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default to page 1)
  const pageSize = parseInt(req.query.pageSize) || 5; // Get the page number from the query parameters (default to page 1)

  if (submittedData.length > 0) {
    const paginatedData = paginate(submittedData, page, pageSize);

    if (paginatedData.length > 0) {
      const responseData = {
        status: "success",
        data: paginatedData,
        currentPage: page,
        totalPages: Math.ceil(submittedData.length / pageSize),
      };
      res.json(responseData);
    }
  } else {
    const responseData = {
      status: "error",
      message: "No data found",
    };
    res.status(404).json(responseData);
  }
});

function paginate(data, page = 1, pageSize = 5) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedData = data.slice(startIndex, endIndex);

  return paginatedData;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
