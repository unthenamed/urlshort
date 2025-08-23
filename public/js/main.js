// Fungsi umum yang digunakan di semua halaman
    <script>
        // Create background particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 30;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');

                // Random properties
                const size = Math.random() * 5 + 2;
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                const delay = Math.random() * 10;
                const duration = Math.random() * 20 + 10;

                // Apply styles
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

                particlesContainer.appendChild(particle);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            createParticles();

            // Add floating animation style
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(5px, -5px) rotate(2deg); }
                    50% { transform: translate(10px, 5px) rotate(-2deg); }
                    75% { transform: translate(-5px, 10px) rotate(1deg); }
                }
            `;
            document.head.appendChild(style);

            // Search functionality
            const searchInput = document.getElementById('searchInput');
            const searchButton = document.getElementById('searchButton');

            // Function to add path parameter
            function addPathParameter(value) {
                // Get current URL
                const currentUrl = window.location.href;

                // Remove any existing hash or query parameters
                const baseUrl = currentUrl.split('#')[0].split('?')[0];

                // Remove trailing slash if exists
                const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

                // Remove 404.html if it's in the URL
                let newUrl = cleanUrl;
                if (newUrl.endsWith('404.html')) {
                    newUrl = newUrl.substring(0, newUrl.length - 9);
                }

                // Add the new path parameter
                if (!newUrl.endsWith('/')) {
                    newUrl += '/';
                }

                newUrl += value;

                // Redirect to the new URL
                window.location.href = newUrl;
            }

            searchButton.addEventListener('click', function() {
                const searchValue = searchInput.value.trim();
                if (searchValue !== '') {
                    // Validate if it's a number
                    if (/^\d+$/.test(searchValue)) {
                        addPathParameter(searchValue);
                    } else {
                        alert('Harap masukkan angka yang valid (contoh: 1, 2, 3)');
                    }
                }
            });

            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const searchValue = searchInput.value.trim();
                    if (searchValue !== '') {
                        // Validate if it's a number
                        if (/^\d+$/.test(searchValue)) {
                            addPathParameter(searchValue);
                        } else {
                            alert('Harap masukkan angka yang valid (contoh: 1, 2, 3)');
                        }
                    }
                }
            });
        });
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