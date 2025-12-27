const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const getS3Client = (credentials) => {
  return new S3Client({
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });
};

const uploadFile = async (credentials, fileBuffer, fileName, mimeType) => {
  const s3Client = getS3Client(credentials);
  const uploadParams = {
    Bucket: credentials.bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    return data;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

const listFiles = async (credentials, prefix = '') => {
  const s3Client = getS3Client(credentials);
  const listParams = {
    Bucket: credentials.bucketName,
    Prefix: prefix,
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(listParams));
    return data.Contents || [];
  } catch (err) {
    console.error("Error listing files:", err);
    throw err;
  }
};

const deleteFile = async (credentials, fileName) => {
  const s3Client = getS3Client(credentials);
  const deleteParams = {
    Bucket: credentials.bucketName,
    Key: fileName,
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(deleteParams));
    return data;
  } catch (err) {
    console.error("Error deleting file:", err);
    throw err;
  }
};

const generatePresignedUrl = async (credentials, fileName, expiresIn = 3600) => {
  const s3Client = getS3Client(credentials);
  const command = new GetObjectCommand({
    Bucket: credentials.bucketName,
    Key: fileName,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw err;
  }
};

module.exports = {
  uploadFile,
  listFiles,
  deleteFile,
  generatePresignedUrl,
};
