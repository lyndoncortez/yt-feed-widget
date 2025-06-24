# YT Feed Carousel


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/lyndoncortez/yt-feed-carousel.svg)](https://github.com/lyndoncortez/yt-feed-carousel/releases)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange)](https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-carousel@latest/dist/yt-feed-carousel.min.js)

**The fastest way to add YouTube feeds for A/B testing and CRO.** 🚀

Skip the development hassle. Copy, paste, and test video content impact on your conversions in minutes, not weeks. Perfect for CRO teams who need to test video placements quickly without custom development.

## 🎯 Why Choose This Tool

- ⚡ **Quick and Easy Integration** - Copy, paste, done. Test video impact in under 5 minutes
- 🔄 **Perfect for A/B Testing** - Easy to add/remove for clean test variations
- 📊 **Ready-Made Social Proof** - Customer testimonials, product demos, case studies
- 📱 **Mobile-First Design** - Works perfectly on all devices (critical for mobile CRO)
- 🎨 **Looks Professional** - No "cheap plugin" look that hurts conversions
- 📈 **Common CRO Use Cases:**
    - Homepage hero video sections
    - Product page demonstration videos
    - Landing page customer testimonials
    - Pricing page success stories
    - About page team/culture videos
    - Thank you page retention content


## 🚀 Copy-Paste A/B Test Setup

Just copy this snippet and replace with your details:

### Control Version (No Video)
```html
<!-- Your existing content -->
```

### Treatment Version (With Video Feed)
```html
<!-- Step 1: Add this where you want videos to appear -->
<div id="video-test"></div>

<!-- Step 2: Add these 2 lines before closing </body> tag -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-carousel@latest/dist/yt-feed-carousel.min.css">
<script src="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-carousel@latest/dist/yt-feed-carousel.min.js"></script>

<!-- Step 3: Add this script (replace YOUR_API_KEY and YOUR_PLAYLIST_ID) -->
<script>
new YTFeedCarousel('video-test', {
    apiKey: 'YOUR_API_KEY',
    playlistId: 'YOUR_PLAYLIST_ID',
    maxResults: 6
});
</script>
```

**That's it!** Your video test variant is ready.

## 📖 Setup in 3 Steps

### Step 1: Get Your YouTube Playlist ID
1. Go to the YouTube playlist you want to display
2. Copy the ID from the URL: `youtube.com/playlist?list=COPY_THIS_PART`

### Step 2: Get a Free YouTube API Key
1. Visit [Google Cloud Console](https://console.developers.google.com)
2. Create a project → Enable "YouTube Data API v3" → Create API key
3. (Takes 3 minutes, completely free)

### Step 3: Add to Your Page
1. **Copy the code snippet above**
2. **Replace YOUR_API_KEY and YOUR_PLAYLIST_ID**
3. **Paste it into your page**

**Done!** Start your A/B test immediately.

### 💡 Pro CRO Tips
- Test customer testimonial videos vs written testimonials
- Try product demo videos on pricing pages
- Add founder story videos to about pages
- Use case study videos on landing pages
- Test video placement: above fold vs below fold

## ⚙️ Test Configuration Options

| Setting | Default | CRO Use Case |
|---------|---------|--------------|
| `maxResults` | 12 | **6** for testimonials, **9** for product demos |
| `autoPlay` | false | **true** for engagement, **false** for control |
| `autoPlayInterval` | 5000ms | Test **3000ms** vs **7000ms** for optimal dwell time |

### Real CRO Test Examples

**Landing Page Social Proof Test:**
```javascript
new YTFeedCarousel('social-proof', {
    apiKey: 'your-key',
    playlistId: 'customer-testimonials-playlist',
    maxResults: 6  // Show top 6 testimonials
});
```

**Product Demo Comparison Test:**
```javascript
new YTFeedCarousel('product-demos', {
    apiKey: 'your-key', 
    playlistId: 'product-demo-playlist',
    maxResults: 3,  // Focus on key features
    autoPlay: true  // Increase engagement
});
```

## 🔑 Getting YouTube API Key (Free & Easy!)

Don't worry - it's simpler than it sounds!

1. **Go to [Google Cloud Console](https://console.developers.google.com)**
2. **Create a new project** (or use existing)
3. **Enable YouTube Data API v3** (search for it in the API library)
4. **Create credentials** → Choose "API Key"
5. **Done!** Copy your key and use it in your code

💡 **Pro tip:** Restrict your API key to YouTube Data API v3 only for security.

The free quota gives you **10,000 requests per day** - enough for most websites!

## 🎮 Control Your Feed

```javascript
// Navigate through videos
feed.next();        // Show next videos
feed.prev();        // Show previous videos
feed.goToSlide(2);  // Jump to specific position

// Auto-play controls
feed.startAutoPlay(); // Start auto-scrolling
feed.stopAutoPlay();  // Stop auto-scrolling

// Maintenance
feed.refresh();  // Reload videos from YouTube
feed.destroy();  // Remove feed from page
```

## 🎨 Make It Match Your Brand

Easy theming with CSS custom properties:

```css
.yt-feed-carousel {
    --primary-color: #your-brand-color;
    --background-color: #your-bg-color;
    --text-color: #your-text-color;
    --border-radius: 8px;
}
```

## ✨ What You Get

- 📱 **Mobile-friendly** - Looks perfect on phones, tablets, and desktop
- 🎬 **Click to play** - Videos open in beautiful lightbox player
- ⌨️ **Keyboard shortcuts** - Arrow keys for navigation
- 👆 **Touch gestures** - Swipe on mobile devices
- ⚡ **Fast loading** - Optimized performance with lazy loading
- 📊 **Rich info** - Shows view counts, duration, and upload dates
- 🔄 **Auto-updates** - New videos appear automatically

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

Found a bug or need help? **[Open an issue](https://github.com/lyndoncortez/yt-feed-carousel/issues)** and we'll help you out!

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**[🚀 View Live Demo](https://lyndoncortez.github.io/yt-feed-carousel/demo/)** | **[📚 Documentation](docs/)** | **[💡 Examples](demo/)**