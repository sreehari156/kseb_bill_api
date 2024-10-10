const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // For parsing JSON request body

// Function to scrape the bill amount using Puppeteer
async function getBillAmount(consumerNumber) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Navigate to the KSEB bill payment page
        await page.goto('https://www.recharge1.com/online-electricity-bill-payment/kseb-kerala-state-electricity-borad.aspx', {
            waitUntil: 'networkidle2'
        });

        // Type the consumer number into the input field
        await page.type('#ctl00_ContentPlaceHolder2_UtilityControlId_TXT_Consumer_Number', consumerNumber);

        // Click the 'Check Bill' button
        await page.click('#ctl00_ContentPlaceHolder2_UtilityControlId_BtnCheckBill');

        // Wait for the bill amount to appear and retrieve it
        await page.waitForSelector('#ctl00_ContentPlaceHolder2_UtilityControlId_ctl01_txtbillamount', { timeout: 15000 });
        const billAmount = await page.$eval('#ctl00_ContentPlaceHolder2_UtilityControlId_ctl01_txtbillamount', el => el.value);

        await browser.close();
        return billAmount;
    } catch (error) {
        console.error('Error fetching bill amount:', error);
        await browser.close();
        return null;
    }
}

// API route to get bill amount
app.post('/get-bill', async (req, res) => {
    const { consumer_number } = req.body;

    if (!consumer_number) {
        return res.status(400).json({ error: 'Consumer number is required' });
    }

    const billAmount = await getBillAmount(consumer_number);

    if (billAmount) {
        return res.status(200).json({ consumer_number, bill_amount: billAmount });
    } else {
        return res.status(500).json({ error: 'Failed to retrieve bill amount' });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
