const express = require('express');
const router = express.Router();
const axios = require('axios');
const puppeteer = require('puppeteer');
const tokenVerificationMiddleware = require('../middlewares/tokenauth');

// Apply authentication middleware to all routes
//router.use(tokenVerificationMiddleware);

/**
 * @swagger
 * /report/viewreport:
 *   get:
 *     summary: View consolidated budget report
 *     tags: [Report]
 *     parameters:
 *       - in: query
 *         name: day
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Combined budget data
 *       500:
 *         description: Error fetching report
 */

// View Report Route
router.get("/viewreport", async function (req, res) {
    const {day,month,year} =req.query;
    try {
        // Base URL for internal requests (adjust port if needed)
        const baseURL = 'http://localhost:3000';

        // Fetch data from all budget routes
        //const categoryWiseBudget = await axios.get(`${baseURL}/budget/categorywisebudget`);
        const totalBudget = await axios.get(`${baseURL}/budget/totalbudget`);
        const monthlyBudget = await axios.get(`${baseURL}/budget/monthlybudget?month=${month}&year=${year}`);
        const yearlyBudget = await axios.get(`${baseURL}/budget//yearlybudget?year=${year}`);
        const dailyBudget = await axios.get(`${baseURL}/budget/dailybudget?day=${day}&month=${month}&year=${year}`);

        // Combine results into a single response
        res.send({
            report: {
             //   categoryWiseBudget: categoryWiseBudget.data.message,
                totalBudget: totalBudget.data.message,
                monthlyBudget: monthlyBudget.data.message,
                yearlyBudget: yearlyBudget.data.message,
                dailyBudget: dailyBudget.data.message,
            }
        });
    } catch (error) {
        // Handle errors
        res.status(500).send({
            message: "Error fetching report data.",
            error: error.message
        });
    }
});
router.get('/pdf', async (req, res) => {
  

  // 1. Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 2. Navigate to your front‑end report page,
    //    passing year & month so it renders the right data.
    const reportUrl = `http://localhost:5173/repanalysis`;
await new Promise(resolve => setTimeout(resolve, 40000));

    await page.goto(reportUrl, { waitUntil: 'networkidle0' });

    // 3. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', bottom: '1in', left: '0.5in', right: '0.5in' }
    });

    // 4. Send it back
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename=Report.pdf`,
      'Content-Length':      pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).send('Could not generate PDF');
  } finally {
    await browser.close();
  }
});

module.exports = router;
