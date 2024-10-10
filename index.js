const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function getBillAmount(consumerNumber) {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true
        });

        const page = await browser.newPage();

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

        return billAmount;
    } catch (error) {
        console.error('Error fetching bill amount:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
