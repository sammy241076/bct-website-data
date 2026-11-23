// ============================================================
// GitHub configuration for Brokenshire College Toril News System
// ============================================================
const GITHUB_CONFIG = {
    owner: 'sammy241076',
    repo: 'bct-website-data',
    path: 'news.json',
    testimonialsPath: 'testimonials.json',
    campusvideosPath: 'campusvideos.json',
    branch: 'main',
    uploadsPath: 'uploads/news/',

    // Write endpoint (image uploads, saving news, saving videos).
    // Deployed Cloudflare Worker URL. Token lives in Worker env vars,
    // never in this file. Leave '' until you deploy the Worker.
    writeProxyUrl: ''   // e.g. 'https://bct-github-proxy.yourname.workers.dev'
};

// ============================================================
// Public read helpers — no token, no rate limit
// ============================================================
function rawUrl(filePath) {
    return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${filePath}`;
}

async function fetchJson(filePath) {
    const res = await fetch(rawUrl(filePath), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${filePath}`);
    return res.json();
}

// ============================================================
// Write helper — goes through the proxy
// ============================================================
async function githubWrite(path, method, body) {
    if (!GITHUB_CONFIG.writeProxyUrl) {
        throw new Error('writeProxyUrl is not configured in GITHUB_CONFIG');
    }
    const res = await fetch(`${GITHUB_CONFIG.writeProxyUrl}/${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        let msg = res.status;
        try { msg = (await res.json()).message || msg; } catch (e) {}
        throw new Error(`Write failed: ${msg}`);
    }
    return res.json();
}

// ============================================================
// Misc helpers
// ============================================================
function getTimestamp() {
    return new Date().toISOString();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================
// Upload image to GitHub (via proxy) — returns raw CDN URL
// ============================================================
async function uploadImageToGitHub(file, newsId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${newsId}-${Date.now()}.${fileExt}`;
    const filePath = GITHUB_CONFIG.uploadsPath + fileName;

    const base64Content = await fileToBase64(file);
    const content = base64Content.split(',')[1];   // strip data:...;base64,

    await githubWrite(
        `repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`,
        'PUT',
        {
            message: `Upload image for news article ${newsId}`,
            content: content,
            branch: GITHUB_CONFIG.branch
        }
    );

    return rawUrl(filePath);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ============================================================
// Unicode → plain text (math bold/italic/sans-bold etc.)
// Uses codePointAt because the math-alphanumeric block (U+1D400+)
// is above what charCodeAt can see.
// ============================================================
function unicodeToPlainText(text) {
    if (!text) return '';

    const normalized = text.normalize('NFKD');
    const out = [];

    for (const char of normalized) {
        const code = char.codePointAt(0);

        if (code >= 0x1D400 && code <= 0x1D419)      out.push(String.fromCharCode(code - 0x1D400 + 65));
        else if (code >= 0x1D41A && code <= 0x1D433) out.push(String.fromCharCode(code - 0x1D41A + 97));
        else if (code >= 0x1D468 && code <= 0x1D481) out.push(String.fromCharCode(code - 0x1D468 + 65));
        else if (code >= 0x1D482 && code <= 0x1D49B) out.push(String.fromCharCode(code - 0x1D482 + 97));
        else if (code >= 0x1D5D4 && code <= 0x1D5ED) out.push(String.fromCharCode(code - 0x1D5D4 + 65));
        else if (code >= 0x1D5EE && code <= 0x1D607) out.push(String.fromCharCode(code - 0x1D5EE + 97));
        else                                          out.push(char);
    }
    return out.join('');
}

// ============================================================
// Escape HTML for safe display
// ============================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
