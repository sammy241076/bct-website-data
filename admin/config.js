// GitHub configuration for Brokenshire College Toril News System
const GITHUB_CONFIG = {
    token: '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',
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
