(function(window) {
  'use strict';

  class YTFeedCarousel {
    constructor(containerId, config = {}) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }

      this.apiKey = config.apiKey || '';
      this.playlistId = config.playlistId || '';
      this.maxResults = config.maxResults || 12;
      this.currentIndex = 0;
      this.videos = [];
      this.itemsPerView = 3;
      this.autoPlay = config.autoPlay || false;
      this.autoPlayInterval = config.autoPlayInterval || 5000;
      this.intervalId = null;

      // Initialize analytics
      this.analytics = config.analytics?.enabled ? new YTFeedAnalytics(config.analytics) : null;
      this.videoPlayStartTime = null;
      this.currentPlayingVideo = null;

      if (!this.apiKey || !this.playlistId) {
        if (this.analytics) {
          this.analytics.trackError('configuration_error', 'API key and playlist ID are required');
        }
        throw new Error('API key and playlist ID are required');
      }

      this.init();
    }

    async init() {
      try {
        await this.loadVideos();
        this.render();
        this.bindEvents();
        this.updateItemsPerView();

        if (this.analytics) {
          this.analytics.trackWidgetLoad({
            layout: 'carousel',
            autoPlay: this.autoPlay,
            autoPlayInterval: this.autoPlayInterval
          }, this.videos.length);
        }

        if (this.autoPlay) {
          this.startAutoPlay();
        }
      } catch (error) {
        if (this.analytics) {
          this.analytics.trackError('initialization_error', error.message, {
            apiKey: !!this.apiKey,
            playlistId: !!this.playlistId
          });
        }

        this.renderError('Failed to load videos. Please check your API key and playlist ID.');
        console.error('YouTube Carousel Error:', error);
      }
    }

    async loadVideos() {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${this.playlistId}&key=${this.apiKey}&maxResults=${this.maxResults}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Get video statistics for each video
      const videoIds = data.items.map(item => item.snippet.resourceId.videoId).join(',');
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`;

      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      this.videos = data.items.map((item, index) => {
        const stats = statsData.items[index] || {};
        return {
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
          viewCount: stats.statistics?.viewCount || '0',
          duration: stats.contentDetails?.duration || 'PT0M0S'
        };
      });
    }


    render() {
      const track = document.createElement('div');
      track.className = 'carousel-track';
      track.id = 'carousel-track';

      this.videos.forEach((video, index) => {
        const videoElement = this.createVideoElement(video, index);
        track.appendChild(videoElement);
      });

      const navButtons = this.createNavButtons();

      this.container.innerHTML = '';
      this.container.appendChild(track);
      this.container.appendChild(navButtons.prev);
      this.container.appendChild(navButtons.next);
    }

    createVideoElement(video, index) {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item';

      const formattedViews = this.formatNumber(parseInt(video.viewCount));
      const duration = this.formatDuration(video.duration);
      const timeAgo = this.timeAgo(new Date(video.publishedAt));

      videoItem.innerHTML = `
                <div class="video-thumbnail" data-video-id="${video.id}">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="play-button"></div>
                    <div class="video-overlay">
                        <div class="video-title">${video.title}</div>
                        <div class="video-stats">
                            <span>${formattedViews} views</span>
                            <span>${timeAgo}</span>
                            <span>${duration}</span>
                        </div>
                    </div>
                </div>
            `;

      return videoItem;
    }

    createNavButtons() {
      const prevButton = document.createElement('button');
      prevButton.className = 'nav-button prev';
      prevButton.innerHTML = '<svg width="17" height="17" viewBox="-1.636 0 10.88 10.88" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,0,0)"><path d="m2.083 9.775 -0.723 -0.723 3.464 -3.485L1.36 2.083l0.723 -0.723 4.165 4.208z"></path></svg>';
      prevButton.addEventListener('click', () => this.prev());

      const nextButton = document.createElement('button');
      nextButton.className = 'nav-button next';
      nextButton.innerHTML = '<svg width="17" height="17" viewBox="-1.636 0 10.88 10.88" xmlns="http://www.w3.org/2000/svg"><path d="m2.083 9.775 -0.723 -0.723 3.464 -3.485L1.36 2.083l0.723 -0.723 4.165 4.208z"/></svg>';
      nextButton.addEventListener('click', () => this.next());

      return { prev: prevButton, next: nextButton };
    }

    bindEvents() {
      this.container.addEventListener('click', (e) => {
        const thumbnail = e.target.closest('.video-thumbnail');
        if (thumbnail) {
          const videoId = thumbnail.getAttribute('data-video-id');
          this.playVideo(videoId);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      let startX = 0;
      let startY = 0;

      this.container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      });

      this.container.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = startX - endX;
        const diffY = startY - endY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            this.next();
          } else {
            this.prev();
          }
        }

        startX = 0;
        startY = 0;
      });

      window.addEventListener('resize', () => {
        this.updateItemsPerView();
      });

      if (this.autoPlay) {
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
      }
    }

    updateItemsPerView() {
      const containerWidth = this.container.offsetWidth;
      if (containerWidth <= 768) {
        this.itemsPerView = 1;
      } else if (containerWidth <= 1024) {
        this.itemsPerView = 2;
      } else {
        this.itemsPerView = 3;
      }

      const videoItems = this.container.querySelectorAll('.video-item');
      videoItems.forEach(item => {
        const gapSpace = (this.itemsPerView - 1) * 16;
        const flexBasis = `calc((100% - ${gapSpace}px) / ${this.itemsPerView})`;
        item.style.flex = `0 0 ${flexBasis}`;
      });

      this.updateCarouselPosition();
    }

    next() {
      const maxIndex = this.videos.length - this.itemsPerView;

      const oldIndex = this.currentIndex;
      if (this.currentIndex < maxIndex) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }

      // Track navigation
      if(this.analytics) {
        this.analytics.trackCarouselNavigation('next', this.currentIndex, this.videos.length);
      }

      this.updateCarouselPosition();
    }

    prev() {
      const maxIndex = this.videos.length - this.itemsPerView;

      const oldIndex = this.currentIndex;
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        this.currentIndex = maxIndex;
      }

      // Track navigation
      if(this.analytics) {
        this.analytics.trackCarouselNavigation('prev', this.currentIndex, this.videos.length);
      }

      this.updateCarouselPosition();
    }

    goToSlide(index) {
      this.currentIndex = index;
      this.updateCarouselPosition();
    }

    updateCarouselPosition() {
      const track = document.getElementById('carousel-track');

      if (!track) {
        console.warn('Carousel track not found');
        return;
      }

      const containerWidth = this.container.offsetWidth;
      const gapSpace = (this.itemsPerView - 1) * 16;
      const itemWidth = (containerWidth - gapSpace) / this.itemsPerView;
      const itemWithGap = itemWidth + 16;

      const translateX = -(this.currentIndex * itemWithGap);

      track.style.transform = `translateX(${translateX}px)`;
    }

    playVideo(videoId) {
      const video = this.videos.find(v => v.id === videoId);
      if (!video) return;

      // Find video position in carousel
      const videoIndex = this.videos.findIndex(v => v.id === videoId);
      const positionInCurrentView = videoIndex - this.currentIndex;

      // Track video play
      if(this.analytics) {
        this.analytics.trackVideoPlay(video, videoIndex, 'carousel');
      }

      // Store play start time for duration tracking
      this.videoPlayStartTime = Date.now();
      this.currentPlayingVideo = video;

      this.createVideoLightbox(video);
    }

    createVideoLightbox(video) {
      const existingLightbox = document.querySelector('.lightbox');
      if (existingLightbox) {
        existingLightbox.remove();
      }

      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';

      const formattedViews = this.formatNumber(parseInt(video.viewCount));
      const duration = this.formatDuration(video.duration);
      const timeAgo = this.timeAgo(new Date(video.publishedAt));

      lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <iframe
                class="lightbox-video"
                src="https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
            <div class="lightbox-info">
                <div class="lightbox-title">${video.title}</div>
                <div class="lightbox-stats">
                    <span>${formattedViews} views</span>
                    <span>${timeAgo}</span>
                    <span>${duration}</span>
                </div>
            </div>
        </div>
    `;

      document.body.appendChild(lightbox);

      setTimeout(() => {
        lightbox.classList.add('active');
      }, 10);

      const closeButton = lightbox.querySelector('.lightbox-close');
      closeButton.addEventListener('click', () => this.closeLightbox(lightbox));

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          this.closeLightbox(lightbox);
        }
      });

      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.closeLightbox(lightbox);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      document.body.style.overflow = 'hidden';
    }

    closeLightbox(lightbox) {
      // Track video close with watch time
      if (this.videoPlayStartTime && this.currentPlayingVideo) {
        const watchTime = Date.now() - this.videoPlayStartTime;

        if(this.analytics) {
          this.analytics.trackVideoClose(this.currentPlayingVideo, watchTime, 'carousel');
        }

        this.videoPlayStartTime = null;
        this.currentPlayingVideo = null;
      }

      lightbox.classList.remove('active');

      setTimeout(() => {
        lightbox.remove();
        document.body.style.overflow = '';
      }, 300);
    }

    startAutoPlay() {
      this.stopAutoPlay();
      this.intervalId = setInterval(() => {
        const maxIndex = Math.ceil(this.videos.length / this.itemsPerView) - 1;
        if (this.currentIndex >= maxIndex) {
          this.currentIndex = 0;
        } else {
          this.currentIndex++;
        }
        this.updateCarouselPosition();
      }, this.autoPlayInterval);
    }

    stopAutoPlay() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    renderError(message) {
      this.container.innerHTML = `<div class="error">${message}</div>`;
    }

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }

    formatDuration(duration) {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      const seconds = parseInt(match[3]) || 0;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    timeAgo(date) {
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    }

    destroy() {
      this.stopAutoPlay();
      window.removeEventListener('resize', this.updateItemsPerView);
      this.container.innerHTML = '';
    }

    refresh() {
      this.init();
    }

    getAnalytics() {
      return this.analytics.getAnalyticsSummary();
    }
  }

  window.YTFeedCarousel = YTFeedCarousel;
})(window);