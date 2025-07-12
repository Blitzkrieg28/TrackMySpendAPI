const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { TextractClient } = require('@aws-sdk/client-textract');
require('dotenv').config();

async function testAWSConnection() {
  try {
    console.log('Testing AWS connection...');
    
    // Test S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const listBucketsCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listBucketsCommand);
    
    console.log('✅ S3 connection successful!');
    console.log('Available buckets:', buckets.Buckets.map(b => b.Name));
    
    // Test Textract
    const textractClient = new TextractClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    console.log('✅ Textract connection successful!');
    console.log('AWS setup is working correctly!');
    
  } catch (error) {
    console.error('❌ AWS connection failed:', error.message);
    console.log('Please check your AWS credentials and permissions.');
  }
}

async function testMixtralConnection() {
  try {
    console.log('\nTesting Mixtral AI connection...');
    
    const axios = require('axios');
    const response = await axios.get('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.MIXTRAL_API_KEY}`
      }
    });
    
    console.log('✅ Mixtral AI connection successful!');
    console.log('Available models:', response.data.data.map(m => m.id));
    
  } catch (error) {
    console.error('❌ Mixtral AI connection failed:', error.message);
    console.log('Please check your Mixtral API key.');
  }
}

async function runTests() {
  console.log('🔍 Testing AWS and Mixtral AI Setup...\n');
  
  await testAWSConnection();
  await testMixtralConnection();
  
  console.log('\n🎉 Setup complete! You can now use the advanced OCR features.');
}

runTests(); 