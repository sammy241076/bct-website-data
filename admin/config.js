// GitHub configuration for Brokenshire College Toril News System
const GITHUB_CONFIG = {
    // Your GitHub personal access token
    token: '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',
    
    // Your GitHub username
    owner: 'sammy241076',
    
    // Your repository name
    repo: 'bct-website-data',
    
    // Path to your news file (stored in the main folder)
    path: 'news.json',
    
    // The branch to use (usually 'main' or 'master')
    branch: 'main'
};

// Helper function to get the current timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// Generate a unique ID for each news article
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
