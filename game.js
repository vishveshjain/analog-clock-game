/**
 * Analog Clock Learning Game - Core Game Engine
 * Designed for kids learning analog clocks on YouTube Playables.
 */

class ClockGame {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.level = 'challenging'; // 'easy' (hours), 'medium' (half/quarters), 'challenging' (5-mins), 'master'
    this.mode = 'kid'; // 'kid' (direct 1-12 number mapping: 3:40 -> hour on 3, minute on 8)
    
    this.targetHour = 3;
    this.targetMinute = 40;

    // Current hand positions (1-12 scale for both hands in kid mode)
    // 1-12 for hour, 0-59 (or 1-12 equivalent) for minute
    this.currentHourTick = 12; // 1 to 12
    this.currentMinuteTick = 12; // 1 to 12 (12 = 00 min, 1 = 05 min, ..., 8 = 40 min)

    // Hand angles in degrees (0 = 12 o'clock)
    this.hourAngle = 0;
    this.minuteAngle = 0;

    // Active dragging state
    this.draggingHand = null; // 'hour' | 'minute' | null
    this.selectedHandPill = 'minute'; // for tap-to-place

    // SVG and DOM Elements
    this.svg = document.getElementById('analog-clock-svg');
    this.hourHandGroup = document.getElementById('hour-hand-group');
    this.minuteHandGroup = document.getElementById('minute-hand-group');
    this.digitalTimeEl = document.getElementById('target-digital-time');
    this.feedbackBox = document.getElementById('feedback-box');
    this.scoreValueEl = document.getElementById('score-value');
    this.streakValueEl = document.getElementById('streak-value');
    this.celebrationModal = document.getElementById('celebration-modal');
    this.modalTimeDisplay = document.getElementById('modal-time-display');

