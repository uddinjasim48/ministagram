const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const upload = require('../config/multerConfig');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('jasimdb'); // Adjust if your DB name is different
const container = database.container('media');       // Adjust if your container name is different

// Upload media
router.post('/upload', upload.single('mediaFile'), mediaController.uploadMedia);

// Get all media
router.get('/all', mediaController.getAllMedia);

// Delete media by custom ID (not Mongo _id)
router.delete('/:id', async (req, res) => {
  const mediaId = req.params.id;

  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: mediaId }],
    };

    const { resources } = await container.items.query(querySpec).fetchAll();

    if (resources.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const item = resources[0];
    console.log('Deleting item:', item);

    //Delete the item usin id and partition key
    await container.item(item.id, item.id).delete();

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// === Increment view count ===
router.post('/api/media/:id/view', async (req, res) => {
  const mediaId = req.params.id;
  try {
  const { resource: media } = await container.item(mediaId, mediaId).read();
  
  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }
  
  // Add field if missing
  if (typeof media.views !== 'number') {
    media.views = 0;
  }
  
  // Add field of missing
  media.views += 1;
  await container.items.upsert(media);
  
  res.status(200).json({ message: 'View count incremented', views: media.views });
  } catch (error) {
  console.error('Error incrementing view:', error);
  res.status(500).json({ error: 'Server error' });
  }
});
  
  // === Increment like count ===
  router.post('/api/media/:id/like', async (req, res) => {
  const mediaId = req.params.id;
  try {
    const { resource: media } = await container.item(mediaId, mediaId).read();
  
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
  
    // Add field if missing
    if (typeof media.likes !== 'number') {
      media.likes = 0;
    }
  
    media.likes += 1;
    await container.items.upsert(media);
  
    res.status(200).json({ message: 'Like count incremented', likes: media.likes });
  } catch (error) {
      console.error('Error incrementing like:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

// === Increment view count ===
router.post('/:id/view', async (req, res) => {
  const mediaId = req.params.id;

  try {
    const { resource: media } = await container.item(mediaId, mediaId).read();

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Initialize or increment viewCount
    media.viewCount = (media.viewCount || 0) + 1;

    await container.item(mediaId, mediaId).replace(media);
    res.status(200).json({ message: 'View count incremented', viewCount: media.viewCount });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ error: 'Failed to increment view count' });
  }
});

// === Increment like count ===
router.post('/:id/like', async (req, res) => {
  const mediaId = req.params.id;

  try {
    const { resource: media } = await container.item(mediaId, mediaId).read();

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Initialize or increment likeCount
    media.likeCount = (media.likeCount || 0) + 1;

    await container.item(mediaId, mediaId).replace(media);
    res.status(200).json({ message: 'Like count incremented', likeCount: media.likeCount });
  } catch (error) {
    console.error('Error incrementing like count:', error);
    res.status(500).json({ error: 'Failed to increment like count' });
  }
});