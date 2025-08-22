const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Untuk menyajikan file static

// Konfigurasi GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Fungsi untuk validasi URL
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

// Fungsi untuk mengekstrak judul dari body issue
function extractTitleFromBody(body) {
  if (!body) return null;
  const titleMatch = body.match(/\*\*Judul Link:\*\*\s*(.+?)(?:\n|$)/);
  return titleMatch ? titleMatch[1].trim() : null;
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShortLink API is running' });
});

// API Redirect - Menggantikan fungsi github_redirect.js
app.get('/api/redirect/:issueNumber', async (req, res) => {
  try {
    const { issueNumber } = req.params;

    // Ambil issue dari GitHub
    const response = await axios.get(`${GITHUB_API_URL}/${issueNumber}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    const issue = response.data;
    const destinationUrl = issue.title;

    // Validasi URL
    if (!isValidUrl(destinationUrl)) {
      return res.redirect('/404.html');
    }

    // Redirect ke URL tujuan
    res.redirect(destinationUrl);
  } catch (error) {
    console.error('Redirect error:', error.response?.data || error.message);
    res.redirect('/404.html');
  }
});

// API Create ShortLink
app.post('/api/create-link', async (req, res) => {
  try {
    const { url, title, description } = req.body;

    // Validasi input
    if (!url || !title) {
      return res.status(400).json({
        success: false,
        message: 'URL dan judul harus diisi'
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'URL harus valid dan dimulai dengan http:// atau https://'
      });
    }

    // Buat issue di GitHub
    const response = await axios.post(GITHUB_API_URL, {
      title: url,
      body: `**Judul Link:** ${title}\n\n**Deskripsi:** ${description || 'Tidak ada deskripsi'}\n\n---\n*Dibuat otomatis melalui ShortLink API*`
    }, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    const issueNumber = response.data.number;
    const shortLink = `${BASE_URL}/${issueNumber}`;

    res.json({
      success: true,
      message: 'ShortLink berhasil dibuat',
      data: {
        issueNumber,
        shortLink,
        destinationUrl: url,
        title,
        githubUrl: response.data.html_url,
        createdAt: response.data.created_at
      }
    });
  } catch (error) {
    console.error('Create link error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Gagal membuat shortlink'
    });
  }
});

// API Get All Links
app.get('/api/links', async (req, res) => {
  try {
    // Ambil semua issues dari GitHub
    const response = await axios.get(GITHUB_API_URL + '?state=all&per_page=100', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    // Filter hanya issues yang valid
    const validLinks = response.data
      .filter(issue => 
        issue.title && 
        (issue.title.startsWith('http://') || issue.title.startsWith('https://'))
      )
      .map(issue => ({
        issueNumber: issue.number,
        destinationUrl: issue.title,
        title: extractTitleFromBody(issue.body) || 'No title',
        status: issue.state === 'open' ? 'active' : 'inactive',
        createdAt: issue.created_at,
        githubUrl: issue.html_url
      }));

    res.json({
      success: true,
      data: {
        links: validLinks,
        total: validLinks.length,
        active: validLinks.filter(link => link.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Get links error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Gagal mengambil daftar shortlink'
    });
  }
});

// API Get Link Details
app.get('/api/links/:issueNumber', async (req, res) => {
  try {
    const { issueNumber } = req.params;

    // Ambil issue dari GitHub
    const response = await axios.get(`${GITHUB_API_URL}/${issueNumber}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    const issue = response.data;

    if (!isValidUrl(issue.title)) {
      return res.status(404).json({
        success: false,
        message: 'ShortLink tidak ditemukan atau tidak valid'
      });
    }

    res.json({
      success: true,
      data: {
        issueNumber: issue.number,
        destinationUrl: issue.title,
        title: extractTitleFromBody(issue.body) || 'No title',
        status: issue.state === 'open' ? 'active' : 'inactive',
        createdAt: issue.created_at,
        githubUrl: issue.html_url,
        description: issue.body
      }
    });
  } catch (error) {
    console.error('Get link error:', error.response?.data || error.message);
    res.status(404).json({
      success: false,
      message: 'ShortLink tidak ditemukan'
    });
  }
});

// Serve landing page for shortlinks
app.get('/:issueNumber', async (req, res) => {
  try {
    const { issueNumber } = req.params;
    
    // Jika bukan angka, arahkan ke halaman utama
    if (!/^\d+$/.test(issueNumber)) {
      return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    
    // Cek jika ada parameter langsung untuk redirect
    if (req.query.direct === 'true') {
      // Redirect langsung tanpa landing page
      const response = await axios.get(`${GITHUB_API_URL}/${issueNumber}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`
        }
      });

      const issue = response.data;
      const destinationUrl = issue.title;

      // Validasi URL
      if (!isValidUrl(destinationUrl)) {
        return res.sendFile(path.join(__dirname, 'public', '404.html'));
      }

      return res.redirect(destinationUrl);
    }
    
    // Jika tidak, tampilkan landing page
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
  } catch (error) {
    console.error('Landing page error:', error.response?.data || error.message);
    res.sendFile(path.join(__dirname, 'public', '404.html'));
  }
});

// API untuk mendapatkan data link untuk landing page
app.get('/api/landing/:issueNumber', async (req, res) => {
  try {
    const { issueNumber } = req.params;

    // Ambil issue dari GitHub
    const response = await axios.get(`${GITHUB_API_URL}/${issueNumber}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    const issue = response.data;

    if (!isValidUrl(issue.title)) {
      return res.status(404).json({
        success: false,
        message: 'ShortLink tidak ditemukan atau tidak valid'
      });
    }

    res.json({
      success: true,
      data: {
        issueNumber: issue.number,
        destinationUrl: issue.title,
        title: extractTitleFromBody(issue.body) || 'No title',
        createdAt: formatDate(issue.created_at),
        githubUrl: issue.html_url
      }
    });
  } catch (error) {
    console.error('Landing API error:', error.response?.data || error.message);
    res.status(404).json({
      success: false,
      message: 'ShortLink tidak ditemukan'
    });
  }
});

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GitHub Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`Base URL: ${BASE_URL}`);
});
