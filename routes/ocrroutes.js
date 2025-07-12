const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const Tesseract = require("tesseract.js");
const multer = require("multer");
const textractService = require("../utils/textractService");
const mixtralService = require("../utils/mixtralService");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * @swagger
 * /ocr/advanced:
 *   post:
 *     summary: Extract and parse receipt data using AWS Textract and Mixtral AI
 *     description: Upload a receipt image and get structured data extracted using advanced OCR and AI parsing
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Receipt image file
 *     responses:
 *       200:
 *         description: Successfully extracted and parsed receipt data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     merchant:
 *                       type: string
 *                     date:
 *                       type: string
 *                     time:
 *                       type: string
 *                     category:
 *                       type: string
 *                     payment_method:
 *                       type: string
 *                     upi_id:
 *                       type: string
 *                     transaction_id:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                 rawText:
 *                   type: string
 *                 s3Key:
 *                   type: string
 *       400:
 *         description: Bad request - invalid image or missing file
 *       500:
 *         description: Internal server error
 */

// Enhanced OCR endpoint using AWS Textract + Mixtral AI
router.post("/advanced", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No image file provided" 
      });
    }

    console.log('Processing image with AWS Textract...');
    
    // Step 1: Extract text using AWS Textract
    const textractResult = await textractService.extractTextFromImage(req.file.buffer);
    const extractedText = textractResult.text;
    
    console.log('Extracted text length:', extractedText.length);
    console.log('Sample extracted text:', extractedText.substring(0, 200) + '...');

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "No text could be extracted from the image"
      });
    }

    console.log('Parsing extracted text with Mixtral AI...');
    
    // Step 2: Parse extracted text using Mixtral AI
    const parsedData = await mixtralService.parseReceiptData(extractedText);
    
    console.log('Parsed data:', parsedData);

    // Step 3: Categorize expense if category is not provided
    if (!parsedData.category || parsedData.category === 'null') {
      const description = parsedData.merchant || extractedText.substring(0, 100);
      const amount = parsedData.amount || '0';
      parsedData.category = await mixtralService.categorizeExpense(description, amount);
    }

    return res.json({
      success: true,
      data: parsedData,
      rawText: extractedText,
      s3Key: textractResult.s3Key,
      processingTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advanced OCR error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /ocr/advanced-base64:
 *   post:
 *     summary: Extract and parse receipt data from base64 image using AWS Textract and Mixtral AI
 *     description: Send a base64 encoded image and get structured data extracted using advanced OCR and AI parsing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageBase64:
 *                 type: string
 *                 description: Base64 encoded image data
 *     responses:
 *       200:
 *         description: Successfully extracted and parsed receipt data
 *       400:
 *         description: Bad request - invalid base64 data
 *       500:
 *         description: Internal server error
 */

// Base64 version of the advanced OCR endpoint
router.post("/advanced-base64", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ 
        success: false, 
        error: "Base64 image data is required" 
      });
    }

    console.log('Processing base64 image with AWS Textract...');
    
    // Step 1: Extract text using AWS Textract
    const textractResult = await textractService.extractTextFromBase64(imageBase64);
    const extractedText = textractResult.text;
    
    console.log('Extracted text length:', extractedText.length);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "No text could be extracted from the image"
      });
    }

    console.log('Parsing extracted text with Mixtral AI...');
    
    // Step 2: Parse extracted text using Mixtral AI
    const parsedData = await mixtralService.parseReceiptData(extractedText);
    
    // Step 3: Categorize expense if category is not provided
    if (!parsedData.category || parsedData.category === 'null') {
      const description = parsedData.merchant || extractedText.substring(0, 100);
      const amount = parsedData.amount || '0';
      parsedData.category = await mixtralService.categorizeExpense(description, amount);
    }

    return res.json({
      success: true,
      data: parsedData,
      rawText: extractedText,
      s3Key: textractResult.s3Key,
      processingTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advanced OCR base64 error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Legacy OCR endpoint (keeping for backward compatibility)
router.post("/ocr", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

    const buffer = Buffer.from(
      imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    // 1. Get image metadata
    const metadata = await sharp(buffer).metadata();
    const height = metadata.height || 1200;
    const width = metadata.width || 800;

    // 2. Process top 25% region to extract amount
    const croppedTop = await sharp(buffer)
      .extract({
        left: 0,
        top: 0,
        width: width,
        height: Math.floor(height * 0.25),
      })
      .grayscale()
      .normalize()
      .resize(1200)
      .modulate({ brightness: 1.1, contrast: 2.2 }) // contrast boost
      .sharpen()
      .toBuffer();

    const {
      data: { text: amountText }
    } = await Tesseract.recognize(croppedTop, "eng", {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
    });

    const amountMatch = amountText.match(
      /(?:₹|Rs\.?)?\s*(\d{1,3}(?:[,\s]?\d{3})*(?:[.,]\d{1,2})?)/i
    );
    const amount = amountMatch
      ? amountMatch[1].replace(/[,\s]/g, "").replace(/,/, ".")
      : null;

    // 3. Process full image for other fields
    const processedFull = await sharp(buffer)
      .grayscale()
      .normalize()
      .gamma()
      .threshold(100)
      .resize(1000)
      .toBuffer();

    const {
      data: { text }
    } = await Tesseract.recognize(processedFull, "eng", {
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });

    // 4. Extract fields
    const nameMatch = text.match(/Paid to\s+([^\n\r]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : null;

    const upiMatch = text.match(/(?:PhonePe|UPI ID)[\s•\-:]*([A-Za-z0-9@.\-_]+)/i);
    const upiId = upiMatch ? upiMatch[1] : null;

    const dateMatch = text.match(
      /\d{1,2}\s+\w+\s+\d{4},\s+\d{1,2}:\d{2}\s?(?:am|pm)?/i
    );
    const date = dateMatch ? dateMatch[0] : null;

    // 5. Return result
    return res.json({ amount, name, date, upiId });

  } catch (err) {
    console.error("OCR error:", err);
    return res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

module.exports = router;
