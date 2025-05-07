// === CONFIG ===
const fetchAllUrl = 'http://localhost:5000/api/media/all';
const deleteUrl = 'http://localhost:5000/api/media';

function updateStats(mediaList) {
  const totalUploads = mediaList.length;
  const totalViews = mediaList.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const totalLikes = mediaList.reduce((sum, item) => sum + (item.likeCount || 0), 0);

  document.getElementById('total-uploads').textContent = totalUploads;
  document.getElementById('total-views').textContent = totalViews;
  document.getElementById('total-likes').textContent = totalLikes;
}

// === 1. Delete media by ID (calls backend API) ===
async function deleteMediaById(mediaId) {
  try {
    const response = await fetch(`${deleteUrl}/${mediaId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Media deleted successfully.');
      fetchCreatorMedia(); // Refresh dashboard
    } else {
      alert('Failed to delete media.');
    }
  } catch (error) {
    console.error('Error deleting media:', error);
    alert('An error occurred while deleting media.');
  }
}

// === 2. Fetch media uploaded by creator ===
async function fetchCreatorMedia() {
  try {
    const response = await fetch(fetchAllUrl);
    const mediaList = await response.json();
    displayMedia(mediaList);
    updateStats(mediaList);  // ← update totals dynamically
  } catch (error) {
    console.error('Error fetching creator media:', error);
  }
}

// === 3. Render media items on dashboard ===
function displayMedia(mediaList) {
  const mediaGrid = document.getElementById('uploads-grid');
  mediaGrid.innerHTML = '';

  mediaList.forEach(media => {
    const item = document.createElement('div');
    item.classList.add('media-item');

    // Attach mediaId (very important)
    item.dataset.id = media.id;
    //console.log('Rendering media:', media);
    //console.log('Assigned data-id:', media._id);

    item.innerHTML = `
      <img src="${media.fileUrl}" alt="${media.title}">
      <div class="media-details">
        <h3>${media.title}</h3>
        <p>${media.caption}</p>
        <p>📈 Views: ${media.viewCount || 0}</p>
        <p>❤️ Likes: ${media.likeCount || 0}</p>
      </div>
    `;

    // Attach universal click handler (selection or view)
    item.addEventListener('click', (e) => {
      if (selectionMode) {
        toggleSelect(e);
      } else {
        showMediaModal(media);
      }
    });

    mediaGrid.appendChild(item);
  });
}

// === 4. Call fetch when page loads ===
document.addEventListener('DOMContentLoaded', fetchCreatorMedia);

// === 5. Selection Mode Functionality ===
let selectionMode = false;
let selectedMedia = []; // Use Set for easier management
const deleteButton = document.getElementById('deleteMediaBtn');

deleteButton.addEventListener('click', () => {
  const mediaItems = document.querySelectorAll('.media-item');

  if (selectionMode) {
    // Already in selection mode → time to confirm deletion
    const selectedIds = Array.from(selectedMedia).map(item => item.dataset.id);

    if (selectedIds.length === 0) {
      alert('Please select at least one media to delete.');
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`);
    if (confirmed) {
      selectedIds.forEach(id => deleteMediaById(id));
    }

    // Exit selection mode and reset UI
    selectionMode = false;
    selectedMedia.clear();
    deleteButton.textContent = '🗑️ Delete Media';
    mediaItems.forEach(item => {
      item.classList.remove('selectable', 'selected');
    });

  } else {
    // Enter selection mode
    selectionMode = true;
    deleteButton.textContent = '✅ Confirm Delete';
    mediaItems.forEach(item => {
      item.classList.add('selectable');
    });
  }
});

// Toggle selection on media item
function toggleSelect(e) {
  const item = e.currentTarget;
  item.classList.toggle('selected');

  if (item.classList.contains('selected')) {
    selectedMedia.push(item);
  } else {
    selectedMedia = selectedMedia.filter(el => el !== item);
  }
}

// === 6. Show media details in new modal (title, caption, location, people, image preview) ===
function showMediaModal(media) {
  const modal = document.getElementById('mediaDetailsModal');
  document.getElementById('details-title').textContent = media.title;
  document.getElementById('details-caption').textContent = media.caption;
  document.getElementById('details-location').textContent = media.location || 'N/A';
  document.getElementById('details-people').textContent = media.people || 'N/A';

  const modalImage = document.getElementById('details-image');
  modalImage.src = media.fileUrl;
  modalImage.alt = media.title;

  modal.style.display = 'block';

  const closeBtn = document.getElementById('closeDetailsModal');
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}