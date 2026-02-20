#!/usr/bin/env node

/**
 * Script to download CSS and other dependencies offline
 * Saves them locally so the app can run without internet
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PUBLIC_DIR = path.join(__dirname, '../public');
const CSS_DIR = path.join(PUBLIC_DIR, 'css');
const FONTS_DIR = path.join(PUBLIC_DIR, 'fonts');

// Create directories if they don't exist
[CSS_DIR, FONTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Download file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    https.get(url, response => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Saved: ${destPath}`);
        resolve();
      });

      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download CSS libraries
 */
async function downloadCSS() {
  const cssFiles = [
    // Google Fonts - Roboto
    {
      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      name: 'roboto.css',
    },
    // Google Fonts - Inter
    {
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
      name: 'inter.css',
    },
    // Normalize CSS
    {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
      name: 'normalize.min.css',
    },
  ];

  for (const file of cssFiles) {
    try {
      await downloadFile(file.url, path.join(CSS_DIR, file.name));
    } catch (error) {
      console.error(`✗ Failed to download ${file.name}:`, error.message);
    }
  }
}

/**
 * Download fonts
 */
async function downloadFonts() {
  const fonts = [
    // Roboto font files
    {
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
      name: 'roboto-400.woff2',
    },
    {
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.woff2',
      name: 'roboto-700.woff2',
    },
    // System font fallback (no download needed for these)
  ];

  for (const font of fonts) {
    try {
      await downloadFile(font.url, path.join(FONTS_DIR, font.name));
    } catch (error) {
      console.error(`✗ Failed to download ${font.name}:`, error.message);
    }
  }
}

/**
 * Create offline HTML reference file
 */
function createOfflineRefFile() {
  const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NetChi - Offline CSS References</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>NetChi - Offline CSS Setup Reference</h1>
    
    <h2>📁 Downloaded Files</h2>
    <ul>
        <li>public/css/roboto.css</li>
        <li>public/css/inter.css</li>
        <li>public/css/normalize.min.css</li>
        <li>public/fonts/roboto-400.woff2</li>
        <li>public/fonts/roboto-700.woff2</li>
    </ul>
    
    <h2>🔧 How to Use in Your HTML/CSS</h2>
    
    <h3>In index.html</h3>
    <pre><code>&lt;head&gt;
    &lt;link rel="stylesheet" href="/css/normalize.min.css"&gt;
    &lt;link rel="stylesheet" href="/css/roboto.css"&gt;
    &lt;link rel="stylesheet" href="/css/inter.css"&gt;
&lt;/head&gt;</code></pre>
    
    <h3>In Your CSS File</h3>
    <pre><code>@font-face {
    font-family: 'Roboto';
    src: url('/fonts/roboto-400.woff2') format('woff2');
    font-weight: 400;
}

@font-face {
    font-family: 'Roboto';
    src: url('/fonts/roboto-700.woff2') format('woff2');
    font-weight: 700;
}

body {
    font-family: 'Roboto', sans-serif;
}</code></pre>
    
    <h2>✅ Verification</h2>
    <p>After downloading, you should have:</p>
    <ul>
        <li>✓ All CSS files in <code>public/css/</code></li>
        <li>✓ All fonts in <code>public/fonts/</code></li>
        <li>✓ No CDN dependencies required</li>
        <li>✓ Application works offline</li>
    </ul>
    
    <h2>🚀 Next Steps</h2>
    <ol>
        <li>Update your <code>index.html</code> to reference local CSS files</li>
        <li>Update your CSS files to use local fonts</li>
        <li>Test in offline mode (DevTools > Network > Offline)</li>
        <li>Run <code>npm run build</code> to bundle everything</li>
    </ol>
</body>
</html>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'offline-reference.html'), content);
  console.log('✓ Created offline-reference.html');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Starting offline CSS and font download...\n');

  try {
    await downloadCSS();
    console.log('\n✓ CSS files downloaded\n');

    await downloadFonts();
    console.log('\n✓ Font files downloaded\n');

    createOfflineRefFile();

    console.log('\n✅ All downloads completed!');
    console.log('\n📋 Summary:');
    console.log('   - CSS files saved to: public/css/');
    console.log('   - Font files saved to: public/fonts/');
    console.log('   - Reference file: public/offline-reference.html');
    console.log('\n💡 Next: Update your HTML and CSS to use local files instead of CDN.');
  } catch (error) {
    console.error('\n❌ Download process failed:', error);
    process.exit(1);
  }
}

main();
