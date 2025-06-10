const express = require('express');
const router = express.Router();
const axios = require('axios');

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

module.exports = router;
