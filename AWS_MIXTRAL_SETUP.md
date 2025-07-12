# AWS Textract + Mixtral AI Integration Setup Guide

This guide will help you set up AWS Textract and Mixtral AI integration for your TrackMySpend project to extract and parse information from receipt screenshots.

## Prerequisites

1. **AWS Account**: You need an AWS account with access to Textract and S3 services
2. **Mixtral AI API Key**: Get your API key from [Mistral AI](https://console.mistral.ai/)
3. **Node.js**: Version 16 or higher
4. **MongoDB**: Running instance for your database

## Step 1: AWS Setup

### 1.1 Create AWS IAM User
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policies:
   - `AmazonTextractFullAccess`
   - `AmazonS3FullAccess` (or create a custom policy for your specific bucket)

### 1.2 Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket named `trackmyspend-receipts` (or your preferred name)
3. Configure bucket settings:
   - Block all public access (recommended)
   - Enable versioning (optional)
   - Set up lifecycle rules for automatic cleanup (optional)

### 1.3 Get AWS Credentials
1. Go to IAM → Users → Your User → Security credentials
2. Create access keys
3. Note down the Access Key ID and Secret Access Key

## Step 2: Mixtral AI Setup

### 2.1 Get API Key
1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Sign up/Login to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

## Step 3: Environment Configuration

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/trackmyspend

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=trackmyspend-receipts

# Mixtral AI Configuration
MIXTRAL_API_KEY=your_mixtral_api_key
MIXTRAL_BASE_URL=https://api.mistral.ai/v1

# Server Configuration
PORT=8000
NODE_ENV=development

# Web Push Configuration (if using push notifications)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## Step 4: Install Dependencies

Run the following command to install the new dependencies:

```bash
npm install
```

This will install:
- `@aws-sdk/client-textract`: AWS Textract SDK
- `@aws-sdk/client-s3`: AWS S3 SDK
- `multer`: File upload middleware
- `uuid`: Unique ID generation

## Step 5: Test the Integration

### 5.1 Test with cURL

Test the file upload endpoint:
```bash
curl -X POST http://localhost:8000/ocr/advanced \
  -F "image=@/path/to/your/receipt.jpg"
```

Test the base64 endpoint:
```bash
curl -X POST http://localhost:8000/ocr/advanced-base64 \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"base64_encoded_image_data"}'
```

### 5.2 Expected Response Format

```json
{
  "success": true,
  "data": {
    "amount": 1250.50,
    "currency": "₹",
    "merchant": "Swiggy",
    "date": "2024-01-15",
    "time": "14:30",
    "category": "food",
    "payment_method": "UPI",
    "upi_id": "user@upi",
    "transaction_id": "TXN123456",
    "confidence": 0.95
  },
  "rawText": "Extracted text from image...",
  "s3Key": "receipts/uuid.jpg",
  "processingTime": "2024-01-15T14:30:00.000Z"
}
```

## Step 6: API Endpoints

### New Endpoints Added:

1. **POST /ocr/advanced**
   - Upload receipt image file
   - Returns structured data using AWS Textract + Mixtral AI

2. **POST /ocr/advanced-base64**
   - Send base64 encoded image
   - Returns structured data using AWS Textract + Mixtral AI

### Legacy Endpoint (Backward Compatible):

3. **POST /ocr/ocr**
   - Original Tesseract.js implementation
   - Still available for backward compatibility

## Step 7: Error Handling

The new endpoints include comprehensive error handling:

- **400**: Invalid image format or missing file
- **500**: AWS Textract or Mixtral AI errors
- Detailed error messages in development mode

## Step 8: Cost Considerations

### AWS Textract Pricing:
- **Synchronous operations**: $1.50 per 1,000 pages
- **Asynchronous operations**: $0.60 per 1,000 pages
- **S3 storage**: ~$0.023 per GB/month

### Mixtral AI Pricing:
- **Mistral Large**: $0.14 per 1M input tokens, $0.42 per 1M output tokens
- **Mistral Medium**: $0.14 per 1M input tokens, $0.42 per 1M output tokens

## Step 9: Security Best Practices

1. **AWS Credentials**: Never commit AWS credentials to version control
2. **API Keys**: Store Mixtral API key securely in environment variables
3. **S3 Bucket**: Configure proper CORS and access policies
4. **File Validation**: Implement file type and size validation
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Step 10: Monitoring and Logging

The implementation includes console logging for:
- Text extraction progress
- AI parsing steps
- Error details
- Processing times

Consider implementing:
- AWS CloudWatch for monitoring
- Structured logging (Winston/Pino)
- Error tracking (Sentry)

## Troubleshooting

### Common Issues:

1. **AWS Credentials Error**
   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   - Check IAM permissions for Textract and S3

2. **S3 Bucket Not Found**
   - Ensure S3_BUCKET_NAME matches your bucket name
   - Check bucket region matches AWS_REGION

3. **Mixtral API Errors**
   - Verify MIXTRAL_API_KEY is correct
   - Check API key permissions and quotas

4. **Image Processing Errors**
   - Ensure image format is supported (JPEG, PNG)
   - Check file size limits (10MB max)

## Support

For issues related to:
- **AWS Textract**: Check AWS documentation and CloudWatch logs
- **Mixtral AI**: Check Mistral AI console for API usage and errors
- **Application**: Check server logs and error responses

## Next Steps

1. **Frontend Integration**: Update your frontend to use the new endpoints
2. **Database Integration**: Save extracted data to your MongoDB collections
3. **Validation**: Add input validation for extracted data
4. **Caching**: Implement caching for frequently processed receipts
5. **Batch Processing**: Consider batch processing for multiple receipts 