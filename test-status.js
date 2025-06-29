const axios = require('axios');

async function testDocumentStatus(documentId) {
  try {
    console.log(`Testing document status for ID: ${documentId}\n`);
    
    const response = await axios.get(`http://localhost:3000/api/documents/${documentId}/status`);
    
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    console.log('\nStatus data:', JSON.stringify(response.data.data, null, 2));
    console.log('\nStatus field:', response.data.data.status);
    console.log('Is completed?', response.data.data.status === 'completed');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Use the document ID from the logs
const documentId = process.argv[2] || '94d9a0af-a404-4e5d-8f97-286ea814a6e3';
testDocumentStatus(documentId);
