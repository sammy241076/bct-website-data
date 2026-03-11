// GitHub configuration for Brokenshire College Toril News System
const GITHUB_CONFIG = {
   
    owner: 'sammy241076',
    repo: 'bct-website-data',
    path: 'news.json',
    testimonialsPath: 'testimonials.json', // new testimonials data
    branch: 'main',
    uploadsPath: 'uploads/news/'  // Folder for images
     
};

function getTimestamp() {
    return new Date().toISOString();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to upload image to GitHub as a separate file
async function uploadImageToGitHub(file, newsId) {
    // Create a clean filename: newsId-timestamp.extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${newsId}-${Date.now()}.${fileExt}`;
    const filePath = GITHUB_CONFIG.uploadsPath + fileName;
    
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    
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
            message: `Upload image for news article ${newsId}`,
            content: content
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload image: ${errorData.message || response.status}`);
    }
    
    const data = await response.json();
    // Return the raw GitHub URL of the uploaded image
    return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/main/${filePath}`;
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

// SIMPLE FUNCTION: Convert Unicode special characters to plain text
function unicodeToPlainText(text) {
    if (!text) return '';
    
    // Normalize the text first
    let normalized = text.normalize('NFKD');
    
    // Handle mathematical bold characters (like 𝐁𝐂𝐓)
    const result = [];
    
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        const code = char.charCodeAt(0);
        
        // Mathematical bold capital letters (A-Z) - U+1D400 to U+1D419
        if (code >= 0x1D400 && code <= 0x1D419) {
            result.push(String.fromCharCode(code - 0x1D400 + 65));
        }
        // Mathematical bold small letters (a-z) - U+1D41A to U+1D433
        else if (code >= 0x1D41A && code <= 0x1D433) {
            result.push(String.fromCharCode(code - 0x1D41A + 97));
        }
        // Mathematical bold italic capital letters - U+1D468 to U+1D481
        else if (code >= 0x1D468 && code <= 0x1D481) {
            result.push(String.fromCharCode(code - 0x1D468 + 65));
        }
        // Mathematical bold italic small letters - U+1D482 to U+1D49B
        else if (code >= 0x1D482 && code <= 0x1D49B) {
            result.push(String.fromCharCode(code - 0x1D482 + 97));
        }
        // Mathematical sans-serif bold capital letters - U+1D5D4 to U+1D5ED
        else if (code >= 0x1D5D4 && code <= 0x1D5ED) {
            result.push(String.fromCharCode(code - 0x1D5D4 + 65));
        }
        // Mathematical sans-serif bold small letters - U+1D5EE to U+1D607
        else if (code >= 0x1D5EE && code <= 0x1D607) {
            result.push(String.fromCharCode(code - 0x1D5EE + 97));
        }
        // Keep other characters as is
        else {
            result.push(char);
        }
    }
    
    return result.join('');
}

// Helper function to escape HTML (for safe display)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
