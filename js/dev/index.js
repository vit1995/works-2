import "./app.min.js";
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
