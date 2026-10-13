// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async function() {
    const musicLibrary = document.querySelector('.music-library');

    // Show loading message
    musicLibrary.innerHTML = '<p>Loading your music library...</p>';

    try {
        // Fetch list of files from the songs directory via GitHub API
        const response = await fetch('https://api.github.com/repos/47y27gc8w8-ops/music/contents/songs');

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const files = await response.json();

        // Filter for audio files (common extensions)
        const audioFiles = files
            .filter(file => file.type === 'file')
            .filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext);
            })
            .map(file => file.name);

        if (audioFiles.length === 0) {
            musicLibrary.innerHTML = '<p>No audio files found in the songs folder. Add some MP3, WAV, or other audio files to see them appear here.</p>';
            return;
        }

        // Create music items for each audio file
        musicLibrary.innerHTML = ''; // Clear loading message

        audioFiles.forEach(filename => {
            const musicItem = document.createElement('div');
            musicItem.className = 'music-item';

            // Extract title from filename (remove extension)
            const title = filename.replace(/\.[^/.]+$/, "");

            musicItem.innerHTML = `
                <h3>${title}</h3>
                <audio controls preload="none">
                    <source src="songs/${filename}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;

            musicLibrary.appendChild(musicItem);
        });

    } catch (error) {
        console.error('Error loading music library:', error);
        musicLibrary.innerHTML = `
            <p>Error loading music library. Make sure the repository is public and the songs folder exists.</p>
            <p>${error.message}</p>
        `;
    }
});