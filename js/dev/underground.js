import { i as isMobile } from "./app.min.js";
class BeforeAfter {
  constructor(props) {
    let defaultConfig = {
      init: true,
      logging: true
    };
    this.config = Object.assign(defaultConfig, props);
    if (this.config.init) {
      const beforeAfterItems = document.querySelectorAll("[data-fls-beforeafter]");
      if (beforeAfterItems.length > 0) {
        this.setLogging(`Проснулся, вижу элементы: ${beforeAfterItems.length}`);
        this.beforeAfterInit(beforeAfterItems);
      } else {
        this.setLogging(`Проснулся, не вижу элементов`);
      }
    }
  }
  beforeAfterInit(beforeAfterItems) {
    beforeAfterItems.forEach((beforeAfter) => {
      if (beforeAfter) {
        this.beforeAfterClasses(beforeAfter);
        this.beforeAfterItemInit(beforeAfter);
      }
    });
  }
  beforeAfterClasses(beforeAfter) {
    beforeAfter.querySelector("[data-fls-beforeafter-arrow]");
    beforeAfter.addEventListener("mouseover", function(e) {
      const targetElement = e.target;
      if (!targetElement.hasAttribute("data-fls-beforeafter-arrow")) {
        if (targetElement.closest("[data-fls-beforeafter-before]")) {
          beforeAfter.classList.remove("-right");
          beforeAfter.classList.add("-left");
        } else {
          beforeAfter.classList.add("-right");
          beforeAfter.classList.remove("-left");
        }
      }
    });
    beforeAfter.addEventListener("mouseleave", function() {
      beforeAfter.classList.remove("-left");
      beforeAfter.classList.remove("-right");
    });
  }
  beforeAfterItemInit(beforeAfter) {
    const beforeAfterArrow = beforeAfter.querySelector("[data-fls-beforeafter-arrow]");
    const afterItem = beforeAfter.querySelector("[data-fls-beforeafter-after]");
    const beforeAfterArrowWidth = parseFloat(window.getComputedStyle(beforeAfterArrow).getPropertyValue("width"));
    let beforeAfterSizes = {};
    let isDragging = false;
    if (beforeAfterArrow) {
      if (isMobile.any()) {
        beforeAfterArrow.addEventListener("touchstart", beforeAfterDrag);
      } else {
        beforeAfterArrow.addEventListener("mousedown", beforeAfterDrag);
      }
    }
    function beforeAfterDrag(e) {
      isDragging = true;
      beforeAfterSizes = {
        width: beforeAfter.offsetWidth,
        left: beforeAfter.getBoundingClientRect().left - scrollX
      };
      if (isMobile.any()) {
        document.addEventListener("touchmove", beforeAfterArrowMove);
        document.addEventListener("touchend", beforeAfterDragEnd);
      } else {
        document.addEventListener("mousemove", beforeAfterArrowMove);
        document.addEventListener("mouseup", beforeAfterDragEnd);
      }
      document.addEventListener("dragstart", function(e2) {
        e2.preventDefault();
      }, { "once": true });
    }
    function beforeAfterArrowMove(e) {
      if (!isDragging) return;
      const posLeft = e.type === "touchmove" ? e.touches[0].clientX - beforeAfterSizes.left : e.clientX - beforeAfterSizes.left;
      if (posLeft <= beforeAfterSizes.width && posLeft > 0) {
        const way = posLeft / beforeAfterSizes.width * 100;
        beforeAfterArrow.style.cssText = `left:calc(${way}% - ${beforeAfterArrowWidth}px)`;
        afterItem.style.cssText = `width: ${100 - way}%`;
      } else if (posLeft >= beforeAfterSizes.width) {
        beforeAfterArrow.style.cssText = `left: calc(100% - ${beforeAfterArrowWidth}px)`;
        afterItem.style.cssText = `width: 0%`;
      } else if (posLeft <= 0) {
        beforeAfterArrow.style.cssText = `left: 0%`;
        afterItem.style.cssText = `width: 100%`;
      }
    }
    function beforeAfterDragEnd(e) {
      isDragging = false;
      if (isMobile.any()) {
        document.removeEventListener("touchmove", beforeAfterArrowMove);
        document.removeEventListener("touchend", beforeAfterDragEnd);
      } else {
        document.removeEventListener("mousemove", beforeAfterArrowMove);
        document.removeEventListener("mouseup", beforeAfterDragEnd);
      }
    }
  }
  // Логинг в консоль
  setLogging(message) {
    if (this.config.logging) ;
  }
}
new BeforeAfter({});
