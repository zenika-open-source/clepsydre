// fetch params in url for quick settings

const params = new URLSearchParams(globalThis.location.search);
const div = document.getElementById('expandingDiv');
const timer = document.getElementById('timer');
const startMessage = document.getElementById('startMessage');
const settingsModal = document.getElementById("settingsModal");
const settingsForm = document.getElementById("settingsForm");
const totalHeight = window.innerHeight;
// 🔹 Declare global variables at the top
let animationFrameId = null;
 

const defaultSettings = {
  "durationInSeconds" : 600,
  "showTimer": true,
  "colorScheme": "zenika-colors",
  "firstThreshold": 0.8,
  "secondThreshold": 0.9,
  "thirdThreshold": 0.95,
  "soundEnabled": false,
  "orientation": "upward"
}

let settings = {
  "durationInSeconds" : parseDuration(params.get("duration")),
  "showTimer": true,
  "colorScheme": "zenika-colors",
  "firstThreshold": 0.8,
  "secondThreshold": 0.9,
  "thirdThreshold": 0.95,
  "soundEnabled": params.get("sound") === "true",
  "orientation": "upward"
}

let wakeLock = null;


// ------------- Settings ----------------

function parseDuration(durationStr) {
  const DEFAULT = 600; // 10 minutes by default
  if (!durationStr) return DEFAULT;

  durationStr = durationStr.toLowerCase().trim();
  let totalSeconds = 0;
  const regex = /(\d+)([ms:]?)/g;
  let match;
  let found = false;

  while ((match = regex.exec(durationStr)) !== null) {
    found = true;
    const value = Number.parseInt(match[1], 10);
    const unit = match[2] || "s";
    if (unit === "m" || unit === ":") {
      totalSeconds += value * 60;
    } else {
      totalSeconds += value;
    }
  }

  if (!found || totalSeconds <= 0) {
    console.warn(`Durée invalide ("${durationStr}"), utilisation de la valeur par défaut: ${DEFAULT}s`);
    return DEFAULT;
  }
  return totalSeconds;
}


function showSettings() {
  settingsModal.showModal();
}

function hideSettings() {
  settingsModal.close();
}

function submitSettings() {
  settings.durationInSeconds = Number(settingsForm["durationMinutes"].value * 60) + Number(settingsForm["durationSeconds"].value)
  settings.colorScheme = settingsForm["color-scheme"].value;
  settings.showTimer = settingsForm["show-timer"].checked;
  settings.firstThreshold = settingsForm["threshold1"].value / 100;
  settings.secondThreshold = settingsForm["threshold2"].value / 100;
  settings.thirdThreshold = settingsForm["threshold3"].value / 100;
  settings.soundEnabled = settingsForm["play-sound"].checked;
  settings.orientation = settingsForm["orientation"].value;

  applySettings();
  hideSettings();
}

function applySettings() {
  updateTimer(settings.durationInSeconds);
  document.documentElement.className = settings.colorScheme;

  if (settings.showTimer === false) {
    // maybe only hide the timer once it's started, but keep it visible until start to show the duration?
    timer.style.display = "none";
  } else {
    timer.style.display = "block";
  }

  updateSettingsForm();

  // Currently : apply changes to running timer. Maybe start the timer over?
}

function updateSettingsForm() {
  // Apply the settings to the form so it reflects current settings
  settingsForm["durationMinutes"].value = Math.floor(settings.durationInSeconds / 60);
  settingsForm["durationSeconds"].value = settings.durationInSeconds % 60;
  settingsForm["show-timer"].checked = settings.showTimer;
  settingsForm["color-scheme"].value = settings.colorScheme;
  settingsForm["threshold1"].value = settings.firstThreshold * 100;
  settingsForm["threshold2"].value = settings.secondThreshold * 100;
  settingsForm["threshold3"].value = settings.thirdThreshold * 100;
  settingsForm["play-sound"].checked = settings.soundEnabled;
  settingsForm["orientation"].value = settings.orientation;
}

function resetDefaultSettings() {
  settings = defaultSettings;
  updateSettingsForm();
}

// ------------- Animation ----------------

function updateTimer(secRemaining) {
  const sec = Math.max(0, Math.ceil(secRemaining));
  const minutes = Math.floor(sec / 60);
  const remainingSeconds = sec % 60;

  // format into "mm:ss" padded with 0 if needed
  timer.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getClassByProgress(p) {
  // p = percentage between 0 and 1
  if (p < settings.firstThreshold) return 'start';
  if (p < settings.secondThreshold) return 'critical';
  if (p < settings.thirdThreshold) return 'very-critical';
  return 'ending';
}

function startAnimation() {
  requestWakeLock();

  // Hide Start button
  startMessage.style.opacity = 0;
  setTimeout(() => startMessage.style.display = 'none', 600);

  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / (settings.durationInSeconds * 1000), 1);
    const currentHeight = Math.floor(totalHeight * progress);
    const remaining = settings.durationInSeconds - (elapsed / 1000);

    updateTimer(remaining);
    div.style.height = `${currentHeight}px`;
    div.classList = getClassByProgress(progress);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Timer finished
      timer.textContent = "00:00";
      playBeep();
      timer.classList.add("blinking");

      // After 5 seconds of blinking, stop blinking & show Reset button
      setTimeout(() => {
        timer.classList.remove("blinking");
        timer.style.opacity = "1";
        showResetButton();  // <--- call function here
      }, 5000);
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

// Show Reset button after blinking finishes
// Show the Reset button and keep it visible always
const resetButton = document.getElementById("resetButton");
resetButton.style.display = "inline-block";
setTimeout(() => {
  resetButton.style.opacity = 1;
}, 100); // fade-in animation



//   Function to reset the timer/animation
function resetTimer() {
  console.log("Reset clicked");

  // Stop animation if running
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Reset visuals
  div.style.height = "0px"; // animation bar back to zero

  // Reset timer text to full duration in mm:ss
  const totalSeconds = settings.durationInSeconds;
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  timer.textContent = `${minutes}:${seconds}`;

  // Hide Reset button
  const resetButton = document.getElementById("resetButton");
  resetButton.style.opacity = 0;
  setTimeout(() => (resetButton.style.display = "none"), 300);

  // Show Start button again
  startMessage.style.display = "block";
  setTimeout(() => (startMessage.style.opacity = 1), 100);

  // Release Wake Lock if active
  if (wakeLock) {
    wakeLock.release().then(() => {
      wakeLock = null;
      console.log("Wake Lock relâché");
    });
  }
}



async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock activé');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock relâché');
      });
    }
  } catch (err) {
    console.warn(`Impossible d'activer Wake Lock : ${err}`);
  }
}

function playBeep() {
  if (!settings.soundEnabled) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine"; // tone type: sine | square | triangle | sawtooth
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // frequency in Hz
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // volume

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3); // play for 0.3s
}

// Wakelock: réactiver si la page revient au premier plan
document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

applySettings();
