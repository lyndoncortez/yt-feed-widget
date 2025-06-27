# YT Feed Widget

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/lyndoncortez/yt-feed-widget)](https://github.com/lyndoncortez/yt-feed-widget/releases)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange)](https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-all.min.js)

**The fastest way to add YouTube feeds for A/B testing and CRO.** 🚀

Skip the development hassle. Copy, paste, and test video content impact on your conversions in minutes, not weeks. Perfect for CRO teams who need to test video placements quickly without custom development.

## 🎨 Choose Your Layout

### Carousel
Perfect for homepage heroes and featured content sections. [View Carousel Demo](https://lyndoncortez.github.io/yt-feed-widget/demo/)

### Grid
Clean grid display ideal for portfolios and video galleries. [View Grid Demo](https://lyndoncortez.github.io/yt-feed-widget/demo/grid.html)

### Combined Package
Use both layouts in the same project for maximum A/B testing flexibility.

## 🎯 Why Choose This Tool

- ⚡ **Quick & Easy Integration** - Copy, paste, done. Test video impact in under 5 minutes
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

## 🚀 Quick Start - Choose Your Style

### Option 1: Carousel Layout (Horizontal Scrolling)

```html
<!-- CSS + JavaScript -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-carousel.min.css">
<script src="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-carousel.min.js"></script>

<!-- Your carousel container -->
<div id="video-carousel"></div>

<script>
new YTFeedCarousel('video-carousel', {
    apiKey: 'YOUR_API_KEY',
    playlistId: 'YOUR_PLAYLIST_ID',
    maxResults: 12,
    autoPlay: true
});
</script>
```

### Option 2: Grid Layout (Clean Grid Display)

```html
<!-- CSS + JavaScript -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-grid.min.css">
<script src="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-grid.min.js"></script>

<!-- Your grid container -->
<div id="video-grid"></div>

<script>
new YTFeedGrid('video-grid', {
    apiKey: 'YOUR_API_KEY',
    playlistId: 'YOUR_PLAYLIST_ID',
    gridColumns: 3,
    gridRows: 2,
    showLoadMore: true
});
</script>
```

### Option 3: Both Layouts (Maximum Flexibility)

```html
<!-- Combined CSS + JavaScript (includes both layouts) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-all.min.css">
<script src="https://cdn.jsdelivr.net/gh/lyndoncortez/yt-feed-widget@latest/dist/yt-feed-all.min.js"></script>

<!-- Use either or both on the same page -->
<div id="hero-carousel"></div>
<div id="portfolio-grid"></div>

<script>
// Carousel for hero section
new YTFeedCarousel('hero-carousel', { 
    apiKey: 'YOUR_API_KEY', 
    playlistId: 'YOUR_PLAYLIST_ID' 
});

// Grid for portfolio section  
new YTFeedGrid('portfolio-grid', { 
    apiKey: 'YOUR_API_KEY', 
    playlistId: 'YOUR_PLAYLIST_ID',
    gridColumns: 4 
});
</script>
```

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

## ⚙️ Configuration Options

### Carousel Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | String | **Required** | Your YouTube Data API key |
| `playlistId` | String | **Required** | YouTube playlist ID to display |
| `maxResults` | Number | `12` | Number of videos to load |
| `autoPlay` | Boolean | `false` | Auto-scroll through videos |
| `autoPlayInterval` | Number | `5000` | Auto-scroll speed (milliseconds) |

### Grid Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | String | **Required** | Your YouTube Data API key |
| `playlistId` | String | **Required** | YouTube playlist ID to display |
| `gridColumns` | Number | `3` | Number of columns (2, 3, or 4) |
| `gridRows` | Number | `2` | Initial rows to display |
| `showLoadMore` | Boolean | `true` | Show "Load More" button |
| `showSubscribe` | Boolean | `true` | Show "Subscribe" button |

### Real CRO Test Examples

**Landing Page Hero Test (Carousel vs Static):**
```javascript
// Treatment A: Carousel
new YTFeedCarousel('hero-section', {
    apiKey: 'your-key',
    playlistId: 'customer-testimonials',
    maxResults: 6,
    autoPlay: true
});
```

**Product Gallery Test (Grid vs Images):**
```javascript
// Treatment B: Grid
new YTFeedGrid('product-gallery', {
    apiKey: 'your-key',
    playlistId: 'product-demos',
    gridColumns: 3,
    gridRows: 2,
    showLoadMore: false
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

## 🎮 Control Your Feeds

### Carousel Methods
```javascript
const carousel = new YTFeedCarousel('container', {...});

// Navigation
carousel.next();        // Show next videos
carousel.prev();        // Show previous videos
carousel.goToSlide(2);  // Jump to specific position

// Auto-play controls
carousel.startAutoPlay(); // Start auto-scrolling
carousel.stopAutoPlay();  // Stop auto-scrolling

// Maintenance
carousel.refresh();  // Reload videos from YouTube
carousel.destroy();  // Remove carousel from page
```

### Grid Methods
```javascript
const grid = new YTFeedGrid('container', {...});

// Load more content
grid.loadMore();     // Show more videos

// Maintenance  
grid.refresh();      // Reload videos from YouTube
grid.destroy();      // Remove grid from page
```

## 🎨 Customize for Your Brand

Both layouts support easy theming with CSS custom properties:

### Carousel Styling
```css
.yt-feed-carousel {
    --primary-color: #your-brand-color;
    --background-color: #your-bg-color;
    --text-color: #your-text-color;
    --border-radius: 12px;
}
```

### Grid Styling
```css
.yt-feed-grid {
    --grid-gap: 20px;
    --item-border-radius: 8px;
    --hover-transform: translateY(-2px);
    --button-color: #1a73e8;
}
```

## 📊 Optional: Analytics Tracking
Want to track video performance? **[Enable Analytics →](docs/ANALYTICS.md)**

## ✨ What You Get

- 📱 **Mobile-first responsive design** - Perfect on all devices
- 🎬 **Click-to-play lightbox** - Beautiful video player experience
- ⌨️ **Keyboard navigation** - Arrow keys for carousel
- 👆 **Touch gestures** - Swipe support on mobile
- ⚡ **Optimized performance** - Lazy loading and smooth animations
- 📊 **Rich video metadata** - Views, duration, upload dates
- 🔄 **Auto-updates** - New videos appear automatically
- 🎯 **A/B test ready** - Easy to implement and remove
- 🎨 **Two layout options** - Carousel and grid for different use cases
- 📦 **Auto-built files** - Always up-to-date minified versions

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

Found a bug or need help? **[Open an issue](https://github.com/lyndoncortez/yt-feed-widget/issues)** and we'll help you out!

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**[View Carousel Demo](https://lyndoncortez.github.io/yt-feed-widget/demo/)** | **[View Grid Demo](https://lyndoncortez.github.io/yt-feed-widget/demo/grid.html)**