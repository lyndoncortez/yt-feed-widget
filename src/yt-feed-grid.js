(function(window) {
    'use strict';

    class YTFeedGrid {
        constructor(containerId, config = {}) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                throw new Error(`Container with id "${containerId}" not found`);
            }

            this.apiKey = config.apiKey || '';
            this.playlistId = config.playlistId || '';
            this.maxResults = config.maxResults || 50;
            this.gridColumns = config.gridColumns || 3;
            this.gridRows = config.gridRows || 2;
            this.showLoadMore = config.showLoadMore !== false;
            this.showSubscribe = config.showSubscribe !== false;
            this.channelId = config.channelId || '';

            this.videos = [];
            this.displayedCount = this.gridColumns * this.gridRows;
            this.currentOffset = 0;

            // Initialize analytics
            this.analytics = config.analytics?.enabled ? new YTFeedAnalytics(config.analytics) : null;
            this.videoPlayStartTime = null;
            this.currentPlayingVideo = null;

            if (!this.apiKey || !this.playlistId) {
                this.analytics.trackError('configuration_error', 'API key and playlist ID are required');
                throw new Error('API key and playlist ID are required');
            }

            this.init();
        }

        async init() {
            try {
                await this.loadVideos();
                await this.loadChannelInfo();
                this.render();
                this.bindEvents();

                // Track successful widget load
                if (this.analytics) {
                    this.analytics.trackWidgetLoad({
                        layout: 'grid',
                        gridColumns: this.gridColumns,
                        gridRows: this.gridRows,
                        showLoadMore: this.showLoadMore,
                        showSubscribe: this.showSubscribe
                    }, this.videos.length);
                }

            } catch (error) {
                if (this.analytics) {
                    this.analytics.trackError('initialization_error', error.message, {
                        apiKey: !!this.apiKey,
                        playlistId: !!this.playlistId
                    });
                }

                this.renderError('Failed to load videos. Please check your API key and playlist ID.');
                console.error('YT Feed Grid Error:', error);
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
                    channelTitle: item.snippet.channelTitle,
                    viewCount: stats.statistics?.viewCount || '0',
                    duration: stats.contentDetails?.duration || 'PT0M0S'
                };
            });

            // Store channel ID from first video for subscribe button
            if (data.items.length > 0) {
                this.channelId = data.items[0].snippet.channelId;
            }
        }

        async loadChannelInfo() {
            if (!this.channelId) return;

            try {
                const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${this.channelId}&key=${this.apiKey}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    this.channelInfo = data.items[0];
                }
            } catch (error) {
                console.warn('Could not load channel info:', error);
            }
        }

        render() {
            this.container.innerHTML = '';
            this.container.classList.add('yt-feed-grid');

            // Create grid container
            const gridContainer = document.createElement('div');
            gridContainer.className = 'yt-grid-container';
            gridContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${this.gridColumns}, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            `;

            // Render initial videos
            this.renderVideos(gridContainer);

            this.container.appendChild(gridContainer);

            // Add load more and subscribe buttons
            this.renderActionButtons();
        }

        renderVideos(container) {
            const videosToShow = this.videos.slice(this.currentOffset, this.currentOffset + this.displayedCount);

            videosToShow.forEach(video => {
                const videoElement = this.createVideoElement(video);
                container.appendChild(videoElement);
            });
        }

        createVideoElement(video) {
            const videoItem = document.createElement('div');
            videoItem.className = 'yt-grid-item';

            const formattedViews = this.formatNumber(parseInt(video.viewCount));
            const timeAgo = this.timeAgo(new Date(video.publishedAt));

            videoItem.innerHTML = `
                <div class="yt-grid-thumbnail" data-video-id="${video.id}">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="yt-grid-play-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="yt-grid-info">
                    <h3 class="yt-grid-title">${video.title}</h3>
                    <div class="yt-grid-meta">
                        <span class="yt-grid-channel">${video.channelTitle}</span>
                        <span class="yt-grid-stats">${formattedViews} views • ${timeAgo}</span>
                    </div>
                </div>
            `;

            return videoItem;
        }

        renderActionButtons() {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'yt-grid-actions';

            if (this.showLoadMore && this.hasMoreVideos()) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'yt-grid-load-more';
                loadMoreBtn.textContent = 'Load More...';
                loadMoreBtn.addEventListener('click', () => this.loadMore());
                actionsContainer.appendChild(loadMoreBtn);
            }

            if (this.showSubscribe && this.channelId) {
                const subscribeBtn = document.createElement('button');
                subscribeBtn.className = 'yt-grid-subscribe';
                subscribeBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Subscribe
                `;
                subscribeBtn.addEventListener('click', () => this.subscribe());
                actionsContainer.appendChild(subscribeBtn);
            }

            if (actionsContainer.children.length > 0) {
                this.container.appendChild(actionsContainer);
            }
        }

        loadMore() {
            const previousCount = this.currentOffset + this.displayedCount;

            // Track load more click
            if (this.analytics) {
                this.analytics.trackLoadMore(previousCount, this.videos.length, 'grid');
            }

            this.currentOffset += this.displayedCount;
            const gridContainer = this.container.querySelector('.yt-grid-container');
            this.renderVideos(gridContainer);

            // Update load more button visibility
            const loadMoreBtn = this.container.querySelector('.yt-grid-load-more');
            if (!this.hasMoreVideos() && loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
        }

        hasMoreVideos() {
            return this.currentOffset + this.displayedCount < this.videos.length;
        }

        subscribe() {
            if (this.channelId) {
                // Track subscribe click
                if (this.analytics) {
                    this.analytics.trackSubscribeClick({
                        channelId: this.channelId,
                        channelTitle: this.channelInfo?.snippet?.title || 'Unknown'
                    }, 'grid');
                }

                window.open(`https://www.youtube.com/channel/${this.channelId}?sub_confirmation=1`, '_blank');
            }
        }

        bindEvents() {
            this.container.addEventListener('click', (e) => {
                const thumbnail = e.target.closest('.yt-grid-thumbnail');
                if (thumbnail) {
                    const videoId = thumbnail.getAttribute('data-video-id');
                    this.playVideo(videoId);
                }
            });

            // Responsive grid
            window.addEventListener('resize', () => {
                this.updateResponsiveGrid();
            });

            this.updateResponsiveGrid();
        }

        updateResponsiveGrid() {
            const gridContainer = this.container.querySelector('.yt-grid-container');
            if (!gridContainer) return;

            const containerWidth = this.container.offsetWidth;
            let columns = this.gridColumns;

            if (containerWidth <= 768) {
                columns = 1;
            } else if (containerWidth <= 1024) {
                columns = Math.min(2, this.gridColumns);
            }

            gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }

        playVideo(videoId) {
            const video = this.videos.find(v => v.id === videoId);
            if (!video) return;

            // Find video position in grid
            const videoIndex = this.videos.findIndex(v => v.id === videoId);

            // Track video play
            if (this.analytics) {
                this.analytics.trackVideoPlay(video, videoIndex, 'grid');
            }

            // Store play start time for duration tracking
            this.videoPlayStartTime = Date.now();
            this.currentPlayingVideo = video;

            this.createVideoLightbox(video);
        }

        createVideoLightbox(video) {
            const existingLightbox = document.querySelector('.yt-lightbox');
            if (existingLightbox) {
                existingLightbox.remove();
            }

            const lightbox = document.createElement('div');
            lightbox.className = 'yt-lightbox';

            const formattedViews = this.formatNumber(parseInt(video.viewCount));
            const timeAgo = this.timeAgo(new Date(video.publishedAt));

            lightbox.innerHTML = `
                <div class="yt-lightbox-content">
                    <button class="yt-lightbox-close">&times;</button>
                        <iframe
                          class="yt-lightbox-video"
                          src="https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen>
                        </iframe>
                    <div class="yt-lightbox-info">
                      <div class="yt-lightbox-title">${video.title}</div>
                      <div class="yt-lightbox-stats">
                          <span>${video.channelTitle}</span>
                          <span>${formattedViews} views</span>
                          <span>${timeAgo}</span>
                      </div>
                    </div>
                </div>`;

            document.body.appendChild(lightbox);

            setTimeout(() => {
                lightbox.classList.add('active');
            }, 10);

            const closeButton = lightbox.querySelector('.yt-lightbox-close');
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

                if (this.analytics) {
                    this.analytics.trackVideoClose(this.currentPlayingVideo, watchTime, 'grid');
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

        renderError(message) {
            this.container.innerHTML = `<div class="yt-grid-error">${message}</div>`;
        }

        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
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
            window.removeEventListener('resize', this.updateResponsiveGrid);
            this.container.innerHTML = '';
        }

        refresh() {
            this.currentOffset = 0;
            this.init();
        }

        getAnalytics() {
            return this.analytics.getAnalyticsSummary();
        }
    }

    window.YTFeedGrid = YTFeedGrid;
})(window);