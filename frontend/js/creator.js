// js/creator.js

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    // Process people (split commas)
    const peopleInput = formData.get('people');
    const peopleArray = peopleInput ? peopleInput.split(',').map(p => p.trim()) : [];
    formData.set('people', JSON.stringify(peopleArray));  // Send as JSON string
  
    try {
      const response = await fetch('http://127.0.0.1:5000/api/media/upload', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Swal.fire({
            icon: 'success',
            title: 'Upload Successful',
            text: 'Your media has been uploaded!',
            confirmButtonColor: '#2c3e50'
          });
        form.reset();
      } else {
        Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: result.message || 'There was an issue uploading your media.',
            confirmButtonColor: '#c0392b'
          });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      document.getElementById('statusMessage').textContent = 'Error uploading media.';
    }
  });