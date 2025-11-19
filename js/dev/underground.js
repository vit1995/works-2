import "./app.min.js";
document.addEventListener("DOMContentLoaded", function() {
  const containers = document.querySelectorAll(".sl-container");
  containers.forEach((container) => {
    const dragMe = container.querySelector(".dragme");
    const viewAfter = container.querySelector(".view-after");
    let isDragging = false;
    function setInitialPosition() {
      const containerWidth = container.offsetWidth;
      const initialPosition = containerWidth * 0.5;
      dragMe.style.left = initialPosition + "px";
      viewAfter.style.width = initialPosition + "px";
    }
    function animateTo(position, duration = 300) {
      const startTime = performance.now();
      const startLeft = parseFloat(dragMe.style.left) || 0;
      const startWidth = parseFloat(viewAfter.style.width) || 0;
      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newLeft = startLeft + (position - startLeft) * progress;
        const newWidth = startWidth + (position - startWidth) * progress;
        dragMe.style.left = newLeft + "px";
        viewAfter.style.width = newWidth + "px";
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      requestAnimationFrame(animate);
    }
    function startDrag(e) {
      e.preventDefault();
      isDragging = true;
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stopDrag);
    }
    function drag(e) {
      if (!isDragging) return;
      const containerRect = container.getBoundingClientRect();
      let newLeft = e.clientX - containerRect.left - dragMe.offsetWidth / 2;
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - dragMe.offsetWidth));
      dragMe.style.left = newLeft + "px";
      viewAfter.style.width = newLeft + 5 + "px";
    }
    function stopDrag() {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDrag);
    }
    function handleContainerClick(e) {
      const containerRect = container.getBoundingClientRect();
      const clickPosition = e.clientX - containerRect.left - 15;
      animateTo(clickPosition);
    }
    dragMe.addEventListener("mousedown", startDrag);
    container.addEventListener("click", handleContainerClick);
    dragMe.addEventListener("touchstart", function(e) {
      e.preventDefault();
      isDragging = true;
      document.addEventListener("touchmove", touchDrag);
      document.addEventListener("touchend", stopDrag);
    });
    function touchDrag(e) {
      if (!isDragging) return;
      const containerRect = container.getBoundingClientRect();
      let newLeft = e.touches[0].clientX - containerRect.left - dragMe.offsetWidth / 2;
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - dragMe.offsetWidth));
      dragMe.style.left = newLeft + "px";
      viewAfter.style.width = newLeft + 5 + "px";
    }
    dragMe.addEventListener("dragstart", function(e) {
      e.preventDefault();
    });
    setInitialPosition();
    window.addEventListener("resize", setInitialPosition);
  });
});