    this.init();
  }

  init() {
    this.buildClockFace();
    this.setupEventListeners();
    this.setupLevelButtons();

    // Start with the classic example from the prompt: 3:40
    this.setTargetTime(3, 40);
    this.setHands(12, 12); // Initial starting position at 12:00

    // Announce ready to YouTube Playables
    if (window.Playables) {
      window.Playables.firstFrameReady();
      window.Playables.gameReady();
    }
  }

  // Generate numbers, ticks, and educational minute badges dynamically
  buildClockFace() {
    const numbersGroup = document.getElementById('clock-numbers-group');
    const ticksGroup = document.getElementById('clock-ticks-group');
    if (!numbersGroup || !ticksGroup) return;

    const cx = 200;
    const cy = 200;
    const radius = 170;

    // Generate 60 minute ticks
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 * Math.PI) / 180;
      const isHourTick = i % 5 === 0;
      const tickLength = isHourTick ? 14 : 7;
      const rOuter = radius - 6;
      const rInner = rOuter - tickLength;

      const x1 = cx + rOuter * Math.sin(angle);
      const y1 = cy - rOuter * Math.cos(angle);
      const x2 = cx + rInner * Math.sin(angle);
      const y2 = cy - rInner * Math.cos(angle);

      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x1);
      tick.setAttribute('y1', y1);
      tick.setAttribute('x2', x2);
      tick.setAttribute('y2', y2);
      tick.setAttribute('class', isHourTick ? 'tick-hour' : 'tick-minute');
      ticksGroup.appendChild(tick);
    }

    // Generate 12 Hour Numbers (1 to 12) + 5-minute hints
    for (let num = 1; num <= 12; num++) {
      const angle = (num * 30 * Math.PI) / 180;
      
      // Hour number position
      const numRadius = 125;
      const nx = cx + numRadius * Math.sin(angle);
      const ny = cy - numRadius * Math.cos(angle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', nx);
      text.setAttribute('y', ny);
      text.setAttribute('class', 'clock-number');
      text.setAttribute('data-number', num);
      text.textContent = num;
      numbersGroup.appendChild(text);

      // Outer 5-minute helper badge (e.g., :05, :10, :40)
      const minuteVal = (num * 5) % 60;
      const minStr = minuteVal < 10 ? `0${minuteVal}` : `${minuteVal}`;
      const hintRadius = 158;
      const hx = cx + hintRadius * Math.sin(angle);
      const hy = cy - hintRadius * Math.cos(angle);

      const hint = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      hint.setAttribute('x', hx);
      hint.setAttribute('y', hy);
      hint.setAttribute('class', 'minute-hint');
      hint.setAttribute('data-number', num);
      hint.textContent = minStr;
      numbersGroup.appendChild(hint);
    }
  }

  setupEventListeners() {
    // SVG Pointer events for drag and drop
    this.svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

    // Number clicking / tapping support
    this.svg.addEventListener('click', (e) => {
      const target = e.target.closest('[data-number]');
      if (target) {
        const num = parseInt(target.getAttribute('data-number'), 10);
        this.placeSelectedHandOnNumber(num);
      }
    });

    // Check button
    document.getElementById('btn-check').addEventListener('click', () => {
      this.checkAnswer();
    });

    // Hint button
    document.getElementById('btn-hint').addEventListener('click', () => {
      this.giveHint();
    });

    // Speaker button for time voice readout
    document.getElementById('btn-speaker').addEventListener('click', () => {
      window.sounds.speakTime(this.targetHour, this.targetMinute);
    });

    // Sound mute toggle
    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      const muted = window.sounds.toggleMute();
      e.currentTarget.textContent = muted ? '🔇' : '🔊';
    });

    // Next Time button on celebration modal
    document.getElementById('btn-next-time').addEventListener('click', () => {
      this.closeModal();
      this.nextChallenge();
    });

    // Hand selection pills
    const hourPill = document.getElementById('pill-hour');
    const minutePill = document.getElementById('pill-minute');
    if (hourPill && minutePill) {
      hourPill.addEventListener('click', () => {
        this.selectedHandPill = 'hour';
        hourPill.classList.add('active-hour');
        minutePill.classList.remove('active-minute');
      });
      minutePill.addEventListener('click', () => {
        this.selectedHandPill = 'minute';
        minutePill.classList.add('active-minute');
        hourPill.classList.remove('active-hour');
      });
    }
  }

  setupLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        buttons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.level = e.currentTarget.getAttribute('data-level');
        this.nextChallenge();
      });
    });
  }

  // Get angle in degrees (0-360) from clock center (200, 200)
  getPointerAngle(e) {
    const rect = this.svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = e.clientX - cx;
    const y = e.clientY - cy;

    // Angle in degrees where 0 = top (12 o'clock)
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    return { angle, dist: Math.hypot(x, y) };
  }

  onPointerDown(e) {
    const { angle, dist } = this.getPointerAngle(e);
    
    // Check if clicked near hour hand or minute hand
    // Or if clicked on handles
    const target = e.target;
    if (target.closest('#hour-hand-group') || target.id === 'hour-handle') {
      this.draggingHand = 'hour';
      this.setActivePill('hour');
    } else if (target.closest('#minute-hand-group') || target.id === 'minute-handle') {
      this.draggingHand = 'minute';
      this.setActivePill('minute');
    } else {
      // If tapped on clock face, determine which hand is closer in angle
      const diffHour = Math.abs(this.angleDiff(angle, this.hourAngle));
      const diffMin = Math.abs(this.angleDiff(angle, this.minuteAngle));
      
      if (diffHour < 25 && diffMin >= 25) {
        this.draggingHand = 'hour';
        this.setActivePill('hour');
      } else if (diffMin < 25 && diffHour >= 25) {
        this.draggingHand = 'minute';
        this.setActivePill('minute');
      } else {
        // Fall back to currently active pill
        this.draggingHand = this.selectedHandPill;
      }
    }

    if (this.draggingHand) {
      try {
        this.svg.setPointerCapture(e.pointerId);
      } catch (err) {}
      this.updateHandFromAngle(this.draggingHand, angle, false);
      window.sounds.playTick();
    }
  }

  onPointerMove(e) {
    if (!this.draggingHand) return;
    const { angle } = this.getPointerAngle(e);
    this.updateHandFromAngle(this.draggingHand, angle, false);
  }

  onPointerUp(e) {
    if (!this.draggingHand) return;
    const { angle } = this.getPointerAngle(e);
    this.updateHandFromAngle(this.draggingHand, angle, true);
    window.sounds.playSnap();
    this.draggingHand = null;

    try {
      this.svg.releasePointerCapture(e.pointerId);
    } catch (err) {}
    this.updateStatusDisplay();
  }

  setActivePill(hand) {
    this.selectedHandPill = hand;
    const hourPill = document.getElementById('pill-hour');
    const minutePill = document.getElementById('pill-minute');
    if (hourPill && minutePill) {
      if (hand === 'hour') {
        hourPill.classList.add('active-hour');
        minutePill.classList.remove('active-minute');
      } else {
        minutePill.classList.add('active-minute');
        hourPill.classList.remove('active-hour');
      }
    }
  }

  angleDiff(a, b) {
    let diff = (a - b) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    return diff;
  }

  // Update hand orientation and snap to the 12 positions
  updateHandFromAngle(hand, rawAngle, snapToTick = false) {
    // Each of the 12 numbers is 30 degrees apart
    // 12 = 0 deg, 1 = 30 deg, 2 = 60 deg, ..., 11 = 330 deg
    const tickNumber = Math.round(rawAngle / 30) % 12 || 12;
    const snappedAngle = (tickNumber % 12) * 30;

    if (hand === 'hour') {
      this.currentHourTick = tickNumber;
      this.hourAngle = snapToTick ? snappedAngle : rawAngle;
      this.hourHandGroup.setAttribute('transform', `rotate(${this.hourAngle} 200 200)`);
    } else {
      this.currentMinuteTick = tickNumber;
      this.minuteAngle = snapToTick ? snappedAngle : rawAngle;
      this.minuteHandGroup.setAttribute('transform', `rotate(${this.minuteAngle} 200 200)`);
    }

    this.clearFeedback();
  }

  placeSelectedHandOnNumber(num) {
    const hand = this.selectedHandPill;
    const snappedAngle = (num % 12) * 30;

    if (hand === 'hour') {
      this.currentHourTick = num;
      this.hourAngle = snappedAngle;
      this.hourHandGroup.setAttribute('transform', `rotate(${this.hourAngle} 200 200)`);
    } else {
      this.currentMinuteTick = num;
      this.minuteAngle = snappedAngle;
      this.minuteHandGroup.setAttribute('transform', `rotate(${this.minuteAngle} 200 200)`);
    }

    window.sounds.playSnap();
    this.clearFeedback();
    this.updateStatusDisplay();
  }

  setHands(hourTick, minuteTick) {
    this.currentHourTick = hourTick;
    this.currentMinuteTick = minuteTick;

    this.hourAngle = (hourTick % 12) * 30;
    this.minuteAngle = (minuteTick % 12) * 30;

    this.hourHandGroup.setAttribute('transform', `rotate(${this.hourAngle} 200 200)`);
    this.minuteHandGroup.setAttribute('transform', `rotate(${this.minuteAngle} 200 200)`);
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    const readout = document.getElementById('current-hands-readout');
    if (!readout) return;
    const minVal = (this.currentMinuteTick * 5) % 60;
    const minStr = minVal < 10 ? `0${minVal}` : `${minVal}`;
    readout.innerHTML = `Your Clock: <span class="badge-h">Small: ${this.currentHourTick}</span> &bull; <span class="badge-m">Large: ${this.currentMinuteTick} (:${minStr})</span>`;
  }

  // Set target time and update display
  setTargetTime(hour, minute) {
    this.targetHour = hour;
    this.targetMinute = minute;

    const minStr = minute < 10 ? `0${minute}` : `${minute}`;
    this.digitalTimeEl.textContent = `${hour}:${minStr}`;

    // Read aloud for young learners
    setTimeout(() => {
      window.sounds.speakTime(hour, minute);
    }, 300);
  }

  // Generate next puzzle based on level
  nextChallenge() {
    let newHour = Math.floor(Math.random() * 12) + 1;
    let newMin = 0;

    if (this.level === 'easy') {
      // O'clock: 1:00, 2:00, ..., 12:00
      newMin = 0;
    } else if (this.level === 'medium') {
      // Half and quarter hours: :00, :15, :30, :45
      const options = [0, 15, 30, 45];
      newMin = options[Math.floor(Math.random() * options.length)];
    } else {
      // Challenging: 5-minute multiples (e.g. 3:40, 8:25, etc.)
      const minuteTick = Math.floor(Math.random() * 12); // 0 to 11
      newMin = minuteTick * 5;
    }

    // Avoid exact same time consecutively
    if (newHour === this.targetHour && newMin === this.targetMinute) {
      newHour = (newHour % 12) + 1;
    }

    this.setTargetTime(newHour, newMin);
    this.clearFeedback();
  }

  // Check the child's answer
  checkAnswer() {
    // Hour tick expectation (1-12)
    const expectedHourTick = this.targetHour;

    // Minute tick expectation (1-12, where 12 = :00, 1 = :05, ..., 8 = :40)
    const expectedMinuteTick = this.targetMinute === 0 ? 12 : Math.round(this.targetMinute / 5);

    const isHourCorrect = this.currentHourTick === expectedHourTick;
    const isMinuteCorrect = this.currentMinuteTick === expectedMinuteTick;

    if (isHourCorrect && isMinuteCorrect) {
      this.handleSuccess();
    } else {
      this.handleIncorrect(isHourCorrect, isMinuteCorrect, expectedHourTick, expectedMinuteTick);
    }
  }

  handleSuccess() {
    this.score += 10;
    this.streak += 1;

    this.scoreValueEl.textContent = this.score;
    this.streakValueEl.textContent = this.streak;

    // Report to YouTube Playables SDK
    if (window.Playables) {
      window.Playables.sendScore(this.score);
    }

    // Audio effects
    window.sounds.playSuccess();
    window.sounds.speakPraise();

    // Confetti particles
    if (window.confetti) {
      window.confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 90);
    }

    // Show celebration modal
    const minStr = this.targetMinute < 10 ? `0${this.targetMinute}` : `${this.targetMinute}`;
    this.modalTimeDisplay.textContent = `${this.targetHour}:${minStr}`;
    this.celebrationModal.classList.add('show');
  }

  handleIncorrect(isHourCorrect, isMinuteCorrect, expectedHour, expectedMinute) {
    this.streak = 0;
    this.streakValueEl.textContent = this.streak;

    window.sounds.playTryAgain();

    // Provide friendly, actionable hints for the child
    if (!isHourCorrect && isMinuteCorrect) {
      const msg = `Almost! Orange minute hand is good. Point the small blue tick to ${expectedHour}!`;
      this.showFeedback(msg, true);
    } else if (isHourCorrect && !isMinuteCorrect) {
      const minStr = this.targetMinute < 10 ? `0${this.targetMinute}` : `${this.targetMinute}`;
      const msg = `Small blue tick is on ${expectedHour} (Great!). Now point the long orange tick to ${expectedMinute} (${minStr} min)!`;
      this.showFeedback(msg, true);
    } else {
      const minStr = this.targetMinute < 10 ? `0${this.targetMinute}` : `${this.targetMinute}`;
      const msg = `Point the small blue tick to ${expectedHour} and long orange tick to ${expectedMinute}!`;
      this.showFeedback(msg, true);
    }
  }

  giveHint() {
    const expectedHour = this.targetHour;
    const expectedMinute = this.targetMinute === 0 ? 12 : Math.round(this.targetMinute / 5);
    const minStr = this.targetMinute < 10 ? `0${this.targetMinute}` : `${this.targetMinute}`;

    const hintMsg = `💡 Hint: Small blue hand goes to ${expectedHour}, long orange hand goes to ${expectedMinute} (${minStr} min).`;
    this.showFeedback(hintMsg, true);
  }

  showFeedback(msg, isHint = false) {
    this.feedbackBox.textContent = msg;
    if (isHint) {
      this.feedbackBox.classList.add('hint');
    } else {
      this.feedbackBox.classList.remove('hint');
    }
  }

  clearFeedback() {
    this.feedbackBox.textContent = '';
    this.feedbackBox.classList.remove('hint');
  }

  closeModal() {
    this.celebrationModal.classList.remove('show');
  }
}

// Start game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new ClockGame();
});
