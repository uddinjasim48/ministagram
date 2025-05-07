const containerClient = require('../config/azureBlobConfig');
const { v4: uuidv4 } = require('uuid');
const cosmosContainer = require('../config/cosmosConfig');


// Dummy in-memory array to simulate storage (we'll connect DB later)
let mediaLibrary = [];

// Controller to upload media
exports.uploadMedia = async (req, res) => {
    const { title, caption, location, people } = req.body;
  
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }
  
    try {
      // Generate unique filename
      const fileExtension = req.file.originalname.split('.').pop();
      const blobName = `${uuidv4()}.${fileExtension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
      // Upload file buffer to Azure Blob
      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype }
      });
        
      // Get blob URL
      const blobUrl = blockBlobClient.url;
  
      const newMedia = {
        id: uuidv4(),   // Use UUID instead of increment id (better for Cosmos)
        title,
        caption,
        location,
        people,
        fileUrl: blobUrl
      };
      
      // Save to Cosmos DB
      await cosmosContainer.items.create(newMedia);
      
      // Also save to in-memory array (optional — still works with /all route)
      mediaLibrary.push(newMedia);      
  
      res.status(201).json({ message: 'Media uploaded to Azure!', media: newMedia });
    } catch (error) {
      console.error('Azure Blob upload error:', error);
      res.status(500).json({ message: 'Azure Blob upload failed!', error: error.message });
    }
  };
  
  
// Controller to get all media
exports.getAllMedia = async (req, res) => {
    try {
      const { resources: items } = await cosmosContainer.items.query('SELECT * FROM c').fetchAll();
      res.json(items);
    } catch (error) {
      console.error('Error fetching media from Cosmos DB:', error);
      res.status(500).json({ message: 'Failed to fetch media', error: error.message });
    }
  };