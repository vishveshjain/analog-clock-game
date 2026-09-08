/**
 * YouTube Playables SDK Bridge & Mock
 * Provides seamless integration with YouTube Playables API when embedded,
 * with complete graceful fallback for standalone browser execution.
 */
class YouTubePlayablesBridge {
  constructor() {
    this.isEmbedded = typeof window.YT_PLAYABLES !== 'undefined';
    this.sdk = window.YT_PLAYABLES || null;
    this.isPaused = false;
    this.pauseCallbacks = [];
    this.resumeCallbacks = [];

    this._initListeners();
  }

  _initListeners() {
    if (this.sdk) {
      if (typeof this.sdk.onPause === 'function') {
        this.sdk.onPause(() => this._handlePause());
      }
      if (typeof this.sdk.onResume === 'function') {
        this.sdk.onResume(() => this._handleResume());
      }
    }

    // Standard browser visibility fallback
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._handlePause();
      } else {
        this._handleResume();
      }
    });
  }

  _handlePause() {
    this.isPaused = true;
    this.pauseCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.warn('Error in onPause callback', e); }
    });
  }

  _handleResume() {
    this.isPaused = false;
    this.resumeCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.warn('Error in onResume callback', e); }
    });
  }

  onPause(cb) {
    if (typeof cb === 'function') this.pauseCallbacks.push(cb);
  }

  onResume(cb) {
    if (typeof cb === 'function') this.resumeCallbacks.push(cb);
  }

  firstFrameReady() {
    console.log('[Playables SDK] First Frame Ready');
    if (this.sdk && typeof this.sdk.firstFrameReady === 'function') {
      try {
        this.sdk.firstFrameReady();
      } catch (err) {
        console.warn('firstFrameReady error', err);
      }
    }
  }

  gameReady() {
    console.log('[Playables SDK] Game Ready');
    if (this.sdk && typeof this.sdk.gameReady === 'function') {
      try {
        this.sdk.gameReady();
      } catch (err) {
        console.warn('gameReady error', err);
      }
    }
  }

  sendScore(score) {
    console.log('[Playables SDK] Score reported:', score);
    if (this.sdk && typeof this.sdk.sendScore === 'function') {
      try {
        this.sdk.sendScore({ value: score });
      } catch (err) {
        console.warn('sendScore error', err);
      }
    }
  }
}

window.Playables = new YouTubePlayablesBridge();
