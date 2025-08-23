// Logika khusus untuk halaman list.html

document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refreshBtn');
    const shortlinksList = document.getElementById('shortlinksList');
    const totalLinks = document.getElementById('totalLinks');
    const activeLinks = document.getElementById('activeLinks');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadShortLinks();
        });
    }
    
    // Load shortlinks saat halaman dimuat
    loadShortLinks();
    
    async function loadShortLinks() {
        shortlinksList.innerHTML = `
            <div class="loading-list">
                <div class="spinner"></div>
                <p>Memuat daftar shortlink...</p>
            </div>
        `;
        
        try {
            const response = await fetch('/api/links');
            const data = await response.json();
            
            if (data.success) {
                displayShortLinks(data.data.links);
                updateStats(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            shortlinksList.innerHTML = `
                <div class="empty-state">
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }
    
    function displayShortLinks(links) {
        if (!links || links.length === 0) {
            shortlinksList.innerHTML = `
                <div class="empty-state">
                    <p>Belum ada shortlink yang dibuat</p>
                    <p>Buat shortlink pertama Anda di halaman <a href="/create" style="color: #4facfe;">Buat ShortLink</a></p>
                </div>
            `;
            return;
        }
        
        shortlinksList.innerHTML = links.map(link => `
            <div class="shortlink-item">
                <div>
                    <span class="shortlink-number">#${link.issueNumber}</span>
                    <span class="shortlink-state" style="color: ${link.status === 'active' ? '#00ff00' : '#ff6b6b'}">
                        ${link.status === 'active' ? '🟢' : '🔴'}
                    </span>
                </div>
                <div class="shortlink-url">${window.location.origin}/${link.issueNumber}</div>
                <div class="shortlink-destination" title="${link.destinationUrl}">
                    → ${truncateText(link.destinationUrl, 50)}
                </div>
                <div class="shortlink-title">${link.title}</div>
                <div class="shortlink-actions">
                    <button class="action-btn copy-btn" onclick="copyToClipboard('${window.location.origin}/${link.issueNumber}')">
                        📋 Copy
                    </button>
                    <button class="action-btn test-btn" onclick="window.open('${window.location.origin}/${link.issueNumber}', '_blank')">
                        🔗 Test
                    </button>
                    <button class="action-btn github-btn" onclick="window.open('${link.githubUrl}', '_blank')">
                        GitHub
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function updateStats(data) {
        totalLinks.textContent = data.total;
        activeLinks.textContent = data.active;
    }
    
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
});