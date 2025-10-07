const durationInSeconds = 10;

const div = document.getElementById('expandingDiv');
const timer = document.getElementById('timer');
const startMessage = document.getElementById('startMessage');

const totalHeight = window.innerHeight;

function updateTimer(secRemaining) {
  const sec = Math.max(0, Math.ceil(secRemaining));
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Affiche la durée totale avant démarrage
updateTimer(durationInSeconds);


function startAnimation() {

  startMessage.style.opacity = 0;
  setTimeout(() => startMessage.style.display = 'none', 600);

  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / (durationInSeconds * 1000), 1); // 0 → 1
    const currentHeight = Math.floor(totalHeight * progress);
    const remaining = durationInSeconds - (elapsed / 1000);
    updateTimer(remaining);

    div.style.height = `${currentHeight}px`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      timer.textContent = "00:00";
      timer.classList.add("blinking"); // démarre le clignotement

      // Arrête le clignotement après 5 secondes
      setTimeout(() => {
        timer.classList.remove("blinking");
        timer.style.opacity = "1";
      }, 5000);
    }
  }
  requestAnimationFrame(animate);
}

// --- Démarrage au clic ---
function onFirstClick() {
  startAnimation();
  document.removeEventListener('click', onFirstClick);
}
document.addEventListener('click', onFirstClick);

