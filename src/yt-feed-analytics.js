(function(window) {
    'use strict';

    class YTFeedAnalytics {
        constructor(config = {}) {
            this.config = {
                enabled: config.enabled !== false,
                provider: config.provider || 'ga4',
                measurementId: config.measurementId || null,
                customEvents: config.customEvents !== false,
                debug: config.debug || false,
                sessionId: this.generateSessionId(),
                userId: config.userId || this.generateUserId(),
                ...config
            };

            this.eventQueue = [];
            this.isInitialized = false;
            this.startTime = Date.now();

            if (this.config.enabled) {
                this.init();
            }
        }

        init() {
            this.detectEnvironment();
            this.initializeProvider();
            this.isInitialized = true;
            this.flushEventQueue();

            if (this.config.debug) {
                console.log('YT Feed Analytics initialized:', this.config);
            }
        }

        detectEnvironment() {
            this.environment = {
                userAgent: navigator.userAgent,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                deviceType: this.getDeviceType(),
                isMobile: window.innerWidth <= 767,
                isTablet: window.innerWidth > 767 && window.innerWidth <= 1023,
                isDesktop: window.innerWidth > 1023,
                referrer: document.referrer,
                url: window.location.href,
                timestamp: new Date().toISOString()
            };
        }

        getDeviceType() {
            const width = window.innerWidth;
            if (width <= 767) return 'mobile';
            if (width <= 1023) return 'tablet';
            return 'desktop';
        }

        initializeProvider() {
            if (this.config.provider === 'ga4' && this.config.measurementId) {
                this.initializeGA4();
            }
        }

        initializeGA4() {
            // Load Google Analytics 4 if not already loaded
            if (!window.gtag) {
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
                document.head.appendChild(script);

                window.dataLayer = window.dataLayer || [];
                window.gtag = function() {
                    window.dataLayer.push(arguments);
                };

                window.gtag('js', new Date());
                window.gtag('config', this.config.measurementId, {
                    debug_mode: this.config.debug,
                    send_page_view: false // handle manually
                });
            }

            if (this.config.debug) {
                console.log('Google Analytics 4 initialized with ID:', this.config.measurementId);
            }
        }

        track(eventName, eventData = {}) {
            if (!this.config.enabled) return;

            const enrichedData = this.enrichEventData(eventName, eventData);

            if (!this.isInitialized) {
                this.eventQueue.push({ eventName, eventData: enrichedData });
                return;
            }

            this.sendEvent(eventName, enrichedData);
        }

        enrichEventData(eventName, eventData) {
            const baseData = {
                event_category: 'yt_feed_widget',
                event_label: eventData.video_title || eventData.layout_type || 'unknown',
                session_id: this.config.sessionId,
                user_id: this.config.userId,
                widget_version: 'WIDGET_VERSION',
                device_type: this.environment.deviceType,
                viewport_width: this.environment.viewportWidth,
                viewport_height: this.environment.viewportHeight,
                timestamp: Date.now(),
                session_duration: Date.now() - this.startTime,
                page_url: window.location.href,
                ...eventData
            };

            // Add specific enrichments based on event type
            switch (eventName) {
                case 'video_play':
                    baseData.value = 1; // Standard conversion value
                    break;
                case 'subscribe_click':
                    baseData.value = 5; // Higher value for subscription intent
                    break;
                case 'load_more_click':
                    baseData.value = 2; // Medium value for engagement
                    break;
            }

            return baseData;
        }

        sendEvent(eventName, eventData) {
            // Send to Google Analytics 4
            if (this.config.provider === 'ga4' && window.gtag) {
                window.gtag('event', eventName, eventData);
            }

            // Send to custom event handlers
            if (this.config.customEvents) {
                this.sendCustomEvent(eventName, eventData);
            }

            if (this.config.debug) {
                console.log('Analytics Event:', eventName, eventData);
            }
        }

        sendCustomEvent(eventName, eventData) {
            // Dispatch custom DOM event for other analytics tools
            const customEvent = new CustomEvent('yt_feed_analytics', {
                detail: {
                    eventName,
                    eventData,
                    timestamp: Date.now()
                }
            });

            document.dispatchEvent(customEvent);

            // Also call global callback if defined
            if (window.ytFeedAnalyticsCallback && typeof window.ytFeedAnalyticsCallback === 'function') {
                window.ytFeedAnalyticsCallback(eventName, eventData);
            }
        }

        flushEventQueue() {
            while (this.eventQueue.length > 0) {
                const { eventName, eventData } = this.eventQueue.shift();
                this.sendEvent(eventName, eventData);
            }
        }

        // Predefined tracking methods for common events
        trackVideoPlay(videoData, position, layoutType) {
            this.track('video_play', {
                video_id: videoData.id,
                video_title: videoData.title,
                video_duration: videoData.duration,
                video_views: videoData.viewCount,
                video_channel: videoData.channelTitle,
                video_position: position,
                layout_type: layoutType,
                play_method: 'thumbnail_click'
            });
        }

        trackVideoClose(videoData, watchTime, layoutType) {
            this.track('video_close', {
                video_id: videoData.id,
                video_title: videoData.title,
                watch_time_seconds: Math.round(watchTime / 1000),
                layout_type: layoutType,
                engagement_rate: watchTime > 10000 ? 'high' : watchTime > 3000 ? 'medium' : 'low'
            });
        }

        trackCarouselNavigation(direction, currentIndex, totalVideos) {
            this.track('carousel_navigate', {
                navigation_direction: direction,
                current_position: currentIndex,
                total_videos: totalVideos,
                layout_type: 'carousel'
            });
        }

        trackLoadMore(currentCount, totalVideos, layoutType) {
            this.track('load_more_click', {
                videos_shown_before: currentCount,
                total_videos: totalVideos,
                layout_type: layoutType,
                engagement_depth: currentCount / totalVideos
            });
        }

        trackSubscribeClick(channelData, layoutType) {
            this.track('subscribe_click', {
                channel_id: channelData.channelId,
                channel_title: channelData.channelTitle,
                layout_type: layoutType,
                subscriber_intent: true
            });
        }

        trackWidgetLoad(config, videoCount) {
            this.track('widget_load', {
                layout_type: config.layout || 'carousel',
                video_count: videoCount,
                auto_play: config.autoPlay || false,
                grid_columns: config.gridColumns || null,
                load_time_seconds: (Date.now() - this.startTime) / 1000
            });
        }

        trackError(errorType, errorMessage, context = {}) {
            this.track('widget_error', {
                error_type: errorType,
                error_message: errorMessage,
                ...context
            });
        }

        // Utility methods
        generateSessionId() {
            return 'yt_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        generateUserId() {
            // Try to get existing user ID from localStorage, create new if not exists
            let userId = null;
            try {
                userId = localStorage.getItem('yt_feed_user_id');
                if (!userId) {
                    userId = 'yt_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('yt_feed_user_id', userId);
                }
            } catch (e) {
                // Fallback if localStorage is not available
                userId = 'yt_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            return userId;
        }

        // Get analytics summary for debugging/reporting
        getAnalyticsSummary() {
            return {
                config: this.config,
                environment: this.environment,
                sessionDuration: Date.now() - this.startTime,
                isInitialized: this.isInitialized,
                eventQueueLength: this.eventQueue.length
            };
        }

        // Disable analytics (GDPR compliance)
        disable() {
            this.config.enabled = false;
            if (this.config.debug) {
                console.log('YT Feed Analytics disabled');
            }
        }

        // Enable analytics
        enable() {
            this.config.enabled = true;
            if (!this.isInitialized) {
                this.init();
            }
            if (this.config.debug) {
                console.log('YT Feed Analytics enabled');
            }
        }
    }

    window.YTFeedAnalytics = YTFeedAnalytics;

})(window);