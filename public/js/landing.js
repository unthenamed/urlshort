// Logika khusus untuk halaman landing.html

document.addEventListener('DOMContentLoaded', function() {
    const linkTitle = document.getElementById('linkTitle');
    const destinationUrl = document.getElementById('destinationUrl');
    const createdAt = document.getElementById('createdAt');
    const countdownElement = document.getElementById('countdown');
    const continueBtn = document.getElementById('continueBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Get issue number from URL path
    const pathSegments = window.location.pathname.split('/');
    const issueNumber = pathSegments[pathSegments.length - 1];
    
    let countdownTime = 10;
    let countdownInterval;
    
    // Fungsi untuk memulai countdown
    function startCountdown() {
        countdownInterval = setInterval(() => {
            countdownTime--;
            countdownElement.textContent = countdownTime;
            
            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
                redirectToDestination();
            }
        }, 1000);
    }
    
    // Fungsi untuk redirect ke tujuan
    function redirectToDestination() {
        window.location.href = destinationUrl.href;
    }
    
    // Fungsi untuk membatalkan redirect
    function cancelRedirect() {
        clearInterval(countdownInterval);
        countdownElement.textContent = 'Dibatalkan';
        countdownElement.style.color = '#ff6b6b';
    }
    
    // Ambil data link dari API
    async function fetchLinkData() {
        try {
            const response = await fetch(`/api/landing/${issueNumber}`);
            const data = await response.json();
            
            if (data.success) {
                // Isi data ke dalam elemen
                linkTitle.textContent = data.data.title;
                destinationUrl.textContent = data.data.destinationUrl;
                destinationUrl.href = data.data.destinationUrl;
                createdAt.textContent = data.data.createdAt;
                
                // Mulai countdown
                startCountdown();
            } else {
                throw new Error(data.message || 'Gagal memuat data link');
            }
        } catch (error) {
            // Jika error, redirect ke halaman utama
            window.location.href = '/';
        }
    }
    
    // Event listeners
    if (continueBtn) {
        continueBtn.addEventListener('click', redirectToDestination);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelRedirect);
    }
    
    // Load data
    fetchLinkData();
});