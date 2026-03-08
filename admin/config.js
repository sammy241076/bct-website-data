// GitHub configuration for Brokenshire College Toril News System
const GITHUB_CONFIG = {
    token: ' ',
    owner: 'sammy241076',
    repo: 'bct-website-data',
    path: 'news.json',
    branch: 'main',
    uploadsPath: 'uploads/news/'  // Folder for images
};

function getTimestamp() {
    return new Date().toISOString();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// NEW: Function to upload image to GitHub
async function uploadImageToGitHub(file, fileName) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.uploadsPath}${fileName}`;
    
    // Convert file to base64
    const base64Content = await fileToBase64(file);
    // Remove the data:image/jpeg;base64, part
    const content = base64Content.split(',')[1];
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Upload image: ${fileName}`,
            content: content
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    // Return the raw GitHub URL of the uploaded image
    return data.content.download_url;
}

// Helper: Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
// Helper function to escape HTML (for metadata only)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Unicode-safe base64 encode (handles special characters properly)
function unicodeToBase64(str) {
    // Convert string to UTF-8 bytes then to base64
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    utf8Bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

// Unicode-safe base64 decode (handles special characters properly)
function base64ToUnicode(base64) {
    try {
        // Decode base64 to binary string
        const binary = atob(base64);
        // Convert binary string to UTF-8 bytes
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        // Decode UTF-8 bytes to string
        return new TextDecoder().utf8 ? new TextDecoder().decode(bytes) : decodeURIComponent(escape(binary));
    } catch (e) {
        console.error('Base64 decode error:', e);
        return base64;
    }
}

// Fallback for older browsers
if (!window.TextEncoder) {
    window.TextEncoder = function() {};
    window.TextEncoder.prototype.encode = function(str) {
        return unescape(encodeURIComponent(str)).split('').map(c => c.charCodeAt(0));
    };
}

if (!window.TextDecoder) {
    window.TextDecoder = function() {};
    window.TextDecoder.prototype.decode = function(bytes) {
        return decodeURIComponent(escape(String.fromCharCode.apply(null, bytes)));
    };
}
