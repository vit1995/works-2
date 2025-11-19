import "./app.min.js";
document.addEventListener("DOMContentLoaded", function() {
  const navButton = document.querySelector(".nav");
  const pageHeight = document.body.scrollHeight;
  const triggerPoint = pageHeight * 0.5;
  window.addEventListener("scroll", function() {
    const scrollProgress = window.scrollY / triggerPoint;
    if (scrollProgress >= 1) {
      navButton.style.opacity = "1";
      navButton.style.visibility = "visible";
    } else {
      navButton.style.opacity = "0";
      navButton.style.visibility = "hidden";
    }
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const videoContainers = document.querySelectorAll(".video-container");
  videoContainers.forEach((container) => {
    const preview = container.querySelector(".video-preview");
    const video = container.querySelector("video");
    preview.addEventListener("click", function() {
      container.classList.add("playing");
      video.play().catch((e) => {
        console.log("Ошибка воспроизведения:", e);
      });
    });
    video.addEventListener("click", function(e) {
      e.stopPropagation();
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("ended", function() {
      container.classList.remove("playing");
    });
  });
});
