const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const handle = 'construacerocarabobo';
const targetDir = path.join(__dirname, '..', 'kit-instagram-web', 'assets', 'instagram');

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    // If url is base64 or not http
    if (!url || !url.startsWith('http')) {
      resolve();
      return;
    }
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function scrape() {
  console.log(`Starting scrape for ${handle}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'es-ES'
  });
  const page = await context.newPage();
  
  try {
    console.log(`Navigating to https://www.instagram.com/${handle}/ ...`);
    await page.goto(`https://www.instagram.com/${handle}/`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    
    console.log('Waiting 6 seconds for images and dynamic data to load...');
    await page.waitForTimeout(6000);
    
    // Grab title
    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);
    
    // Check if page contains login prompt
    const pageText = await page.innerText('body');
    const isLoginWall = pageText.includes('Iniciar sesión') && pageText.includes('Regístrate');
    console.log('Is Instagram showing login wall?', isLoginWall);
    
    const metaData = await page.evaluate(() => {
      const getMeta = (prop) => {
        const el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
        return el ? el.getAttribute('content') : null;
      };
      
      return {
        title: getMeta('og:title'),
        description: getMeta('og:description'),
        image: getMeta('og:image'),
        url: getMeta('og:url')
      };
    });
    
    console.log('Raw Meta Data extracted:', metaData);
    
    let followers = '1,250'; // Default placeholder if not extracted
    let following = '180';
    let posts = '45';
    let bio = 'Ferretería Industrial y Materiales de Construcción en Carabobo. El mejor acero y materiales para tus obras y construcciones.';
    let name = 'Construacero Carabobo';
    
    if (metaData.description) {
      const desc = metaData.description;
      // Extract stats from description
      // Matches Spanish format: "12.3k seguidores, 456 seguidos, 78 publicaciones..."
      // Or English: "12.3k Followers, 456 Following, 78 Posts..."
      const followersMatch = desc.match(/([\d.,kK]+)\s*(?:Followers|seguidores)/i);
      const followingMatch = desc.match(/([\d.,kK]+)\s*(?:Following|seguidos)/i);
      const postsMatch = desc.match(/([\d.,kK]+)\s*(?:Posts|publicaciones)/i);
      
      if (followersMatch) followers = followersMatch[1];
      if (followingMatch) following = followingMatch[1];
      if (postsMatch) posts = postsMatch[1];
      
      // Bio is usually after the dash "-"
      const dashIndex = desc.indexOf('-');
      if (dashIndex !== -1) {
        const afterDash = desc.substring(dashIndex + 1).trim();
        // Remove ending text like "See Instagram photos and videos..."
        const seeMoreIndex = afterDash.search(/(?:See Instagram photos|Ver fotos y videos)/i);
        if (seeMoreIndex !== -1) {
          bio = afterDash.substring(0, seeMoreIndex).trim();
        } else {
          bio = afterDash;
        }
      }
    }
    
    if (metaData.title) {
      // Matches "Name (@handle) • Instagram..."
      const titleMatch = metaData.title.match(/^([^(]+)\s+\(/);
      if (titleMatch) {
        name = titleMatch[1].trim();
      }
    }
    
    // Find all images
    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements.map((img, idx) => ({
        src: img.src,
        alt: img.alt || '',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        index: idx
      }));
    });
    
    console.log(`Total images found on DOM: ${images.length}`);
    
    // Profile picture candidate: usually og:image, or img with alt containing "perfil"
    let profilePicUrl = metaData.image || '';
    if (!profilePicUrl) {
      const profileImg = images.find(img => img.alt && (img.alt.includes('perfil') || img.alt.includes('profile')));
      if (profileImg) {
        profilePicUrl = profileImg.src;
      }
    }
    
    // Filter post images. Post images on IG have cdninstagram.com source.
    // They are usually in the grid, naturalWidth >= 150.
    const postImages = images.filter(img => {
      const isProfile = img.src === profilePicUrl || (img.alt && (img.alt.includes('perfil') || img.alt.includes('profile')));
      const isCdn = img.src.includes('cdninstagram.com') || img.src.includes('instagram');
      const isNotIcon = img.naturalWidth > 150 || img.naturalWidth === 0; // naturalWidth might be 0 before fully loaded in headless
      return !isProfile && isCdn && isNotIcon;
    });
    
    console.log(`Filtered ${postImages.length} post image candidates.`);
    
    const results = {
      handle,
      name,
      bio,
      followers,
      following,
      posts,
      profilePicUrl,
      postImages: postImages.slice(0, 12).map(img => img.src)
    };
    
    // Write metadata file
    fs.writeFileSync(path.join(__dirname, 'scrape_results.json'), JSON.stringify(results, null, 2));
    console.log('Results written to scrape_results.json successfully.');
    
    // Download profile picture
    if (profilePicUrl) {
      console.log('Downloading profile.jpg...');
      await downloadImage(profilePicUrl, path.join(targetDir, 'profile.jpg'))
        .then(() => console.log('Successfully saved profile.jpg'))
        .catch(err => console.error('Error saving profile.jpg:', err));
    }
    
    // Download posts
    const limit = Math.min(postImages.length, 12);
    if (limit === 0) {
      console.log('No post images found to download. The page might have blocked image loading or grid renders.');
    } else {
      for (let i = 0; i < limit; i++) {
        const imgUrl = postImages[i].src;
        const destPath = path.join(targetDir, `post-${i + 1}.jpg`);
        console.log(`Downloading post-${i + 1}.jpg ...`);
        await downloadImage(imgUrl, destPath)
          .then(() => console.log(`Saved post-${i + 1}.jpg`))
          .catch(err => console.error(`Error saving post-${i + 1}.jpg:`, err));
      }
    }
    
    console.log('SCRAPE DONE.');
    
  } catch (error) {
    console.error('Fatal error during scrape:', error);
  } finally {
    await browser.close();
  }
}

scrape();
