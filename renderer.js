class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.defaultTime = 25 * 60;
        this.isRunning = false;
        this.isPaused = false;
        this.isMinimized = false;
        this.timer = null;
    this.buttonState = 'play'; // 'play', 'pause'
        this.chimeAudio = new Audio('./sound/chime.mp3');
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateButton();
    }
    
    initializeElements() {
        this.bubble = document.getElementById('pomoBubble');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timeInput = document.getElementById('timeInput');
        this.mainBtn = document.getElementById('mainBtn');
        this.minimizedIcon = document.getElementById('minimizedIcon');
    }
    
    setupEventListeners() {
        // Main control button
        this.mainBtn.addEventListener('click', () => this.handleButtonClick());
        
        // Time input
        this.timeInput.addEventListener('change', () => this.setCustomTime());
        this.timeInput.addEventListener('input', () => this.setCustomTime());
        
        // Prevent accidental double-click selection on time input
        this.timeInput.addEventListener('dblclick', (e) => {
            e.stopPropagation();
        });
        
        // Double click to minimize/expand
        this.bubble.addEventListener('dblclick', (e) => {
            // Prevent minimize if double-clicking on the time input
            if (e.target === this.timeInput) {
                return;
            }
            this.toggleMinimize();
        });
        
        // Click on minimized icon to expand
        this.minimizedIcon.addEventListener('click', () => this.toggleMinimize());
        
        // Prevent dragging on interactive elements
        const interactiveElements = [
            this.mainBtn, this.timeInput, this.minimizedIcon
        ];
        
        interactiveElements.forEach(element => {
            element.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.timeLeft);
    }
    
    updateButton() {
        if (this.buttonState === 'play') {
            this.mainBtn.textContent = '▶';
        } else {
            this.mainBtn.textContent = '⏸';
        }
    }
    
    handleButtonClick() {
        if (this.buttonState === 'play') {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }
    
    setCustomTime() {
        if (!this.isRunning) {
            const minutes = parseInt(this.timeInput.value) || 25;
            const clampedMinutes = Math.max(1, Math.min(120, minutes));
            
            if (clampedMinutes !== minutes) {
                this.timeInput.value = clampedMinutes;
            }
            
            this.timeLeft = clampedMinutes * 60;
            this.defaultTime = this.timeLeft;
            this.updateDisplay();
        }
    }
    
    startTimer() {
        if (this.isPaused) {
            // Resume from pause
            this.isPaused = false;
        } else if (!this.isRunning) {
            // Start fresh timer
            this.isRunning = true;
        }
        
        this.isRunning = true;
        this.buttonState = 'pause';
        this.updateButton();
        this.timeInput.readOnly = true;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }
    
    pauseTimer() {
    this.isRunning = false;
    this.isPaused = true;
    clearInterval(this.timer);
    this.buttonState = 'play';
    this.updateButton();
    }
    
    resetTimer() {
    // Removed: no reset functionality
    }
    
    completeTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        this.timeLeft = 0;
        this.updateDisplay();
        this.buttonState = 'play';
        this.updateButton();
        this.bubble.classList.add('completed');
        this.playChime();
        // Remove completed animation after it finishes
        setTimeout(() => {
            this.bubble.classList.remove('completed');
            // Optionally, reset timer to default time and make input editable again
            this.timeLeft = this.defaultTime;
            this.updateDisplay();
            this.timeInput.readOnly = false;
        }, 3000);
    }
    
    playChime() {
        try {
            this.chimeAudio.currentTime = 0;
            this.chimeAudio.play().catch(error => {
                console.log('Could not play chime sound:', error);
                // Fallback: create a simple beep using Web Audio API
                this.createBeep();
            });
        } catch (error) {
            console.log('Audio not available:', error);
            this.createBeep();
        }
    }
    
    createBeep() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Web Audio API not available:', error);
        }
    }
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            this.bubble.classList.add('minimized');
            this.minimizedIcon.style.display = 'block';
        } else {
            this.bubble.classList.remove('minimized');
            this.minimizedIcon.style.display = 'none';
        }
    }
}

// Initialize the timer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Handle app closing
window.addEventListener('beforeunload', () => {
    // Clean up any running timers
    clearInterval(timer);
});