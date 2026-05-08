import "./app.min.js";
import "./gallery.min.js";
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
