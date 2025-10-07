const durationInSeconds = 10;

const div = document.getElementById('expandingDiv');


const totalHeight = window.innerHeight;

function startAnimation() {

  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / (durationInSeconds * 1000), 1); // 0 → 1
    const currentHeight = Math.floor(totalHeight * progress);

    div.style.height = `${currentHeight}px`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

startAnimation();

