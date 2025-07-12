const { 
  DetectDocumentTextCommand,
  AnalyzeDocumentCommand 
} = require('@aws-sdk/client-textract');
const { 
  PutObjectCommand,
  GetObjectCommand 
} = require('@aws-sdk/client-s3');
const { textractClient, s3Client, S3_BUCKET_NAME } = require('../config/awsConfig');
const { v4: uuidv4 } = require('uuid');

class TextractService {
  constructor() {
    this.bucketName = S3_BUCKET_NAME;
  }

  async uploadToS3(imageBuffer, fileName) {
    try {
      const key = `receipts/${fileName}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'private'
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      return key;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload image to S3: ${error.message}`);
    }
  }

  async extractTextFromImage(imageBuffer) {
    try {
      // Upload image to S3 first
      const fileName = `${uuidv4()}.jpg`;
      const s3Key = await this.uploadToS3(imageBuffer, fileName);

      // Use Textract to extract text
      const textractParams = {
        Document: {
          S3Object: {
            Bucket: this.bucketName,
            Name: s3Key
          }
        },
        FeatureTypes: ['TABLES', 'FORMS']
      };

      const command = new AnalyzeDocumentCommand(textractParams);
      const response = await textractClient.send(command);

      // Extract text from blocks
      let extractedText = '';
      const textBlocks = response.Blocks.filter(block => block.BlockType === 'LINE');
      
      textBlocks.forEach(block => {
        if (block.Text) {
          extractedText += block.Text + '\n';
        }
      });

      return {
        text: extractedText.trim(),
        blocks: response.Blocks,
        s3Key: s3Key
      };

    } catch (error) {
      console.error('Textract error:', error);
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  async extractTextFromBase64(base64Image) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      return await this.extractTextFromImage(imageBuffer);
    } catch (error) {
      console.error('Base64 to buffer conversion error:', error);
      throw new Error(`Failed to process base64 image: ${error.message}`);
    }
  }

  async getS3Object(s3Key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });
      
      const response = await s3Client.send(command);
      return response.Body;
    } catch (error) {
      console.error('S3 get object error:', error);
      throw new Error(`Failed to retrieve image from S3: ${error.message}`);
    }
  }

  // Extract specific fields using Textract's form analysis
  async extractFormFields(imageBuffer) {
    try {
      const fileName = `${uuidv4()}.jpg`;
      const s3Key = await this.uploadToS3(imageBuffer, fileName);

      const textractParams = {
        Document: {
          S3Object: {
            Bucket: this.bucketName,
            Name: s3Key
          }
        },
        FeatureTypes: ['FORMS']
      };

      const command = new AnalyzeDocumentCommand(textractParams);
      const response = await textractClient.send(command);

      const formFields = {};
      
      // Process key-value pairs
      response.Blocks.forEach(block => {
        if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes.includes('KEY')) {
          const key = this.getTextFromBlock(block, response.Blocks);
          const valueBlock = this.getValueBlock(block, response.Blocks);
          const value = valueBlock ? this.getTextFromBlock(valueBlock, response.Blocks) : '';
          
          if (key && value) {
            formFields[key.toLowerCase()] = value;
          }
        }
      });

      return {
        formFields,
        s3Key: s3Key
      };

    } catch (error) {
      console.error('Form extraction error:', error);
      throw new Error(`Form field extraction failed: ${error.message}`);
    }
  }

  getTextFromBlock(block, blocks) {
    let text = '';
    if (block.Relationships) {
      block.Relationships.forEach(relationship => {
        if (relationship.Type === 'CHILD') {
          relationship.Ids.forEach(id => {
            const childBlock = blocks.find(b => b.Id === id);
            if (childBlock && childBlock.BlockType === 'WORD') {
              text += childBlock.Text + ' ';
            }
          });
        }
      });
    }
    return text.trim();
  }

  getValueBlock(keyBlock, blocks) {
    if (keyBlock.Relationships) {
      const valueRelationship = keyBlock.Relationships.find(r => r.Type === 'VALUE');
      if (valueRelationship) {
        return blocks.find(b => b.Id === valueRelationship.Ids[0]);
      }
    }
    return null;
  }
}

module.exports = new TextractService(); 