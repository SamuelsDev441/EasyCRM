const parallaxEls = document.querySelectorAll(".parallax");

function onScroll() {
  const scrolled = window.scrollY;
  parallaxEls.forEach((el) => {
    const speed = Number(el.dataset.speed || 0.2);
    el.style.transform = `translateY(${scrolled * speed * 0.15}px)`;
  });
}

window.addEventListener("scroll", onScroll);
onScroll();
