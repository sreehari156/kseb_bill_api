const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Handler function to process bill details
app.post('/get-bill', async (req, res) => {
  const { consumerNumber } = req.body;

  if (!consumerNumber) {
    return res.status(400).json({
      error: 'Consumer number is required',
    });
  }

  // Define the API endpoint and headers
  const url = 'https://api.rechargezap.in/postpaid/v1/bill/detail';
  const headers = {
    appid: '100002',
    'Content-Type': 'application/json',
  };

  // Define the payload
  const payload = {
    billerId: 87,
    optionals: [
      {
        'Param Name': 'Enter Consumer Number',
        value: consumerNumber,
      },
    ],
  };

  try {
    // Make the POST request to the external API
    const response = await axios.post(url, payload, { headers });

    if (response.status === 200 || response.status === 201) {
      const billDetails = response.data.data.billDetails || {};
      return res.status(200).json({
        status: 'success',
        consumerNumber: billDetails.account,
        dueAmount: billDetails.dueAmount,
        customerName: billDetails.customerName,
        billDueDate: billDetails.billDueDate,
        billDate: billDetails.billDate,
        fetchBillId: billDetails.fetchBillId,
      });
    } else {
      return res.status(response.status).json({
        error: 'Failed to fetch bill details',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

module.exports = app;
