const prisma = require('../db');

const updateConfig = async (req, res) => {
  try {
    const { awsAccessKeyId, awsSecretAccessKey, awsBucketName, awsRegion } = req.body;
    const userId = req.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        awsAccessKeyId,
        awsSecretAccessKey,
        awsBucketName,
        awsRegion,
      },
    });

    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config', details: error.message });
  }
};

const getConfig = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            awsAccessKeyId: true,
            awsBucketName: true,
            awsRegion: true,
            // Do not return secret key
        }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config', details: error.message });
  }
}

module.exports = {
  updateConfig,
  getConfig
};
