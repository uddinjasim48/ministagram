let allMedia = []; // Store fetched media globally

let itemsPerPage = 4;
let currentPage = 1;

// Increment view count
async function incrementViewCount(mediaId) {
  try {
    const response = await fetch(`http://localhost:5000/api/media/${mediaId}/view`, {
      method: 'POST'
    });
    if (!response.ok) {
      console.error('Failed to increment view count');
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Increment like count
async function incrementLikeCount(mediaId) {
  try {
    const response = await fetch(`http://localhost:5000/api/media/${mediaId}/like`, {
      method: 'POST'
    });
    if (response.ok) {
      alert('Liked!');
    } else {
      console.error('Failed to increment like count');
    }
  } catch (error) {
    console.error('Error incrementing like count:', error);
  }
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allMedia.filter(media =>
      media.title.toLowerCase().includes(query) ||
      media.caption.toLowerCase().includes(query) ||
      media.location.toLowerCase().includes(query)
    );
    renderGallery(filtered);
  });
}

async function fetchMedia() {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/media/all`);
      const mediaList = await response.json();
      allMedia = mediaList;
      renderGallery(mediaList, currentPage);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  }
  
  function renderGallery(mediaList, page = 1) {
    const gallery = document.getElementById('gallery');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
  
    // Calculate items to show
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const paginatedItems = mediaList.slice(0, endIndex);
  
    gallery.innerHTML = '';
  
    paginatedItems.forEach(media => {
      const card = document.createElement('div');
      card.className = 'media-card';
  
      let mediaElement;
      if (media.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        mediaElement = document.createElement('img');
        mediaElement.src = media.fileUrl;
      } else if (media.fileUrl.match(/\.(mp4|mov|avi)$/i)) {
        mediaElement = document.createElement('video');
        mediaElement.src = media.fileUrl;
        mediaElement.controls = true;
      }
  
      const title = document.createElement('h3');
      title.textContent = media.title;
  
      const caption = document.createElement('p');
      caption.textContent = media.caption;

      const views = document.createElement('p');
      //views.textContent =  `${media.views || 0} views`;
      views.className = 'media-stats';

      const likes = document.createElement('p');
      //likes.textContent =  `${media.likes || 0} likes`;
      likes.className = 'media-stats';

      card.appendChild(views);
      card.appendChild(likes);
  
      card.appendChild(mediaElement);
      card.appendChild(title);
      card.appendChild(caption);
      card.onclick = () => showModal(media);
      gallery.appendChild(card);
    });
  
    // Show/hide Load More button
    if (endIndex >= mediaList.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }

  
  function setupModal() {
    const modal = document.getElementById('mediaModal');
    const span = document.getElementsByClassName('close')[0];
  
    span.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => {
      if (event.target == modal) modal.style.display = 'none';
    };
  }
  
  function showModal(media) {
    const modal = document.getElementById('mediaModal');
    const modalMedia = document.getElementById('modalMedia');
    const title = document.getElementById('modalTitle');
    const caption = document.getElementById('modalCaption');
    const location = document.getElementById('modalLocation');
    const people = document.getElementById('modalPeople');
    const likes = document.getElementById('modalLikes');
    const views = document.getElementById('modalViews');
  
    modalMedia.innerHTML = '';
    let element;
    if (media.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
      element = document.createElement('img');
      element.src = media.fileUrl;
      element.style.maxWidth = '100%';
    } else if (media.fileUrl.match(/\.(mp4|mov|avi)$/i)) {
      element = document.createElement('video');
      element.src = media.fileUrl;
      element.controls = true;
      element.style.maxWidth = '100%';
    }
  
    modalMedia.appendChild(element);
    title.textContent = media.title;
    caption.textContent = 'Caption: ' + media.caption;
    location.textContent = 'Location: ' + media.location;
    people.textContent = 'People: ' + media.people;

    likes.textContent = `Likes: ${media.likeCount || 0}`;
    views.textContent = `Views: ${media.viewCount || 0}`;
  
    modal.style.display = 'block';
    incrementViewCount(media.id);

    document.getElementById('likeButton').onclick = () => {
      incrementLikeCount(media.id);
    };

    // Send request to increment view count
    fetch(`http://127.0.0.1:5000/api/media/${media.id}/view`, {
      method: 'POST'
      }).then(res => res.json()).then(data => {
      views.textContent = `Views: ${data.viewCount}`;
      media.viewCount = data.viewCount;
      });
      

  }

  // Initialize
  fetchMedia();
  setupSearch();
  setupModal();
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentPage++;
    renderGallery(allMedia, currentPage);
  });

