// Fungsi umum yang digunakan di semua halaman

// Inisialisasi background particles
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('bg-effects');
    
    const circle1 = document.createElement('div');
    circle1.classList.add('bg-circle', 'circle-1');
    
    const circle2 = document.createElement('div');
    circle2.classList.add('bg-circle', 'circle-2');
    
    particlesContainer.appendChild(circle1);
    particlesContainer.appendChild(circle2);
    
    document.body.appendChild(particlesContainer);
}

// Fungsi untuk menampilkan pesan error
function showError(message, containerId = 'resultContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.className = 'result-container error';
    container.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
    `;
    container.style.display = 'block';
}

// Fungsi untuk validasi URL
function isValidUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

// Fungsi untuk copy teks ke clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('URL berhasil disalin!');
    }).catch(err => {
        alert('Gagal menyalin URL: ' + err);
    });
}

// Inisialisasi ketika DOM sudah dimuat
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
});