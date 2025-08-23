// Logika khusus untuk halaman create.html

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('shortenForm');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const shortUrl = document.getElementById('shortUrl');
    const copyBtn = document.getElementById('copyBtn');
    const testBtn = document.getElementById('testBtn');
    const issueInfo = document.getElementById('issueInfo');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const destinationUrl = document.getElementById('destinationUrl').value;
            const linkTitle = document.getElementById('linkTitle').value;
            const description = document.getElementById('issueDescription').value;
            
            if (!isValidUrl(destinationUrl)) {
                showError('URL tidak valid. Harus dimulai dengan http:// atau https://');
                return;
            }
            
            loading.style.display = 'block';
            resultContainer.style.display = 'none';
            
            try {
                const response = await fetch('/api/create-link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: destinationUrl,
                        title: linkTitle,
                        description: description
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showSuccess(data.data);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                showError(`Error: ${error.message}`);
            } finally {
                loading.style.display = 'none';
            }
        });
    }
    
    function showSuccess(data) {
        resultContainer.className = 'result-container success';
        resultTitle.textContent = 'Berhasil!';
        resultMessage.textContent = `ShortLink berhasil dibuat:`;
        shortUrl.textContent = data.shortLink;
        
        issueInfo.innerHTML = `
            <strong>Issue Number:</strong> ${data.issueNumber}<br>
            <strong>URL Tujuan:</strong> ${data.destinationUrl}<br>
            <strong>GitHub Issue:</strong> <a href="${data.githubUrl}" target="_blank" style="color: #4facfe;">Lihat di GitHub</a>
        `;
        
        resultContainer.style.display = 'block';
        
        // Scroll ke hasil
        resultContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Setup event listeners untuk tombol
        if (copyBtn) {
            copyBtn.onclick = function() {
                copyToClipboard(data.shortLink);
            };
        }
        
        if (testBtn) {
            testBtn.onclick = function() {
                window.open(data.shortLink, '_blank');
            };
        }
    }
    
    // Auto-fill contoh untuk testing
    if (document.getElementById('destinationUrl')) {
        document.getElementById('destinationUrl').value = 'https://example.com';
        document.getElementById('linkTitle').value = 'Contoh Website';
        document.getElementById('issueDescription').value = 'Ini adalah contoh website untuk testing';
    }
});