// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async function() {
    const musicLibrary = document.querySelector('.music-library');

    // Show loading message
    showLoadingMessage(musicLibrary);

    try {
        // Fetch and process music files (audio and images)
        const musicItems = await fetchAndProcessFiles();

        if (musicItems.length === 0) {
            showNoFilesMessage(musicLibrary);
            return;
        }

        // Render music library
        renderMusicLibrary(musicLibrary, musicItems);

    } catch (error) {
        showErrorMessage(musicLibrary, error);
    }
});

/**
 * Shows a loading message in the music library container
 * @param {HTMLElement} container - The container element to show loading message in
 */
function showLoadingMessage(container) {
    container.innerHTML = '<p>Loading your music library...</p>';
}

/**
 * Fetches and processes files from the GitHub API to find audio files and matching album covers
 * @returns {Promise<Array<Object>>} Array of objects with audioFile and imageFile properties
 */
async function fetchAndProcessFiles() {
    const response = await fetch('https://api.github.com/repos/47y27gc8w8-ops/music/contents/songs');

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    const files = await response.json();

    const audioFiles = files
        .filter(isFile)
        .filter(isAudioFile)
        .map(getFileName);

    const imageFiles = files
        .filter(isFile)
        .filter(isImageFile)
        .map(getFileName);

    // Create a map from base name to image file name for quick lookup
    const imageMap = {};
    imageFiles.forEach(imageName => {
        const baseName = extractTitleFromFilename(imageName);
        imageMap[baseName] = imageName;
    });

    // For each audio file, try to find a matching image
    return audioFiles.map(audioName => {
        const baseName = extractTitleFromFilename(audioName);
        const imageName = imageMap[baseName] || null;
        return { audioFile: audioName, imageFile: imageName };
    });
}

/**
 * Checks if a GitHub file object represents a file (not a directory)
 * @param {Object} file - GitHub file object
 * @returns {boolean} True if it's a file
 */
function isFile(file) {
    return file.type === 'file';
}

/**
 * Checks if a file has an audio extension
 * @param {Object} file - GitHub file object
 * @returns {boolean} True if it's an audio file
 */
function isAudioFile(file) {
    const ext = getFileExtension(file.name).toLowerCase();
    return ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext);
}

/**
 * Checks if a file has an image extension
 * @param {Object} file - GitHub file object
 * @returns {boolean} True if it's an image file
 */
function isImageFile(file) {
    const ext = getFileExtension(file.name).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

/**
 * Extracts the file name from a GitHub file object
 * @param {Object} file - GitHub file object
 * @returns {string} File name
 */
function getFileName(file) {
    return file.name;
}

/**
 * Extracts the file extension from a file name
 * @param {string} fileName - File name
 * @returns {string} File extension (without dot)
 */
function getFileExtension(fileName) {
    return fileName.split('.').pop();
}

/**
 * Shows a message when no audio files are found
 * @param {HTMLElement} container - The container element to show message in
 */
function showNoFilesMessage(container) {
    container.innerHTML = '<p>No audio files found in the songs folder. Add some MP3, WAV, or other audio files to see them appear here.</p>';
}

/**
 * Renders the music library with the given music items
 * @param {HTMLElement} container - The container element to render in
 * @param {Array<Object>} musicItems - Array of objects with audioFile and imageFile properties
 */
function renderMusicLibrary(container, musicItems) {
    container.innerHTML = ''; // Clear loading message

    musicItems.forEach(item => {
        const musicItem = createMusicItem(item);
        container.appendChild(musicItem);
    });
}

/**
 * Creates a music item element for the given audio and image files
 * @param {Object} item - Object with audioFile and imageFile properties
 * @returns {HTMLElement} Music item element
 */
function createMusicItem(item) {
    const musicItem = document.createElement('div');
    musicItem.className = 'music-item';

    const title = extractTitleFromFilename(item.audioFile);

    // Start building the inner HTML
    let innerHTML = '';

    // Add album cover if available
    if (item.imageFile) {
        innerHTML += `<img src="songs/${item.imageFile}" alt="${title} album cover" class="album-cover">`;
    }

    innerHTML += `
        <h3>${title}</h3>
        <audio controls preload="none">
            <source src="songs/${item.audioFile}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    `;

    musicItem.innerHTML = innerHTML;

    return musicItem;
}

/**
 * Extracts a title from a filename by removing the extension
 * @param {string} filename - File name
 * @returns {string} Title without extension
 */
function extractTitleFromFilename(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

/**
 * Shows an error message in the music library container
 * @param {HTMLElement} container - The container element to show error in
 * @param {Error} error - The error object
 */
function showErrorMessage(container, error) {
    console.error('Error loading music library:', error);
    container.innerHTML = `
        <p>Error loading music library. Make sure the repository is public and the songs folder exists.</p>
        <p>${error.message}</p>
    `;
}