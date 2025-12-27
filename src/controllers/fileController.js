const s3Service = require('../services/s3Service');
const prisma = require('../db');

// Helper to get User's AWS Config
const getUserCredentials = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.awsAccessKeyId || !user.awsSecretAccessKey || !user.awsBucketName) {
    throw new Error('AWS Configuration missing for this user');
  }
  return {
    accessKeyId: user.awsAccessKeyId,
    secretAccessKey: user.awsSecretAccessKey,
    bucketName: user.awsBucketName,
    region: user.awsRegion,
  };
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check permissions/quota here if needed

    const { originalname, buffer, mimetype } = req.file;
    // Simple key strategy: userId/originalName (to avoid User A overwriting User B's file if sharing bucket)
    // Or just originalName if bucket is private to user
    const fileName = `${req.user.id}/${Date.now()}_${originalname}`;

    const credentials = await getUserCredentials(req.user.id);

    await s3Service.uploadFile(credentials, buffer, fileName, mimetype);

    // Save metadata to DB
    const fileRecord = await prisma.file.create({
      data: {
        name: originalname,
        key: fileName,
        mimeType: mimetype,
        size: buffer.length,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: 'File uploaded successfully', file: fileRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
};

const listFiles = async (req, res) => {
  try {
    // We list from DB first as it's faster and contains structure. 
    // If you want to sync with S3, you'd call s3Service.listFiles
    const files = await prisma.file.findMany({
      where: { userId: req.user.id, isDeleted: false },
    });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files', details: error.message });
  }
};

const getFileUrl = async (req, res) => {
  try {
    const { fileName } = req.params;
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    // Security: Check if file belongs to user
    const fileRecord = await prisma.file.findUnique({ where: { key: fileName } });
    if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    // Allow access if owner OR if file is shared/public (TODO: Implement granular share logic)
    if (fileRecord.userId !== req.user.id && !fileRecord.isPublic) {
        return res.status(403).json({ error: 'Access denied' });
    }

    // Get Owner's credentials (bucket owner) to sign the URL
    // NOTE: If User A is viewing User B's file, we need User B's creds to sign the URL for User B's bucket.
    const credentials = await getUserCredentials(fileRecord.userId);

    const url = await s3Service.generatePresignedUrl(credentials, fileName);
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get file URL', details: error.message });
  }
};

module.exports = {
  uploadFile,
  listFiles,
  getFileUrl,
};
