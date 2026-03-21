/* posts/auto-loader.js — Automatically load all posts from manifest */

async function loadAllPosts() {
  try {
    // Fetch and parse the posts manifest JSON file
    const response = await fetch('posts/posts-manifest.json');
    const manifest = await response.json();
    
    console.log(`Loading ${manifest.posts.length} post files...`);
    
    let loadedCount = 0;
    
    // Iterate through all post files and dynamically load them
    manifest.posts.forEach((file, index) => {
      const script = document.createElement('script');
      script.src = 'posts/' + file;
      
      // Track script loading and trigger initialization when all scripts are loaded
      script.onload = () => {
        loadedCount++;
        console.log(`[${loadedCount}/${manifest.posts.length}] Loaded: ${file}`);
        
        // When all scripts have been loaded, initialize the posts
        if (loadedCount === manifest.posts.length) {
          console.log('All posts loaded. Initializing...');
          if (typeof loadPosts === 'function') {
            loadPosts();
          }
        }
      };
      
      // Log error if script fails to load
      script.onerror = () => {
        console.error(`Failed to load: ${file}`);
      };
      
      // Append script to DOM to trigger loading
      document.body.appendChild(script);
    });
    
  } catch (error) {
    console.error('Error loading posts manifest:', error);
  }
}

// Load posts when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllPosts);
} else {
  loadAllPosts();
}
