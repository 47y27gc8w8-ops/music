// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async function() {
    const musicLibrary = document.querySelector('.music-library');

    // Show loading message
    showLoadingMessage(musicLibrary);

    try {
        // Fetch and process music files
        const audioFiles = await fetchAndFilterAudioFiles();

        if (audioFiles.length === 0) {
            showNoFilesMessage(musicLibrary);
            return;
        }

        // Render music library
        renderMusicLibrary(musicLibrary, audioFiles);

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
 * Fetches audio files from the GitHub API and filters for supported formats
 * @returns {Promise<Array<string>>} Array of audio file names
 */
async function fetchAndFilterAudioFiles() {
    const response = await fetch('https://api.github.com/repos/47y27gc8w8-ops/music/contents/songs');

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    const files = await response.json();
    return filterAudioFiles(files);
}

/**
 * Filters an array of GitHub file objects for audio files
 * @param {Array<Object>} files - Array of GitHub file objects
 * @returns {Array<string>} Array of audio file names
 */
function filterAudioFiles(files) {
    return files
        .filter(isFile)
        .filter(isAudioFile)
        .map(getFileName);
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
 * Renders the music library with the given audio files
 * @param {HTMLElement} container - The container element to render in
 * @param {Array<string>} audioFiles - Array of audio file names
 */
function renderMusicLibrary(container, audioFiles) {
    container.innerHTML = ''; // Clear loading message

    audioFiles.forEach(filename => {
        const musicItem = createMusicItem(filename);
        container.appendChild(musicItem);
    });
}

/**
 * Creates a music item element for the given audio file
 * @param {string} filename - Name of the audio file
 * @returns {HTMLElement} Music item element
 */
function createMusicItem(filename) {
    const musicItem = document.createElement('div');
    musicItem.className = 'music-item';

    const title = extractTitleFromFilename(filename);

    musicItem.innerHTML = `
        <h3>${title}</h3>
        <audio controls preload="none">
            <source src="songs/${filename}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    `;

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