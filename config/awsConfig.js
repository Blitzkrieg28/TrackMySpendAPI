const { TextractClient } = require('@aws-sdk/client-textract');
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Initialize AWS clients
const textractClient = new TextractClient(awsConfig);
const s3Client = new S3Client(awsConfig);

// S3 bucket configuration
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'trackmyspend-receipts';

module.exports = {
  textractClient,
  s3Client,
  S3_BUCKET_NAME,
  awsConfig,
}; 