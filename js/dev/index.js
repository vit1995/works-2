(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
function setHash(hash) {
  hash = hash ? `#${hash}` : window.location.href.split("#")[0];
  history.pushState("", "", hash);
}
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function tabs() {
  const tabs2 = document.querySelectorAll("[data-fls-tabs]");
  let tabsActiveHash = [];
  if (tabs2.length > 0) {
    const hash = getHash();
    if (hash && hash.startsWith("tab-")) {
      tabsActiveHash = hash.replace("tab-", "").split("-");
    }
    tabs2.forEach((tabsBlock, index) => {
      tabsBlock.classList.add("--tab-init");
      tabsBlock.setAttribute("data-fls-tabs-index", index);
      tabsBlock.addEventListener("click", setTabsAction);
      initTabs(tabsBlock);
    });
    let mdQueriesArray = dataMediaQueries(tabs2, "flsTabs");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
  function setTitlePosition(tabsMediaArray, matchMedia) {
    tabsMediaArray.forEach((tabsMediaItem) => {
      tabsMediaItem = tabsMediaItem.item;
      let tabsTitles = tabsMediaItem.querySelector("[data-fls-tabs-titles]");
      let tabsTitleItems = tabsMediaItem.querySelectorAll("[data-fls-tabs-title]");
      let tabsContent = tabsMediaItem.querySelector("[data-fls-tabs-body]");
      let tabsContentItems = tabsMediaItem.querySelectorAll("[data-fls-tabs-item]");
      tabsTitleItems = Array.from(tabsTitleItems).filter((item) => item.closest("[data-fls-tabs]") === tabsMediaItem);
      tabsContentItems = Array.from(tabsContentItems).filter((item) => item.closest("[data-fls-tabs]") === tabsMediaItem);
      tabsContentItems.forEach((tabsContentItem, index) => {
        if (matchMedia.matches) {
          tabsContent.append(tabsTitleItems[index]);
          tabsContent.append(tabsContentItem);
          tabsMediaItem.classList.add("--tab-spoller");
        } else {
          tabsTitles.append(tabsTitleItems[index]);
          tabsMediaItem.classList.remove("--tab-spoller");
        }
      });
    });
  }
  function initTabs(tabsBlock) {
    let tabsTitles = tabsBlock.querySelectorAll("[data-fls-tabs-titles]>*");
    let tabsContent = tabsBlock.querySelectorAll("[data-fls-tabs-body]>*");
    const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
    const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;
    if (tabsActiveHashBlock) {
      const tabsActiveTitle = tabsBlock.querySelector("[data-fls-tabs-titles]>.--tab-active");
      tabsActiveTitle ? tabsActiveTitle.classList.remove("--tab-active") : null;
    }
    if (tabsContent.length) {
      tabsContent.forEach((tabsContentItem, index) => {
        tabsTitles[index].setAttribute("data-fls-tabs-title", "");
        tabsContentItem.setAttribute("data-fls-tabs-item", "");
        if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
          tabsTitles[index].classList.add("--tab-active");
        }
        tabsContentItem.hidden = !tabsTitles[index].classList.contains("--tab-active");
      });
    }
  }
  function setTabsStatus(tabsBlock) {
    let tabsTitles = tabsBlock.querySelectorAll("[data-fls-tabs-title]");
    let tabsContent = tabsBlock.querySelectorAll("[data-fls-tabs-item]");
    const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
    function isTabsAnamate(tabsBlock2) {
      if (tabsBlock2.hasAttribute("data-fls-tabs-animate")) {
        return tabsBlock2.dataset.flsTabsAnimate > 0 ? Number(tabsBlock2.dataset.flsTabsAnimate) : 500;
      }
    }
    const tabsBlockAnimate = isTabsAnamate(tabsBlock);
    if (tabsContent.length > 0) {
      const isHash = tabsBlock.hasAttribute("data-fls-tabs-hash");
      tabsContent = Array.from(tabsContent).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock);
      tabsTitles = Array.from(tabsTitles).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock);
      tabsContent.forEach((tabsContentItem, index) => {
        if (tabsTitles[index].classList.contains("--tab-active")) {
          if (tabsBlockAnimate) {
            slideDown(tabsContentItem, tabsBlockAnimate);
          } else {
            tabsContentItem.hidden = false;
          }
          if (isHash && !tabsContentItem.closest(".popup")) {
            setHash(`tab-${tabsBlockIndex}-${index}`);
          }
        } else {
          if (tabsBlockAnimate) {
            slideUp(tabsContentItem, tabsBlockAnimate);
          } else {
            tabsContentItem.hidden = true;
          }
        }
      });
    }
  }
  function setTabsAction(e) {
    const el = e.target;
    if (el.closest("[data-fls-tabs-title]")) {
      const tabTitle = el.closest("[data-fls-tabs-title]");
      const tabsBlock = tabTitle.closest("[data-fls-tabs]");
      if (!tabTitle.classList.contains("--tab-active") && !tabsBlock.querySelector(".--slide")) {
        let tabActiveTitle = tabsBlock.querySelectorAll("[data-fls-tabs-title].--tab-active");
        tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock) : null;
        tabActiveTitle.length ? tabActiveTitle[0].classList.remove("--tab-active") : null;
        tabTitle.classList.add("--tab-active");
        setTabsStatus(tabsBlock);
      }
      e.preventDefault();
    }
  }
}
window.addEventListener("load", tabs);
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll("[required]");
    if (formRequiredItems.length) {
      formRequiredItems.forEach((formRequiredItem) => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;
    if (formRequiredItem.type === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }
    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add("--form-error");
    formRequiredItem.parentElement.classList.add("--form-error");
    let inputError = formRequiredItem.parentElement.querySelector("[data-fls-form-error]");
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.flsFormErrtext) {
      formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-fls-form-error>${formRequiredItem.dataset.flsFormErrtext}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove("--form-error");
    formRequiredItem.parentElement.classList.remove("--form-error");
    if (formRequiredItem.parentElement.querySelector("[data-fls-form-error]")) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-fls-form-error]"));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add("--form-success");
    formRequiredItem.parentElement.classList.add("--form-success");
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove("--form-success");
    formRequiredItem.parentElement.classList.remove("--form-success");
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll("input,textarea");
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        el.parentElement.classList.remove("--form-focus");
        el.classList.remove("--form-focus");
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["flsSelect"]) {
        let selects = form.querySelectorAll("select[data-fls-select]");
        if (selects.length) {
          selects.forEach((select) => {
            window["flsSelect"].selectBuild(select);
          });
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
class SelectConstructor {
  constructor(props, data = null) {
    let defaultConfig = {
      init: true,
      speed: 150
    };
    this.config = Object.assign(defaultConfig, props);
    this.selectClasses = {
      classSelect: "select",
      // Основной блок
      classSelectBody: "select__body",
      // Тело селекта
      classSelectTitle: "select__title",
      // Заголовок
      classSelectValue: "select__value",
      // Значения у заголовка
      classSelectLabel: "select__label",
      // Лабел
      classSelectInput: "select__input",
      // Поле ввода
      classSelectText: "select__text",
      // Оболочка текстовых данных
      classSelectLink: "select__link",
      // Ссылка в элементе
      classSelectOptions: "select__options",
      // Выпадающий список
      classSelectOptionsScroll: "select__scroll",
      // Оболочка при скролле
      classSelectOption: "select__option",
      // Пункт
      classSelectContent: "select__content",
      // Оболочка контента в заголовке
      classSelectRow: "select__row",
      // Ряд
      classSelectData: "select__asset",
      // Дополнительные данные
      classSelectDisabled: "--select-disabled",
      // Запрещено
      classSelectTag: "--select-tag",
      // Класс тега
      classSelectOpen: "--select-open",
      // Список открыт
      classSelectActive: "--select-active",
      // Список выбран
      classSelectFocus: "--select-focus",
      // Список в фокусе
      classSelectMultiple: "--select-multiple",
      // Мультивыбор
      classSelectCheckBox: "--select-checkbox",
      // Стиль чекбокса
      classSelectOptionSelected: "--select-selected",
      // Вибраный пункт
      classSelectPseudoLabel: "--select-pseudo-label"
      // Псевдолейбл
    };
    this._this = this;
    if (this.config.init) {
      const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll("select[data-fls-select]");
      if (selectItems.length) {
        this.selectsInit(selectItems);
      }
    }
  }
  // Конструктор CSS класcа
  getSelectClass(className) {
    return `.${className}`;
  }
  // Геттер элементов псевдоселекта
  getSelectElement(selectItem, className) {
    return {
      originalSelect: selectItem.querySelector("select"),
      selectElement: selectItem.querySelector(this.getSelectClass(className))
    };
  }
  // Функция инициализации всех селектов
  selectsInit(selectItems) {
    selectItems.forEach((originalSelect, index) => {
      this.selectInit(originalSelect, index + 1);
    });
    document.addEventListener("click", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("focusin", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("focusout", (function(e) {
      this.selectsActions(e);
    }).bind(this));
  }
  // Функция инициализации конкретного селекта
  selectInit(originalSelect, index) {
    index ? originalSelect.dataset.flsSelectId = index : null;
    if (originalSelect.options.length) {
      const _this = this;
      let selectItem = document.createElement("div");
      selectItem.classList.add(this.selectClasses.classSelect);
      originalSelect.parentNode.insertBefore(selectItem, originalSelect);
      selectItem.appendChild(originalSelect);
      originalSelect.hidden = true;
      if (this.getSelectPlaceholder(originalSelect)) {
        originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
        if (this.getSelectPlaceholder(originalSelect).label.show) {
          const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
          selectItemTitle.insertAdjacentHTML("afterbegin", `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
        }
      }
      selectItem.insertAdjacentHTML("beforeend", `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
      this.selectBuild(originalSelect);
      originalSelect.dataset.flsSelectSpeed = originalSelect.dataset.flsSelectSpeed ? originalSelect.dataset.flsSelectSpeed : this.config.speed;
      this.config.speed = +originalSelect.dataset.flsSelectSpeed;
      originalSelect.addEventListener("change", function(e) {
        _this.selectChange(e);
      });
    }
  }
  // Конструктор псевдоселекта
  selectBuild(originalSelect) {
    const selectItem = originalSelect.parentElement;
    if (originalSelect.id) {
      selectItem.id = originalSelect.id;
      originalSelect.removeAttribute("id");
    }
    selectItem.dataset.flsSelectId = originalSelect.dataset.flsSelectId;
    originalSelect.dataset.flsSelectModif ? selectItem.classList.add(`select--${originalSelect.dataset.flsSelectModif}`) : null;
    originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
    originalSelect.hasAttribute("data-fls-select-checkbox") && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
    this.setSelectTitleValue(selectItem, originalSelect);
    this.setOptions(selectItem, originalSelect);
    originalSelect.hasAttribute("data-fls-select-search") ? this.searchActions(selectItem) : null;
    originalSelect.hasAttribute("data-fls-select-open") ? this.selectAction(selectItem) : null;
    this.selectDisabled(selectItem, originalSelect);
  }
  // Функция реакций на события
  selectsActions(e) {
    const t = e.target, type = e.type;
    const isSelect = t.closest(this.getSelectClass(this.selectClasses.classSelect));
    const isTag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
    if (!isSelect && !isTag) return this.selectsСlose();
    const selectItem = isSelect || document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${isTag.dataset.flsSelectId}"]`);
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    if (originalSelect.disabled) return;
    if (type === "click") {
      const tag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
      const title = t.closest(this.getSelectClass(this.selectClasses.classSelectTitle));
      const option = t.closest(this.getSelectClass(this.selectClasses.classSelectOption));
      if (tag) {
        const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${tag.dataset.flsSelectId}"] .select__option[data-fls-select-value="${tag.dataset.flsSelectValue}"]`);
        this.optionAction(selectItem, originalSelect, optionItem);
      } else if (title) {
        this.selectAction(selectItem);
      } else if (option) {
        this.optionAction(selectItem, originalSelect, option);
      }
    } else if (type === "focusin" || type === "focusout") {
      if (isSelect) selectItem.classList.toggle(this.selectClasses.classSelectFocus, type === "focusin");
    } else if (type === "keydown" && e.code === "Escape") {
      this.selectsСlose();
    }
  }
  // Функция закрытия всех селектов
  selectsСlose(selectOneGroup) {
    const selectsGroup = selectOneGroup ? selectOneGroup : document;
    const selectActiveItems = selectsGroup.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
    if (selectActiveItems.length) {
      selectActiveItems.forEach((selectActiveItem) => {
        this.selectСlose(selectActiveItem);
      });
    }
  }
  // Функция закрытия конкретного селекта
  selectСlose(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    if (!selectOptions.classList.contains("_slide")) {
      selectItem.classList.remove(this.selectClasses.classSelectOpen);
      slideUp(selectOptions, originalSelect.dataset.flsSelectSpeed);
      setTimeout(() => {
        selectItem.style.zIndex = "";
      }, originalSelect.dataset.flsSelectSpeed);
    }
  }
  // Функция открытия / закрытия конкретного селекта
  selectAction(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
    const selectOpenzIndex = originalSelect.dataset.flsSelectZIndex ? originalSelect.dataset.flsSelectZIndex : 3;
    this.setOptionsPosition(selectItem);
    if (originalSelect.closest("[data-fls-select-one]")) {
      const selectOneGroup = originalSelect.closest("[data-fls-select-one]");
      this.selectsСlose(selectOneGroup);
    }
    setTimeout(() => {
      if (!selectOptions.classList.contains("--slide")) {
        selectItem.classList.toggle(this.selectClasses.classSelectOpen);
        slideToggle(selectOptions, originalSelect.dataset.flsSelectSpeed);
        if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
          selectItem.style.zIndex = selectOpenzIndex;
        } else {
          setTimeout(() => {
            selectItem.style.zIndex = "";
          }, originalSelect.dataset.flsSelectSpeed);
        }
      }
    }, 0);
  }
  // Сеттер значение заголовка селекта
  setSelectTitleValue(selectItem, originalSelect) {
    const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
    const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
    if (selectItemTitle) selectItemTitle.remove();
    selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
    originalSelect.hasAttribute("data-fls-select-search") ? this.searchActions(selectItem) : null;
  }
  // Конструктор значения заголовка
  // getSelectTitleValue(selectItem, originalSelect) {
  // 	// Получаем выбранные текстовые значения
  // 	let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
  // 	// Обработка значений мультивыбора
  // 	// Если включен режим тегов (указаны настройки data-fls-select-tags)
  // 	if (originalSelect.multiple && originalSelect.hasAttribute('data-fls-select-tags')) {
  // 		selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map(option => `<span role="button" data-fls-select-id="${selectItem.dataset.flsSelectId}" data-fls-select-value="${option.value}" class="--select-tag">${this.getSelectElementContent(option)}</span>`).join('');
  // 		// Если вывод тегов во внешний блок
  // 		if (originalSelect.dataset.flsSelectTags && document.querySelector(originalSelect.dataset.flsSelectTags)) {
  // 			document.querySelector(originalSelect.dataset.flsSelectTags).innerHTML = selectTitleValue;
  // 			if (originalSelect.hasAttribute('data-fls-select-search')) selectTitleValue = false;
  // 		}
  // 	}
  // 	// Значение или плейсхолдер
  // 	selectTitleValue = selectTitleValue.length ? selectTitleValue : (originalSelect.dataset.flsSelectPlaceholder || '')
  // 	if (!originalSelect.hasAttribute('data-fls-select-tags')) {
  // 		selectTitleValue = selectTitleValue ? selectTitleValue.map(item => item.replace(/"/g, '&quot;')) : ''
  // 	}
  // 	// Если включен режим pseudo
  // 	let pseudoAttribute = '';
  // 	let pseudoAttributeClass = '';
  // 	if (originalSelect.hasAttribute('data-fls-select-pseudo-label')) {
  // 		pseudoAttribute = originalSelect.dataset.flsSelectPseudoLabel ? ` data-fls-select-pseudo-label="${originalSelect.dataset.flsSelectPseudoLabel}"` : ` data-fls-select-pseudo-label="Заповніть атрибут"`;
  // 		pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
  // 	}
  // 	// Если есть значение, добавляем класс
  // 	this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
  // 	// Возвращаем поле ввода для поиска или текст
  // 	if (originalSelect.hasAttribute('data-fls-select-search')) {
  // 		// Выводим поле ввода для поиска
  // 		return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-fls-select-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
  // 	} else {
  // 		// Если выбран элемент со своим классом
  // 		const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass}` : '';
  // 		// Выводим текстовое значение
  // 		return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
  // 	}
  // }
  // Конструктор значения заголовка
  // Конструктор значения заголовка
  getSelectTitleValue(selectItem, originalSelect) {
    const selectedOption = originalSelect.options[originalSelect.selectedIndex];
    const selectedAsset = selectedOption.getAttribute("data-fls-select-asset");
    let assetHTML = "";
    if (selectedAsset) {
      assetHTML = `<span class="${this.selectClasses.classSelectData}">${selectedAsset.indexOf("img") >= 0 ? `<img src="${selectedAsset}" alt="">` : selectedAsset}</span>`;
    }
    const selectedText = selectedOption.textContent;
    let pseudoAttribute = "";
    let pseudoAttributeClass = "";
    if (originalSelect.hasAttribute("data-fls-select-pseudo-label")) {
      pseudoAttribute = originalSelect.dataset.flsSelectPseudoLabel ? ` data-fls-select-pseudo-label="${originalSelect.dataset.flsSelectPseudoLabel}"` : ` data-fls-select-pseudo-label="Заповніть атрибут"`;
      pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
    }
    this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
    if (originalSelect.hasAttribute("data-fls-select-search")) {
      return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectedText}" data-fls-select-placeholder="${selectedText}" class="${this.selectClasses.classSelectInput}"></span></div>`;
    } else {
      const customClass = selectedOption.dataset.flsSelectClass ? ` ${selectedOption.dataset.flsSelectClass}` : "";
      return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${assetHTML}<span class="${this.selectClasses.classSelectText}">${selectedText}</span></span></span></button>`;
    }
  }
  // Конструктор данных для значения заголовка
  getSelectElementContent(selectOption) {
    const selectOptionData = selectOption.dataset.flsSelectAsset ? `${selectOption.dataset.flsSelectAsset}` : "";
    const selectOptionDataHTML = selectOptionData.indexOf("img") >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
    let selectOptionContentHTML = ``;
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : "";
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : "";
    selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : "";
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : "";
    selectOptionContentHTML += selectOption.textContent;
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    return selectOptionContentHTML;
  }
  // Получение данных плейсхолдера
  getSelectPlaceholder(originalSelect) {
    const selectPlaceholder = Array.from(originalSelect.options).find((option) => !option.value);
    if (selectPlaceholder) {
      return {
        value: selectPlaceholder.textContent,
        show: selectPlaceholder.hasAttribute("data-fls-select-show"),
        label: {
          show: selectPlaceholder.hasAttribute("data-fls-select-label"),
          text: selectPlaceholder.dataset.flsSelectLabel
        }
      };
    }
  }
  // Получение данных из выбранных элементов
  getSelectedOptionsData(originalSelect, type) {
    let selectedOptions = [];
    if (originalSelect.multiple) {
      selectedOptions = Array.from(originalSelect.options).filter((option) => option.value).filter((option) => option.selected);
    } else {
      selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
    }
    return {
      elements: selectedOptions.map((option) => option),
      values: selectedOptions.filter((option) => option.value).map((option) => option.value),
      html: selectedOptions.map((option) => this.getSelectElementContent(option))
    };
  }
  // Конструктор элементов списка
  getOptions(originalSelect) {
    const selectOptionsScroll = originalSelect.hasAttribute("data-fls-select-scroll") ? `` : "";
    +originalSelect.dataset.flsSelectScroll ? +originalSelect.dataset.flsSelectScroll : null;
    let selectOptions = Array.from(originalSelect.options);
    if (selectOptions.length > 0) {
      let selectOptionsHTML = ``;
      if (this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show || originalSelect.multiple) {
        selectOptions = selectOptions.filter((option) => option.value);
      }
      selectOptionsHTML += `<div ${selectOptionsScroll} ${""} class="${this.selectClasses.classSelectOptionsScroll}">`;
      selectOptions.forEach((selectOption) => {
        selectOptionsHTML += this.getOption(selectOption, originalSelect);
      });
      selectOptionsHTML += `</div>`;
      return selectOptionsHTML;
    }
  }
  // Конструктор конкретного элемента списка
  getOption(selectOption, originalSelect) {
    const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : "";
    const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute("data-fls-select-show-selected") && !originalSelect.multiple ? `hidden` : ``;
    const selectOptionClass = selectOption.dataset.flsSelectClass ? ` ${selectOption.dataset.flsSelectClass}` : "";
    const selectOptionLink = selectOption.dataset.flsSelectHref ? selectOption.dataset.flsSelectHref : false;
    const selectOptionLinkTarget = selectOption.hasAttribute("data-fls-select-href-blank") ? `target="_blank"` : "";
    let selectOptionHTML = ``;
    selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-fls-select-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-fls-select-value="${selectOption.value}" type="button">`;
    selectOptionHTML += this.getSelectElementContent(selectOption);
    selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
    return selectOptionHTML;
  }
  // Сеттер элементов списка (options)
  setOptions(selectItem, originalSelect) {
    const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectItemOptions.innerHTML = this.getOptions(originalSelect);
  }
  // Определяем, где отобразить выпадающий список
  setOptionsPosition(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    const selectItemScroll = this.getSelectElement(selectItem, this.selectClasses.classSelectOptionsScroll).selectElement;
    const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? `${+originalSelect.dataset.flsSelectScroll}px` : ``;
    const selectOptionsPosMargin = +originalSelect.dataset.flsSelectOptionsMargin ? +originalSelect.dataset.flsSelectOptionsMargin : 10;
    if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
      selectOptions.hidden = false;
      const selectItemScrollHeight = selectItemScroll.offsetHeight ? selectItemScroll.offsetHeight : parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue("max-height"));
      const selectOptionsHeight = selectOptions.offsetHeight > selectItemScrollHeight ? selectOptions.offsetHeight : selectItemScrollHeight + selectOptions.offsetHeight;
      const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
      selectOptions.hidden = true;
      const selectItemHeight = selectItem.offsetHeight;
      const selectItemPos = selectItem.getBoundingClientRect().top;
      const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
      const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);
      if (selectItemResult < 0) {
        const newMaxHeightValue = selectOptionsHeight + selectItemResult;
        if (newMaxHeightValue < 100) {
          selectItem.classList.add("select--show-top");
          selectItemScroll.style.maxHeight = selectItemPos < selectOptionsHeight ? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px` : customMaxHeightValue;
        } else {
          selectItem.classList.remove("select--show-top");
          selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
        }
      }
    } else {
      setTimeout(() => {
        selectItem.classList.remove("select--show-top");
        selectItemScroll.style.maxHeight = customMaxHeightValue;
      }, +originalSelect.dataset.flsSelectSpeed);
    }
  }
  // Обработчик клика на пункт списка
  optionAction(selectItem, originalSelect, optionItem) {
    const optionsBox = selectItem.querySelector(this.getSelectClass(this.selectClasses.classSelectOptions));
    if (optionsBox.classList.contains("--slide")) return;
    if (originalSelect.multiple) {
      optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
      const selectedEls = this.getSelectedOptionsData(originalSelect).elements;
      for (const el of selectedEls) {
        el.removeAttribute("selected");
      }
      const selectedUI = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
      for (const el of selectedUI) {
        const val = el.dataset.flsSelectValue;
        const opt = originalSelect.querySelector(`option[value="${val}"]`);
        if (opt) opt.setAttribute("selected", "selected");
      }
    } else {
      if (!originalSelect.hasAttribute("data-fls-select-show-selected")) {
        setTimeout(() => {
          const hiddenOpt = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`);
          if (hiddenOpt) hiddenOpt.hidden = false;
          optionItem.hidden = true;
        }, this.config.speed);
      }
      originalSelect.value = optionItem.dataset.flsSelectValue || optionItem.textContent;
      this.selectAction(selectItem);
    }
    this.setSelectTitleValue(selectItem, originalSelect);
    this.setSelectChange(originalSelect);
  }
  // Реакция на изменение исходного select
  selectChange(e) {
    const originalSelect = e.target;
    this.selectBuild(originalSelect);
    this.setSelectChange(originalSelect);
  }
  // Обработчик изменения в селекте
  setSelectChange(originalSelect) {
    if (originalSelect.hasAttribute("data-fls-select-validate")) {
      formValidate.validateInput(originalSelect);
    }
    if (originalSelect.hasAttribute("data-fls-select-submit") && originalSelect.value) {
      let tempButton = document.createElement("button");
      tempButton.type = "submit";
      originalSelect.closest("form").append(tempButton);
      tempButton.click();
      tempButton.remove();
    }
    const selectItem = originalSelect.parentElement;
    this.selectCallback(selectItem, originalSelect);
  }
  // Обработчик disabled
  selectDisabled(selectItem, originalSelect) {
    if (originalSelect.disabled) {
      selectItem.classList.add(this.selectClasses.classSelectDisabled);
      this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
    } else {
      selectItem.classList.remove(this.selectClasses.classSelectDisabled);
      this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
    }
  }
  // Обработчик поиска по элементам списка
  searchActions(selectItem) {
    const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectInput.addEventListener("input", () => {
      const inputValue = selectInput.value.toLowerCase();
      const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
      selectOptionsItems.forEach((item) => {
        const itemText = item.textContent.toLowerCase();
        item.hidden = !itemText.includes(inputValue);
      });
      if (selectOptions.hidden) {
        this.selectAction(selectItem);
      }
    });
  }
  // Колбек функция
  selectCallback(selectItem, originalSelect) {
    document.dispatchEvent(new CustomEvent("selectCallback", {
      detail: {
        select: originalSelect
      }
    }));
  }
}
document.querySelector("select[data-fls-select]") ? window.addEventListener("load", () => window.flsSelect = new SelectConstructor({})) : null;
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers2 = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody2(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody2(spollersBlock, false);
        }
      });
    }, initSpollerBody2 = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (!spollerItem.hasAttribute("data-fls-spollers-open")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction2 = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spollers-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody2(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody2 = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    var initSpollers = initSpollers2, initSpollerBody = initSpollerBody2, setSpollerAction = setSpollerAction2, hideSpollersBody = hideSpollersBody2;
    document.addEventListener("click", setSpollerAction2);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self2) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers2(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
function isObject$1(obj) {
  return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend$1(target, src) {
  if (target === void 0) {
    target = {};
  }
  if (src === void 0) {
    src = {};
  }
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined") target[key] = src[key];
    else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
      extend$1(target[key], src[key]);
    }
  });
}
const ssrDocument = {
  body: {},
  addEventListener() {
  },
  removeEventListener() {
  },
  activeElement: {
    blur() {
    },
    nodeName: ""
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {
      }
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {
      },
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  }
};
function getDocument() {
  const doc = typeof document !== "undefined" ? document : {};
  extend$1(doc, ssrDocument);
  return doc;
}
const ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ""
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  },
  history: {
    replaceState() {
    },
    pushState() {
    },
    go() {
    },
    back() {
    }
  },
  CustomEvent: function CustomEvent2() {
    return this;
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      }
    };
  },
  Image() {
  },
  Date() {
  },
  screen: {},
  setTimeout() {
  },
  clearTimeout() {
  },
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === "undefined") {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id) {
    if (typeof setTimeout === "undefined") {
      return;
    }
    clearTimeout(id);
  }
};
function getWindow() {
  const win = typeof window !== "undefined" ? window : {};
  extend$1(win, ssrWindow);
  return win;
}
function classesToTokens(classes2) {
  if (classes2 === void 0) {
    classes2 = "";
  }
  return classes2.trim().split(" ").filter((c) => !!c.trim());
}
function deleteProps(obj) {
  const object = obj;
  Object.keys(object).forEach((key) => {
    try {
      object[key] = null;
    } catch (e) {
    }
    try {
      delete object[key];
    } catch (e) {
    }
  });
}
function nextTick(callback, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return setTimeout(callback, delay);
}
function now() {
  return Date.now();
}
function getComputedStyle$1(el) {
  const window2 = getWindow();
  let style;
  if (window2.getComputedStyle) {
    style = window2.getComputedStyle(el, null);
  }
  if (!style && el.currentStyle) {
    style = el.currentStyle;
  }
  if (!style) {
    style = el.style;
  }
  return style;
}
function getTranslate(el, axis) {
  if (axis === void 0) {
    axis = "x";
  }
  const window2 = getWindow();
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = getComputedStyle$1(el);
  if (window2.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;
    if (curTransform.split(",").length > 6) {
      curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
    }
    transformMatrix = new window2.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
    matrix = transformMatrix.toString().split(",");
  }
  if (axis === "x") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m41;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
    else curTransform = parseFloat(matrix[4]);
  }
  if (axis === "y") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m42;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
    else curTransform = parseFloat(matrix[5]);
  }
  return curTransform || 0;
}
function isObject(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
}
function isNode(node) {
  if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
    return node instanceof HTMLElement;
  }
  return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend() {
  const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
  const noExtend = ["__proto__", "constructor", "prototype"];
  for (let i = 1; i < arguments.length; i += 1) {
    const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
    if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
      const keysArray = Object.keys(Object(nextSource)).filter((key) => noExtend.indexOf(key) < 0);
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        const nextKey = keysArray[nextIndex];
        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== void 0 && desc.enumerable) {
          if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {};
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return to;
}
function setCSSProperty(el, varName, varValue) {
  el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll(_ref) {
  let {
    swiper,
    targetPosition,
    side
  } = _ref;
  const window2 = getWindow();
  const startPosition = -swiper.translate;
  let startTime = null;
  let time;
  const duration = swiper.params.speed;
  swiper.wrapperEl.style.scrollSnapType = "none";
  window2.cancelAnimationFrame(swiper.cssModeFrameID);
  const dir = targetPosition > startPosition ? "next" : "prev";
  const isOutOfBound = (current, target) => {
    return dir === "next" && current >= target || dir === "prev" && current <= target;
  };
  const animate = () => {
    time = (/* @__PURE__ */ new Date()).getTime();
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
    if (isOutOfBound(currentPosition, targetPosition)) {
      currentPosition = targetPosition;
    }
    swiper.wrapperEl.scrollTo({
      [side]: currentPosition
    });
    if (isOutOfBound(currentPosition, targetPosition)) {
      swiper.wrapperEl.style.overflow = "hidden";
      swiper.wrapperEl.style.scrollSnapType = "";
      setTimeout(() => {
        swiper.wrapperEl.style.overflow = "";
        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });
      });
      window2.cancelAnimationFrame(swiper.cssModeFrameID);
      return;
    }
    swiper.cssModeFrameID = window2.requestAnimationFrame(animate);
  };
  animate();
}
function getSlideTransformEl(slideEl) {
  return slideEl.querySelector(".swiper-slide-transform") || slideEl.shadowRoot && slideEl.shadowRoot.querySelector(".swiper-slide-transform") || slideEl;
}
function elementChildren(element, selector) {
  if (selector === void 0) {
    selector = "";
  }
  const window2 = getWindow();
  const children = [...element.children];
  if (window2.HTMLSlotElement && element instanceof HTMLSlotElement) {
    children.push(...element.assignedElements());
  }
  if (!selector) {
    return children;
  }
  return children.filter((el) => el.matches(selector));
}
function elementIsChildOfSlot(el, slot) {
  const elementsQueue = [slot];
  while (elementsQueue.length > 0) {
    const elementToCheck = elementsQueue.shift();
    if (el === elementToCheck) {
      return true;
    }
    elementsQueue.push(...elementToCheck.children, ...elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : [], ...elementToCheck.assignedElements ? elementToCheck.assignedElements() : []);
  }
}
function elementIsChildOf(el, parent) {
  const window2 = getWindow();
  let isChild = parent.contains(el);
  if (!isChild && window2.HTMLSlotElement && parent instanceof HTMLSlotElement) {
    const children = [...parent.assignedElements()];
    isChild = children.includes(el);
    if (!isChild) {
      isChild = elementIsChildOfSlot(el, parent);
    }
  }
  return isChild;
}
function showWarning(text) {
  try {
    console.warn(text);
    return;
  } catch (err) {
  }
}
function createElement(tag, classes2) {
  if (classes2 === void 0) {
    classes2 = [];
  }
  const el = document.createElement(tag);
  el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
  return el;
}
function elementPrevAll(el, selector) {
  const prevEls = [];
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling;
    if (selector) {
      if (prev.matches(selector)) prevEls.push(prev);
    } else prevEls.push(prev);
    el = prev;
  }
  return prevEls;
}
function elementNextAll(el, selector) {
  const nextEls = [];
  while (el.nextElementSibling) {
    const next = el.nextElementSibling;
    if (selector) {
      if (next.matches(selector)) nextEls.push(next);
    } else nextEls.push(next);
    el = next;
  }
  return nextEls;
}
function elementStyle(el, prop) {
  const window2 = getWindow();
  return window2.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
  let child = el;
  let i;
  if (child) {
    i = 0;
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }
    return i;
  }
  return void 0;
}
function elementParents(el, selector) {
  const parents = [];
  let parent = el.parentElement;
  while (parent) {
    if (selector) {
      if (parent.matches(selector)) parents.push(parent);
    } else {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}
function elementTransitionEnd(el, callback) {
  function fireCallBack(e) {
    if (e.target !== el) return;
    callback.call(el, e);
    el.removeEventListener("transitionend", fireCallBack);
  }
  if (callback) {
    el.addEventListener("transitionend", fireCallBack);
  }
}
function elementOuterSize(el, size, includeMargins) {
  const window2 = getWindow();
  {
    return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
  }
}
function makeElementsArray(el) {
  return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
function setInnerHTML(el, html) {
  if (html === void 0) {
    html = "";
  }
  if (typeof trustedTypes !== "undefined") {
    el.innerHTML = trustedTypes.createPolicy("html", {
      createHTML: (s) => s
    }).createHTML(html);
  } else {
    el.innerHTML = html;
  }
}
let support;
function calcSupport() {
  const window2 = getWindow();
  const document2 = getDocument();
  return {
    smoothScroll: document2.documentElement && document2.documentElement.style && "scrollBehavior" in document2.documentElement.style,
    touch: !!("ontouchstart" in window2 || window2.DocumentTouch && document2 instanceof window2.DocumentTouch)
  };
}
function getSupport() {
  if (!support) {
    support = calcSupport();
  }
  return support;
}
let deviceCached;
function calcDevice(_temp) {
  let {
    userAgent
  } = _temp === void 0 ? {} : _temp;
  const support2 = getSupport();
  const window2 = getWindow();
  const platform = window2.navigator.platform;
  const ua = userAgent || window2.navigator.userAgent;
  const device = {
    ios: false,
    android: false
  };
  const screenWidth = window2.screen.width;
  const screenHeight = window2.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const windows = platform === "Win32";
  let macos = platform === "MacIntel";
  const iPadScreens = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
  if (!ipad && macos && support2.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    if (!ipad) ipad = [0, 1, "13_0_0"];
    macos = false;
  }
  if (android && !windows) {
    device.os = "android";
    device.android = true;
  }
  if (ipad || iphone || ipod) {
    device.os = "ios";
    device.ios = true;
  }
  return device;
}
function getDevice(overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  if (!deviceCached) {
    deviceCached = calcDevice(overrides);
  }
  return deviceCached;
}
let browser;
function calcBrowser() {
  const window2 = getWindow();
  const device = getDevice();
  let needPerspectiveFix = false;
  function isSafari() {
    const ua = window2.navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
  }
  if (isSafari()) {
    const ua = String(window2.navigator.userAgent);
    if (ua.includes("Version/")) {
      const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
    }
  }
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window2.navigator.userAgent);
  const isSafariBrowser = isSafari();
  const need3dFix = isSafariBrowser || isWebView && device.ios;
  return {
    isSafari: needPerspectiveFix || isSafariBrowser,
    needPerspectiveFix,
    need3dFix,
    isWebView
  };
}
function getBrowser() {
  if (!browser) {
    browser = calcBrowser();
  }
  return browser;
}
function Resize(_ref) {
  let {
    swiper,
    on,
    emit
  } = _ref;
  const window2 = getWindow();
  let observer = null;
  let animationFrame = null;
  const resizeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("beforeResize");
    emit("resize");
  };
  const createObserver = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    observer = new ResizeObserver((entries) => {
      animationFrame = window2.requestAnimationFrame(() => {
        const {
          width,
          height
        } = swiper;
        let newWidth = width;
        let newHeight = height;
        entries.forEach((_ref2) => {
          let {
            contentBoxSize,
            contentRect,
            target
          } = _ref2;
          if (target && target !== swiper.el) return;
          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
        });
        if (newWidth !== width || newHeight !== height) {
          resizeHandler();
        }
      });
    });
    observer.observe(swiper.el);
  };
  const removeObserver = () => {
    if (animationFrame) {
      window2.cancelAnimationFrame(animationFrame);
    }
    if (observer && observer.unobserve && swiper.el) {
      observer.unobserve(swiper.el);
      observer = null;
    }
  };
  const orientationChangeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("orientationchange");
  };
  on("init", () => {
    if (swiper.params.resizeObserver && typeof window2.ResizeObserver !== "undefined") {
      createObserver();
      return;
    }
    window2.addEventListener("resize", resizeHandler);
    window2.addEventListener("orientationchange", orientationChangeHandler);
  });
  on("destroy", () => {
    removeObserver();
    window2.removeEventListener("resize", resizeHandler);
    window2.removeEventListener("orientationchange", orientationChangeHandler);
  });
}
function Observer(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const observers = [];
  const window2 = getWindow();
  const attach = function(target, options) {
    if (options === void 0) {
      options = {};
    }
    const ObserverFunc = window2.MutationObserver || window2.WebkitMutationObserver;
    const observer = new ObserverFunc((mutations) => {
      if (swiper.__preventObserver__) return;
      if (mutations.length === 1) {
        emit("observerUpdate", mutations[0]);
        return;
      }
      const observerUpdate = function observerUpdate2() {
        emit("observerUpdate", mutations[0]);
      };
      if (window2.requestAnimationFrame) {
        window2.requestAnimationFrame(observerUpdate);
      } else {
        window2.setTimeout(observerUpdate, 0);
      }
    });
    observer.observe(target, {
      attributes: typeof options.attributes === "undefined" ? true : options.attributes,
      childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
      characterData: typeof options.characterData === "undefined" ? true : options.characterData
    });
    observers.push(observer);
  };
  const init = () => {
    if (!swiper.params.observer) return;
    if (swiper.params.observeParents) {
      const containerParents = elementParents(swiper.hostEl);
      for (let i = 0; i < containerParents.length; i += 1) {
        attach(containerParents[i]);
      }
    }
    attach(swiper.hostEl, {
      childList: swiper.params.observeSlideChildren
    });
    attach(swiper.wrapperEl, {
      attributes: false
    });
  };
  const destroy = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0, observers.length);
  };
  extendParams({
    observer: false,
    observeParents: false,
    observeSlideChildren: false
  });
  on("init", init);
  on("destroy", destroy);
}
var eventsEmitter = {
  on(events2, handler, priority) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed) return self2;
    if (typeof handler !== "function") return self2;
    const method = priority ? "unshift" : "push";
    events2.split(" ").forEach((event) => {
      if (!self2.eventsListeners[event]) self2.eventsListeners[event] = [];
      self2.eventsListeners[event][method](handler);
    });
    return self2;
  },
  once(events2, handler, priority) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed) return self2;
    if (typeof handler !== "function") return self2;
    function onceHandler() {
      self2.off(events2, onceHandler);
      if (onceHandler.__emitterProxy) {
        delete onceHandler.__emitterProxy;
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      handler.apply(self2, args);
    }
    onceHandler.__emitterProxy = handler;
    return self2.on(events2, onceHandler, priority);
  },
  onAny(handler, priority) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed) return self2;
    if (typeof handler !== "function") return self2;
    const method = priority ? "unshift" : "push";
    if (self2.eventsAnyListeners.indexOf(handler) < 0) {
      self2.eventsAnyListeners[method](handler);
    }
    return self2;
  },
  offAny(handler) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed) return self2;
    if (!self2.eventsAnyListeners) return self2;
    const index = self2.eventsAnyListeners.indexOf(handler);
    if (index >= 0) {
      self2.eventsAnyListeners.splice(index, 1);
    }
    return self2;
  },
  off(events2, handler) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed) return self2;
    if (!self2.eventsListeners) return self2;
    events2.split(" ").forEach((event) => {
      if (typeof handler === "undefined") {
        self2.eventsListeners[event] = [];
      } else if (self2.eventsListeners[event]) {
        self2.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
            self2.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self2;
  },
  emit() {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed) return self2;
    if (!self2.eventsListeners) return self2;
    let events2;
    let data;
    let context;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      events2 = args[0];
      data = args.slice(1, args.length);
      context = self2;
    } else {
      events2 = args[0].events;
      data = args[0].data;
      context = args[0].context || self2;
    }
    data.unshift(context);
    const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
    eventsArray.forEach((event) => {
      if (self2.eventsAnyListeners && self2.eventsAnyListeners.length) {
        self2.eventsAnyListeners.forEach((eventHandler) => {
          eventHandler.apply(context, [event, ...data]);
        });
      }
      if (self2.eventsListeners && self2.eventsListeners[event]) {
        self2.eventsListeners[event].forEach((eventHandler) => {
          eventHandler.apply(context, data);
        });
      }
    });
    return self2;
  }
};
function updateSize() {
  const swiper = this;
  let width;
  let height;
  const el = swiper.el;
  if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) {
    width = swiper.params.width;
  } else {
    width = el.clientWidth;
  }
  if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) {
    height = swiper.params.height;
  } else {
    height = el.clientHeight;
  }
  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
    return;
  }
  width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
  height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
  if (Number.isNaN(width)) width = 0;
  if (Number.isNaN(height)) height = 0;
  Object.assign(swiper, {
    width,
    height,
    size: swiper.isHorizontal() ? width : height
  });
}
function updateSlides() {
  const swiper = this;
  function getDirectionPropertyValue(node, label) {
    return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
  }
  const params = swiper.params;
  const {
    wrapperEl,
    slidesEl,
    size: swiperSize,
    rtlTranslate: rtl,
    wrongRTL
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
  const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
  let snapGrid = [];
  const slidesGrid = [];
  const slidesSizesGrid = [];
  let offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === "function") {
    offsetBefore = params.slidesOffsetBefore.call(swiper);
  }
  let offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === "function") {
    offsetAfter = params.slidesOffsetAfter.call(swiper);
  }
  const previousSnapGridLength = swiper.snapGrid.length;
  const previousSlidesGridLength = swiper.slidesGrid.length;
  let spaceBetween = params.spaceBetween;
  let slidePosition = -offsetBefore;
  let prevSlideSize = 0;
  let index = 0;
  if (typeof swiperSize === "undefined") {
    return;
  }
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  swiper.virtualSize = -spaceBetween;
  slides.forEach((slideEl) => {
    if (rtl) {
      slideEl.style.marginLeft = "";
    } else {
      slideEl.style.marginRight = "";
    }
    slideEl.style.marginBottom = "";
    slideEl.style.marginTop = "";
  });
  if (params.centeredSlides && params.cssMode) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
  }
  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
  if (gridEnabled) {
    swiper.grid.initSlides(slides);
  } else if (swiper.grid) {
    swiper.grid.unsetSlides();
  }
  let slideSize;
  const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
    return typeof params.breakpoints[key].slidesPerView !== "undefined";
  }).length > 0;
  for (let i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    let slide2;
    if (slides[i]) slide2 = slides[i];
    if (gridEnabled) {
      swiper.grid.updateSlide(i, slide2, slides);
    }
    if (slides[i] && elementStyle(slide2, "display") === "none") continue;
    if (params.slidesPerView === "auto") {
      if (shouldResetSlideSize) {
        slides[i].style[swiper.getDirectionLabel("width")] = ``;
      }
      const slideStyles = getComputedStyle(slide2);
      const currentTransform = slide2.style.transform;
      const currentWebKitTransform = slide2.style.webkitTransform;
      if (currentTransform) {
        slide2.style.transform = "none";
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = "none";
      }
      if (params.roundLengths) {
        slideSize = swiper.isHorizontal() ? elementOuterSize(slide2, "width") : elementOuterSize(slide2, "height");
      } else {
        const width = getDirectionPropertyValue(slideStyles, "width");
        const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
        const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
        const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
        const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
        const boxSizing = slideStyles.getPropertyValue("box-sizing");
        if (boxSizing && boxSizing === "border-box") {
          slideSize = width + marginLeft + marginRight;
        } else {
          const {
            clientWidth,
            offsetWidth
          } = slide2;
          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
        }
      }
      if (currentTransform) {
        slide2.style.transform = currentTransform;
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = currentWebKitTransform;
      }
      if (params.roundLengths) slideSize = Math.floor(slideSize);
    } else {
      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
      if (params.roundLengths) slideSize = Math.floor(slideSize);
      if (slides[i]) {
        slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
      }
    }
    if (slides[i]) {
      slides[i].swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);
    if (params.centeredSlides) {
      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
    } else {
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }
    swiper.virtualSize += slideSize + spaceBetween;
    prevSlideSize = slideSize;
    index += 1;
  }
  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
  if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
    wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (params.setWrapperSize) {
    wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (gridEnabled) {
    swiper.grid.updateWrapperSize(slideSize, snapGrid);
  }
  if (!params.centeredSlides) {
    const newSlidesGrid = [];
    for (let i = 0; i < snapGrid.length; i += 1) {
      let slidesGridItem = snapGrid[i];
      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
      if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
        newSlidesGrid.push(slidesGridItem);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      snapGrid.push(swiper.virtualSize - swiperSize);
    }
  }
  if (isVirtual && params.loop) {
    const size = slidesSizesGrid[0] + spaceBetween;
    if (params.slidesPerGroup > 1) {
      const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
      const groupSize = size * params.slidesPerGroup;
      for (let i = 0; i < groups; i += 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
      }
    }
    for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
      if (params.slidesPerGroup === 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
      }
      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
      swiper.virtualSize += size;
    }
  }
  if (snapGrid.length === 0) snapGrid = [0];
  if (spaceBetween !== 0) {
    const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
    slides.filter((_, slideIndex) => {
      if (!params.cssMode || params.loop) return true;
      if (slideIndex === slides.length - 1) {
        return false;
      }
      return true;
    }).forEach((slideEl) => {
      slideEl.style[key] = `${spaceBetween}px`;
    });
  }
  if (params.centeredSlides && params.centeredSlidesBounds) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
    snapGrid = snapGrid.map((snap) => {
      if (snap <= 0) return -offsetBefore;
      if (snap > maxSnap) return maxSnap + offsetAfter;
      return snap;
    });
  }
  if (params.centerInsufficientSlides) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
    if (allSlidesSize + offsetSize < swiperSize) {
      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
      snapGrid.forEach((snap, snapIndex) => {
        snapGrid[snapIndex] = snap - allSlidesOffset;
      });
      slidesGrid.forEach((snap, snapIndex) => {
        slidesGrid[snapIndex] = snap + allSlidesOffset;
      });
    }
  }
  Object.assign(swiper, {
    slides,
    snapGrid,
    slidesGrid,
    slidesSizesGrid
  });
  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
    const addToSnapGrid = -swiper.snapGrid[0];
    const addToSlidesGrid = -swiper.slidesGrid[0];
    swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
    swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
  }
  if (slidesLength !== previousSlidesLength) {
    swiper.emit("slidesLengthChange");
  }
  if (snapGrid.length !== previousSnapGridLength) {
    if (swiper.params.watchOverflow) swiper.checkOverflow();
    swiper.emit("snapGridLengthChange");
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper.emit("slidesGridLengthChange");
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  swiper.emit("slidesUpdated");
  if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
    const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
    if (slidesLength <= params.maxBackfaceHiddenSlides) {
      if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
    } else if (hasClassBackfaceClassAdded) {
      swiper.el.classList.remove(backFaceHiddenClass);
    }
  }
}
function updateAutoHeight(speed) {
  const swiper = this;
  const activeSlides = [];
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  let newHeight = 0;
  let i;
  if (typeof speed === "number") {
    swiper.setTransition(speed);
  } else if (speed === true) {
    swiper.setTransition(swiper.params.speed);
  }
  const getSlideByIndex = (index) => {
    if (isVirtual) {
      return swiper.slides[swiper.getSlideIndexByData(index)];
    }
    return swiper.slides[index];
  };
  if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) {
    if (swiper.params.centeredSlides) {
      (swiper.visibleSlides || []).forEach((slide2) => {
        activeSlides.push(slide2);
      });
    } else {
      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
        const index = swiper.activeIndex + i;
        if (index > swiper.slides.length && !isVirtual) break;
        activeSlides.push(getSlideByIndex(index));
      }
    }
  } else {
    activeSlides.push(getSlideByIndex(swiper.activeIndex));
  }
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== "undefined") {
      const height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }
  if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
  const swiper = this;
  const slides = swiper.slides;
  const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
  for (let i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
  }
}
const toggleSlideClasses$1 = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesProgress(translate2) {
  if (translate2 === void 0) {
    translate2 = this && this.translate || 0;
  }
  const swiper = this;
  const params = swiper.params;
  const {
    slides,
    rtlTranslate: rtl,
    snapGrid
  } = swiper;
  if (slides.length === 0) return;
  if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
  let offsetCenter = -translate2;
  if (rtl) offsetCenter = translate2;
  swiper.visibleSlidesIndexes = [];
  swiper.visibleSlides = [];
  let spaceBetween = params.spaceBetween;
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  for (let i = 0; i < slides.length; i += 1) {
    const slide2 = slides[i];
    let slideOffset = slide2.swiperSlideOffset;
    if (params.cssMode && params.centeredSlides) {
      slideOffset -= slides[0].swiperSlideOffset;
    }
    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const slideBefore = -(offsetCenter - slideOffset);
    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
    if (isVisible) {
      swiper.visibleSlides.push(slide2);
      swiper.visibleSlidesIndexes.push(i);
    }
    toggleSlideClasses$1(slide2, isVisible, params.slideVisibleClass);
    toggleSlideClasses$1(slide2, isFullyVisible, params.slideFullyVisibleClass);
    slide2.progress = rtl ? -slideProgress : slideProgress;
    slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
  }
}
function updateProgress(translate2) {
  const swiper = this;
  if (typeof translate2 === "undefined") {
    const multiplier = swiper.rtlTranslate ? -1 : 1;
    translate2 = swiper && swiper.translate && swiper.translate * multiplier || 0;
  }
  const params = swiper.params;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  let {
    progress,
    isBeginning,
    isEnd,
    progressLoop
  } = swiper;
  const wasBeginning = isBeginning;
  const wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate2 - swiper.minTranslate()) / translatesDiff;
    const isBeginningRounded = Math.abs(translate2 - swiper.minTranslate()) < 1;
    const isEndRounded = Math.abs(translate2 - swiper.maxTranslate()) < 1;
    isBeginning = isBeginningRounded || progress <= 0;
    isEnd = isEndRounded || progress >= 1;
    if (isBeginningRounded) progress = 0;
    if (isEndRounded) progress = 1;
  }
  if (params.loop) {
    const firstSlideIndex = swiper.getSlideIndexByData(0);
    const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
    const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
    const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
    const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
    const translateAbs = Math.abs(translate2);
    if (translateAbs >= firstSlideTranslate) {
      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
    } else {
      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
    }
    if (progressLoop > 1) progressLoop -= 1;
  }
  Object.assign(swiper, {
    progress,
    progressLoop,
    isBeginning,
    isEnd
  });
  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate2);
  if (isBeginning && !wasBeginning) {
    swiper.emit("reachBeginning toEdge");
  }
  if (isEnd && !wasEnd) {
    swiper.emit("reachEnd toEdge");
  }
  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
    swiper.emit("fromEdge");
  }
  swiper.emit("progress", progress);
}
const toggleSlideClasses = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesClasses() {
  const swiper = this;
  const {
    slides,
    params,
    slidesEl,
    activeIndex
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const getFilteredSlide = (selector) => {
    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
  };
  let activeSlide;
  let prevSlide;
  let nextSlide;
  if (isVirtual) {
    if (params.loop) {
      let slideIndex = activeIndex - swiper.virtual.slidesBefore;
      if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
      if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
    } else {
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
    }
  } else {
    if (gridEnabled) {
      activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
      nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
      prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
    } else {
      activeSlide = slides[activeIndex];
    }
  }
  if (activeSlide) {
    if (!gridEnabled) {
      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !nextSlide) {
        nextSlide = slides[0];
      }
      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !prevSlide === 0) {
        prevSlide = slides[slides.length - 1];
      }
    }
  }
  slides.forEach((slideEl) => {
    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
  });
  swiper.emitSlidesClasses();
}
const processLazyPreloader = (swiper, imageEl) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
  const slideEl = imageEl.closest(slideSelector());
  if (slideEl) {
    let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
    if (!lazyEl && swiper.isElement) {
      if (slideEl.shadowRoot) {
        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
      } else {
        requestAnimationFrame(() => {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (lazyEl) lazyEl.remove();
          }
        });
      }
    }
    if (lazyEl) lazyEl.remove();
  }
};
const unlazy = (swiper, index) => {
  if (!swiper.slides[index]) return;
  const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
  if (imageEl) imageEl.removeAttribute("loading");
};
const preload = (swiper) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  let amount = swiper.params.lazyPreloadPrevNext;
  const len = swiper.slides.length;
  if (!len || !amount || amount < 0) return;
  amount = Math.min(amount, len);
  const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
  const activeIndex = swiper.activeIndex;
  if (swiper.params.grid && swiper.params.grid.rows > 1) {
    const activeColumn = activeIndex;
    const preloadColumns = [activeColumn - amount];
    preloadColumns.push(...Array.from({
      length: amount
    }).map((_, i) => {
      return activeColumn + slidesPerView + i;
    }));
    swiper.slides.forEach((slideEl, i) => {
      if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
    });
    return;
  }
  const slideIndexLastInView = activeIndex + slidesPerView - 1;
  if (swiper.params.rewind || swiper.params.loop) {
    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
      const realIndex = (i % len + len) % len;
      if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
    }
  } else {
    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
        unlazy(swiper, i);
      }
    }
  }
};
function getActiveIndexByTranslate(swiper) {
  const {
    slidesGrid,
    params
  } = swiper;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  let activeIndex;
  for (let i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== "undefined") {
      if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
        activeIndex = i;
      } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
        activeIndex = i + 1;
      }
    } else if (translate2 >= slidesGrid[i]) {
      activeIndex = i;
    }
  }
  if (params.normalizeSlideIndex) {
    if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
  }
  return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
  const swiper = this;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  const {
    snapGrid,
    params,
    activeIndex: previousIndex,
    realIndex: previousRealIndex,
    snapIndex: previousSnapIndex
  } = swiper;
  let activeIndex = newActiveIndex;
  let snapIndex;
  const getVirtualRealIndex = (aIndex) => {
    let realIndex2 = aIndex - swiper.virtual.slidesBefore;
    if (realIndex2 < 0) {
      realIndex2 = swiper.virtual.slides.length + realIndex2;
    }
    if (realIndex2 >= swiper.virtual.slides.length) {
      realIndex2 -= swiper.virtual.slides.length;
    }
    return realIndex2;
  };
  if (typeof activeIndex === "undefined") {
    activeIndex = getActiveIndexByTranslate(swiper);
  }
  if (snapGrid.indexOf(translate2) >= 0) {
    snapIndex = snapGrid.indexOf(translate2);
  } else {
    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  if (activeIndex === previousIndex && !swiper.params.loop) {
    if (snapIndex !== previousSnapIndex) {
      swiper.snapIndex = snapIndex;
      swiper.emit("snapIndexChange");
    }
    return;
  }
  if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
    swiper.realIndex = getVirtualRealIndex(activeIndex);
    return;
  }
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  let realIndex;
  if (swiper.virtual && params.virtual.enabled && params.loop) {
    realIndex = getVirtualRealIndex(activeIndex);
  } else if (gridEnabled) {
    const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
    if (Number.isNaN(activeSlideIndex)) {
      activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
    }
    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
  } else if (swiper.slides[activeIndex]) {
    const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
    if (slideIndex) {
      realIndex = parseInt(slideIndex, 10);
    } else {
      realIndex = activeIndex;
    }
  } else {
    realIndex = activeIndex;
  }
  Object.assign(swiper, {
    previousSnapIndex,
    snapIndex,
    previousRealIndex,
    realIndex,
    previousIndex,
    activeIndex
  });
  if (swiper.initialized) {
    preload(swiper);
  }
  swiper.emit("activeIndexChange");
  swiper.emit("snapIndexChange");
  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
    if (previousRealIndex !== realIndex) {
      swiper.emit("realIndexChange");
    }
    swiper.emit("slideChange");
  }
}
function updateClickedSlide(el, path) {
  const swiper = this;
  const params = swiper.params;
  let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
  if (!slide2 && swiper.isElement && path && path.length > 1 && path.includes(el)) {
    [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
      if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
        slide2 = pathEl;
      }
    });
  }
  let slideFound = false;
  let slideIndex;
  if (slide2) {
    for (let i = 0; i < swiper.slides.length; i += 1) {
      if (swiper.slides[i] === slide2) {
        slideFound = true;
        slideIndex = i;
        break;
      }
    }
  }
  if (slide2 && slideFound) {
    swiper.clickedSlide = slide2;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      swiper.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
    } else {
      swiper.clickedIndex = slideIndex;
    }
  } else {
    swiper.clickedSlide = void 0;
    swiper.clickedIndex = void 0;
    return;
  }
  if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) {
    swiper.slideToClickedSlide();
  }
}
var update = {
  updateSize,
  updateSlides,
  updateAutoHeight,
  updateSlidesOffset,
  updateSlidesProgress,
  updateProgress,
  updateSlidesClasses,
  updateActiveIndex,
  updateClickedSlide
};
function getSwiperTranslate(axis) {
  if (axis === void 0) {
    axis = this.isHorizontal() ? "x" : "y";
  }
  const swiper = this;
  const {
    params,
    rtlTranslate: rtl,
    translate: translate2,
    wrapperEl
  } = swiper;
  if (params.virtualTranslate) {
    return rtl ? -translate2 : translate2;
  }
  if (params.cssMode) {
    return translate2;
  }
  let currentTranslate = getTranslate(wrapperEl, axis);
  currentTranslate += swiper.cssOverflowAdjustment();
  if (rtl) currentTranslate = -currentTranslate;
  return currentTranslate || 0;
}
function setTranslate(translate2, byController) {
  const swiper = this;
  const {
    rtlTranslate: rtl,
    params,
    wrapperEl,
    progress
  } = swiper;
  let x = 0;
  let y = 0;
  const z = 0;
  if (swiper.isHorizontal()) {
    x = rtl ? -translate2 : translate2;
  } else {
    y = translate2;
  }
  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  swiper.previousTranslate = swiper.translate;
  swiper.translate = swiper.isHorizontal() ? x : y;
  if (params.cssMode) {
    wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y;
  } else if (!params.virtualTranslate) {
    if (swiper.isHorizontal()) {
      x -= swiper.cssOverflowAdjustment();
    } else {
      y -= swiper.cssOverflowAdjustment();
    }
    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate2 - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== progress) {
    swiper.updateProgress(translate2);
  }
  swiper.emit("setTranslate", swiper.translate, byController);
}
function minTranslate() {
  return -this.snapGrid[0];
}
function maxTranslate() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate2, speed, runCallbacks, translateBounds, internal) {
  if (translate2 === void 0) {
    translate2 = 0;
  }
  if (speed === void 0) {
    speed = this.params.speed;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (translateBounds === void 0) {
    translateBounds = true;
  }
  const swiper = this;
  const {
    params,
    wrapperEl
  } = swiper;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  const minTranslate2 = swiper.minTranslate();
  const maxTranslate2 = swiper.maxTranslate();
  let newTranslate;
  if (translateBounds && translate2 > minTranslate2) newTranslate = minTranslate2;
  else if (translateBounds && translate2 < maxTranslate2) newTranslate = maxTranslate2;
  else newTranslate = translate2;
  swiper.updateProgress(newTranslate);
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    if (speed === 0) {
      wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: -newTranslate,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: -newTranslate,
        behavior: "smooth"
      });
    }
    return true;
  }
  if (speed === 0) {
    swiper.setTransition(0);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionEnd");
    }
  } else {
    swiper.setTransition(speed);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionStart");
    }
    if (!swiper.animating) {
      swiper.animating = true;
      if (!swiper.onTranslateToWrapperTransitionEnd) {
        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper || swiper.destroyed) return;
          if (e.target !== this) return;
          swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
          swiper.onTranslateToWrapperTransitionEnd = null;
          delete swiper.onTranslateToWrapperTransitionEnd;
          swiper.animating = false;
          if (runCallbacks) {
            swiper.emit("transitionEnd");
          }
        };
      }
      swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
    }
  }
  return true;
}
var translate = {
  getTranslate: getSwiperTranslate,
  setTranslate,
  minTranslate,
  maxTranslate,
  translateTo
};
function setTransition(duration, byController) {
  const swiper = this;
  if (!swiper.params.cssMode) {
    swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
    swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
  }
  swiper.emit("setTransition", duration, byController);
}
function transitionEmit(_ref) {
  let {
    swiper,
    runCallbacks,
    direction,
    step
  } = _ref;
  const {
    activeIndex,
    previousIndex
  } = swiper;
  let dir = direction;
  if (!dir) {
    if (activeIndex > previousIndex) dir = "next";
    else if (activeIndex < previousIndex) dir = "prev";
    else dir = "reset";
  }
  swiper.emit(`transition${step}`);
  if (runCallbacks && dir === "reset") {
    swiper.emit(`slideResetTransition${step}`);
  } else if (runCallbacks && activeIndex !== previousIndex) {
    swiper.emit(`slideChangeTransition${step}`);
    if (dir === "next") {
      swiper.emit(`slideNextTransition${step}`);
    } else {
      swiper.emit(`slidePrevTransition${step}`);
    }
  }
}
function transitionStart(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  if (params.cssMode) return;
  if (params.autoHeight) {
    swiper.updateAutoHeight();
  }
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "Start"
  });
}
function transitionEnd(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.animating = false;
  if (params.cssMode) return;
  swiper.setTransition(0);
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "End"
  });
}
var transition = {
  setTransition,
  transitionStart,
  transitionEnd
};
function slideTo(index, speed, runCallbacks, internal, initial) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    index = parseInt(index, 10);
  }
  const swiper = this;
  let slideIndex = index;
  if (slideIndex < 0) slideIndex = 0;
  const {
    params,
    snapGrid,
    slidesGrid,
    previousIndex,
    activeIndex,
    rtlTranslate: rtl,
    wrapperEl,
    enabled
  } = swiper;
  if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  const translate2 = -snapGrid[snapIndex];
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      const normalizedTranslate = -Math.floor(translate2 * 100);
      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
          slideIndex = i;
        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
          slideIndex = i + 1;
        }
      } else if (normalizedTranslate >= normalizedGrid) {
        slideIndex = i;
      }
    }
  }
  if (swiper.initialized && slideIndex !== activeIndex) {
    if (!swiper.allowSlideNext && (rtl ? translate2 > swiper.translate && translate2 > swiper.minTranslate() : translate2 < swiper.translate && translate2 < swiper.minTranslate())) {
      return false;
    }
    if (!swiper.allowSlidePrev && translate2 > swiper.translate && translate2 > swiper.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) {
        return false;
      }
    }
  }
  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
    swiper.emit("beforeSlideChangeStart");
  }
  swiper.updateProgress(translate2);
  let direction;
  if (slideIndex > activeIndex) direction = "next";
  else if (slideIndex < activeIndex) direction = "prev";
  else direction = "reset";
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  const isInitialVirtual = isVirtual && initial;
  if (!isInitialVirtual && (rtl && -translate2 === swiper.translate || !rtl && translate2 === swiper.translate)) {
    swiper.updateActiveIndex(slideIndex);
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== "slide") {
      swiper.setTranslate(translate2);
    }
    if (direction !== "reset") {
      swiper.transitionStart(runCallbacks, direction);
      swiper.transitionEnd(runCallbacks, direction);
    }
    return false;
  }
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    const t = rtl ? translate2 : -translate2;
    if (speed === 0) {
      if (isVirtual) {
        swiper.wrapperEl.style.scrollSnapType = "none";
        swiper._immediateVirtual = true;
      }
      if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
        swiper._cssModeVirtualInitialSet = true;
        requestAnimationFrame(() => {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        });
      } else {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
      }
      if (isVirtual) {
        requestAnimationFrame(() => {
          swiper.wrapperEl.style.scrollSnapType = "";
          swiper._immediateVirtual = false;
        });
      }
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: t,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: t,
        behavior: "smooth"
      });
    }
    return true;
  }
  const browser2 = getBrowser();
  const isSafari = browser2.isSafari;
  if (isVirtual && !initial && isSafari && swiper.isElement) {
    swiper.virtual.update(false, false, slideIndex);
  }
  swiper.setTransition(speed);
  swiper.setTranslate(translate2);
  swiper.updateActiveIndex(slideIndex);
  swiper.updateSlidesClasses();
  swiper.emit("beforeTransitionStart", speed, internal);
  swiper.transitionStart(runCallbacks, direction);
  if (speed === 0) {
    swiper.transitionEnd(runCallbacks, direction);
  } else if (!swiper.animating) {
    swiper.animating = true;
    if (!swiper.onSlideToWrapperTransitionEnd) {
      swiper.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
        if (!swiper || swiper.destroyed) return;
        if (e.target !== this) return;
        swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        swiper.onSlideToWrapperTransitionEnd = null;
        delete swiper.onSlideToWrapperTransitionEnd;
        swiper.transitionEnd(runCallbacks, direction);
      };
    }
    swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
  }
  return true;
}
function slideToLoop(index, speed, runCallbacks, internal) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  let newIndex = index;
  if (swiper.params.loop) {
    if (swiper.virtual && swiper.params.virtual.enabled) {
      newIndex = newIndex + swiper.virtual.slidesBefore;
    } else {
      let targetSlideIndex;
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        targetSlideIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        targetSlideIndex = swiper.getSlideIndexByData(newIndex);
      }
      const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
      const {
        centeredSlides
      } = swiper.params;
      let slidesPerView = swiper.params.slidesPerView;
      if (slidesPerView === "auto") {
        slidesPerView = swiper.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
        if (centeredSlides && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      let needLoopFix = cols - targetSlideIndex < slidesPerView;
      if (centeredSlides) {
        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
      }
      if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) {
        needLoopFix = false;
      }
      if (needLoopFix) {
        const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
        swiper.loopFix({
          direction,
          slideTo: true,
          activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
          slideRealIndex: direction === "next" ? swiper.realIndex : void 0
        });
      }
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        newIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        newIndex = swiper.getSlideIndexByData(newIndex);
      }
    }
  }
  requestAnimationFrame(() => {
    swiper.slideTo(newIndex, speed, runCallbacks, internal);
  });
  return swiper;
}
function slideNext(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    enabled,
    params,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
  }
  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "next"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper.isEnd) {
    return swiper.slideTo(0, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}
function slidePrev(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params,
    snapGrid,
    slidesGrid,
    rtlTranslate,
    enabled,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "prev"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
  }
  const translate2 = rtlTranslate ? swiper.translate : -swiper.translate;
  function normalize(val) {
    if (val < 0) return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate2);
  const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
  const isFreeMode = params.freeMode && params.freeMode.enabled;
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== "undefined") {
      prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== "undefined") {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper.isBeginning) {
    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}
function slideReset(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}
function slideToClosest(speed, runCallbacks, internal, threshold) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (threshold === void 0) {
    threshold = 0.5;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let index = swiper.activeIndex;
  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  if (translate2 >= swiper.snapGrid[snapIndex]) {
    const currentSnap = swiper.snapGrid[snapIndex];
    const nextSnap = swiper.snapGrid[snapIndex + 1];
    if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
      index += swiper.params.slidesPerGroup;
    }
  } else {
    const prevSnap = swiper.snapGrid[snapIndex - 1];
    const currentSnap = swiper.snapGrid[snapIndex];
    if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
      index -= swiper.params.slidesPerGroup;
    }
  }
  index = Math.max(index, 0);
  index = Math.min(index, swiper.slidesGrid.length - 1);
  return swiper.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
  const swiper = this;
  if (swiper.destroyed) return;
  const {
    params,
    slidesEl
  } = swiper;
  const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
  let slideToIndex = swiper.getSlideIndexWhenGrid(swiper.clickedIndex);
  let realIndex;
  const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
  const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  if (params.loop) {
    if (swiper.animating) return;
    realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
    if (params.centeredSlides) {
      swiper.slideToLoop(realIndex);
    } else if (slideToIndex > (isGrid ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1) : swiper.slides.length - slidesPerView)) {
      swiper.loopFix();
      slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
      nextTick(() => {
        swiper.slideTo(slideToIndex);
      });
    } else {
      swiper.slideTo(slideToIndex);
    }
  } else {
    swiper.slideTo(slideToIndex);
  }
}
var slide = {
  slideTo,
  slideToLoop,
  slideNext,
  slidePrev,
  slideReset,
  slideToClosest,
  slideToClickedSlide
};
function loopCreate(slideRealIndex, initial) {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    slides.forEach((el, index) => {
      el.setAttribute("data-swiper-slide-index", index);
    });
  };
  const clearBlankSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
    slides.forEach((el) => {
      el.remove();
    });
    if (slides.length > 0) {
      swiper.recalcSlides();
      swiper.updateSlides();
    }
  };
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
    clearBlankSlides();
  }
  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
  const addBlankSlides = (amountOfSlides) => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
      swiper.slidesEl.append(slideEl);
    }
  };
  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else {
    initSlides();
  }
  swiper.loopFix({
    slideRealIndex,
    direction: params.centeredSlides ? void 0 : "next",
    initial
  });
}
function loopFix(_temp) {
  let {
    slideRealIndex,
    slideTo: slideTo2 = true,
    direction,
    setTranslate: setTranslate2,
    activeSlideIndex,
    initial,
    byController,
    byMousewheel
  } = _temp === void 0 ? {} : _temp;
  const swiper = this;
  if (!swiper.params.loop) return;
  swiper.emit("beforeLoopFix");
  const {
    slides,
    allowSlidePrev,
    allowSlideNext,
    slidesEl,
    params
  } = swiper;
  const {
    centeredSlides,
    initialSlide
  } = params;
  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  if (swiper.virtual && params.virtual.enabled) {
    if (slideTo2) {
      if (!params.centeredSlides && swiper.snapIndex === 0) {
        swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
      } else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) {
        swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
      } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
        swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
      }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    swiper.emit("loopFix");
    return;
  }
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === "auto") {
    slidesPerView = swiper.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (centeredSlides && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }
  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = centeredSlides ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2)) : slidesPerGroup;
  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper.loopedSlides = loopedSlides;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
  } else if (gridEnabled && params.grid.fill === "row") {
    showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
  }
  const prependSlidesIndexes = [];
  const appendSlidesIndexes = [];
  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
  const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !centeredSlides;
  let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
  if (typeof activeSlideIndex === "undefined") {
    activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
  } else {
    activeIndex = activeSlideIndex;
  }
  const isNext = direction === "next" || !direction;
  const isPrev = direction === "prev" || !direction;
  let slidesPrepended = 0;
  let slidesAppended = 0;
  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
  const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
  if (activeColIndexWithShift < loopedSlides) {
    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        const colIndexToPrepend = cols - index - 1;
        for (let i2 = slides.length - 1; i2 >= 0; i2 -= 1) {
          if (slides[i2].column === colIndexToPrepend) prependSlidesIndexes.push(i2);
        }
      } else {
        prependSlidesIndexes.push(cols - index - 1);
      }
    }
  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
    if (isInitialOverflow) {
      slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
    }
    for (let i = 0; i < slidesAppended; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        slides.forEach((slide2, slideIndex) => {
          if (slide2.column === index) appendSlidesIndexes.push(slideIndex);
        });
      } else {
        appendSlidesIndexes.push(index);
      }
    }
  }
  swiper.__preventObserver__ = true;
  requestAnimationFrame(() => {
    swiper.__preventObserver__ = false;
  });
  if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    if (appendSlidesIndexes.includes(activeSlideIndex)) {
      appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
    if (prependSlidesIndexes.includes(activeSlideIndex)) {
      prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
  }
  if (isPrev) {
    prependSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.prepend(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  if (isNext) {
    appendSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.append(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  swiper.recalcSlides();
  if (params.slidesPerView === "auto") {
    swiper.updateSlides();
  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
    swiper.slides.forEach((slide2, slideIndex) => {
      swiper.grid.updateSlide(slideIndex, slide2, swiper.slides);
    });
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  if (slideTo2) {
    if (prependSlidesIndexes.length > 0 && isPrev) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        if (setTranslate2) {
          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
          swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
          swiper.touchEventsData.currentTranslate = swiper.translate;
        }
      }
    } else if (appendSlidesIndexes.length > 0 && isNext) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
        swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
      }
    }
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.controller && swiper.controller.control && !byController) {
    const loopParams = {
      slideRealIndex,
      direction,
      setTranslate: setTranslate2,
      activeSlideIndex,
      byController: true
    };
    if (Array.isArray(swiper.controller.control)) {
      swiper.controller.control.forEach((c) => {
        if (!c.destroyed && c.params.loop) c.loopFix({
          ...loopParams,
          slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
        });
      });
    } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
      swiper.controller.control.loopFix({
        ...loopParams,
        slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo2 : false
      });
    }
  }
  swiper.emit("loopFix");
}
function loopDestroy() {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
  swiper.recalcSlides();
  const newSlidesOrder = [];
  swiper.slides.forEach((slideEl) => {
    const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper.slides.forEach((slideEl) => {
    slideEl.removeAttribute("data-swiper-slide-index");
  });
  newSlidesOrder.forEach((slideEl) => {
    slidesEl.append(slideEl);
  });
  swiper.recalcSlides();
  swiper.slideTo(swiper.realIndex, 0);
}
var loop = {
  loopCreate,
  loopFix,
  loopDestroy
};
function setGrabCursor(moving) {
  const swiper = this;
  if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
  const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  el.style.cursor = "move";
  el.style.cursor = moving ? "grabbing" : "grab";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
function unsetGrabCursor() {
  const swiper = this;
  if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
    return;
  }
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
var grabCursor = {
  setGrabCursor,
  unsetGrabCursor
};
function closestElement(selector, base) {
  if (base === void 0) {
    base = this;
  }
  function __closestFrom(el) {
    if (!el || el === getDocument() || el === getWindow()) return null;
    if (el.assignedSlot) el = el.assignedSlot;
    const found = el.closest(selector);
    if (!found && !el.getRootNode) {
      return null;
    }
    return found || __closestFrom(el.getRootNode().host);
  }
  return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
  const window2 = getWindow();
  const {
    params
  } = swiper;
  const edgeSwipeDetection = params.edgeSwipeDetection;
  const edgeSwipeThreshold = params.edgeSwipeThreshold;
  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window2.innerWidth - edgeSwipeThreshold)) {
    if (edgeSwipeDetection === "prevent") {
      event.preventDefault();
      return true;
    }
    return false;
  }
  return true;
}
function onTouchStart(event) {
  const swiper = this;
  const document2 = getDocument();
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  const data = swiper.touchEventsData;
  if (e.type === "pointerdown") {
    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
      return;
    }
    data.pointerId = e.pointerId;
  } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
    data.touchId = e.targetTouches[0].identifier;
  }
  if (e.type === "touchstart") {
    preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
    return;
  }
  const {
    params,
    touches,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return;
  }
  if (!swiper.animating && params.cssMode && params.loop) {
    swiper.loopFix();
  }
  let targetEl = e.target;
  if (params.touchEventsTarget === "wrapper") {
    if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
  }
  if ("which" in e && e.which === 3) return;
  if ("button" in e && e.button > 0) return;
  if (data.isTouched && data.isMoved) return;
  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
  const eventPath = e.composedPath ? e.composedPath() : e.path;
  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
    targetEl = eventPath[0];
  }
  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
  const isTargetShadow = !!(e.target && e.target.shadowRoot);
  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
    swiper.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!targetEl.closest(params.swipeHandler)) return;
  }
  touches.currentX = e.pageX;
  touches.currentY = e.pageY;
  const startX = touches.currentX;
  const startY = touches.currentY;
  if (!preventEdgeSwipe(swiper, e, startX)) {
    return;
  }
  Object.assign(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: void 0,
    startMoving: void 0
  });
  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = now();
  swiper.allowClick = true;
  swiper.updateSize();
  swiper.swipeDirection = void 0;
  if (params.threshold > 0) data.allowThresholdMove = false;
  let preventDefault = true;
  if (targetEl.matches(data.focusableElements)) {
    preventDefault = false;
    if (targetEl.nodeName === "SELECT") {
      data.isTouched = false;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== targetEl && (e.pointerType === "mouse" || e.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) {
    document2.activeElement.blur();
  }
  const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
    e.preventDefault();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
    swiper.freeMode.onTouchStart();
  }
  swiper.emit("touchStart", e);
}
function onTouchMove(event) {
  const document2 = getDocument();
  const swiper = this;
  const data = swiper.touchEventsData;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && event.pointerType === "mouse") return;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  if (e.type === "pointermove") {
    if (data.touchId !== null) return;
    const id = e.pointerId;
    if (id !== data.pointerId) return;
  }
  let targetTouch;
  if (e.type === "touchmove") {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  } else {
    targetTouch = e;
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      swiper.emit("touchMoveOpposite", e);
    }
    return;
  }
  const pageX = targetTouch.pageX;
  const pageY = targetTouch.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper.allowTouchMove) {
    if (!e.target.matches(data.focusableElements)) {
      swiper.allowClick = false;
    }
    if (data.isTouched) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY
      });
      data.touchStartTime = now();
    }
    return;
  }
  if (params.touchReleaseOnEdges && !params.loop) {
    if (swiper.isVertical()) {
      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) {
      return;
    } else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) {
      return;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== e.target && e.pointerType !== "mouse") {
    document2.activeElement.blur();
  }
  if (document2.activeElement) {
    if (e.target === document2.activeElement && e.target.matches(data.focusableElements)) {
      data.isMoved = true;
      swiper.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper.emit("touchMove", e);
  }
  touches.previousX = touches.currentX;
  touches.previousY = touches.currentY;
  touches.currentX = pageX;
  touches.currentY = pageY;
  const diffX = touches.currentX - touches.startX;
  const diffY = touches.currentY - touches.startY;
  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
  if (typeof data.isScrolling === "undefined") {
    let touchAngle;
    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
      data.isScrolling = false;
    } else {
      if (diffX * diffX + diffY * diffY >= 25) {
        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
      }
    }
  }
  if (data.isScrolling) {
    swiper.emit("touchMoveOpposite", e);
  }
  if (typeof data.startMoving === "undefined") {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper.allowClick = false;
  if (!params.cssMode && e.cancelable) {
    e.preventDefault();
  }
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }
  let diff = swiper.isHorizontal() ? diffX : diffY;
  let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
  if (params.oneWayMovement) {
    diff = Math.abs(diff) * (rtl ? 1 : -1);
    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
  }
  touches.diff = diff;
  diff *= params.touchRatio;
  if (rtl) {
    diff = -diff;
    touchesDiff = -touchesDiff;
  }
  const prevTouchesDirection = swiper.touchesDirection;
  swiper.swipeDirection = diff > 0 ? "prev" : "next";
  swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
  const isLoop = swiper.params.loop && !params.cssMode;
  const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
  if (!data.isMoved) {
    if (isLoop && allowLoopFix) {
      swiper.loopFix({
        direction: swiper.swipeDirection
      });
    }
    data.startTranslate = swiper.getTranslate();
    swiper.setTransition(0);
    if (swiper.animating) {
      const evt = new window.CustomEvent("transitionend", {
        bubbles: true,
        cancelable: true,
        detail: {
          bySwiperTouchMove: true
        }
      });
      swiper.wrapperEl.dispatchEvent(evt);
    }
    data.allowMomentumBounce = false;
    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(true);
    }
    swiper.emit("sliderFirstMove", e);
  }
  (/* @__PURE__ */ new Date()).getTime();
  if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
    Object.assign(touches, {
      startX: pageX,
      startY: pageY,
      currentX: pageX,
      currentY: pageY,
      startTranslate: data.currentTranslate
    });
    data.loopSwapReset = true;
    data.startTranslate = data.currentTranslate;
    return;
  }
  swiper.emit("sliderMove", e);
  data.isMoved = true;
  data.currentTranslate = diff + data.startTranslate;
  let disableParentSwiper = true;
  let resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if (diff > 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
      swiper.loopFix({
        direction: "prev",
        setTranslate: true,
        activeSlideIndex: 0
      });
    }
    if (data.currentTranslate > swiper.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      }
    }
  } else if (diff < 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
      swiper.loopFix({
        direction: "next",
        setTranslate: true,
        activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
      });
    }
    if (data.currentTranslate < swiper.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }
    }
  }
  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }
  if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
    data.currentTranslate = data.startTranslate;
  }
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }
  if (!params.followFinger || params.cssMode) return;
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
    swiper.freeMode.onTouchMove();
  }
  swiper.updateProgress(data.currentTranslate);
  swiper.setTranslate(data.currentTranslate);
}
function onTouchEnd(event) {
  const swiper = this;
  const data = swiper.touchEventsData;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  let targetTouch;
  const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
  if (!isTouchEvent) {
    if (data.touchId !== null) return;
    if (e.pointerId !== data.pointerId) return;
    targetTouch = e;
  } else {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  }
  if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
    const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
    if (!proceed) {
      return;
    }
  }
  data.pointerId = null;
  data.touchId = null;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    slidesGrid,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (data.allowTouchCallbacks) {
    swiper.emit("touchEnd", e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) {
    if (data.isMoved && params.grabCursor) {
      swiper.setGrabCursor(false);
    }
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
    swiper.setGrabCursor(false);
  }
  const touchEndTime = now();
  const timeDiff = touchEndTime - data.touchStartTime;
  if (swiper.allowClick) {
    const pathTree = e.path || e.composedPath && e.composedPath();
    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
    swiper.emit("tap click", e);
    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
      swiper.emit("doubleTap doubleClick", e);
    }
  }
  data.lastClickTime = now();
  nextTick(() => {
    if (!swiper.destroyed) swiper.allowClick = true;
  });
  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;
  data.startMoving = false;
  let currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper.translate : -swiper.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.cssMode) {
    return;
  }
  if (params.freeMode && params.freeMode.enabled) {
    swiper.freeMode.onTouchEnd({
      currentPos
    });
    return;
  }
  const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
  let stopIndex = 0;
  let groupSize = swiper.slidesSizesGrid[0];
  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
    const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (typeof slidesGrid[i + increment2] !== "undefined") {
      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
        stopIndex = i;
        groupSize = slidesGrid[i + increment2] - slidesGrid[i];
      }
    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }
  let rewindFirstIndex = null;
  let rewindLastIndex = null;
  if (params.rewind) {
    if (swiper.isBeginning) {
      rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    } else if (swiper.isEnd) {
      rewindFirstIndex = 0;
    }
  }
  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
  if (timeDiff > params.longSwipesMs) {
    if (!params.longSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === "next") {
      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
      else swiper.slideTo(stopIndex);
    }
    if (swiper.swipeDirection === "prev") {
      if (ratio > 1 - params.longSwipesRatio) {
        swiper.slideTo(stopIndex + increment);
      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
        swiper.slideTo(rewindLastIndex);
      } else {
        swiper.slideTo(stopIndex);
      }
    }
  } else {
    if (!params.shortSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
    if (!isNavButtonTarget) {
      if (swiper.swipeDirection === "next") {
        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
      }
      if (swiper.swipeDirection === "prev") {
        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
      }
    } else if (e.target === swiper.navigation.nextEl) {
      swiper.slideTo(stopIndex + increment);
    } else {
      swiper.slideTo(stopIndex);
    }
  }
}
function onResize() {
  const swiper = this;
  const {
    params,
    el
  } = swiper;
  if (el && el.offsetWidth === 0) return;
  if (params.breakpoints) {
    swiper.setBreakpoint();
  }
  const {
    allowSlideNext,
    allowSlidePrev,
    snapGrid
  } = swiper;
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;
  swiper.updateSize();
  swiper.updateSlides();
  swiper.updateSlidesClasses();
  const isVirtualLoop = isVirtual && params.loop;
  if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
  } else {
    if (swiper.params.loop && !isVirtual) {
      swiper.slideToLoop(swiper.realIndex, 0, false, true);
    } else {
      swiper.slideTo(swiper.activeIndex, 0, false, true);
    }
  }
  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
    clearTimeout(swiper.autoplay.resizeTimeout);
    swiper.autoplay.resizeTimeout = setTimeout(() => {
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.resume();
      }
    }, 500);
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
    swiper.checkOverflow();
  }
}
function onClick(e) {
  const swiper = this;
  if (!swiper.enabled) return;
  if (!swiper.allowClick) {
    if (swiper.params.preventClicks) e.preventDefault();
    if (swiper.params.preventClicksPropagation && swiper.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}
function onScroll() {
  const swiper = this;
  const {
    wrapperEl,
    rtlTranslate,
    enabled
  } = swiper;
  if (!enabled) return;
  swiper.previousTranslate = swiper.translate;
  if (swiper.isHorizontal()) {
    swiper.translate = -wrapperEl.scrollLeft;
  } else {
    swiper.translate = -wrapperEl.scrollTop;
  }
  if (swiper.translate === 0) swiper.translate = 0;
  swiper.updateActiveIndex();
  swiper.updateSlidesClasses();
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== swiper.progress) {
    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
  }
  swiper.emit("setTranslate", swiper.translate, false);
}
function onLoad(e) {
  const swiper = this;
  processLazyPreloader(swiper, e.target);
  if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) {
    return;
  }
  swiper.update();
}
function onDocumentTouchStart() {
  const swiper = this;
  if (swiper.documentTouchHandlerProceeded) return;
  swiper.documentTouchHandlerProceeded = true;
  if (swiper.params.touchReleaseOnEdges) {
    swiper.el.style.touchAction = "auto";
  }
}
const events = (swiper, method) => {
  const document2 = getDocument();
  const {
    params,
    el,
    wrapperEl,
    device
  } = swiper;
  const capture = !!params.nested;
  const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
  const swiperMethod = method;
  if (!el || typeof el === "string") return;
  document2[domMethod]("touchstart", swiper.onDocumentTouchStart, {
    passive: false,
    capture
  });
  el[domMethod]("touchstart", swiper.onTouchStart, {
    passive: false
  });
  el[domMethod]("pointerdown", swiper.onTouchStart, {
    passive: false
  });
  document2[domMethod]("touchmove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("pointermove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("touchend", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerup", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointercancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("touchcancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerout", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerleave", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("contextmenu", swiper.onTouchEnd, {
    passive: true
  });
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]("click", swiper.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]("scroll", swiper.onScroll);
  }
  if (params.updateOnWindowResize) {
    swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
  } else {
    swiper[swiperMethod]("observerUpdate", onResize, true);
  }
  el[domMethod]("load", swiper.onLoad, {
    capture: true
  });
};
function attachEvents() {
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.onTouchStart = onTouchStart.bind(swiper);
  swiper.onTouchMove = onTouchMove.bind(swiper);
  swiper.onTouchEnd = onTouchEnd.bind(swiper);
  swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
  if (params.cssMode) {
    swiper.onScroll = onScroll.bind(swiper);
  }
  swiper.onClick = onClick.bind(swiper);
  swiper.onLoad = onLoad.bind(swiper);
  events(swiper, "on");
}
function detachEvents() {
  const swiper = this;
  events(swiper, "off");
}
var events$1 = {
  attachEvents,
  detachEvents
};
const isGridEnabled = (swiper, params) => {
  return swiper.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
  const swiper = this;
  const {
    realIndex,
    initialized,
    params,
    el
  } = swiper;
  const breakpoints2 = params.breakpoints;
  if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0) return;
  const document2 = getDocument();
  const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
  const breakpointContainer = ["window", "container"].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document2.querySelector(params.breakpointsBase);
  const breakpoint = swiper.getBreakpoint(breakpoints2, breakpointsBase, breakpointContainer);
  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
  const breakpointOnlyParams = breakpoint in breakpoints2 ? breakpoints2[breakpoint] : void 0;
  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
  const wasMultiRow = isGridEnabled(swiper, params);
  const isMultiRow = isGridEnabled(swiper, breakpointParams);
  const wasGrabCursor = swiper.params.grabCursor;
  const isGrabCursor = breakpointParams.grabCursor;
  const wasEnabled = params.enabled;
  if (wasMultiRow && !isMultiRow) {
    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
    swiper.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    el.classList.add(`${params.containerModifierClass}grid`);
    if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
      el.classList.add(`${params.containerModifierClass}grid-column`);
    }
    swiper.emitContainerClasses();
  }
  if (wasGrabCursor && !isGrabCursor) {
    swiper.unsetGrabCursor();
  } else if (!wasGrabCursor && isGrabCursor) {
    swiper.setGrabCursor();
  }
  ["navigation", "pagination", "scrollbar"].forEach((prop) => {
    if (typeof breakpointParams[prop] === "undefined") return;
    const wasModuleEnabled = params[prop] && params[prop].enabled;
    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
    if (wasModuleEnabled && !isModuleEnabled) {
      swiper[prop].disable();
    }
    if (!wasModuleEnabled && isModuleEnabled) {
      swiper[prop].enable();
    }
  });
  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
  const wasLoop = params.loop;
  if (directionChanged && initialized) {
    swiper.changeDirection();
  }
  extend(swiper.params, breakpointParams);
  const isEnabled = swiper.params.enabled;
  const hasLoop = swiper.params.loop;
  Object.assign(swiper, {
    allowTouchMove: swiper.params.allowTouchMove,
    allowSlideNext: swiper.params.allowSlideNext,
    allowSlidePrev: swiper.params.allowSlidePrev
  });
  if (wasEnabled && !isEnabled) {
    swiper.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper.enable();
  }
  swiper.currentBreakpoint = breakpoint;
  swiper.emit("_beforeBreakpoint", breakpointParams);
  if (initialized) {
    if (needsReLoop) {
      swiper.loopDestroy();
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (!wasLoop && hasLoop) {
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (wasLoop && !hasLoop) {
      swiper.loopDestroy();
    }
  }
  swiper.emit("breakpoint", breakpointParams);
}
function getBreakpoint(breakpoints2, base, containerEl) {
  if (base === void 0) {
    base = "window";
  }
  if (!breakpoints2 || base === "container" && !containerEl) return void 0;
  let breakpoint = false;
  const window2 = getWindow();
  const currentHeight = base === "window" ? window2.innerHeight : containerEl.clientHeight;
  const points = Object.keys(breakpoints2).map((point) => {
    if (typeof point === "string" && point.indexOf("@") === 0) {
      const minRatio = parseFloat(point.substr(1));
      const value = currentHeight * minRatio;
      return {
        value,
        point
      };
    }
    return {
      value: point,
      point
    };
  });
  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  for (let i = 0; i < points.length; i += 1) {
    const {
      point,
      value
    } = points[i];
    if (base === "window") {
      if (window2.matchMedia(`(min-width: ${value}px)`).matches) {
        breakpoint = point;
      }
    } else if (value <= containerEl.clientWidth) {
      breakpoint = point;
    }
  }
  return breakpoint || "max";
}
var breakpoints = {
  setBreakpoint,
  getBreakpoint
};
function prepareClasses(entries, prefix) {
  const resultClasses = [];
  entries.forEach((item) => {
    if (typeof item === "object") {
      Object.keys(item).forEach((classNames) => {
        if (item[classNames]) {
          resultClasses.push(prefix + classNames);
        }
      });
    } else if (typeof item === "string") {
      resultClasses.push(prefix + item);
    }
  });
  return resultClasses;
}
function addClasses() {
  const swiper = this;
  const {
    classNames,
    params,
    rtl,
    el,
    device
  } = swiper;
  const suffixes = prepareClasses(["initialized", params.direction, {
    "free-mode": swiper.params.freeMode && params.freeMode.enabled
  }, {
    "autoheight": params.autoHeight
  }, {
    "rtl": rtl
  }, {
    "grid": params.grid && params.grid.rows > 1
  }, {
    "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
  }, {
    "android": device.android
  }, {
    "ios": device.ios
  }, {
    "css-mode": params.cssMode
  }, {
    "centered": params.cssMode && params.centeredSlides
  }, {
    "watch-progress": params.watchSlidesProgress
  }], params.containerModifierClass);
  classNames.push(...suffixes);
  el.classList.add(...classNames);
  swiper.emitContainerClasses();
}
function removeClasses() {
  const swiper = this;
  const {
    el,
    classNames
  } = swiper;
  if (!el || typeof el === "string") return;
  el.classList.remove(...classNames);
  swiper.emitContainerClasses();
}
var classes = {
  addClasses,
  removeClasses
};
function checkOverflow() {
  const swiper = this;
  const {
    isLocked: wasLocked,
    params
  } = swiper;
  const {
    slidesOffsetBefore
  } = params;
  if (slidesOffsetBefore) {
    const lastSlideIndex = swiper.slides.length - 1;
    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
    swiper.isLocked = swiper.size > lastSlideRightEdge;
  } else {
    swiper.isLocked = swiper.snapGrid.length === 1;
  }
  if (params.allowSlideNext === true) {
    swiper.allowSlideNext = !swiper.isLocked;
  }
  if (params.allowSlidePrev === true) {
    swiper.allowSlidePrev = !swiper.isLocked;
  }
  if (wasLocked && wasLocked !== swiper.isLocked) {
    swiper.isEnd = false;
  }
  if (wasLocked !== swiper.isLocked) {
    swiper.emit(swiper.isLocked ? "lock" : "unlock");
  }
}
var checkOverflow$1 = {
  checkOverflow
};
var defaults = {
  init: true,
  direction: "horizontal",
  oneWayMovement: false,
  swiperElementNodeName: "SWIPER-CONTAINER",
  touchEventsTarget: "wrapper",
  initialSlide: 0,
  speed: 300,
  cssMode: false,
  updateOnWindowResize: true,
  resizeObserver: true,
  nested: false,
  createElements: false,
  eventsPrefix: "swiper",
  enabled: true,
  focusableElements: "input, select, option, textarea, button, video, label",
  // Overrides
  width: null,
  height: null,
  //
  preventInteractionOnTransition: false,
  // ssr
  userAgent: null,
  url: null,
  // To support iOS's swipe-to-go-back gesture (when being used in-app).
  edgeSwipeDetection: false,
  edgeSwipeThreshold: 20,
  // Autoheight
  autoHeight: false,
  // Set wrapper width
  setWrapperSize: false,
  // Virtual Translate
  virtualTranslate: false,
  // Effects
  effect: "slide",
  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
  // Breakpoints
  breakpoints: void 0,
  breakpointsBase: "window",
  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerGroupSkip: 0,
  slidesPerGroupAuto: false,
  centeredSlides: false,
  centeredSlidesBounds: false,
  slidesOffsetBefore: 0,
  // in px
  slidesOffsetAfter: 0,
  // in px
  normalizeSlideIndex: true,
  centerInsufficientSlides: false,
  // Disable swiper and hide navigation when container not overflow
  watchOverflow: true,
  // Round length
  roundLengths: false,
  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchMoveStopPropagation: false,
  touchStartPreventDefault: true,
  touchStartForcePreventDefault: false,
  touchReleaseOnEdges: false,
  // Unique Navigation Elements
  uniqueNavElements: true,
  // Resistance
  resistance: true,
  resistanceRatio: 0.85,
  // Progress
  watchSlidesProgress: false,
  // Cursor
  grabCursor: false,
  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,
  // loop
  loop: false,
  loopAddBlankSlides: true,
  loopAdditionalSlides: 0,
  loopPreventsSliding: true,
  // rewind
  rewind: false,
  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null,
  // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: "swiper-no-swiping",
  noSwipingSelector: null,
  // Passive Listeners
  passiveListeners: true,
  maxBackfaceHiddenSlides: 10,
  // NS
  containerModifierClass: "swiper-",
  // NEW
  slideClass: "swiper-slide",
  slideBlankClass: "swiper-slide-blank",
  slideActiveClass: "swiper-slide-active",
  slideVisibleClass: "swiper-slide-visible",
  slideFullyVisibleClass: "swiper-slide-fully-visible",
  slideNextClass: "swiper-slide-next",
  slidePrevClass: "swiper-slide-prev",
  wrapperClass: "swiper-wrapper",
  lazyPreloaderClass: "swiper-lazy-preloader",
  lazyPreloadPrevNext: 0,
  // Callbacks
  runCallbacksOnInit: true,
  // Internals
  _emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
  return function extendParams(obj) {
    if (obj === void 0) {
      obj = {};
    }
    const moduleParamName = Object.keys(obj)[0];
    const moduleParams = obj[moduleParamName];
    if (typeof moduleParams !== "object" || moduleParams === null) {
      extend(allModulesParams, obj);
      return;
    }
    if (params[moduleParamName] === true) {
      params[moduleParamName] = {
        enabled: true
      };
    }
    if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
      params[moduleParamName].auto = true;
    }
    if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
      params[moduleParamName].auto = true;
    }
    if (!(moduleParamName in params && "enabled" in moduleParams)) {
      extend(allModulesParams, obj);
      return;
    }
    if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
      params[moduleParamName].enabled = true;
    }
    if (!params[moduleParamName]) params[moduleParamName] = {
      enabled: false
    };
    extend(allModulesParams, obj);
  };
}
const prototypes = {
  eventsEmitter,
  update,
  translate,
  transition,
  slide,
  loop,
  grabCursor,
  events: events$1,
  breakpoints,
  checkOverflow: checkOverflow$1,
  classes
};
const extendedDefaults = {};
class Swiper {
  constructor() {
    let el;
    let params;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
      params = args[0];
    } else {
      [el, params] = args;
    }
    if (!params) params = {};
    params = extend({}, params);
    if (el && !params.el) params.el = el;
    const document2 = getDocument();
    if (params.el && typeof params.el === "string" && document2.querySelectorAll(params.el).length > 1) {
      const swipers = [];
      document2.querySelectorAll(params.el).forEach((containerEl) => {
        const newParams = extend({}, params, {
          el: containerEl
        });
        swipers.push(new Swiper(newParams));
      });
      return swipers;
    }
    const swiper = this;
    swiper.__swiper__ = true;
    swiper.support = getSupport();
    swiper.device = getDevice({
      userAgent: params.userAgent
    });
    swiper.browser = getBrowser();
    swiper.eventsListeners = {};
    swiper.eventsAnyListeners = [];
    swiper.modules = [...swiper.__modules__];
    if (params.modules && Array.isArray(params.modules)) {
      swiper.modules.push(...params.modules);
    }
    const allModulesParams = {};
    swiper.modules.forEach((mod) => {
      mod({
        params,
        swiper,
        extendParams: moduleExtendParams(params, allModulesParams),
        on: swiper.on.bind(swiper),
        once: swiper.once.bind(swiper),
        off: swiper.off.bind(swiper),
        emit: swiper.emit.bind(swiper)
      });
    });
    const swiperParams = extend({}, defaults, allModulesParams);
    swiper.params = extend({}, swiperParams, extendedDefaults, params);
    swiper.originalParams = extend({}, swiper.params);
    swiper.passedParams = extend({}, params);
    if (swiper.params && swiper.params.on) {
      Object.keys(swiper.params.on).forEach((eventName) => {
        swiper.on(eventName, swiper.params.on[eventName]);
      });
    }
    if (swiper.params && swiper.params.onAny) {
      swiper.onAny(swiper.params.onAny);
    }
    Object.assign(swiper, {
      enabled: swiper.params.enabled,
      el,
      // Classes
      classNames: [],
      // Slides
      slides: [],
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],
      // isDirection
      isHorizontal() {
        return swiper.params.direction === "horizontal";
      },
      isVertical() {
        return swiper.params.direction === "vertical";
      },
      // Indexes
      activeIndex: 0,
      realIndex: 0,
      //
      isBeginning: true,
      isEnd: false,
      // Props
      translate: 0,
      previousTranslate: 0,
      progress: 0,
      velocity: 0,
      animating: false,
      cssOverflowAdjustment() {
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
      },
      // Locks
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,
      // Touch Events
      touchEventsData: {
        isTouched: void 0,
        isMoved: void 0,
        allowTouchCallbacks: void 0,
        touchStartTime: void 0,
        isScrolling: void 0,
        currentTranslate: void 0,
        startTranslate: void 0,
        allowThresholdMove: void 0,
        // Form elements to match
        focusableElements: swiper.params.focusableElements,
        // Last click time
        lastClickTime: 0,
        clickTimeout: void 0,
        // Velocities
        velocities: [],
        allowMomentumBounce: void 0,
        startMoving: void 0,
        pointerId: null,
        touchId: null
      },
      // Clicks
      allowClick: true,
      // Touches
      allowTouchMove: swiper.params.allowTouchMove,
      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      },
      // Images
      imagesToLoad: [],
      imagesLoaded: 0
    });
    swiper.emit("_swiper");
    if (swiper.params.init) {
      swiper.init();
    }
    return swiper;
  }
  getDirectionLabel(property) {
    if (this.isHorizontal()) {
      return property;
    }
    return {
      "width": "height",
      "margin-top": "margin-left",
      "margin-bottom ": "margin-right",
      "margin-left": "margin-top",
      "margin-right": "margin-bottom",
      "padding-left": "padding-top",
      "padding-right": "padding-bottom",
      "marginRight": "marginBottom"
    }[property];
  }
  getSlideIndex(slideEl) {
    const {
      slidesEl,
      params
    } = this;
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const firstSlideIndex = elementIndex(slides[0]);
    return elementIndex(slideEl) - firstSlideIndex;
  }
  getSlideIndexByData(index) {
    return this.getSlideIndex(this.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index));
  }
  getSlideIndexWhenGrid(index) {
    if (this.grid && this.params.grid && this.params.grid.rows > 1) {
      if (this.params.grid.fill === "column") {
        index = Math.floor(index / this.params.grid.rows);
      } else if (this.params.grid.fill === "row") {
        index = index % Math.ceil(this.slides.length / this.params.grid.rows);
      }
    }
    return index;
  }
  recalcSlides() {
    const swiper = this;
    const {
      slidesEl,
      params
    } = swiper;
    swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
  }
  enable() {
    const swiper = this;
    if (swiper.enabled) return;
    swiper.enabled = true;
    if (swiper.params.grabCursor) {
      swiper.setGrabCursor();
    }
    swiper.emit("enable");
  }
  disable() {
    const swiper = this;
    if (!swiper.enabled) return;
    swiper.enabled = false;
    if (swiper.params.grabCursor) {
      swiper.unsetGrabCursor();
    }
    swiper.emit("disable");
  }
  setProgress(progress, speed) {
    const swiper = this;
    progress = Math.min(Math.max(progress, 0), 1);
    const min = swiper.minTranslate();
    const max = swiper.maxTranslate();
    const current = (max - min) * progress + min;
    swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  emitContainerClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const cls = swiper.el.className.split(" ").filter((className) => {
      return className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
    });
    swiper.emit("_containerClasses", cls.join(" "));
  }
  getSlideClasses(slideEl) {
    const swiper = this;
    if (swiper.destroyed) return "";
    return slideEl.className.split(" ").filter((className) => {
      return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0;
    }).join(" ");
  }
  emitSlidesClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const updates = [];
    swiper.slides.forEach((slideEl) => {
      const classNames = swiper.getSlideClasses(slideEl);
      updates.push({
        slideEl,
        classNames
      });
      swiper.emit("_slideClass", slideEl, classNames);
    });
    swiper.emit("_slideClasses", updates);
  }
  slidesPerViewDynamic(view, exact) {
    if (view === void 0) {
      view = "current";
    }
    if (exact === void 0) {
      exact = false;
    }
    const swiper = this;
    const {
      params,
      slides,
      slidesGrid,
      slidesSizesGrid,
      size: swiperSize,
      activeIndex
    } = swiper;
    let spv = 1;
    if (typeof params.slidesPerView === "number") return params.slidesPerView;
    if (params.centeredSlides) {
      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
      let breakLoop;
      for (let i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += Math.ceil(slides[i].swiperSlideSize);
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
      for (let i = activeIndex - 1; i >= 0; i -= 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
    } else {
      if (view === "current") {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
    }
    return spv;
  }
  update() {
    const swiper = this;
    if (!swiper || swiper.destroyed) return;
    const {
      snapGrid,
      params
    } = swiper;
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }
    [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      }
    });
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateProgress();
    swiper.updateSlidesClasses();
    function setTranslate2() {
      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    let translated;
    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
      setTranslate2();
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
        const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
        translated = swiper.slideTo(slides.length - 1, 0, false, true);
      } else {
        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate2();
      }
    }
    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
      swiper.checkOverflow();
    }
    swiper.emit("update");
  }
  changeDirection(newDirection, needUpdate) {
    if (needUpdate === void 0) {
      needUpdate = true;
    }
    const swiper = this;
    const currentDirection = swiper.params.direction;
    if (!newDirection) {
      newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
    }
    if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
      return swiper;
    }
    swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
    swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
    swiper.emitContainerClasses();
    swiper.params.direction = newDirection;
    swiper.slides.forEach((slideEl) => {
      if (newDirection === "vertical") {
        slideEl.style.width = "";
      } else {
        slideEl.style.height = "";
      }
    });
    swiper.emit("changeDirection");
    if (needUpdate) swiper.update();
    return swiper;
  }
  changeLanguageDirection(direction) {
    const swiper = this;
    if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
    swiper.rtl = direction === "rtl";
    swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
    if (swiper.rtl) {
      swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "rtl";
    } else {
      swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "ltr";
    }
    swiper.update();
  }
  mount(element) {
    const swiper = this;
    if (swiper.mounted) return true;
    let el = element || swiper.params.el;
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) {
      return false;
    }
    el.swiper = swiper;
    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
      swiper.isElement = true;
    }
    const getWrapperSelector = () => {
      return `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
    };
    const getWrapper = () => {
      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
        const res = el.shadowRoot.querySelector(getWrapperSelector());
        return res;
      }
      return elementChildren(el, getWrapperSelector())[0];
    };
    let wrapperEl = getWrapper();
    if (!wrapperEl && swiper.params.createElements) {
      wrapperEl = createElement("div", swiper.params.wrapperClass);
      el.append(wrapperEl);
      elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
        wrapperEl.append(slideEl);
      });
    }
    Object.assign(swiper, {
      el,
      wrapperEl,
      slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
      hostEl: swiper.isElement ? el.parentNode.host : el,
      mounted: true,
      // RTL
      rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
      rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
      wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
    });
    return true;
  }
  init(el) {
    const swiper = this;
    if (swiper.initialized) return swiper;
    const mounted = swiper.mount(el);
    if (mounted === false) return swiper;
    swiper.emit("beforeInit");
    if (swiper.params.breakpoints) {
      swiper.setBreakpoint();
    }
    swiper.addClasses();
    swiper.updateSize();
    swiper.updateSlides();
    if (swiper.params.watchOverflow) {
      swiper.checkOverflow();
    }
    if (swiper.params.grabCursor && swiper.enabled) {
      swiper.setGrabCursor();
    }
    if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
      swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
    } else {
      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
    }
    if (swiper.params.loop) {
      swiper.loopCreate(void 0, true);
    }
    swiper.attachEvents();
    const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
    if (swiper.isElement) {
      lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
    }
    lazyElements.forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      } else {
        imageEl.addEventListener("load", (e) => {
          processLazyPreloader(swiper, e.target);
        });
      }
    });
    preload(swiper);
    swiper.initialized = true;
    preload(swiper);
    swiper.emit("init");
    swiper.emit("afterInit");
    return swiper;
  }
  destroy(deleteInstance, cleanStyles) {
    if (deleteInstance === void 0) {
      deleteInstance = true;
    }
    if (cleanStyles === void 0) {
      cleanStyles = true;
    }
    const swiper = this;
    const {
      params,
      el,
      wrapperEl,
      slides
    } = swiper;
    if (typeof swiper.params === "undefined" || swiper.destroyed) {
      return null;
    }
    swiper.emit("beforeDestroy");
    swiper.initialized = false;
    swiper.detachEvents();
    if (params.loop) {
      swiper.loopDestroy();
    }
    if (cleanStyles) {
      swiper.removeClasses();
      if (el && typeof el !== "string") {
        el.removeAttribute("style");
      }
      if (wrapperEl) {
        wrapperEl.removeAttribute("style");
      }
      if (slides && slides.length) {
        slides.forEach((slideEl) => {
          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
          slideEl.removeAttribute("style");
          slideEl.removeAttribute("data-swiper-slide-index");
        });
      }
    }
    swiper.emit("destroy");
    Object.keys(swiper.eventsListeners).forEach((eventName) => {
      swiper.off(eventName);
    });
    if (deleteInstance !== false) {
      if (swiper.el && typeof swiper.el !== "string") {
        swiper.el.swiper = null;
      }
      deleteProps(swiper);
    }
    swiper.destroyed = true;
    return null;
  }
  static extendDefaults(newDefaults) {
    extend(extendedDefaults, newDefaults);
  }
  static get extendedDefaults() {
    return extendedDefaults;
  }
  static get defaults() {
    return defaults;
  }
  static installModule(mod) {
    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
    const modules = Swiper.prototype.__modules__;
    if (typeof mod === "function" && modules.indexOf(mod) < 0) {
      modules.push(mod);
    }
  }
  static use(module) {
    if (Array.isArray(module)) {
      module.forEach((m) => Swiper.installModule(m));
      return Swiper;
    }
    Swiper.installModule(module);
    return Swiper;
  }
}
Object.keys(prototypes).forEach((prototypeGroup) => {
  Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
  });
});
Swiper.use([Resize, Observer]);
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
function Navigation(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  extendParams({
    navigation: {
      nextEl: null,
      prevEl: null,
      hideOnClick: false,
      disabledClass: "swiper-button-disabled",
      hiddenClass: "swiper-button-hidden",
      lockClass: "swiper-button-lock",
      navigationDisabledClass: "swiper-navigation-disabled"
    }
  });
  swiper.navigation = {
    nextEl: null,
    prevEl: null
  };
  function getEl(el) {
    let res;
    if (el && typeof el === "string" && swiper.isElement) {
      res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
      if (res) return res;
    }
    if (el) {
      if (typeof el === "string") res = [...document.querySelectorAll(el)];
      if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
        res = swiper.el.querySelector(el);
      } else if (res && res.length === 1) {
        res = res[0];
      }
    }
    if (el && !res) return el;
    return res;
  }
  function toggleEl(el, disabled) {
    const params = swiper.params.navigation;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (subEl) {
        subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
        if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
        if (swiper.params.watchOverflow && swiper.enabled) {
          subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
        }
      }
    });
  }
  function update2() {
    const {
      nextEl,
      prevEl
    } = swiper.navigation;
    if (swiper.params.loop) {
      toggleEl(prevEl, false);
      toggleEl(nextEl, false);
      return;
    }
    toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
    toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
  }
  function onPrevClick(e) {
    e.preventDefault();
    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slidePrev();
    emit("navigationPrev");
  }
  function onNextClick(e) {
    e.preventDefault();
    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slideNext();
    emit("navigationNext");
  }
  function init() {
    const params = swiper.params.navigation;
    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
      nextEl: "swiper-button-next",
      prevEl: "swiper-button-prev"
    });
    if (!(params.nextEl || params.prevEl)) return;
    let nextEl = getEl(params.nextEl);
    let prevEl = getEl(params.prevEl);
    Object.assign(swiper.navigation, {
      nextEl,
      prevEl
    });
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const initButton = (el, dir) => {
      if (el) {
        el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      }
      if (!swiper.enabled && el) {
        el.classList.add(...params.lockClass.split(" "));
      }
    };
    nextEl.forEach((el) => initButton(el, "next"));
    prevEl.forEach((el) => initButton(el, "prev"));
  }
  function destroy() {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const destroyButton = (el, dir) => {
      el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
    };
    nextEl.forEach((el) => destroyButton(el, "next"));
    prevEl.forEach((el) => destroyButton(el, "prev"));
  }
  on("init", () => {
    if (swiper.params.navigation.enabled === false) {
      disable();
    } else {
      init();
      update2();
    }
  });
  on("toEdge fromEdge lock unlock", () => {
    update2();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    if (swiper.enabled) {
      update2();
      return;
    }
    [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper.params.navigation.lockClass));
  });
  on("click", (_s, e) => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const targetEl = e.target;
    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
    if (swiper.isElement && !targetIsButton) {
      const path = e.path || e.composedPath && e.composedPath();
      if (path) {
        targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
      }
    }
    if (swiper.params.navigation.hideOnClick && !targetIsButton) {
      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
      let isHidden;
      if (nextEl.length) {
        isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      } else if (prevEl.length) {
        isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      }
      if (isHidden === true) {
        emit("navigationShow");
      } else {
        emit("navigationHide");
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper.params.navigation.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
    init();
    update2();
  };
  const disable = () => {
    swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
    destroy();
  };
  Object.assign(swiper.navigation, {
    enable,
    disable,
    update: update2,
    init,
    destroy
  });
}
function classesToSelector(classes2) {
  if (classes2 === void 0) {
    classes2 = "";
  }
  return `.${classes2.trim().replace(/([\.:!+\/()[\]])/g, "\\$1").replace(/ /g, ".")}`;
}
function Pagination(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const pfx = "swiper-pagination";
  extendParams({
    pagination: {
      el: null,
      bulletElement: "span",
      clickable: false,
      hideOnClick: false,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      progressbarOpposite: false,
      type: "bullets",
      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
      dynamicBullets: false,
      dynamicMainBullets: 1,
      formatFractionCurrent: (number) => number,
      formatFractionTotal: (number) => number,
      bulletClass: `${pfx}-bullet`,
      bulletActiveClass: `${pfx}-bullet-active`,
      modifierClass: `${pfx}-`,
      currentClass: `${pfx}-current`,
      totalClass: `${pfx}-total`,
      hiddenClass: `${pfx}-hidden`,
      progressbarFillClass: `${pfx}-progressbar-fill`,
      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
      clickableClass: `${pfx}-clickable`,
      lockClass: `${pfx}-lock`,
      horizontalClass: `${pfx}-horizontal`,
      verticalClass: `${pfx}-vertical`,
      paginationDisabledClass: `${pfx}-disabled`
    }
  });
  swiper.pagination = {
    el: null,
    bullets: []
  };
  let bulletSize;
  let dynamicBulletIndex = 0;
  function isPaginationDisabled() {
    return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
  }
  function setSideBullets(bulletEl, position) {
    const {
      bulletActiveClass
    } = swiper.params.pagination;
    if (!bulletEl) return;
    bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
    if (bulletEl) {
      bulletEl.classList.add(`${bulletActiveClass}-${position}`);
      bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
      if (bulletEl) {
        bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
      }
    }
  }
  function getMoveDirection(prevIndex, nextIndex, length) {
    prevIndex = prevIndex % length;
    nextIndex = nextIndex % length;
    if (nextIndex === prevIndex + 1) {
      return "next";
    } else if (nextIndex === prevIndex - 1) {
      return "previous";
    }
    return;
  }
  function onBulletClick(e) {
    const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
    if (!bulletEl) {
      return;
    }
    e.preventDefault();
    const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
    if (swiper.params.loop) {
      if (swiper.realIndex === index) return;
      const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
      if (moveDirection === "next") {
        swiper.slideNext();
      } else if (moveDirection === "previous") {
        swiper.slidePrev();
      } else {
        swiper.slideToLoop(index);
      }
    } else {
      swiper.slideTo(index);
    }
  }
  function update2() {
    const rtl = swiper.rtl;
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let current;
    let previousIndex;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
    const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
    if (swiper.params.loop) {
      previousIndex = swiper.previousRealIndex || 0;
      current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
    } else if (typeof swiper.snapIndex !== "undefined") {
      current = swiper.snapIndex;
      previousIndex = swiper.previousSnapIndex;
    } else {
      previousIndex = swiper.previousIndex || 0;
      current = swiper.activeIndex || 0;
    }
    if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
      const bullets = swiper.pagination.bullets;
      let firstIndex;
      let lastIndex;
      let midIndex;
      if (params.dynamicBullets) {
        bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height");
        el.forEach((subEl) => {
          subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
        });
        if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
          dynamicBulletIndex += current - (previousIndex || 0);
          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
            dynamicBulletIndex = params.dynamicMainBullets - 1;
          } else if (dynamicBulletIndex < 0) {
            dynamicBulletIndex = 0;
          }
        }
        firstIndex = Math.max(current - dynamicBulletIndex, 0);
        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
        midIndex = (lastIndex + firstIndex) / 2;
      }
      bullets.forEach((bulletEl) => {
        const classesToRemove = [...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map((suffix) => `${params.bulletActiveClass}${suffix}`)].map((s) => typeof s === "string" && s.includes(" ") ? s.split(" ") : s).flat();
        bulletEl.classList.remove(...classesToRemove);
      });
      if (el.length > 1) {
        bullets.forEach((bullet) => {
          const bulletIndex = elementIndex(bullet);
          if (bulletIndex === current) {
            bullet.classList.add(...params.bulletActiveClass.split(" "));
          } else if (swiper.isElement) {
            bullet.setAttribute("part", "bullet");
          }
          if (params.dynamicBullets) {
            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
              bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
            if (bulletIndex === firstIndex) {
              setSideBullets(bullet, "prev");
            }
            if (bulletIndex === lastIndex) {
              setSideBullets(bullet, "next");
            }
          }
        });
      } else {
        const bullet = bullets[current];
        if (bullet) {
          bullet.classList.add(...params.bulletActiveClass.split(" "));
        }
        if (swiper.isElement) {
          bullets.forEach((bulletEl, bulletIndex) => {
            bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
          });
        }
        if (params.dynamicBullets) {
          const firstDisplayedBullet = bullets[firstIndex];
          const lastDisplayedBullet = bullets[lastIndex];
          for (let i = firstIndex; i <= lastIndex; i += 1) {
            if (bullets[i]) {
              bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
          }
          setSideBullets(firstDisplayedBullet, "prev");
          setSideBullets(lastDisplayedBullet, "next");
        }
      }
      if (params.dynamicBullets) {
        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
        const offsetProp = rtl ? "right" : "left";
        bullets.forEach((bullet) => {
          bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
        });
      }
    }
    el.forEach((subEl, subElIndex) => {
      if (params.type === "fraction") {
        subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach((fractionEl) => {
          fractionEl.textContent = params.formatFractionCurrent(current + 1);
        });
        subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach((totalEl) => {
          totalEl.textContent = params.formatFractionTotal(total);
        });
      }
      if (params.type === "progressbar") {
        let progressbarDirection;
        if (params.progressbarOpposite) {
          progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal";
        } else {
          progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
        }
        const scale = (current + 1) / total;
        let scaleX = 1;
        let scaleY = 1;
        if (progressbarDirection === "horizontal") {
          scaleX = scale;
        } else {
          scaleY = scale;
        }
        subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach((progressEl) => {
          progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
          progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
        });
      }
      if (params.type === "custom" && params.renderCustom) {
        setInnerHTML(subEl, params.renderCustom(swiper, current + 1, total));
        if (subElIndex === 0) emit("paginationRender", subEl);
      } else {
        if (subElIndex === 0) emit("paginationRender", subEl);
        emit("paginationUpdate", subEl);
      }
      if (swiper.params.watchOverflow && swiper.enabled) {
        subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
      }
    });
  }
  function render() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let paginationHTML = "";
    if (params.type === "bullets") {
      let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
        numberOfBullets = slidesLength;
      }
      for (let i = 0; i < numberOfBullets; i += 1) {
        if (params.renderBullet) {
          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
        } else {
          paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
        }
      }
    }
    if (params.type === "fraction") {
      if (params.renderFraction) {
        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
      } else {
        paginationHTML = `<span class="${params.currentClass}"></span> / <span class="${params.totalClass}"></span>`;
      }
    }
    if (params.type === "progressbar") {
      if (params.renderProgressbar) {
        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
      } else {
        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
      }
    }
    swiper.pagination.bullets = [];
    el.forEach((subEl) => {
      if (params.type !== "custom") {
        setInnerHTML(subEl, paginationHTML || "");
      }
      if (params.type === "bullets") {
        swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
      }
    });
    if (params.type !== "custom") {
      emit("paginationRender", el[0]);
    }
  }
  function init() {
    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
      el: "swiper-pagination"
    });
    const params = swiper.params.pagination;
    if (!params.el) return;
    let el;
    if (typeof params.el === "string" && swiper.isElement) {
      el = swiper.el.querySelector(params.el);
    }
    if (!el && typeof params.el === "string") {
      el = [...document.querySelectorAll(params.el)];
    }
    if (!el) {
      el = params.el;
    }
    if (!el || el.length === 0) return;
    if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
      el = [...swiper.el.querySelectorAll(params.el)];
      if (el.length > 1) {
        el = el.find((subEl) => {
          if (elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
          return true;
        });
      }
    }
    if (Array.isArray(el) && el.length === 1) el = el[0];
    Object.assign(swiper.pagination, {
      el
    });
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (params.type === "bullets" && params.clickable) {
        subEl.classList.add(...(params.clickableClass || "").split(" "));
      }
      subEl.classList.add(params.modifierClass + params.type);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
      if (params.type === "bullets" && params.dynamicBullets) {
        subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
        dynamicBulletIndex = 0;
        if (params.dynamicMainBullets < 1) {
          params.dynamicMainBullets = 1;
        }
      }
      if (params.type === "progressbar" && params.progressbarOpposite) {
        subEl.classList.add(params.progressbarOppositeClass);
      }
      if (params.clickable) {
        subEl.addEventListener("click", onBulletClick);
      }
      if (!swiper.enabled) {
        subEl.classList.add(params.lockClass);
      }
    });
  }
  function destroy() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => {
        subEl.classList.remove(params.hiddenClass);
        subEl.classList.remove(params.modifierClass + params.type);
        subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (params.clickable) {
          subEl.classList.remove(...(params.clickableClass || "").split(" "));
          subEl.removeEventListener("click", onBulletClick);
        }
      });
    }
    if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl) => subEl.classList.remove(...params.bulletActiveClass.split(" ")));
  }
  on("changeDirection", () => {
    if (!swiper.pagination || !swiper.pagination.el) return;
    const params = swiper.params.pagination;
    let {
      el
    } = swiper.pagination;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      subEl.classList.remove(params.horizontalClass, params.verticalClass);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    });
  });
  on("init", () => {
    if (swiper.params.pagination.enabled === false) {
      disable();
    } else {
      init();
      render();
      update2();
    }
  });
  on("activeIndexChange", () => {
    if (typeof swiper.snapIndex === "undefined") {
      update2();
    }
  });
  on("snapIndexChange", () => {
    update2();
  });
  on("snapGridLengthChange", () => {
    render();
    update2();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass));
    }
  });
  on("lock unlock", () => {
    update2();
  });
  on("click", (_s, e) => {
    const targetEl = e.target;
    const el = makeElementsArray(swiper.pagination.el);
    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
      const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
      if (isHidden === true) {
        emit("paginationShow");
      } else {
        emit("paginationHide");
      }
      el.forEach((subEl) => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
    }
    init();
    render();
    update2();
  };
  const disable = () => {
    swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
    }
    destroy();
  };
  Object.assign(swiper.pagination, {
    enable,
    disable,
    render,
    update: update2,
    init,
    destroy
  });
}
function Parallax(_ref) {
  let {
    swiper,
    extendParams,
    on
  } = _ref;
  extendParams({
    parallax: {
      enabled: false
    }
  });
  const elementsSelector = "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]";
  const setTransform = (el, progress) => {
    const {
      rtl
    } = swiper;
    const rtlFactor = rtl ? -1 : 1;
    const p = el.getAttribute("data-swiper-parallax") || "0";
    let x = el.getAttribute("data-swiper-parallax-x");
    let y = el.getAttribute("data-swiper-parallax-y");
    const scale = el.getAttribute("data-swiper-parallax-scale");
    const opacity = el.getAttribute("data-swiper-parallax-opacity");
    const rotate = el.getAttribute("data-swiper-parallax-rotate");
    if (x || y) {
      x = x || "0";
      y = y || "0";
    } else if (swiper.isHorizontal()) {
      x = p;
      y = "0";
    } else {
      y = p;
      x = "0";
    }
    if (x.indexOf("%") >= 0) {
      x = `${parseInt(x, 10) * progress * rtlFactor}%`;
    } else {
      x = `${x * progress * rtlFactor}px`;
    }
    if (y.indexOf("%") >= 0) {
      y = `${parseInt(y, 10) * progress}%`;
    } else {
      y = `${y * progress}px`;
    }
    if (typeof opacity !== "undefined" && opacity !== null) {
      const currentOpacity = opacity - (opacity - 1) * (1 - Math.abs(progress));
      el.style.opacity = currentOpacity;
    }
    let transform = `translate3d(${x}, ${y}, 0px)`;
    if (typeof scale !== "undefined" && scale !== null) {
      const currentScale = scale - (scale - 1) * (1 - Math.abs(progress));
      transform += ` scale(${currentScale})`;
    }
    if (rotate && typeof rotate !== "undefined" && rotate !== null) {
      const currentRotate = rotate * progress * -1;
      transform += ` rotate(${currentRotate}deg)`;
    }
    el.style.transform = transform;
  };
  const setTranslate2 = () => {
    const {
      el,
      slides,
      progress,
      snapGrid,
      isElement
    } = swiper;
    const elements = elementChildren(el, elementsSelector);
    if (swiper.isElement) {
      elements.push(...elementChildren(swiper.hostEl, elementsSelector));
    }
    elements.forEach((subEl) => {
      setTransform(subEl, progress);
    });
    slides.forEach((slideEl, slideIndex) => {
      let slideProgress = slideEl.progress;
      if (swiper.params.slidesPerGroup > 1 && swiper.params.slidesPerView !== "auto") {
        slideProgress += Math.ceil(slideIndex / 2) - progress * (snapGrid.length - 1);
      }
      slideProgress = Math.min(Math.max(slideProgress, -1), 1);
      slideEl.querySelectorAll(`${elementsSelector}, [data-swiper-parallax-rotate]`).forEach((subEl) => {
        setTransform(subEl, slideProgress);
      });
    });
  };
  const setTransition2 = function(duration) {
    if (duration === void 0) {
      duration = swiper.params.speed;
    }
    const {
      el,
      hostEl
    } = swiper;
    const elements = [...el.querySelectorAll(elementsSelector)];
    if (swiper.isElement) {
      elements.push(...hostEl.querySelectorAll(elementsSelector));
    }
    elements.forEach((parallaxEl) => {
      let parallaxDuration = parseInt(parallaxEl.getAttribute("data-swiper-parallax-duration"), 10) || duration;
      if (duration === 0) parallaxDuration = 0;
      parallaxEl.style.transitionDuration = `${parallaxDuration}ms`;
    });
  };
  on("beforeInit", () => {
    if (!swiper.params.parallax.enabled) return;
    swiper.params.watchSlidesProgress = true;
    swiper.originalParams.watchSlidesProgress = true;
  });
  on("init", () => {
    if (!swiper.params.parallax.enabled) return;
    setTranslate2();
  });
  on("setTranslate", () => {
    if (!swiper.params.parallax.enabled) return;
    setTranslate2();
  });
  on("setTransition", (_swiper, duration) => {
    if (!swiper.params.parallax.enabled) return;
    setTransition2(duration);
  });
}
function Autoplay(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit,
    params
  } = _ref;
  swiper.autoplay = {
    running: false,
    paused: false,
    timeLeft: 0
  };
  extendParams({
    autoplay: {
      enabled: false,
      delay: 3e3,
      waitForTransition: true,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      reverseDirection: false,
      pauseOnMouseEnter: false
    }
  });
  let timeout;
  let raf;
  let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayTimeLeft;
  let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
  let wasPaused;
  let isTouched;
  let pausedByTouch;
  let touchStartTimeout;
  let slideChanged;
  let pausedByInteraction;
  let pausedByPointerEnter;
  function onTransitionEnd(e) {
    if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
    if (e.target !== swiper.wrapperEl) return;
    swiper.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
    if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) {
      return;
    }
    resume();
  }
  const calcTimeLeft = () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.autoplay.paused) {
      wasPaused = true;
    } else if (wasPaused) {
      autoplayDelayCurrent = autoplayTimeLeft;
      wasPaused = false;
    }
    const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
    swiper.autoplay.timeLeft = timeLeft;
    emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
    raf = requestAnimationFrame(() => {
      calcTimeLeft();
    });
  };
  const getSlideDelay = () => {
    let activeSlideEl;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains("swiper-slide-active"));
    } else {
      activeSlideEl = swiper.slides[swiper.activeIndex];
    }
    if (!activeSlideEl) return void 0;
    const currentSlideDelay = parseInt(activeSlideEl.getAttribute("data-swiper-autoplay"), 10);
    return currentSlideDelay;
  };
  const run = (delayForce) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    cancelAnimationFrame(raf);
    calcTimeLeft();
    let delay = typeof delayForce === "undefined" ? swiper.params.autoplay.delay : delayForce;
    autoplayDelayTotal = swiper.params.autoplay.delay;
    autoplayDelayCurrent = swiper.params.autoplay.delay;
    const currentSlideDelay = getSlideDelay();
    if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0 && typeof delayForce === "undefined") {
      delay = currentSlideDelay;
      autoplayDelayTotal = currentSlideDelay;
      autoplayDelayCurrent = currentSlideDelay;
    }
    autoplayTimeLeft = delay;
    const speed = swiper.params.speed;
    const proceed = () => {
      if (!swiper || swiper.destroyed) return;
      if (swiper.params.autoplay.reverseDirection) {
        if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
          swiper.slidePrev(speed, true, true);
          emit("autoplay");
        } else if (!swiper.params.autoplay.stopOnLastSlide) {
          swiper.slideTo(swiper.slides.length - 1, speed, true, true);
          emit("autoplay");
        }
      } else {
        if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
          swiper.slideNext(speed, true, true);
          emit("autoplay");
        } else if (!swiper.params.autoplay.stopOnLastSlide) {
          swiper.slideTo(0, speed, true, true);
          emit("autoplay");
        }
      }
      if (swiper.params.cssMode) {
        autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
        requestAnimationFrame(() => {
          run();
        });
      }
    };
    if (delay > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        proceed();
      }, delay);
    } else {
      requestAnimationFrame(() => {
        proceed();
      });
    }
    return delay;
  };
  const start = () => {
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    swiper.autoplay.running = true;
    run();
    emit("autoplayStart");
  };
  const stop = () => {
    swiper.autoplay.running = false;
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    emit("autoplayStop");
  };
  const pause = (internal, reset) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    clearTimeout(timeout);
    if (!internal) {
      pausedByInteraction = true;
    }
    const proceed = () => {
      emit("autoplayPause");
      if (swiper.params.autoplay.waitForTransition) {
        swiper.wrapperEl.addEventListener("transitionend", onTransitionEnd);
      } else {
        resume();
      }
    };
    swiper.autoplay.paused = true;
    if (reset) {
      if (slideChanged) {
        autoplayTimeLeft = swiper.params.autoplay.delay;
      }
      slideChanged = false;
      proceed();
      return;
    }
    const delay = autoplayTimeLeft || swiper.params.autoplay.delay;
    autoplayTimeLeft = delay - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
    if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
    proceed();
  };
  const resume = () => {
    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    if (pausedByInteraction) {
      pausedByInteraction = false;
      run(autoplayTimeLeft);
    } else {
      run();
    }
    swiper.autoplay.paused = false;
    emit("autoplayResume");
  };
  const onVisibilityChange = () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    const document2 = getDocument();
    if (document2.visibilityState === "hidden") {
      pausedByInteraction = true;
      pause(true);
    }
    if (document2.visibilityState === "visible") {
      resume();
    }
  };
  const onPointerEnter = (e) => {
    if (e.pointerType !== "mouse") return;
    pausedByInteraction = true;
    pausedByPointerEnter = true;
    if (swiper.animating || swiper.autoplay.paused) return;
    pause(true);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    pausedByPointerEnter = false;
    if (swiper.autoplay.paused) {
      resume();
    }
  };
  const attachMouseEvents = () => {
    if (swiper.params.autoplay.pauseOnMouseEnter) {
      swiper.el.addEventListener("pointerenter", onPointerEnter);
      swiper.el.addEventListener("pointerleave", onPointerLeave);
    }
  };
  const detachMouseEvents = () => {
    if (swiper.el && typeof swiper.el !== "string") {
      swiper.el.removeEventListener("pointerenter", onPointerEnter);
      swiper.el.removeEventListener("pointerleave", onPointerLeave);
    }
  };
  const attachDocumentEvents = () => {
    const document2 = getDocument();
    document2.addEventListener("visibilitychange", onVisibilityChange);
  };
  const detachDocumentEvents = () => {
    const document2 = getDocument();
    document2.removeEventListener("visibilitychange", onVisibilityChange);
  };
  on("init", () => {
    if (swiper.params.autoplay.enabled) {
      attachMouseEvents();
      attachDocumentEvents();
      start();
    }
  });
  on("destroy", () => {
    detachMouseEvents();
    detachDocumentEvents();
    if (swiper.autoplay.running) {
      stop();
    }
  });
  on("_freeModeStaticRelease", () => {
    if (pausedByTouch || pausedByInteraction) {
      resume();
    }
  });
  on("_freeModeNoMomentumRelease", () => {
    if (!swiper.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("beforeTransitionStart", (_s, speed, internal) => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (internal || !swiper.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("sliderFirstMove", () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    if (swiper.params.autoplay.disableOnInteraction) {
      stop();
      return;
    }
    isTouched = true;
    pausedByTouch = false;
    pausedByInteraction = false;
    touchStartTimeout = setTimeout(() => {
      pausedByInteraction = true;
      pausedByTouch = true;
      pause(true);
    }, 200);
  });
  on("touchEnd", () => {
    if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
    clearTimeout(touchStartTimeout);
    clearTimeout(timeout);
    if (swiper.params.autoplay.disableOnInteraction) {
      pausedByTouch = false;
      isTouched = false;
      return;
    }
    if (pausedByTouch && swiper.params.cssMode) resume();
    pausedByTouch = false;
    isTouched = false;
  });
  on("slideChange", () => {
    if (swiper.destroyed || !swiper.autoplay.running) return;
    slideChanged = true;
  });
  Object.assign(swiper.autoplay, {
    start,
    stop,
    pause,
    resume
  });
}
function effectInit(params) {
  const {
    effect,
    swiper,
    on,
    setTranslate: setTranslate2,
    setTransition: setTransition2,
    overwriteParams,
    perspective,
    recreateShadows,
    getEffectParams
  } = params;
  on("beforeInit", () => {
    if (swiper.params.effect !== effect) return;
    swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
    if (perspective && perspective()) {
      swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
    }
    const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
    Object.assign(swiper.params, overwriteParamsResult);
    Object.assign(swiper.originalParams, overwriteParamsResult);
  });
  on("setTranslate _virtualUpdated", () => {
    if (swiper.params.effect !== effect) return;
    setTranslate2();
  });
  on("setTransition", (_s, duration) => {
    if (swiper.params.effect !== effect) return;
    setTransition2(duration);
  });
  on("transitionEnd", () => {
    if (swiper.params.effect !== effect) return;
    if (recreateShadows) {
      if (!getEffectParams || !getEffectParams().slideShadows) return;
      swiper.slides.forEach((slideEl) => {
        slideEl.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((shadowEl) => shadowEl.remove());
      });
      recreateShadows();
    }
  });
  let requireUpdateOnVirtual;
  on("virtualUpdate", () => {
    if (swiper.params.effect !== effect) return;
    if (!swiper.slides.length) {
      requireUpdateOnVirtual = true;
    }
    requestAnimationFrame(() => {
      if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
        setTranslate2();
        requireUpdateOnVirtual = false;
      }
    });
  });
}
function effectTarget(effectParams, slideEl) {
  const transformEl = getSlideTransformEl(slideEl);
  if (transformEl !== slideEl) {
    transformEl.style.backfaceVisibility = "hidden";
    transformEl.style["-webkit-backface-visibility"] = "hidden";
  }
  return transformEl;
}
function effectVirtualTransitionEnd(_ref) {
  let {
    swiper,
    duration,
    transformElements
  } = _ref;
  const {
    activeIndex
  } = swiper;
  if (swiper.params.virtualTranslate && duration !== 0) {
    let eventTriggered = false;
    let transitionEndTarget;
    {
      transitionEndTarget = transformElements;
    }
    transitionEndTarget.forEach((el) => {
      elementTransitionEnd(el, () => {
        if (eventTriggered) return;
        if (!swiper || swiper.destroyed) return;
        eventTriggered = true;
        swiper.animating = false;
        const evt = new window.CustomEvent("transitionend", {
          bubbles: true,
          cancelable: true
        });
        swiper.wrapperEl.dispatchEvent(evt);
      });
    });
  }
}
function EffectFade(_ref) {
  let {
    swiper,
    extendParams,
    on
  } = _ref;
  extendParams({
    fadeEffect: {
      crossFade: false
    }
  });
  const setTranslate2 = () => {
    const {
      slides
    } = swiper;
    const params = swiper.params.fadeEffect;
    for (let i = 0; i < slides.length; i += 1) {
      const slideEl = swiper.slides[i];
      const offset = slideEl.swiperSlideOffset;
      let tx = -offset;
      if (!swiper.params.virtualTranslate) tx -= swiper.translate;
      let ty = 0;
      if (!swiper.isHorizontal()) {
        ty = tx;
        tx = 0;
      }
      const slideOpacity = swiper.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(slideEl.progress), 0) : 1 + Math.min(Math.max(slideEl.progress, -1), 0);
      const targetEl = effectTarget(params, slideEl);
      targetEl.style.opacity = slideOpacity;
      targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
    }
  };
  const setTransition2 = (duration) => {
    const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
    transformElements.forEach((el) => {
      el.style.transitionDuration = `${duration}ms`;
    });
    effectVirtualTransitionEnd({
      swiper,
      duration,
      transformElements
    });
  };
  effectInit({
    effect: "fade",
    swiper,
    on,
    setTranslate: setTranslate2,
    setTransition: setTransition2,
    overwriteParams: () => ({
      slidesPerView: 1,
      slidesPerGroup: 1,
      watchSlidesProgress: true,
      spaceBetween: 0,
      virtualTranslate: !swiper.params.cssMode
    })
  });
}
function initSliders() {
  if (document.querySelector(".hero__slider")) {
    new Swiper(".hero__slider", {
      // <- Указываем класс нужного слайдера
      // Подключаем модули слайдера
      // для конкретного случая
      modules: [Navigation, Pagination, Autoplay, Parallax],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 0,
      autoHeight: true,
      speed: 1200,
      //touchRatio: 0,
      //simulateTouch: false,
      //loop: true,
      //preloadImages: false,
      //lazy: true,
      parallax: true,
      // Эфекты
      // effect: 'fade',
      autoplay: {
        delay: 4e3,
        disableOnInteraction: false
      },
      // Пагинация
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      // Скроллбар
      /*
      scrollbar: {
      	el: '.swiper-scrollbar',
      	draggable: true,
      },
      */
      // Кнопки "влево/вправо"
      navigation: {
        prevEl: ".hero-button-prev",
        nextEl: ".hero-button-next"
      },
      /*
      // Брейкпоинты
      breakpoints: {
      	640: {
      		slidesPerView: 1,
      		spaceBetween: 0,
      		autoHeight: true,
      	},
      	768: {
      		slidesPerView: 2,
      		spaceBetween: 20,
      	},
      	992: {
      		slidesPerView: 3,
      		spaceBetween: 20,
      	},
      	1268: {
      		slidesPerView: 4,
      		spaceBetween: 30,
      	},
      },
      */
      // События
      on: {}
    });
  }
  if (document.querySelector(".calculator__slider")) {
    new Swiper(".calculator__slider", {
      modules: [Navigation, Pagination, EffectFade],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 0,
      autoHeight: true,
      speed: 800,
      pagination: {
        el: ".calculator__pagination",
        type: "progressbar",
        clickable: true
      },
      simulateTouch: false,
      allowTouchMove: false,
      effect: "fade",
      fadeEffect: {
        crossFade: true
      },
      navigation: {
        prevEl: ".calculator__button-prev",
        nextEl: ".calculator__button-next"
      },
      on: {
        init: function(swiper) {
          const allSlides = document.querySelector(".fraction-controll__all");
          const allSlidesItems = document.querySelectorAll(".slide-main-block:not(.swiper-slide-duplicate)");
          allSlides.innerHTML = allSlidesItems.length < 10 ? `0${allSlidesItems.length}` : allSlidesItems.length;
          const progressElement = document.querySelector(".fraction-controll__progress");
          progressElement.innerHTML = `<span>Готово</span>: 0%`;
          const progressBarFill = document.querySelector(".swiper-pagination-progressbar-fill");
          progressBarFill.style.width = "0%";
        },
        slideChange: function(swiper) {
          const currentSlide = document.querySelector(".fraction-controll__current");
          currentSlide.innerHTML = swiper.realIndex + 1 < 10 ? `0${swiper.realIndex + 1}` : swiper.realIndex + 1;
          const progress = swiper.realIndex / (swiper.slides.length - 1) * 100;
          const progressElement = document.querySelector(".fraction-controll__progress");
          progressElement.innerHTML = `<span>Готово</span>: ${progress.toFixed(2)}%`;
          const progressBarFill = document.querySelector(".swiper-pagination-progressbar-fill");
          progressBarFill.style.width = `${progress}%`;
          if (swiper.realIndex === 0) {
            progressElement.innerHTML = `<span>Готово</span>: 0%`;
            progressBarFill.style.width = "0%";
          }
        },
        //дейсвите после последнего сладера
        reachEnd: function(swiper) {
          document.getElementById("progress").style.display = "none";
          document.getElementById("calc").style.display = "none";
          document.getElementById("banner").style.display = "none";
          document.getElementById("wrapper-content").classList.add("last");
        },
        fromEdge: function(swiper) {
        }
      }
    });
  }
  if (document.querySelector(".materials__slider")) {
    new Swiper(".materials__slider", {
      // <- Указываем класс нужного слайдера
      // Подключаем модули слайдера
      // для конкретного случая
      modules: [Navigation, Pagination],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 20,
      autoHeight: true,
      speed: 1200,
      //touchRatio: 0,
      //simulateTouch: false,
      //loop: true,
      //preloadImages: false,
      //lazy: true,
      // Эфекты
      // effect: 'fade',
      // autoplay: {
      // 	delay: 4000,
      // 	disableOnInteraction: false,
      // },
      // Пагинация
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      // Скроллбар
      /*
      scrollbar: {
      	el: '.swiper-scrollbar',
      	draggable: true,
      },
      */
      // Кнопки "влево/вправо"
      navigation: {
        prevEl: ".materials-button-prev",
        nextEl: ".materials-button-next"
      },
      // Брейкпоинты
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
          autoHeight: true
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        1268: {
          slidesPerView: 4,
          spaceBetween: 30
        }
      },
      // События
      on: {}
    });
  }
  if (document.querySelector(".guarantees__slider")) {
    new Swiper(".guarantees__slider", {
      // <- Указываем класс нужного слайдера
      // Подключаем модули слайдера
      // для конкретного случая
      modules: [Navigation, Pagination],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 20,
      autoHeight: true,
      speed: 1200,
      //touchRatio: 0,
      //simulateTouch: false,
      //loop: true,
      //preloadImages: false,
      //lazy: true,
      // Эфекты
      // effect: 'fade',
      // autoplay: {
      // 	delay: 4000,
      // 	disableOnInteraction: false,
      // },
      // Пагинация
      // pagination: {
      // 	el: '.swiper-pagination',
      // 	clickable: true,
      // },
      // Скроллбар
      /*
      scrollbar: {
      	el: '.swiper-scrollbar',
      	draggable: true,
      },
      */
      // Кнопки "влево/вправо"
      navigation: {
        prevEl: ".guarantees-button-prev",
        nextEl: ".guarantees-button-next"
      },
      // Брейкпоинты
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
          autoHeight: true
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        1268: {
          slidesPerView: 4,
          spaceBetween: 30
        }
      },
      // События
      on: {}
    });
  }
}
document.querySelector("[data-fls-slider]") ? window.addEventListener("load", initSliders) : null;
class Popup {
  constructor(options) {
    let config = {
      logging: true,
      init: true,
      //Для кнопок
      attributeOpenButton: "data-fls-popup-link",
      // Атрибут для кнопки, которая вызывает Popup
      attributeCloseButton: "data-fls-popup-close",
      // Атрибут для кнопки, что закрывает popup
      // Для сторонних объектов
      fixElementSelector: "[data-fls-lp]",
      // Атрибут для элементов с левым паддингом (которые fixed)
      // Для объекта попапа
      attributeMain: "data-fls-popup",
      youtubeAttribute: "data-fls-popup-youtube",
      // Атрибут для кода youtube
      youtubePlaceAttribute: "data-fls-popup-youtube-place",
      // Атрибут для вставки ролика youtube
      setAutoplayYoutube: true,
      // Смена классов
      classes: {
        popup: "popup",
        // popupWrapper: 'popup__wrapper',
        popupContent: "data-fls-popup-body",
        popupActive: "data-fls-popup-active",
        // Добавляется для попапа, когда он открывается
        bodyActive: "data-fls-popup-open"
        // Прилагается для боди, когда попал открытый
      },
      focusCatch: true,
      // Фокус внутри попапа зациклен
      closeEsc: true,
      // Закрытие ESC
      bodyLock: true,
      // Блокировка скролла
      hashSettings: {
        location: true,
        // Хэш в адресной строке
        goHash: true
        // Переход по наличию в адресной строке
      },
      on: {
        // События
        beforeOpen: function() {
        },
        afterOpen: function() {
        },
        beforeClose: function() {
        },
        afterClose: function() {
        }
      }
    };
    this.youTubeCode;
    this.isOpen = false;
    this.targetOpen = {
      selector: false,
      element: false
    };
    this.previousOpen = {
      selector: false,
      element: false
    };
    this.lastClosed = {
      selector: false,
      element: false
    };
    this._dataValue = false;
    this.hash = false;
    this._reopen = false;
    this._selectorOpen = false;
    this.lastFocusEl = false;
    this._focusEl = [
      "a[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "button:not([disabled]):not([aria-hidden])",
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "area[href]",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"])'
    ];
    this.options = {
      ...config,
      ...options,
      classes: {
        ...config.classes,
        ...options?.classes
      },
      hashSettings: {
        ...config.hashSettings,
        ...options?.hashSettings
      },
      on: {
        ...config.on,
        ...options?.on
      }
    };
    this.bodyLock = false;
    this.options.init ? this.initPopups() : null;
  }
  initPopups() {
    this.buildPopup();
    this.eventsPopup();
  }
  buildPopup() {
  }
  eventsPopup() {
    document.addEventListener("click", (function(e) {
      const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
      if (buttonOpen) {
        e.preventDefault();
        this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
        this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
        if (this._dataValue !== "error") {
          if (!this.isOpen) this.lastFocusEl = buttonOpen;
          this.targetOpen.selector = `${this._dataValue}`;
          this._selectorOpen = true;
          this.open();
          return;
        }
        return;
      }
      const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
      if (buttonClose || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
      if (this.options.focusCatch && e.which == 9 && this.isOpen) {
        this._focusCatch(e);
        return;
      }
    }).bind(this));
    if (this.options.hashSettings.goHash) {
      window.addEventListener("hashchange", (function() {
        if (window.location.hash) {
          this._openToHash();
        } else {
          this.close(this.targetOpen.selector);
        }
      }).bind(this));
      if (window.location.hash) {
        this._openToHash();
      }
    }
  }
  open(selectorValue) {
    if (bodyLockStatus) {
      this.bodyLock = document.documentElement.hasAttribute("data-fls-scrolllock") && !this.isOpen ? true : false;
      if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
        this.targetOpen.selector = selectorValue;
        this._selectorOpen = true;
      }
      if (this.isOpen) {
        this._reopen = true;
        this.close();
      }
      if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
      if (!this._reopen) this.previousActiveElement = document.activeElement;
      this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);
      if (this.targetOpen.element) {
        const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(`${this.options.youtubeAttribute}`);
        if (codeVideo) {
          const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
          const iframe = document.createElement("iframe");
          const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
          iframe.setAttribute("src", urlVideo);
          if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
            this.targetOpen.element.querySelector("[data-fls-popup-content]").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
          }
          this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
        }
        if (this.options.hashSettings.location) {
          this._getHash();
          this._setHash();
        }
        this.options.on.beforeOpen(this);
        document.dispatchEvent(new CustomEvent("beforePopupOpen", {
          detail: {
            popup: this
          }
        }));
        this.targetOpen.element.setAttribute(this.options.classes.popupActive, "");
        document.documentElement.setAttribute(this.options.classes.bodyActive, "");
        if (!this._reopen) {
          !this.bodyLock ? bodyLock() : null;
        } else this._reopen = false;
        this.targetOpen.element.setAttribute("aria-hidden", "false");
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;
        this._selectorOpen = false;
        this.isOpen = true;
        setTimeout(() => {
          this._focusTrap();
        }, 50);
        this.options.on.afterOpen(this);
        document.dispatchEvent(new CustomEvent("afterPopupOpen", {
          detail: {
            popup: this
          }
        }));
      }
    }
  }
  close(selectorValue) {
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.previousOpen.selector = selectorValue;
    }
    if (!this.isOpen || !bodyLockStatus) {
      return;
    }
    this.options.on.beforeClose(this);
    document.dispatchEvent(new CustomEvent("beforePopupClose", {
      detail: {
        popup: this
      }
    }));
    if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
      setTimeout(() => {
        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
      }, 500);
    }
    this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
    this.previousOpen.element.setAttribute("aria-hidden", "true");
    if (!this._reopen) {
      document.documentElement.removeAttribute(this.options.classes.bodyActive);
      !this.bodyLock ? bodyUnlock() : null;
      this.isOpen = false;
    }
    this._removeHash();
    if (this._selectorOpen) {
      this.lastClosed.selector = this.previousOpen.selector;
      this.lastClosed.element = this.previousOpen.element;
    }
    this.options.on.afterClose(this);
    document.dispatchEvent(new CustomEvent("afterPopupClose", {
      detail: {
        popup: this
      }
    }));
    setTimeout(() => {
      this._focusTrap();
    }, 50);
  }
  // Получение хэша
  _getHash() {
    if (this.options.hashSettings.location) {
      this.hash = `#${this.targetOpen.selector}`;
    }
  }
  _openToHash() {
    let classInHash = window.location.hash.replace("#", "");
    const openButton = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
    if (openButton) {
      this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ? openButton.getAttribute(this.options.youtubeAttribute) : null;
    }
    if (classInHash) this.open(classInHash);
  }
  // Установка хэша
  _setHash() {
    history.pushState("", "", this.hash);
  }
  _removeHash() {
    history.pushState("", "", window.location.href.split("#")[0]);
  }
  _focusCatch(e) {
    const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
    const focusArray = Array.prototype.slice.call(focusable);
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (e.shiftKey && focusedIndex === 0) {
      focusArray[focusArray.length - 1].focus();
      e.preventDefault();
    }
    if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
      focusArray[0].focus();
      e.preventDefault();
    }
  }
  _focusTrap() {
    const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
    if (!this.isOpen && this.lastFocusEl) {
      this.lastFocusEl.focus();
    } else {
      focusable[0].focus();
    }
  }
}
document.querySelector("[data-fls-popup]") ? window.addEventListener("load", () => window.flsPopup = new Popup({})) : null;
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu");
  function isMobileView() {
    return window.innerWidth <= 991.98;
  }
  menu.addEventListener("click", function(e) {
    if (!isMobileView()) return;
    const targetElement = e.target;
    const menuItem = targetElement.closest(".menu__item");
    if (menuItem) {
      closeAllSubmenus();
      if (menuItem.querySelector(".submenu-catalog")) {
        menuItem.querySelector(".submenu-catalog").classList.add("active");
      } else if (menuItem.querySelector(".submenu")) {
        menuItem.querySelector(".submenu").classList.add("active");
      }
    }
    if (targetElement.closest(".submenu-close")) {
      const submenu = targetElement.closest(".submenu");
      if (submenu) {
        submenu.classList.remove("active");
      }
    }
    if (targetElement.closest(".submenu-catalog__close")) {
      targetElement.closest(".submenu-catalog").classList.remove("active");
    }
    if (targetElement.closest(".submenu-catalog__title")) {
      const title = targetElement.closest(".submenu-catalog__title");
      const list = title.nextElementSibling;
      title.closest(".submenu-catalog").querySelectorAll(".submenu-catalog__list").forEach((el) => {
        if (el !== list) el.classList.remove("active");
      });
      list.classList.toggle("active");
    }
  });
  document.addEventListener("click", function(e) {
    if (!isMobileView()) return;
    if (!e.target.closest(".menu")) {
      closeAllSubmenus();
    }
  });
  function closeAllSubmenus() {
    document.querySelectorAll(".submenu, .submenu-catalog, .submenu-catalog__list").forEach((el) => {
      el.classList.remove("active");
    });
  }
  window.addEventListener("resize", function() {
    if (!isMobileView()) {
      closeAllSubmenus();
    }
  });
});
/*!
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
var lGEvents = {
  afterAppendSlide: "lgAfterAppendSlide",
  init: "lgInit",
  hasVideo: "lgHasVideo",
  containerResize: "lgContainerResize",
  updateSlides: "lgUpdateSlides",
  afterAppendSubHtml: "lgAfterAppendSubHtml",
  beforeOpen: "lgBeforeOpen",
  afterOpen: "lgAfterOpen",
  slideItemLoad: "lgSlideItemLoad",
  beforeSlide: "lgBeforeSlide",
  afterSlide: "lgAfterSlide",
  posterClick: "lgPosterClick",
  dragStart: "lgDragStart",
  dragMove: "lgDragMove",
  dragEnd: "lgDragEnd",
  beforeNextSlide: "lgBeforeNextSlide",
  beforePrevSlide: "lgBeforePrevSlide",
  beforeClose: "lgBeforeClose",
  afterClose: "lgAfterClose"
};
var lightGalleryCoreSettings = {
  mode: "lg-slide",
  easing: "ease",
  speed: 400,
  licenseKey: "0000-0000-000-0000",
  height: "100%",
  width: "100%",
  addClass: "",
  startClass: "lg-start-zoom",
  backdropDuration: 300,
  container: "",
  startAnimationDuration: 400,
  zoomFromOrigin: true,
  hideBarsDelay: 0,
  showBarsAfter: 1e4,
  slideDelay: 0,
  supportLegacyBrowser: true,
  allowMediaOverlap: false,
  videoMaxSize: "1280-720",
  loadYouTubePoster: true,
  defaultCaptionHeight: 0,
  ariaLabelledby: "",
  ariaDescribedby: "",
  resetScrollPosition: true,
  hideScrollbar: false,
  closable: true,
  swipeToClose: true,
  closeOnTap: true,
  showCloseIcon: true,
  showMaximizeIcon: false,
  loop: true,
  escKey: true,
  keyPress: true,
  trapFocus: true,
  controls: true,
  slideEndAnimation: true,
  hideControlOnEnd: false,
  mousewheel: false,
  getCaptionFromTitleOrAlt: true,
  appendSubHtmlTo: ".lg-sub-html",
  subHtmlSelectorRelative: false,
  preload: 2,
  numberOfSlideItemsInDom: 10,
  selector: "",
  selectWithin: "",
  nextHtml: "",
  prevHtml: "",
  index: 0,
  iframeWidth: "100%",
  iframeHeight: "100%",
  iframeMaxWidth: "100%",
  iframeMaxHeight: "100%",
  download: true,
  counter: true,
  appendCounterTo: ".lg-toolbar",
  swipeThreshold: 50,
  enableSwipe: true,
  enableDrag: true,
  dynamic: false,
  dynamicEl: [],
  extraProps: [],
  exThumbImage: "",
  isMobile: void 0,
  mobileSettings: {
    controls: false,
    showCloseIcon: false,
    download: false
  },
  plugins: [],
  strings: {
    closeGallery: "Close gallery",
    toggleMaximize: "Toggle maximize",
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
    download: "Download",
    playVideo: "Play video",
    mediaLoadingFailed: "Oops... Failed to load content..."
  }
};
function initLgPolyfills() {
  (function() {
    if (typeof window.CustomEvent === "function")
      return false;
    function CustomEvent3(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: null
      };
      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }
    window.CustomEvent = CustomEvent3;
  })();
  (function() {
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
  })();
}
var lgQuery = (
  /** @class */
  function() {
    function lgQuery2(selector) {
      this.cssVenderPrefixes = [
        "TransitionDuration",
        "TransitionTimingFunction",
        "Transform",
        "Transition"
      ];
      this.selector = this._getSelector(selector);
      this.firstElement = this._getFirstEl();
      return this;
    }
    lgQuery2.generateUUID = function() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    };
    lgQuery2.prototype._getSelector = function(selector, context) {
      if (context === void 0) {
        context = document;
      }
      if (typeof selector !== "string") {
        return selector;
      }
      context = context || document;
      var fl = selector.substring(0, 1);
      if (fl === "#") {
        return context.querySelector(selector);
      } else {
        return context.querySelectorAll(selector);
      }
    };
    lgQuery2.prototype._each = function(func) {
      if (!this.selector) {
        return this;
      }
      if (this.selector.length !== void 0) {
        [].forEach.call(this.selector, func);
      } else {
        func(this.selector, 0);
      }
      return this;
    };
    lgQuery2.prototype._setCssVendorPrefix = function(el, cssProperty, value) {
      var property = cssProperty.replace(/-([a-z])/gi, function(s, group1) {
        return group1.toUpperCase();
      });
      if (this.cssVenderPrefixes.indexOf(property) !== -1) {
        el.style[property.charAt(0).toLowerCase() + property.slice(1)] = value;
        el.style["webkit" + property] = value;
        el.style["moz" + property] = value;
        el.style["ms" + property] = value;
        el.style["o" + property] = value;
      } else {
        el.style[property] = value;
      }
    };
    lgQuery2.prototype._getFirstEl = function() {
      if (this.selector && this.selector.length !== void 0) {
        return this.selector[0];
      } else {
        return this.selector;
      }
    };
    lgQuery2.prototype.isEventMatched = function(event, eventName) {
      var eventNamespace = eventName.split(".");
      return event.split(".").filter(function(e) {
        return e;
      }).every(function(e) {
        return eventNamespace.indexOf(e) !== -1;
      });
    };
    lgQuery2.prototype.attr = function(attr, value) {
      if (value === void 0) {
        if (!this.firstElement) {
          return "";
        }
        return this.firstElement.getAttribute(attr);
      }
      this._each(function(el) {
        el.setAttribute(attr, value);
      });
      return this;
    };
    lgQuery2.prototype.find = function(selector) {
      return $LG(this._getSelector(selector, this.selector));
    };
    lgQuery2.prototype.first = function() {
      if (this.selector && this.selector.length !== void 0) {
        return $LG(this.selector[0]);
      } else {
        return $LG(this.selector);
      }
    };
    lgQuery2.prototype.eq = function(index) {
      return $LG(this.selector[index]);
    };
    lgQuery2.prototype.parent = function() {
      return $LG(this.selector.parentElement);
    };
    lgQuery2.prototype.get = function() {
      return this._getFirstEl();
    };
    lgQuery2.prototype.removeAttr = function(attributes) {
      var attrs = attributes.split(" ");
      this._each(function(el) {
        attrs.forEach(function(attr) {
          return el.removeAttribute(attr);
        });
      });
      return this;
    };
    lgQuery2.prototype.wrap = function(className) {
      if (!this.firstElement) {
        return this;
      }
      var wrapper = document.createElement("div");
      wrapper.className = className;
      this.firstElement.parentNode.insertBefore(wrapper, this.firstElement);
      this.firstElement.parentNode.removeChild(this.firstElement);
      wrapper.appendChild(this.firstElement);
      return this;
    };
    lgQuery2.prototype.addClass = function(classNames) {
      if (classNames === void 0) {
        classNames = "";
      }
      this._each(function(el) {
        classNames.split(" ").forEach(function(className) {
          if (className) {
            el.classList.add(className);
          }
        });
      });
      return this;
    };
    lgQuery2.prototype.removeClass = function(classNames) {
      this._each(function(el) {
        classNames.split(" ").forEach(function(className) {
          if (className) {
            el.classList.remove(className);
          }
        });
      });
      return this;
    };
    lgQuery2.prototype.hasClass = function(className) {
      if (!this.firstElement) {
        return false;
      }
      return this.firstElement.classList.contains(className);
    };
    lgQuery2.prototype.hasAttribute = function(attribute) {
      if (!this.firstElement) {
        return false;
      }
      return this.firstElement.hasAttribute(attribute);
    };
    lgQuery2.prototype.toggleClass = function(className) {
      if (!this.firstElement) {
        return this;
      }
      if (this.hasClass(className)) {
        this.removeClass(className);
      } else {
        this.addClass(className);
      }
      return this;
    };
    lgQuery2.prototype.css = function(property, value) {
      var _this = this;
      this._each(function(el) {
        _this._setCssVendorPrefix(el, property, value);
      });
      return this;
    };
    lgQuery2.prototype.on = function(events2, listener) {
      var _this = this;
      if (!this.selector) {
        return this;
      }
      events2.split(" ").forEach(function(event) {
        if (!Array.isArray(lgQuery2.eventListeners[event])) {
          lgQuery2.eventListeners[event] = [];
        }
        lgQuery2.eventListeners[event].push(listener);
        _this.selector.addEventListener(event.split(".")[0], listener);
      });
      return this;
    };
    lgQuery2.prototype.once = function(event, listener) {
      var _this = this;
      this.on(event, function() {
        _this.off(event);
        listener(event);
      });
      return this;
    };
    lgQuery2.prototype.off = function(event) {
      var _this = this;
      if (!this.selector) {
        return this;
      }
      Object.keys(lgQuery2.eventListeners).forEach(function(eventName) {
        if (_this.isEventMatched(event, eventName)) {
          lgQuery2.eventListeners[eventName].forEach(function(listener) {
            _this.selector.removeEventListener(eventName.split(".")[0], listener);
          });
          lgQuery2.eventListeners[eventName] = [];
        }
      });
      return this;
    };
    lgQuery2.prototype.trigger = function(event, detail) {
      if (!this.firstElement) {
        return this;
      }
      var customEvent = new CustomEvent(event.split(".")[0], {
        detail: detail || null
      });
      this.firstElement.dispatchEvent(customEvent);
      return this;
    };
    lgQuery2.prototype.load = function(url) {
      var _this = this;
      fetch(url).then(function(res) {
        return res.text();
      }).then(function(html) {
        _this.selector.innerHTML = html;
      });
      return this;
    };
    lgQuery2.prototype.html = function(html) {
      if (html === void 0) {
        if (!this.firstElement) {
          return "";
        }
        return this.firstElement.innerHTML;
      }
      this._each(function(el) {
        el.innerHTML = html;
      });
      return this;
    };
    lgQuery2.prototype.append = function(html) {
      this._each(function(el) {
        if (typeof html === "string") {
          el.insertAdjacentHTML("beforeend", html);
        } else {
          el.appendChild(html);
        }
      });
      return this;
    };
    lgQuery2.prototype.prepend = function(html) {
      this._each(function(el) {
        if (typeof html === "string") {
          el.insertAdjacentHTML("afterbegin", html);
        } else if (html instanceof HTMLElement) {
          el.insertBefore(html.cloneNode(true), el.firstChild);
        }
      });
      return this;
    };
    lgQuery2.prototype.remove = function() {
      this._each(function(el) {
        el.parentNode.removeChild(el);
      });
      return this;
    };
    lgQuery2.prototype.empty = function() {
      this._each(function(el) {
        el.innerHTML = "";
      });
      return this;
    };
    lgQuery2.prototype.scrollTop = function(scrollTop) {
      if (scrollTop !== void 0) {
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop;
        return this;
      } else {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }
    };
    lgQuery2.prototype.scrollLeft = function(scrollLeft) {
      if (scrollLeft !== void 0) {
        document.body.scrollLeft = scrollLeft;
        document.documentElement.scrollLeft = scrollLeft;
        return this;
      } else {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      }
    };
    lgQuery2.prototype.offset = function() {
      if (!this.firstElement) {
        return {
          left: 0,
          top: 0
        };
      }
      var rect = this.firstElement.getBoundingClientRect();
      var bodyMarginLeft = $LG("body").style().marginLeft;
      return {
        left: rect.left - parseFloat(bodyMarginLeft) + this.scrollLeft(),
        top: rect.top + this.scrollTop()
      };
    };
    lgQuery2.prototype.style = function() {
      if (!this.firstElement) {
        return {};
      }
      return this.firstElement.currentStyle || window.getComputedStyle(this.firstElement);
    };
    lgQuery2.prototype.width = function() {
      var style = this.style();
      return this.firstElement.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    };
    lgQuery2.prototype.height = function() {
      var style = this.style();
      return this.firstElement.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    };
    lgQuery2.eventListeners = {};
    return lgQuery2;
  }()
);
function $LG(selector) {
  initLgPolyfills();
  return new lgQuery(selector);
}
var defaultDynamicOptions = [
  "src",
  "sources",
  "subHtml",
  "subHtmlUrl",
  "html",
  "video",
  "poster",
  "slideName",
  "responsive",
  "srcset",
  "sizes",
  "iframe",
  "downloadUrl",
  "download",
  "width",
  "facebookShareUrl",
  "tweetText",
  "iframeTitle",
  "twitterShareUrl",
  "pinterestShareUrl",
  "pinterestText",
  "fbHtml",
  "disqusIdentifier",
  "disqusUrl"
];
function convertToData(attr) {
  if (attr === "href") {
    return "src";
  }
  attr = attr.replace("data-", "");
  attr = attr.charAt(0).toLowerCase() + attr.slice(1);
  attr = attr.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
  return attr;
}
var utils = {
  /**
   * Fetches HTML content from a given URL and inserts it into a specified element.
   *
   * @param url - The URL to fetch the HTML content from.
   * @param element - The DOM element (jQuery object) to insert the HTML content into.
   * @param insertMethod - The method to insert the HTML ('append' or 'replace').
   */
  fetchCaptionFromUrl: function(url, element, insertMethod) {
    fetch(url).then(function(response) {
      return response.text();
    }).then(function(htmlContent) {
      if (insertMethod === "append") {
        var contentDiv = '<div class="lg-sub-html">' + htmlContent + "</div>";
        element.append(contentDiv);
      } else {
        element.html(htmlContent);
      }
    });
  },
  /**
   * get possible width and height from the lgSize attribute. Used for ZoomFromOrigin option
   */
  getSize: function(el, container, spacing, defaultLgSize) {
    if (spacing === void 0) {
      spacing = 0;
    }
    var LGel = $LG(el);
    var lgSize = LGel.attr("data-lg-size") || defaultLgSize;
    if (!lgSize) {
      return;
    }
    var isResponsiveSizes = lgSize.split(",");
    if (isResponsiveSizes[1]) {
      var wWidth = window.innerWidth;
      for (var i = 0; i < isResponsiveSizes.length; i++) {
        var size_1 = isResponsiveSizes[i];
        var responsiveWidth = parseInt(size_1.split("-")[2], 10);
        if (responsiveWidth > wWidth) {
          lgSize = size_1;
          break;
        }
        if (i === isResponsiveSizes.length - 1) {
          lgSize = size_1;
        }
      }
    }
    var size = lgSize.split("-");
    var width = parseInt(size[0], 10);
    var height = parseInt(size[1], 10);
    var cWidth = container.width();
    var cHeight = container.height() - spacing;
    var maxWidth = Math.min(cWidth, width);
    var maxHeight = Math.min(cHeight, height);
    var ratio = Math.min(maxWidth / width, maxHeight / height);
    return { width: width * ratio, height: height * ratio };
  },
  /**
   * @desc Get transform value based on the imageSize. Used for ZoomFromOrigin option
   * @param {jQuery Element}
   * @returns {String} Transform CSS string
   */
  getTransform: function(el, container, top, bottom, imageSize) {
    if (!imageSize) {
      return;
    }
    var LGel = $LG(el).find("img").first();
    if (!LGel.get()) {
      return;
    }
    var containerRect = container.get().getBoundingClientRect();
    var wWidth = containerRect.width;
    var wHeight = container.height() - (top + bottom);
    var elWidth = LGel.width();
    var elHeight = LGel.height();
    var elStyle = LGel.style();
    var x = (wWidth - elWidth) / 2 - LGel.offset().left + (parseFloat(elStyle.paddingLeft) || 0) + (parseFloat(elStyle.borderLeft) || 0) + $LG(window).scrollLeft() + containerRect.left;
    var y = (wHeight - elHeight) / 2 - LGel.offset().top + (parseFloat(elStyle.paddingTop) || 0) + (parseFloat(elStyle.borderTop) || 0) + $LG(window).scrollTop() + top;
    var scX = elWidth / imageSize.width;
    var scY = elHeight / imageSize.height;
    var transform = "translate3d(" + (x *= -1) + "px, " + (y *= -1) + "px, 0) scale3d(" + scX + ", " + scY + ", 1)";
    return transform;
  },
  getIframeMarkup: function(iframeWidth, iframeHeight, iframeMaxWidth, iframeMaxHeight, src, iframeTitle) {
    var title = iframeTitle ? 'title="' + iframeTitle + '"' : "";
    return '<div class="lg-media-cont lg-has-iframe" style="width:' + iframeWidth + "; max-width:" + iframeMaxWidth + "; height: " + iframeHeight + "; max-height:" + iframeMaxHeight + '">\n                    <iframe class="lg-object" frameborder="0" ' + title + ' src="' + src + '"  allowfullscreen="true"></iframe>\n                </div>';
  },
  getImgMarkup: function(index, src, altAttr, srcset, sizes, sources) {
    var srcsetAttr = srcset ? 'srcset="' + srcset + '"' : "";
    var sizesAttr = sizes ? 'sizes="' + sizes + '"' : "";
    var imgMarkup = "<img " + altAttr + " " + srcsetAttr + "  " + sizesAttr + ' class="lg-object lg-image" data-index="' + index + '" src="' + src + '" />';
    var sourceTag = "";
    if (sources) {
      var sourceObj = typeof sources === "string" ? JSON.parse(sources) : sources;
      sourceTag = sourceObj.map(function(source) {
        var attrs = "";
        Object.keys(source).forEach(function(key) {
          attrs += " " + key + '="' + source[key] + '"';
        });
        return "<source " + attrs + "></source>";
      });
    }
    return "" + sourceTag + imgMarkup;
  },
  // Get src from responsive src
  getResponsiveSrc: function(srcItms) {
    var rsWidth = [];
    var rsSrc = [];
    var src = "";
    for (var i = 0; i < srcItms.length; i++) {
      var _src = srcItms[i].split(" ");
      if (_src[0] === "") {
        _src.splice(0, 1);
      }
      rsSrc.push(_src[0]);
      rsWidth.push(_src[1]);
    }
    var wWidth = window.innerWidth;
    for (var j = 0; j < rsWidth.length; j++) {
      if (parseInt(rsWidth[j], 10) > wWidth) {
        src = rsSrc[j];
        break;
      }
    }
    return src;
  },
  isImageLoaded: function(img) {
    if (!img)
      return false;
    if (!img.complete) {
      return false;
    }
    if (img.naturalWidth === 0) {
      return false;
    }
    return true;
  },
  getVideoPosterMarkup: function(_poster, dummyImg, videoContStyle, playVideoString, _isVideo) {
    var videoClass = "";
    if (_isVideo && _isVideo.youtube) {
      videoClass = "lg-has-youtube";
    } else if (_isVideo && _isVideo.vimeo) {
      videoClass = "lg-has-vimeo";
    } else {
      videoClass = "lg-has-html5";
    }
    var _dummy = dummyImg;
    if (typeof dummyImg !== "string") {
      _dummy = dummyImg.outerHTML;
    }
    return '<div class="lg-video-cont ' + videoClass + '" style="' + videoContStyle + '">\n                <div class="lg-video-play-button">\n                <svg\n                    viewBox="0 0 20 20"\n                    preserveAspectRatio="xMidYMid"\n                    focusable="false"\n                    aria-labelledby="' + playVideoString + '"\n                    role="img"\n                    class="lg-video-play-icon"\n                >\n                    <title>' + playVideoString + '</title>\n                    <polygon class="lg-video-play-icon-inner" points="1,0 20,10 1,20"></polygon>\n                </svg>\n                <svg class="lg-video-play-icon-bg" viewBox="0 0 50 50" focusable="false">\n                    <circle cx="50%" cy="50%" r="20"></circle></svg>\n                <svg class="lg-video-play-icon-circle" viewBox="0 0 50 50" focusable="false">\n                    <circle cx="50%" cy="50%" r="20"></circle>\n                </svg>\n            </div>\n            ' + _dummy + '\n            <img class="lg-object lg-video-poster" src="' + _poster + '" />\n        </div>';
  },
  getFocusableElements: function(container) {
    var elements = container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    var visibleElements = [].filter.call(elements, function(element) {
      var style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    return visibleElements;
  },
  /**
   * @desc Create dynamic elements array from gallery items when dynamic option is false
   * It helps to avoid frequent DOM interaction
   * and avoid multiple checks for dynamic elments
   *
   * @returns {Array} dynamicEl
   */
  getDynamicOptions: function(items, extraProps, getCaptionFromTitleOrAlt, exThumbImage) {
    var dynamicElements = [];
    var availableDynamicOptions = __spreadArrays(defaultDynamicOptions, extraProps);
    [].forEach.call(items, function(item) {
      var dynamicEl = {};
      for (var i = 0; i < item.attributes.length; i++) {
        var attr = item.attributes[i];
        if (attr.specified) {
          var dynamicAttr = convertToData(attr.name);
          var label = "";
          if (availableDynamicOptions.indexOf(dynamicAttr) > -1) {
            label = dynamicAttr;
          }
          if (label) {
            dynamicEl[label] = attr.value;
          }
        }
      }
      var currentItem = $LG(item);
      var alt = currentItem.find("img").first().attr("alt");
      var title = currentItem.attr("title");
      var thumb = exThumbImage ? currentItem.attr(exThumbImage) : currentItem.find("img").first().attr("src");
      dynamicEl.thumb = thumb;
      if (getCaptionFromTitleOrAlt && !dynamicEl.subHtml) {
        dynamicEl.subHtml = title || alt || "";
      }
      dynamicEl.alt = alt || title || "";
      dynamicElements.push(dynamicEl);
    });
    return dynamicElements;
  },
  isMobile: function() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  },
  /**
   * @desc Check the given src is video
   * @param {String} src
   * @return {Object} video type
   * Ex:{ youtube  :  ["//www.youtube.com/watch?v=c0asJgSyxcY", "c0asJgSyxcY"] }
   *
   * @todo - this information can be moved to dynamicEl to avoid frequent calls
   */
  isVideo: function(src, isHTML5VIdeo, index) {
    if (!src) {
      if (isHTML5VIdeo) {
        return {
          html5: true
        };
      } else {
        console.error("lightGallery :- data-src is not provided on slide item " + (index + 1) + ". Please make sure the selector property is properly configured. More info - https://www.lightgalleryjs.com/demos/html-markup/");
        return;
      }
    }
    var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com|be-nocookie\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)([\&|?][\S]*)*/i);
    var vimeo = src.match(/\/\/(?:www\.)?(?:player\.)?vimeo.com\/(?:video\/)?([0-9a-z\-_]+)(.*)?/i);
    var wistia = src.match(/https?:\/\/(.+)?(wistia\.com|wi\.st)\/(medias|embed)\/([0-9a-z\-_]+)(.*)/);
    if (youtube) {
      return {
        youtube
      };
    } else if (vimeo) {
      return {
        vimeo
      };
    } else if (wistia) {
      return {
        wistia
      };
    }
  }
};
var lgId = 0;
var LightGallery = (
  /** @class */
  function() {
    function LightGallery2(element, options) {
      this.lgOpened = false;
      this.index = 0;
      this.plugins = [];
      this.lGalleryOn = false;
      this.lgBusy = false;
      this.currentItemsInDom = [];
      this.prevScrollTop = 0;
      this.bodyPaddingRight = 0;
      this.isDummyImageRemoved = false;
      this.dragOrSwipeEnabled = false;
      this.mediaContainerPosition = {
        top: 0,
        bottom: 0
      };
      if (!element) {
        return this;
      }
      lgId++;
      this.lgId = lgId;
      this.el = element;
      this.LGel = $LG(element);
      this.generateSettings(options);
      this.buildModules();
      if (this.settings.dynamic && this.settings.dynamicEl !== void 0 && !Array.isArray(this.settings.dynamicEl)) {
        throw "When using dynamic mode, you must also define dynamicEl as an Array.";
      }
      this.galleryItems = this.getItems();
      this.normalizeSettings();
      this.init();
      this.validateLicense();
      return this;
    }
    LightGallery2.prototype.generateSettings = function(options) {
      this.settings = __assign(__assign({}, lightGalleryCoreSettings), options);
      if (this.settings.isMobile && typeof this.settings.isMobile === "function" ? this.settings.isMobile() : utils.isMobile()) {
        var mobileSettings = __assign(__assign({}, this.settings.mobileSettings), this.settings.mobileSettings);
        this.settings = __assign(__assign({}, this.settings), mobileSettings);
      }
    };
    LightGallery2.prototype.normalizeSettings = function() {
      if (this.settings.slideEndAnimation) {
        this.settings.hideControlOnEnd = false;
      }
      if (!this.settings.closable) {
        this.settings.swipeToClose = false;
      }
      this.zoomFromOrigin = this.settings.zoomFromOrigin;
      if (this.settings.dynamic) {
        this.zoomFromOrigin = false;
      }
      if (this.settings.container) {
        var container = this.settings.container;
        if (typeof container === "function") {
          this.settings.container = container();
        } else if (typeof container === "string") {
          var el = document.querySelector(container);
          this.settings.container = el !== null && el !== void 0 ? el : document.body;
        }
      } else {
        this.settings.container = document.body;
      }
      this.settings.preload = Math.min(this.settings.preload, this.galleryItems.length);
    };
    LightGallery2.prototype.init = function() {
      var _this = this;
      this.addSlideVideoInfo(this.galleryItems);
      this.buildStructure();
      this.LGel.trigger(lGEvents.init, {
        instance: this
      });
      if (this.settings.keyPress) {
        this.keyPress();
      }
      setTimeout(function() {
        _this.enableDrag();
        _this.enableSwipe();
        _this.triggerPosterClick();
      }, 50);
      this.arrow();
      if (this.settings.mousewheel) {
        this.mousewheel();
      }
      if (!this.settings.dynamic) {
        this.openGalleryOnItemClick();
      }
    };
    LightGallery2.prototype.openGalleryOnItemClick = function() {
      var _this = this;
      var _loop_1 = function(index2) {
        var element = this_1.items[index2];
        var $element = $LG(element);
        var uuid = lgQuery.generateUUID();
        $element.attr("data-lg-id", uuid).on("click.lgcustom-item-" + uuid, function(e) {
          e.preventDefault();
          var currentItemIndex = _this.settings.index || index2;
          _this.openGallery(currentItemIndex, element);
        });
      };
      var this_1 = this;
      for (var index = 0; index < this.items.length; index++) {
        _loop_1(index);
      }
    };
    LightGallery2.prototype.buildModules = function() {
      var _this = this;
      this.settings.plugins.forEach(function(plugin) {
        _this.plugins.push(new plugin(_this, $LG));
      });
    };
    LightGallery2.prototype.validateLicense = function() {
      if (!this.settings.licenseKey) {
        console.error("Please provide a valid license key");
      } else if (this.settings.licenseKey === "0000-0000-000-0000") {
        console.warn("lightGallery: " + this.settings.licenseKey + " license key is not valid for production use");
      }
    };
    LightGallery2.prototype.getSlideItem = function(index) {
      return $LG(this.getSlideItemId(index));
    };
    LightGallery2.prototype.getSlideItemId = function(index) {
      return "#lg-item-" + this.lgId + "-" + index;
    };
    LightGallery2.prototype.getIdName = function(id) {
      return id + "-" + this.lgId;
    };
    LightGallery2.prototype.getElementById = function(id) {
      return $LG("#" + this.getIdName(id));
    };
    LightGallery2.prototype.manageSingleSlideClassName = function() {
      if (this.galleryItems.length < 2) {
        this.outer.addClass("lg-single-item");
      } else {
        this.outer.removeClass("lg-single-item");
      }
    };
    LightGallery2.prototype.buildStructure = function() {
      var _this = this;
      var container = this.$container && this.$container.get();
      if (container) {
        return;
      }
      var controls = "";
      var subHtmlCont = "";
      if (this.settings.controls) {
        controls = '<button type="button" id="' + this.getIdName("lg-prev") + '" aria-label="' + this.settings.strings["previousSlide"] + '" class="lg-prev lg-icon"> ' + this.settings.prevHtml + ' </button>\n                <button type="button" id="' + this.getIdName("lg-next") + '" aria-label="' + this.settings.strings["nextSlide"] + '" class="lg-next lg-icon"> ' + this.settings.nextHtml + " </button>";
      }
      if (this.settings.appendSubHtmlTo !== ".lg-item") {
        subHtmlCont = '<div class="lg-sub-html" role="status" aria-live="polite"></div>';
      }
      var addClasses2 = "";
      if (this.settings.allowMediaOverlap) {
        addClasses2 += "lg-media-overlap ";
      }
      var ariaLabelledby = this.settings.ariaLabelledby ? 'aria-labelledby="' + this.settings.ariaLabelledby + '"' : "";
      var ariaDescribedby = this.settings.ariaDescribedby ? 'aria-describedby="' + this.settings.ariaDescribedby + '"' : "";
      var containerClassName = "lg-container " + this.settings.addClass + " " + (document.body !== this.settings.container ? "lg-inline" : "");
      var closeIcon = this.settings.closable && this.settings.showCloseIcon ? '<button type="button" aria-label="' + this.settings.strings["closeGallery"] + '" id="' + this.getIdName("lg-close") + '" class="lg-close lg-icon"></button>' : "";
      var maximizeIcon = this.settings.showMaximizeIcon ? '<button type="button" aria-label="' + this.settings.strings["toggleMaximize"] + '" id="' + this.getIdName("lg-maximize") + '" class="lg-maximize lg-icon"></button>' : "";
      var template = '\n        <div class="' + containerClassName + '" id="' + this.getIdName("lg-container") + '" tabindex="-1" aria-modal="true" ' + ariaLabelledby + " " + ariaDescribedby + ' role="dialog"\n        >\n            <div id="' + this.getIdName("lg-backdrop") + '" class="lg-backdrop"></div>\n\n            <div id="' + this.getIdName("lg-outer") + '" class="lg-outer lg-use-css3 lg-css3 lg-hide-items ' + addClasses2 + ' ">\n\n              <div id="' + this.getIdName("lg-content") + '" class="lg-content">\n                <div id="' + this.getIdName("lg-inner") + '" class="lg-inner">\n                </div>\n                ' + controls + '\n              </div>\n                <div id="' + this.getIdName("lg-toolbar") + '" class="lg-toolbar lg-group">\n                    ' + maximizeIcon + "\n                    " + closeIcon + "\n                    </div>\n                    " + (this.settings.appendSubHtmlTo === ".lg-outer" ? subHtmlCont : "") + '\n                <div id="' + this.getIdName("lg-components") + '" class="lg-components">\n                    ' + (this.settings.appendSubHtmlTo === ".lg-sub-html" ? subHtmlCont : "") + "\n                </div>\n            </div>\n        </div>\n        ";
      $LG(this.settings.container).append(template);
      if (document.body !== this.settings.container) {
        $LG(this.settings.container).css("position", "relative");
      }
      this.outer = this.getElementById("lg-outer");
      this.$lgComponents = this.getElementById("lg-components");
      this.$backdrop = this.getElementById("lg-backdrop");
      this.$container = this.getElementById("lg-container");
      this.$inner = this.getElementById("lg-inner");
      this.$content = this.getElementById("lg-content");
      this.$toolbar = this.getElementById("lg-toolbar");
      this.$backdrop.css("transition-duration", this.settings.backdropDuration + "ms");
      var outerClassNames = this.settings.mode + " ";
      this.manageSingleSlideClassName();
      if (this.settings.enableDrag) {
        outerClassNames += "lg-grab ";
      }
      this.outer.addClass(outerClassNames);
      this.$inner.css("transition-timing-function", this.settings.easing);
      this.$inner.css("transition-duration", this.settings.speed + "ms");
      if (this.settings.download) {
        this.$toolbar.append('<a id="' + this.getIdName("lg-download") + '" target="_blank" rel="noopener" aria-label="' + this.settings.strings["download"] + '" download class="lg-download lg-icon"></a>');
      }
      this.counter();
      $LG(window).on("resize.lg.global" + this.lgId + " orientationchange.lg.global" + this.lgId, function() {
        _this.refreshOnResize();
      });
      this.hideBars();
      this.manageCloseGallery();
      this.toggleMaximize();
      this.initModules();
    };
    LightGallery2.prototype.refreshOnResize = function() {
      if (this.lgOpened) {
        var currentGalleryItem = this.galleryItems[this.index];
        var __slideVideoInfo = currentGalleryItem.__slideVideoInfo;
        this.mediaContainerPosition = this.getMediaContainerPosition();
        var _a = this.mediaContainerPosition, top_1 = _a.top, bottom = _a.bottom;
        this.currentImageSize = utils.getSize(this.items[this.index], this.outer, top_1 + bottom, __slideVideoInfo && this.settings.videoMaxSize);
        if (__slideVideoInfo) {
          this.resizeVideoSlide(this.index, this.currentImageSize);
        }
        if (this.zoomFromOrigin && !this.isDummyImageRemoved) {
          var imgStyle = this.getDummyImgStyles(this.currentImageSize);
          this.outer.find(".lg-current .lg-dummy-img").first().attr("style", imgStyle);
        }
        this.LGel.trigger(lGEvents.containerResize);
      }
    };
    LightGallery2.prototype.resizeVideoSlide = function(index, imageSize) {
      var lgVideoStyle = this.getVideoContStyle(imageSize);
      var currentSlide = this.getSlideItem(index);
      currentSlide.find(".lg-video-cont").attr("style", lgVideoStyle);
    };
    LightGallery2.prototype.updateSlides = function(items, index) {
      if (this.index > items.length - 1) {
        this.index = items.length - 1;
      }
      if (items.length === 1) {
        this.index = 0;
      }
      if (!items.length) {
        this.closeGallery();
        return;
      }
      var currentSrc = this.galleryItems[index].src;
      this.galleryItems = items;
      this.updateControls();
      this.$inner.empty();
      this.currentItemsInDom = [];
      var _index = 0;
      this.galleryItems.some(function(galleryItem, itemIndex) {
        if (galleryItem.src === currentSrc) {
          _index = itemIndex;
          return true;
        }
        return false;
      });
      this.currentItemsInDom = this.organizeSlideItems(_index, -1);
      this.loadContent(_index, true);
      this.getSlideItem(_index).addClass("lg-current");
      this.index = _index;
      this.updateCurrentCounter(_index);
      this.LGel.trigger(lGEvents.updateSlides);
    };
    LightGallery2.prototype.getItems = function() {
      this.items = [];
      if (!this.settings.dynamic) {
        if (this.settings.selector === "this") {
          this.items.push(this.el);
        } else if (this.settings.selector) {
          if (typeof this.settings.selector === "string") {
            if (this.settings.selectWithin) {
              var selectWithin = $LG(this.settings.selectWithin);
              this.items = selectWithin.find(this.settings.selector).get();
            } else {
              this.items = this.el.querySelectorAll(this.settings.selector);
            }
          } else {
            this.items = this.settings.selector;
          }
        } else {
          this.items = this.el.children;
        }
        return utils.getDynamicOptions(this.items, this.settings.extraProps, this.settings.getCaptionFromTitleOrAlt, this.settings.exThumbImage);
      } else {
        return this.settings.dynamicEl || [];
      }
    };
    LightGallery2.prototype.shouldHideScrollbar = function() {
      return this.settings.hideScrollbar && document.body === this.settings.container;
    };
    LightGallery2.prototype.hideScrollbar = function() {
      if (!this.shouldHideScrollbar()) {
        return;
      }
      this.bodyPaddingRight = parseFloat($LG("body").style().paddingRight);
      var bodyRect = document.documentElement.getBoundingClientRect();
      var scrollbarWidth = window.innerWidth - bodyRect.width;
      $LG(document.body).css("padding-right", scrollbarWidth + this.bodyPaddingRight + "px");
      $LG(document.body).addClass("lg-overlay-open");
    };
    LightGallery2.prototype.resetScrollBar = function() {
      if (!this.shouldHideScrollbar()) {
        return;
      }
      $LG(document.body).css("padding-right", this.bodyPaddingRight + "px");
      $LG(document.body).removeClass("lg-overlay-open");
    };
    LightGallery2.prototype.openGallery = function(index, element) {
      var _this = this;
      if (index === void 0) {
        index = this.settings.index;
      }
      if (this.lgOpened)
        return;
      this.lgOpened = true;
      this.outer.removeClass("lg-hide-items");
      this.hideScrollbar();
      this.$container.addClass("lg-show");
      var itemsToBeInsertedToDom = this.getItemsToBeInsertedToDom(index, index);
      this.currentItemsInDom = itemsToBeInsertedToDom;
      var items = "";
      itemsToBeInsertedToDom.forEach(function(item) {
        items = items + ('<div id="' + item + '" class="lg-item"></div>');
      });
      this.$inner.append(items);
      this.addHtml(index);
      var transform = "";
      this.mediaContainerPosition = this.getMediaContainerPosition();
      var _a = this.mediaContainerPosition, top = _a.top, bottom = _a.bottom;
      if (!this.settings.allowMediaOverlap) {
        this.setMediaContainerPosition(top, bottom);
      }
      var __slideVideoInfo = this.galleryItems[index].__slideVideoInfo;
      if (this.zoomFromOrigin && element) {
        this.currentImageSize = utils.getSize(element, this.outer, top + bottom, __slideVideoInfo && this.settings.videoMaxSize);
        transform = utils.getTransform(element, this.outer, top, bottom, this.currentImageSize);
      }
      if (!this.zoomFromOrigin || !transform) {
        this.outer.addClass(this.settings.startClass);
        this.getSlideItem(index).removeClass("lg-complete");
      }
      var timeout = this.settings.zoomFromOrigin ? 100 : this.settings.backdropDuration;
      setTimeout(function() {
        _this.outer.addClass("lg-components-open");
      }, timeout);
      this.index = index;
      this.LGel.trigger(lGEvents.beforeOpen);
      this.getSlideItem(index).addClass("lg-current");
      this.lGalleryOn = false;
      this.prevScrollTop = $LG(window).scrollTop();
      setTimeout(function() {
        if (_this.zoomFromOrigin && transform) {
          var currentSlide_1 = _this.getSlideItem(index);
          currentSlide_1.css("transform", transform);
          setTimeout(function() {
            currentSlide_1.addClass("lg-start-progress lg-start-end-progress").css("transition-duration", _this.settings.startAnimationDuration + "ms");
            _this.outer.addClass("lg-zoom-from-image");
          });
          setTimeout(function() {
            currentSlide_1.css("transform", "translate3d(0, 0, 0)");
          }, 100);
        }
        setTimeout(function() {
          _this.$backdrop.addClass("in");
          _this.$container.addClass("lg-show-in");
        }, 10);
        setTimeout(function() {
          if (_this.settings.trapFocus && document.body === _this.settings.container) {
            _this.trapFocus();
          }
        }, _this.settings.backdropDuration + 50);
        if (!_this.zoomFromOrigin || !transform) {
          setTimeout(function() {
            _this.outer.addClass("lg-visible");
          }, _this.settings.backdropDuration);
        }
        _this.slide(index, false, false, false);
        _this.LGel.trigger(lGEvents.afterOpen);
      });
      if (document.body === this.settings.container) {
        $LG("html").addClass("lg-on");
      }
    };
    LightGallery2.prototype.getMediaContainerPosition = function() {
      if (this.settings.allowMediaOverlap) {
        return {
          top: 0,
          bottom: 0
        };
      }
      var top = this.$toolbar.get().clientHeight || 0;
      var subHtml = this.outer.find(".lg-components .lg-sub-html").get();
      var captionHeight = this.settings.defaultCaptionHeight || subHtml && subHtml.clientHeight || 0;
      var thumbContainer = this.outer.find(".lg-thumb-outer").get();
      var thumbHeight = thumbContainer ? thumbContainer.clientHeight : 0;
      var bottom = thumbHeight + captionHeight;
      return {
        top,
        bottom
      };
    };
    LightGallery2.prototype.setMediaContainerPosition = function(top, bottom) {
      if (top === void 0) {
        top = 0;
      }
      if (bottom === void 0) {
        bottom = 0;
      }
      this.$content.css("top", top + "px").css("bottom", bottom + "px");
    };
    LightGallery2.prototype.hideBars = function() {
      var _this = this;
      setTimeout(function() {
        _this.outer.removeClass("lg-hide-items");
        if (_this.settings.hideBarsDelay > 0) {
          _this.outer.on("mousemove.lg click.lg touchstart.lg", function() {
            _this.outer.removeClass("lg-hide-items");
            clearTimeout(_this.hideBarTimeout);
            _this.hideBarTimeout = setTimeout(function() {
              _this.outer.addClass("lg-hide-items");
            }, _this.settings.hideBarsDelay);
          });
          _this.outer.trigger("mousemove.lg");
        }
      }, this.settings.showBarsAfter);
    };
    LightGallery2.prototype.initPictureFill = function($img) {
      if (this.settings.supportLegacyBrowser) {
        try {
          picturefill({
            elements: [$img.get()]
          });
        } catch (e) {
          console.warn("lightGallery :- If you want srcset or picture tag to be supported for older browser please include picturefil javascript library in your document.");
        }
      }
    };
    LightGallery2.prototype.counter = function() {
      if (this.settings.counter) {
        var counterHtml = '<div class="lg-counter" role="status" aria-live="polite">\n                <span id="' + this.getIdName("lg-counter-current") + '" class="lg-counter-current">' + (this.index + 1) + ' </span> /\n                <span id="' + this.getIdName("lg-counter-all") + '" class="lg-counter-all">' + this.galleryItems.length + " </span></div>";
        this.outer.find(this.settings.appendCounterTo).append(counterHtml);
      }
    };
    LightGallery2.prototype.addHtml = function(index) {
      var subHtml;
      var subHtmlUrl;
      if (this.galleryItems[index].subHtmlUrl) {
        subHtmlUrl = this.galleryItems[index].subHtmlUrl;
      } else {
        subHtml = this.galleryItems[index].subHtml;
      }
      if (!subHtmlUrl) {
        if (subHtml) {
          var fL = subHtml.substring(0, 1);
          if (fL === "." || fL === "#") {
            try {
              if (this.settings.subHtmlSelectorRelative && !this.settings.dynamic) {
                subHtml = $LG(this.items).eq(index).find(subHtml).first().html();
              } else {
                subHtml = $LG(subHtml).first().html();
              }
            } catch (error) {
              console.warn('Error processing subHtml selector "' + subHtml + '"');
              subHtml = "";
            }
          }
        } else {
          subHtml = "";
        }
      }
      if (this.settings.appendSubHtmlTo !== ".lg-item") {
        if (subHtmlUrl) {
          utils.fetchCaptionFromUrl(subHtmlUrl, this.outer.find(".lg-sub-html"), "replace");
        } else {
          this.outer.find(".lg-sub-html").html(subHtml);
        }
      } else {
        var currentSlide = $LG(this.getSlideItemId(index));
        if (subHtmlUrl) {
          utils.fetchCaptionFromUrl(subHtmlUrl, currentSlide, "append");
        } else {
          currentSlide.append('<div class="lg-sub-html">' + subHtml + "</div>");
        }
      }
      if (typeof subHtml !== "undefined" && subHtml !== null) {
        if (subHtml === "") {
          this.outer.find(this.settings.appendSubHtmlTo).addClass("lg-empty-html");
        } else {
          this.outer.find(this.settings.appendSubHtmlTo).removeClass("lg-empty-html");
        }
      }
      this.LGel.trigger(lGEvents.afterAppendSubHtml, {
        index
      });
    };
    LightGallery2.prototype.preload = function(index) {
      for (var i = 1; i <= this.settings.preload; i++) {
        if (i >= this.galleryItems.length - index) {
          break;
        }
        this.loadContent(index + i, false);
      }
      for (var j = 1; j <= this.settings.preload; j++) {
        if (index - j < 0) {
          break;
        }
        this.loadContent(index - j, false);
      }
    };
    LightGallery2.prototype.getDummyImgStyles = function(imageSize) {
      if (!imageSize)
        return "";
      return "width:" + imageSize.width + "px;\n                margin-left: -" + imageSize.width / 2 + "px;\n                margin-top: -" + imageSize.height / 2 + "px;\n                height:" + imageSize.height + "px";
    };
    LightGallery2.prototype.getVideoContStyle = function(imageSize) {
      if (!imageSize)
        return "";
      return "width:" + imageSize.width + "px;\n                height:" + imageSize.height + "px";
    };
    LightGallery2.prototype.getDummyImageContent = function($currentSlide, index, alt) {
      var $currentItem;
      if (!this.settings.dynamic) {
        $currentItem = $LG(this.items).eq(index);
      }
      if ($currentItem) {
        var _dummyImgSrc = void 0;
        if (!this.settings.exThumbImage) {
          _dummyImgSrc = $currentItem.find("img").first().attr("src");
        } else {
          _dummyImgSrc = $currentItem.attr(this.settings.exThumbImage);
        }
        if (!_dummyImgSrc)
          return "";
        var imgStyle = this.getDummyImgStyles(this.currentImageSize);
        var dummyImgContentImg = document.createElement("img");
        dummyImgContentImg.alt = alt || "";
        dummyImgContentImg.src = _dummyImgSrc;
        dummyImgContentImg.className = "lg-dummy-img";
        dummyImgContentImg.style.cssText = imgStyle;
        $currentSlide.addClass("lg-first-slide");
        this.outer.addClass("lg-first-slide-loading");
        return dummyImgContentImg;
      }
      return "";
    };
    LightGallery2.prototype.setImgMarkup = function(src, $currentSlide, index) {
      var currentGalleryItem = this.galleryItems[index];
      var alt = currentGalleryItem.alt, srcset = currentGalleryItem.srcset, sizes = currentGalleryItem.sizes, sources = currentGalleryItem.sources;
      var imgContent = "";
      var altAttr = alt ? 'alt="' + alt + '"' : "";
      if (this.isFirstSlideWithZoomAnimation()) {
        imgContent = this.getDummyImageContent($currentSlide, index, altAttr);
      } else {
        imgContent = utils.getImgMarkup(index, src, altAttr, srcset, sizes, sources);
      }
      var picture = document.createElement("picture");
      picture.className = "lg-img-wrap";
      $LG(picture).append(imgContent);
      $currentSlide.prepend(picture);
    };
    LightGallery2.prototype.onSlideObjectLoad = function($slide, isHTML5VideoWithoutPoster, onLoad2, onError) {
      var mediaObject = $slide.find(".lg-object").first();
      if (utils.isImageLoaded(mediaObject.get()) || isHTML5VideoWithoutPoster) {
        onLoad2();
      } else {
        mediaObject.on("load.lg error.lg", function() {
          onLoad2 && onLoad2();
        });
        mediaObject.on("error.lg", function() {
          onError && onError();
        });
      }
    };
    LightGallery2.prototype.onLgObjectLoad = function(currentSlide, index, delay, speed, isFirstSlide, isHTML5VideoWithoutPoster) {
      var _this = this;
      this.onSlideObjectLoad(currentSlide, isHTML5VideoWithoutPoster, function() {
        _this.triggerSlideItemLoad(currentSlide, index, delay, speed, isFirstSlide);
      }, function() {
        currentSlide.addClass("lg-complete lg-complete_");
        currentSlide.html('<span class="lg-error-msg">' + _this.settings.strings["mediaLoadingFailed"] + "</span>");
      });
    };
    LightGallery2.prototype.triggerSlideItemLoad = function($currentSlide, index, delay, speed, isFirstSlide) {
      var _this = this;
      var currentGalleryItem = this.galleryItems[index];
      var _speed = isFirstSlide && this.getSlideType(currentGalleryItem) === "video" && !currentGalleryItem.poster ? speed : 0;
      setTimeout(function() {
        $currentSlide.addClass("lg-complete lg-complete_");
        _this.LGel.trigger(lGEvents.slideItemLoad, {
          index,
          delay: delay || 0,
          isFirstSlide
        });
      }, _speed);
    };
    LightGallery2.prototype.isFirstSlideWithZoomAnimation = function() {
      return !!(!this.lGalleryOn && this.zoomFromOrigin && this.currentImageSize);
    };
    LightGallery2.prototype.addSlideVideoInfo = function(items) {
      var _this = this;
      items.forEach(function(element, index) {
        element.__slideVideoInfo = utils.isVideo(element.src, !!element.video, index);
        if (element.__slideVideoInfo && _this.settings.loadYouTubePoster && !element.poster && element.__slideVideoInfo.youtube) {
          element.poster = "//img.youtube.com/vi/" + element.__slideVideoInfo.youtube[1] + "/maxresdefault.jpg";
        }
      });
    };
    LightGallery2.prototype.loadContent = function(index, rec) {
      var _this = this;
      var currentGalleryItem = this.galleryItems[index];
      var $currentSlide = $LG(this.getSlideItemId(index));
      var poster = currentGalleryItem.poster, srcset = currentGalleryItem.srcset, sizes = currentGalleryItem.sizes, sources = currentGalleryItem.sources;
      var src = currentGalleryItem.src;
      var video = currentGalleryItem.video;
      var _html5Video = video && typeof video === "string" ? JSON.parse(video) : video;
      if (currentGalleryItem.responsive) {
        var srcDyItms = currentGalleryItem.responsive.split(",");
        src = utils.getResponsiveSrc(srcDyItms) || src;
      }
      var videoInfo = currentGalleryItem.__slideVideoInfo;
      var lgVideoStyle = "";
      var iframe = !!currentGalleryItem.iframe;
      var isFirstSlide = !this.lGalleryOn;
      var delay = 0;
      if (isFirstSlide) {
        if (this.zoomFromOrigin && this.currentImageSize) {
          delay = this.settings.startAnimationDuration + 10;
        } else {
          delay = this.settings.backdropDuration + 10;
        }
      }
      if (!$currentSlide.hasClass("lg-loaded")) {
        if (videoInfo) {
          var _a = this.mediaContainerPosition, top_2 = _a.top, bottom = _a.bottom;
          var videoSize = utils.getSize(this.items[index], this.outer, top_2 + bottom, videoInfo && this.settings.videoMaxSize);
          lgVideoStyle = this.getVideoContStyle(videoSize);
        }
        if (iframe) {
          var markup = utils.getIframeMarkup(this.settings.iframeWidth, this.settings.iframeHeight, this.settings.iframeMaxWidth, this.settings.iframeMaxHeight, src, currentGalleryItem.iframeTitle);
          $currentSlide.prepend(markup);
        } else if (poster) {
          var dummyImg = "";
          var hasStartAnimation = isFirstSlide && this.zoomFromOrigin && this.currentImageSize;
          if (hasStartAnimation) {
            dummyImg = this.getDummyImageContent($currentSlide, index, "");
          }
          var markup = utils.getVideoPosterMarkup(poster, dummyImg || "", lgVideoStyle, this.settings.strings["playVideo"], videoInfo);
          $currentSlide.prepend(markup);
        } else if (videoInfo) {
          var markup = '<div class="lg-video-cont " style="' + lgVideoStyle + '"></div>';
          $currentSlide.prepend(markup);
        } else {
          this.setImgMarkup(src, $currentSlide, index);
          if (srcset || sources) {
            var $img = $currentSlide.find(".lg-object");
            this.initPictureFill($img);
          }
        }
        if (poster || videoInfo) {
          this.LGel.trigger(lGEvents.hasVideo, {
            index,
            src,
            html5Video: _html5Video,
            hasPoster: !!poster
          });
        }
        this.LGel.trigger(lGEvents.afterAppendSlide, { index });
        if (this.lGalleryOn && this.settings.appendSubHtmlTo === ".lg-item") {
          this.addHtml(index);
        }
      }
      var _speed = 0;
      if (delay && !$LG(document.body).hasClass("lg-from-hash")) {
        _speed = delay;
      }
      if (this.isFirstSlideWithZoomAnimation()) {
        setTimeout(function() {
          $currentSlide.removeClass("lg-start-end-progress lg-start-progress").removeAttr("style");
        }, this.settings.startAnimationDuration + 100);
        if (!$currentSlide.hasClass("lg-loaded")) {
          setTimeout(function() {
            if (_this.getSlideType(currentGalleryItem) === "image") {
              var alt = currentGalleryItem.alt;
              var altAttr = alt ? 'alt="' + alt + '"' : "";
              $currentSlide.find(".lg-img-wrap").append(utils.getImgMarkup(index, src, altAttr, srcset, sizes, currentGalleryItem.sources));
              if (srcset || sources) {
                var $img2 = $currentSlide.find(".lg-object");
                _this.initPictureFill($img2);
              }
            }
            if (_this.getSlideType(currentGalleryItem) === "image" || _this.getSlideType(currentGalleryItem) === "video" && poster) {
              _this.onLgObjectLoad($currentSlide, index, delay, _speed, true, false);
              _this.onSlideObjectLoad($currentSlide, !!(videoInfo && videoInfo.html5 && !poster), function() {
                _this.loadContentOnFirstSlideLoad(index, $currentSlide, _speed);
              }, function() {
                _this.loadContentOnFirstSlideLoad(index, $currentSlide, _speed);
              });
            }
          }, this.settings.startAnimationDuration + 100);
        }
      }
      $currentSlide.addClass("lg-loaded");
      if (!this.isFirstSlideWithZoomAnimation() || this.getSlideType(currentGalleryItem) === "video" && !poster) {
        this.onLgObjectLoad($currentSlide, index, delay, _speed, isFirstSlide, !!(videoInfo && videoInfo.html5 && !poster));
      }
      if ((!this.zoomFromOrigin || !this.currentImageSize) && $currentSlide.hasClass("lg-complete_") && !this.lGalleryOn) {
        setTimeout(function() {
          $currentSlide.addClass("lg-complete");
        }, this.settings.backdropDuration);
      }
      this.lGalleryOn = true;
      if (rec === true) {
        if (!$currentSlide.hasClass("lg-complete_")) {
          $currentSlide.find(".lg-object").first().on("load.lg error.lg", function() {
            _this.preload(index);
          });
        } else {
          this.preload(index);
        }
      }
    };
    LightGallery2.prototype.loadContentOnFirstSlideLoad = function(index, $currentSlide, speed) {
      var _this = this;
      setTimeout(function() {
        $currentSlide.find(".lg-dummy-img").remove();
        $currentSlide.removeClass("lg-first-slide");
        _this.outer.removeClass("lg-first-slide-loading");
        _this.isDummyImageRemoved = true;
        _this.preload(index);
      }, speed + 300);
    };
    LightGallery2.prototype.getItemsToBeInsertedToDom = function(index, prevIndex, numberOfItems) {
      var _this = this;
      if (numberOfItems === void 0) {
        numberOfItems = 0;
      }
      var itemsToBeInsertedToDom = [];
      var possibleNumberOfItems = Math.max(numberOfItems, 3);
      possibleNumberOfItems = Math.min(possibleNumberOfItems, this.galleryItems.length);
      var prevIndexItem = "lg-item-" + this.lgId + "-" + prevIndex;
      if (this.galleryItems.length <= 3) {
        this.galleryItems.forEach(function(_element, index2) {
          itemsToBeInsertedToDom.push("lg-item-" + _this.lgId + "-" + index2);
        });
        return itemsToBeInsertedToDom;
      }
      if (index < (this.galleryItems.length - 1) / 2) {
        for (var idx = index; idx > index - possibleNumberOfItems / 2 && idx >= 0; idx--) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + idx);
        }
        var numberOfExistingItems = itemsToBeInsertedToDom.length;
        for (var idx = 0; idx < possibleNumberOfItems - numberOfExistingItems; idx++) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (index + idx + 1));
        }
      } else {
        for (var idx = index; idx <= this.galleryItems.length - 1 && idx < index + possibleNumberOfItems / 2; idx++) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + idx);
        }
        var numberOfExistingItems = itemsToBeInsertedToDom.length;
        for (var idx = 0; idx < possibleNumberOfItems - numberOfExistingItems; idx++) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (index - idx - 1));
        }
      }
      if (this.settings.loop) {
        if (index === this.galleryItems.length - 1) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-0");
        } else if (index === 0) {
          itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + (this.galleryItems.length - 1));
        }
      }
      if (itemsToBeInsertedToDom.indexOf(prevIndexItem) === -1) {
        itemsToBeInsertedToDom.push("lg-item-" + this.lgId + "-" + prevIndex);
      }
      return itemsToBeInsertedToDom;
    };
    LightGallery2.prototype.organizeSlideItems = function(index, prevIndex) {
      var _this = this;
      var itemsToBeInsertedToDom = this.getItemsToBeInsertedToDom(index, prevIndex, this.settings.numberOfSlideItemsInDom);
      itemsToBeInsertedToDom.forEach(function(item) {
        if (_this.currentItemsInDom.indexOf(item) === -1) {
          _this.$inner.append('<div id="' + item + '" class="lg-item"></div>');
        }
      });
      this.currentItemsInDom.forEach(function(item) {
        if (itemsToBeInsertedToDom.indexOf(item) === -1) {
          $LG("#" + item).remove();
        }
      });
      return itemsToBeInsertedToDom;
    };
    LightGallery2.prototype.getPreviousSlideIndex = function() {
      var prevIndex = 0;
      try {
        var currentItemId = this.outer.find(".lg-current").first().attr("id");
        prevIndex = parseInt(currentItemId.split("-")[3]) || 0;
      } catch (error) {
        prevIndex = 0;
      }
      return prevIndex;
    };
    LightGallery2.prototype.setDownloadValue = function(index) {
      if (this.settings.download) {
        var currentGalleryItem = this.galleryItems[index];
        var hideDownloadBtn = currentGalleryItem.downloadUrl === false || currentGalleryItem.downloadUrl === "false";
        if (hideDownloadBtn) {
          this.outer.addClass("lg-hide-download");
        } else {
          var $download = this.getElementById("lg-download");
          this.outer.removeClass("lg-hide-download");
          $download.attr("href", currentGalleryItem.downloadUrl || currentGalleryItem.src);
          if (currentGalleryItem.download) {
            $download.attr("download", currentGalleryItem.download);
          }
        }
      }
    };
    LightGallery2.prototype.makeSlideAnimation = function(direction, currentSlideItem, previousSlideItem) {
      var _this = this;
      if (this.lGalleryOn) {
        previousSlideItem.addClass("lg-slide-progress");
      }
      setTimeout(function() {
        _this.outer.addClass("lg-no-trans");
        _this.outer.find(".lg-item").removeClass("lg-prev-slide lg-next-slide");
        if (direction === "prev") {
          currentSlideItem.addClass("lg-prev-slide");
          previousSlideItem.addClass("lg-next-slide");
        } else {
          currentSlideItem.addClass("lg-next-slide");
          previousSlideItem.addClass("lg-prev-slide");
        }
        setTimeout(function() {
          _this.outer.find(".lg-item").removeClass("lg-current");
          currentSlideItem.addClass("lg-current");
          _this.outer.removeClass("lg-no-trans");
        }, 50);
      }, this.lGalleryOn ? this.settings.slideDelay : 0);
    };
    LightGallery2.prototype.slide = function(index, fromTouch, fromThumb, direction) {
      var _this = this;
      var prevIndex = this.getPreviousSlideIndex();
      this.currentItemsInDom = this.organizeSlideItems(index, prevIndex);
      if (this.lGalleryOn && prevIndex === index) {
        return;
      }
      var numberOfGalleryItems = this.galleryItems.length;
      if (!this.lgBusy) {
        if (this.settings.counter) {
          this.updateCurrentCounter(index);
        }
        var currentSlideItem = this.getSlideItem(index);
        var previousSlideItem_1 = this.getSlideItem(prevIndex);
        var currentGalleryItem = this.galleryItems[index];
        var videoInfo = currentGalleryItem.__slideVideoInfo;
        this.outer.attr("data-lg-slide-type", this.getSlideType(currentGalleryItem));
        this.setDownloadValue(index);
        if (videoInfo) {
          var _a = this.mediaContainerPosition, top_3 = _a.top, bottom = _a.bottom;
          var videoSize = utils.getSize(this.items[index], this.outer, top_3 + bottom, videoInfo && this.settings.videoMaxSize);
          this.resizeVideoSlide(index, videoSize);
        }
        this.LGel.trigger(lGEvents.beforeSlide, {
          prevIndex,
          index,
          fromTouch: !!fromTouch,
          fromThumb: !!fromThumb
        });
        this.lgBusy = true;
        clearTimeout(this.hideBarTimeout);
        this.arrowDisable(index);
        if (!direction) {
          if (index < prevIndex) {
            direction = "prev";
          } else if (index > prevIndex) {
            direction = "next";
          }
        }
        if (!fromTouch) {
          this.makeSlideAnimation(direction, currentSlideItem, previousSlideItem_1);
        } else {
          this.outer.find(".lg-item").removeClass("lg-prev-slide lg-current lg-next-slide");
          var touchPrev = void 0;
          var touchNext = void 0;
          if (numberOfGalleryItems > 2) {
            touchPrev = index - 1;
            touchNext = index + 1;
            if (index === 0 && prevIndex === numberOfGalleryItems - 1) {
              touchNext = 0;
              touchPrev = numberOfGalleryItems - 1;
            } else if (index === numberOfGalleryItems - 1 && prevIndex === 0) {
              touchNext = 0;
              touchPrev = numberOfGalleryItems - 1;
            }
          } else {
            touchPrev = 0;
            touchNext = 1;
          }
          if (direction === "prev") {
            this.getSlideItem(touchNext).addClass("lg-next-slide");
          } else {
            this.getSlideItem(touchPrev).addClass("lg-prev-slide");
          }
          currentSlideItem.addClass("lg-current");
        }
        if (!this.lGalleryOn) {
          this.loadContent(index, true);
        } else {
          setTimeout(function() {
            _this.loadContent(index, true);
            if (_this.settings.appendSubHtmlTo !== ".lg-item") {
              _this.addHtml(index);
            }
          }, this.settings.speed + 50 + (fromTouch ? 0 : this.settings.slideDelay));
        }
        setTimeout(function() {
          _this.lgBusy = false;
          previousSlideItem_1.removeClass("lg-slide-progress");
          _this.LGel.trigger(lGEvents.afterSlide, {
            prevIndex,
            index,
            fromTouch,
            fromThumb
          });
        }, (this.lGalleryOn ? this.settings.speed + 100 : 100) + (fromTouch ? 0 : this.settings.slideDelay));
      }
      this.index = index;
    };
    LightGallery2.prototype.updateCurrentCounter = function(index) {
      this.getElementById("lg-counter-current").html(index + 1 + "");
    };
    LightGallery2.prototype.updateCounterTotal = function() {
      this.getElementById("lg-counter-all").html(this.galleryItems.length + "");
    };
    LightGallery2.prototype.getSlideType = function(item) {
      if (item.__slideVideoInfo) {
        return "video";
      } else if (item.iframe) {
        return "iframe";
      } else {
        return "image";
      }
    };
    LightGallery2.prototype.touchMove = function(startCoords, endCoords, e) {
      var distanceX = endCoords.pageX - startCoords.pageX;
      var distanceY = endCoords.pageY - startCoords.pageY;
      var allowSwipe = false;
      if (this.swipeDirection) {
        allowSwipe = true;
      } else {
        if (Math.abs(distanceX) > 15) {
          this.swipeDirection = "horizontal";
          allowSwipe = true;
        } else if (Math.abs(distanceY) > 15) {
          this.swipeDirection = "vertical";
          allowSwipe = true;
        }
      }
      if (!allowSwipe) {
        return;
      }
      var $currentSlide = this.getSlideItem(this.index);
      if (this.swipeDirection === "horizontal") {
        e === null || e === void 0 ? void 0 : e.preventDefault();
        this.outer.addClass("lg-dragging");
        this.setTranslate($currentSlide, distanceX, 0);
        var width = $currentSlide.get().offsetWidth;
        var slideWidthAmount = width * 15 / 100;
        var gutter = slideWidthAmount - Math.abs(distanceX * 10 / 100);
        this.setTranslate(this.outer.find(".lg-prev-slide").first(), -width + distanceX - gutter, 0);
        this.setTranslate(this.outer.find(".lg-next-slide").first(), width + distanceX + gutter, 0);
      } else if (this.swipeDirection === "vertical") {
        if (this.settings.swipeToClose) {
          e === null || e === void 0 ? void 0 : e.preventDefault();
          this.$container.addClass("lg-dragging-vertical");
          var opacity = 1 - Math.abs(distanceY) / window.innerHeight;
          this.$backdrop.css("opacity", opacity);
          var scale = 1 - Math.abs(distanceY) / (window.innerWidth * 2);
          this.setTranslate($currentSlide, 0, distanceY, scale, scale);
          if (Math.abs(distanceY) > 100) {
            this.outer.addClass("lg-hide-items").removeClass("lg-components-open");
          }
        }
      }
    };
    LightGallery2.prototype.touchEnd = function(endCoords, startCoords, event) {
      var _this = this;
      var distance;
      if (this.settings.mode !== "lg-slide") {
        this.outer.addClass("lg-slide");
      }
      setTimeout(function() {
        _this.$container.removeClass("lg-dragging-vertical");
        _this.outer.removeClass("lg-dragging lg-hide-items").addClass("lg-components-open");
        var triggerClick = true;
        if (_this.swipeDirection === "horizontal") {
          distance = endCoords.pageX - startCoords.pageX;
          var distanceAbs = Math.abs(endCoords.pageX - startCoords.pageX);
          if (distance < 0 && distanceAbs > _this.settings.swipeThreshold) {
            _this.goToNextSlide(true);
            triggerClick = false;
          } else if (distance > 0 && distanceAbs > _this.settings.swipeThreshold) {
            _this.goToPrevSlide(true);
            triggerClick = false;
          }
        } else if (_this.swipeDirection === "vertical") {
          distance = Math.abs(endCoords.pageY - startCoords.pageY);
          if (_this.settings.closable && _this.settings.swipeToClose && distance > 100) {
            _this.closeGallery();
            return;
          } else {
            _this.$backdrop.css("opacity", 1);
          }
        }
        _this.outer.find(".lg-item").removeAttr("style");
        if (triggerClick && Math.abs(endCoords.pageX - startCoords.pageX) < 5) {
          var target = $LG(event.target);
          if (_this.isPosterElement(target)) {
            _this.LGel.trigger(lGEvents.posterClick);
          }
        }
        _this.swipeDirection = void 0;
      });
      setTimeout(function() {
        if (!_this.outer.hasClass("lg-dragging") && _this.settings.mode !== "lg-slide") {
          _this.outer.removeClass("lg-slide");
        }
      }, this.settings.speed + 100);
    };
    LightGallery2.prototype.enableSwipe = function() {
      var _this = this;
      var startCoords = {};
      var endCoords = {};
      var isMoved = false;
      var isSwiping = false;
      if (this.settings.enableSwipe) {
        this.$inner.on("touchstart.lg", function(e) {
          _this.dragOrSwipeEnabled = true;
          var $item = _this.getSlideItem(_this.index);
          if (($LG(e.target).hasClass("lg-item") || $item.get().contains(e.target)) && !_this.outer.hasClass("lg-zoomed") && !_this.lgBusy && e.touches.length === 1) {
            isSwiping = true;
            _this.touchAction = "swipe";
            _this.manageSwipeClass();
            startCoords = {
              pageX: e.touches[0].pageX,
              pageY: e.touches[0].pageY
            };
          }
        });
        this.$inner.on("touchmove.lg", function(e) {
          if (isSwiping && _this.touchAction === "swipe" && e.touches.length === 1) {
            endCoords = {
              pageX: e.touches[0].pageX,
              pageY: e.touches[0].pageY
            };
            _this.touchMove(startCoords, endCoords, e);
            isMoved = true;
          }
        });
        this.$inner.on("touchend.lg", function(event) {
          if (_this.touchAction === "swipe") {
            if (isMoved) {
              isMoved = false;
              _this.touchEnd(endCoords, startCoords, event);
            } else if (isSwiping) {
              var target = $LG(event.target);
              if (_this.isPosterElement(target)) {
                _this.LGel.trigger(lGEvents.posterClick);
              }
            }
            _this.touchAction = void 0;
            isSwiping = false;
          }
        });
      }
    };
    LightGallery2.prototype.enableDrag = function() {
      var _this = this;
      var startCoords = {};
      var endCoords = {};
      var isDraging = false;
      var isMoved = false;
      if (this.settings.enableDrag) {
        this.outer.on("mousedown.lg", function(e) {
          _this.dragOrSwipeEnabled = true;
          var $item = _this.getSlideItem(_this.index);
          if ($LG(e.target).hasClass("lg-item") || $item.get().contains(e.target)) {
            if (!_this.outer.hasClass("lg-zoomed") && !_this.lgBusy) {
              e.preventDefault();
              if (!_this.lgBusy) {
                _this.manageSwipeClass();
                startCoords = {
                  pageX: e.pageX,
                  pageY: e.pageY
                };
                isDraging = true;
                _this.outer.get().scrollLeft += 1;
                _this.outer.get().scrollLeft -= 1;
                _this.outer.removeClass("lg-grab").addClass("lg-grabbing");
                _this.LGel.trigger(lGEvents.dragStart);
              }
            }
          }
        });
        $LG(window).on("mousemove.lg.global" + this.lgId, function(e) {
          if (isDraging && _this.lgOpened) {
            isMoved = true;
            endCoords = {
              pageX: e.pageX,
              pageY: e.pageY
            };
            _this.touchMove(startCoords, endCoords);
            _this.LGel.trigger(lGEvents.dragMove);
          }
        });
        $LG(window).on("mouseup.lg.global" + this.lgId, function(event) {
          if (!_this.lgOpened) {
            return;
          }
          var target = $LG(event.target);
          if (isMoved) {
            isMoved = false;
            _this.touchEnd(endCoords, startCoords, event);
            _this.LGel.trigger(lGEvents.dragEnd);
          } else if (_this.isPosterElement(target)) {
            _this.LGel.trigger(lGEvents.posterClick);
          }
          if (isDraging) {
            isDraging = false;
            _this.outer.removeClass("lg-grabbing").addClass("lg-grab");
          }
        });
      }
    };
    LightGallery2.prototype.triggerPosterClick = function() {
      var _this = this;
      this.$inner.on("click.lg", function(event) {
        if (!_this.dragOrSwipeEnabled && _this.isPosterElement($LG(event.target))) {
          _this.LGel.trigger(lGEvents.posterClick);
        }
      });
    };
    LightGallery2.prototype.manageSwipeClass = function() {
      var _touchNext = this.index + 1;
      var _touchPrev = this.index - 1;
      if (this.settings.loop && this.galleryItems.length > 2) {
        if (this.index === 0) {
          _touchPrev = this.galleryItems.length - 1;
        } else if (this.index === this.galleryItems.length - 1) {
          _touchNext = 0;
        }
      }
      this.outer.find(".lg-item").removeClass("lg-next-slide lg-prev-slide");
      if (_touchPrev > -1) {
        this.getSlideItem(_touchPrev).addClass("lg-prev-slide");
      }
      this.getSlideItem(_touchNext).addClass("lg-next-slide");
    };
    LightGallery2.prototype.goToNextSlide = function(fromTouch) {
      var _this = this;
      var _loop = this.settings.loop;
      if (fromTouch && this.galleryItems.length < 3) {
        _loop = false;
      }
      if (!this.lgBusy) {
        if (this.index + 1 < this.galleryItems.length) {
          this.index++;
          this.LGel.trigger(lGEvents.beforeNextSlide, {
            index: this.index
          });
          this.slide(this.index, !!fromTouch, false, "next");
        } else {
          if (_loop) {
            this.index = 0;
            this.LGel.trigger(lGEvents.beforeNextSlide, {
              index: this.index
            });
            this.slide(this.index, !!fromTouch, false, "next");
          } else if (this.settings.slideEndAnimation && !fromTouch) {
            this.outer.addClass("lg-right-end");
            setTimeout(function() {
              _this.outer.removeClass("lg-right-end");
            }, 400);
          }
        }
      }
    };
    LightGallery2.prototype.goToPrevSlide = function(fromTouch) {
      var _this = this;
      var _loop = this.settings.loop;
      if (fromTouch && this.galleryItems.length < 3) {
        _loop = false;
      }
      if (!this.lgBusy) {
        if (this.index > 0) {
          this.index--;
          this.LGel.trigger(lGEvents.beforePrevSlide, {
            index: this.index,
            fromTouch
          });
          this.slide(this.index, !!fromTouch, false, "prev");
        } else {
          if (_loop) {
            this.index = this.galleryItems.length - 1;
            this.LGel.trigger(lGEvents.beforePrevSlide, {
              index: this.index,
              fromTouch
            });
            this.slide(this.index, !!fromTouch, false, "prev");
          } else if (this.settings.slideEndAnimation && !fromTouch) {
            this.outer.addClass("lg-left-end");
            setTimeout(function() {
              _this.outer.removeClass("lg-left-end");
            }, 400);
          }
        }
      }
    };
    LightGallery2.prototype.keyPress = function() {
      var _this = this;
      $LG(window).on("keydown.lg.global" + this.lgId, function(e) {
        if (_this.lgOpened && _this.settings.escKey === true && e.keyCode === 27) {
          e.preventDefault();
          if (_this.settings.allowMediaOverlap && _this.outer.hasClass("lg-can-toggle") && _this.outer.hasClass("lg-components-open")) {
            _this.outer.removeClass("lg-components-open");
          } else {
            _this.closeGallery();
          }
        }
        if (_this.lgOpened && _this.galleryItems.length > 1) {
          if (e.keyCode === 37) {
            e.preventDefault();
            _this.goToPrevSlide();
          }
          if (e.keyCode === 39) {
            e.preventDefault();
            _this.goToNextSlide();
          }
        }
      });
    };
    LightGallery2.prototype.arrow = function() {
      var _this = this;
      this.getElementById("lg-prev").on("click.lg", function() {
        _this.goToPrevSlide();
      });
      this.getElementById("lg-next").on("click.lg", function() {
        _this.goToNextSlide();
      });
    };
    LightGallery2.prototype.arrowDisable = function(index) {
      if (!this.settings.loop && this.settings.hideControlOnEnd) {
        var $prev = this.getElementById("lg-prev");
        var $next = this.getElementById("lg-next");
        if (index + 1 === this.galleryItems.length) {
          $next.attr("disabled", "disabled").addClass("disabled");
        } else {
          $next.removeAttr("disabled").removeClass("disabled");
        }
        if (index === 0) {
          $prev.attr("disabled", "disabled").addClass("disabled");
        } else {
          $prev.removeAttr("disabled").removeClass("disabled");
        }
      }
    };
    LightGallery2.prototype.setTranslate = function($el, xValue, yValue, scaleX, scaleY) {
      if (scaleX === void 0) {
        scaleX = 1;
      }
      if (scaleY === void 0) {
        scaleY = 1;
      }
      $el.css("transform", "translate3d(" + xValue + "px, " + yValue + "px, 0px) scale3d(" + scaleX + ", " + scaleY + ", 1)");
    };
    LightGallery2.prototype.mousewheel = function() {
      var _this = this;
      var lastCall = 0;
      this.outer.on("wheel.lg", function(e) {
        if (!e.deltaY || _this.galleryItems.length < 2) {
          return;
        }
        e.preventDefault();
        var now2 = (/* @__PURE__ */ new Date()).getTime();
        if (now2 - lastCall < 1e3) {
          return;
        }
        lastCall = now2;
        if (e.deltaY > 0) {
          _this.goToNextSlide();
        } else if (e.deltaY < 0) {
          _this.goToPrevSlide();
        }
      });
    };
    LightGallery2.prototype.isSlideElement = function(target) {
      return target.hasClass("lg-outer") || target.hasClass("lg-item") || target.hasClass("lg-img-wrap") || target.hasClass("lg-img-rotate");
    };
    LightGallery2.prototype.isPosterElement = function(target) {
      var playButton = this.getSlideItem(this.index).find(".lg-video-play-button").get();
      return target.hasClass("lg-video-poster") || target.hasClass("lg-video-play-button") || playButton && playButton.contains(target.get());
    };
    LightGallery2.prototype.toggleMaximize = function() {
      var _this = this;
      this.getElementById("lg-maximize").on("click.lg", function() {
        _this.$container.toggleClass("lg-inline");
        _this.refreshOnResize();
      });
    };
    LightGallery2.prototype.invalidateItems = function() {
      for (var index = 0; index < this.items.length; index++) {
        var element = this.items[index];
        var $element = $LG(element);
        $element.off("click.lgcustom-item-" + $element.attr("data-lg-id"));
      }
    };
    LightGallery2.prototype.trapFocus = function() {
      var _this = this;
      this.$container.get().focus({
        preventScroll: true
      });
      $LG(window).on("keydown.lg.global" + this.lgId, function(e) {
        if (!_this.lgOpened) {
          return;
        }
        var isTabPressed = e.key === "Tab" || e.keyCode === 9;
        if (!isTabPressed) {
          return;
        }
        var focusableEls = utils.getFocusableElements(_this.$container.get());
        var firstFocusableEl = focusableEls[0];
        var lastFocusableEl = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      });
    };
    LightGallery2.prototype.manageCloseGallery = function() {
      var _this = this;
      if (!this.settings.closable)
        return;
      var mousedown = false;
      this.getElementById("lg-close").on("click.lg", function() {
        _this.closeGallery();
      });
      if (this.settings.closeOnTap) {
        this.outer.on("mousedown.lg", function(e) {
          var target = $LG(e.target);
          if (_this.isSlideElement(target)) {
            mousedown = true;
          } else {
            mousedown = false;
          }
        });
        this.outer.on("mousemove.lg", function() {
          mousedown = false;
        });
        this.outer.on("mouseup.lg", function(e) {
          var target = $LG(e.target);
          if (_this.isSlideElement(target) && mousedown) {
            if (!_this.outer.hasClass("lg-dragging")) {
              _this.closeGallery();
            }
          }
        });
      }
    };
    LightGallery2.prototype.closeGallery = function(force) {
      var _this = this;
      if (!this.lgOpened || !this.settings.closable && !force) {
        return 0;
      }
      this.LGel.trigger(lGEvents.beforeClose);
      if (this.settings.resetScrollPosition && !this.settings.hideScrollbar) {
        $LG(window).scrollTop(this.prevScrollTop);
      }
      var currentItem = this.items[this.index];
      var transform;
      if (this.zoomFromOrigin && currentItem) {
        var _a = this.mediaContainerPosition, top_4 = _a.top, bottom = _a.bottom;
        var _b = this.galleryItems[this.index], __slideVideoInfo = _b.__slideVideoInfo, poster = _b.poster;
        var imageSize = utils.getSize(currentItem, this.outer, top_4 + bottom, __slideVideoInfo && poster && this.settings.videoMaxSize);
        transform = utils.getTransform(currentItem, this.outer, top_4, bottom, imageSize);
      }
      if (this.zoomFromOrigin && transform) {
        this.outer.addClass("lg-closing lg-zoom-from-image");
        this.getSlideItem(this.index).addClass("lg-start-end-progress").css("transition-duration", this.settings.startAnimationDuration + "ms").css("transform", transform);
      } else {
        this.outer.addClass("lg-hide-items");
        this.outer.removeClass("lg-zoom-from-image");
      }
      this.destroyModules();
      this.lGalleryOn = false;
      this.isDummyImageRemoved = false;
      this.zoomFromOrigin = this.settings.zoomFromOrigin;
      clearTimeout(this.hideBarTimeout);
      this.hideBarTimeout = false;
      $LG("html").removeClass("lg-on");
      this.outer.removeClass("lg-visible lg-components-open");
      this.$backdrop.removeClass("in").css("opacity", 0);
      var removeTimeout = this.zoomFromOrigin && transform ? Math.max(this.settings.startAnimationDuration, this.settings.backdropDuration) : this.settings.backdropDuration;
      this.$container.removeClass("lg-show-in");
      setTimeout(function() {
        if (_this.zoomFromOrigin && transform) {
          _this.outer.removeClass("lg-zoom-from-image");
        }
        _this.$container.removeClass("lg-show");
        _this.resetScrollBar();
        _this.$backdrop.removeAttr("style").css("transition-duration", _this.settings.backdropDuration + "ms");
        _this.outer.removeClass("lg-closing " + _this.settings.startClass);
        _this.getSlideItem(_this.index).removeClass("lg-start-end-progress");
        _this.$inner.empty();
        if (_this.lgOpened) {
          _this.LGel.trigger(lGEvents.afterClose, {
            instance: _this
          });
        }
        if (_this.$container.get()) {
          _this.$container.get().blur();
        }
        _this.lgOpened = false;
      }, removeTimeout + 100);
      return removeTimeout + 100;
    };
    LightGallery2.prototype.initModules = function() {
      this.plugins.forEach(function(module) {
        try {
          module.init();
        } catch (err) {
          console.warn("lightGallery:- make sure lightGallery module is properly initiated");
        }
      });
    };
    LightGallery2.prototype.destroyModules = function(destroy) {
      this.plugins.forEach(function(module) {
        try {
          if (destroy) {
            module.destroy();
          } else {
            module.closeGallery && module.closeGallery();
          }
        } catch (err) {
          console.warn("lightGallery:- make sure lightGallery module is properly destroyed");
        }
      });
    };
    LightGallery2.prototype.refresh = function(galleryItems) {
      if (!this.settings.dynamic) {
        this.invalidateItems();
      }
      if (galleryItems) {
        this.galleryItems = galleryItems;
      } else {
        this.galleryItems = this.getItems();
      }
      this.updateControls();
      this.openGalleryOnItemClick();
      this.LGel.trigger(lGEvents.updateSlides);
    };
    LightGallery2.prototype.updateControls = function() {
      this.addSlideVideoInfo(this.galleryItems);
      this.updateCounterTotal();
      this.manageSingleSlideClassName();
    };
    LightGallery2.prototype.destroyGallery = function() {
      this.destroyModules(true);
      if (!this.settings.dynamic) {
        this.invalidateItems();
      }
      $LG(window).off(".lg.global" + this.lgId);
      this.LGel.off(".lg");
      this.$container.remove();
    };
    LightGallery2.prototype.destroy = function() {
      var closeTimeout = this.closeGallery(true);
      if (closeTimeout) {
        setTimeout(this.destroyGallery.bind(this), closeTimeout);
      } else {
        this.destroyGallery();
      }
      return closeTimeout;
    };
    return LightGallery2;
  }()
);
function lightGallery(el, options) {
  return new LightGallery(el, options);
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lgThumbnail_min$1 = { exports: {} };
/**
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
var lgThumbnail_min = lgThumbnail_min$1.exports;
var hasRequiredLgThumbnail_min;
function requireLgThumbnail_min() {
  if (hasRequiredLgThumbnail_min) return lgThumbnail_min$1.exports;
  hasRequiredLgThumbnail_min = 1;
  (function(module, exports) {
    !function(t, e) {
      module.exports = e();
    }(lgThumbnail_min, function() {
      var t = function() {
        return (t = Object.assign || function(t2) {
          for (var e2, i2 = 1, s2 = arguments.length; i2 < s2; i2++) for (var h2 in e2 = arguments[i2]) Object.prototype.hasOwnProperty.call(e2, h2) && (t2[h2] = e2[h2]);
          return t2;
        }).apply(this, arguments);
      }, e = { thumbnail: true, animateThumb: true, currentPagerPosition: "middle", alignThumbnails: "middle", thumbWidth: 100, thumbHeight: "80px", thumbMargin: 5, appendThumbnailsTo: ".lg-components", toggleThumb: false, enableThumbDrag: true, enableThumbSwipe: true, thumbnailSwipeThreshold: 10, loadYouTubeThumbnail: true, youTubeThumbSize: 1, thumbnailPluginStrings: { toggleThumbnails: "Toggle thumbnails" } }, i = "lgContainerResize", s = "lgUpdateSlides", h = "lgBeforeOpen", n = "lgBeforeSlide";
      return function() {
        function o(t2, e2) {
          return this.thumbOuterWidth = 0, this.thumbTotalWidth = 0, this.translateX = 0, this.thumbClickable = false, this.core = t2, this.$LG = e2, this;
        }
        return o.prototype.init = function() {
          this.settings = t(t({}, e), this.core.settings), this.thumbOuterWidth = 0, this.thumbTotalWidth = this.core.galleryItems.length * (this.settings.thumbWidth + this.settings.thumbMargin), this.translateX = 0, this.setAnimateThumbStyles(), this.core.settings.allowMediaOverlap || (this.settings.toggleThumb = false), this.settings.thumbnail && (this.build(), this.settings.animateThumb ? (this.settings.enableThumbDrag && this.enableThumbDrag(), this.settings.enableThumbSwipe && this.enableThumbSwipe(), this.thumbClickable = false) : this.thumbClickable = true, this.toggleThumbBar(), this.thumbKeyPress());
        }, o.prototype.build = function() {
          var t2 = this;
          this.setThumbMarkup(), this.manageActiveClassOnSlideChange(), this.$lgThumb.first().on("click.lg touchend.lg", function(e2) {
            var i2 = t2.$LG(e2.target);
            i2.hasAttribute("data-lg-item-id") && setTimeout(function() {
              if (t2.thumbClickable && !t2.core.lgBusy) {
                var e3 = parseInt(i2.attr("data-lg-item-id"));
                t2.core.slide(e3, false, true, false);
              }
            }, 50);
          }), this.core.LGel.on(n + ".thumb", function(e2) {
            var i2 = e2.detail.index;
            t2.animateThumb(i2);
          }), this.core.LGel.on(h + ".thumb", function() {
            t2.thumbOuterWidth = t2.core.outer.get().offsetWidth;
          }), this.core.LGel.on(s + ".thumb", function() {
            t2.rebuildThumbnails();
          }), this.core.LGel.on(i + ".thumb", function() {
            t2.core.lgOpened && setTimeout(function() {
              t2.thumbOuterWidth = t2.core.outer.get().offsetWidth, t2.animateThumb(t2.core.index), t2.thumbOuterWidth = t2.core.outer.get().offsetWidth;
            }, 50);
          });
        }, o.prototype.setThumbMarkup = function() {
          var t2 = "lg-thumb-outer ";
          this.settings.alignThumbnails && (t2 += "lg-thumb-align-" + this.settings.alignThumbnails);
          var e2 = '<div class="' + t2 + '">\n        <div class="lg-thumb lg-group">\n        </div>\n        </div>';
          this.core.outer.addClass("lg-has-thumb"), ".lg-components" === this.settings.appendThumbnailsTo ? this.core.$lgComponents.append(e2) : this.core.outer.append(e2), this.$thumbOuter = this.core.outer.find(".lg-thumb-outer").first(), this.$lgThumb = this.core.outer.find(".lg-thumb").first(), this.settings.animateThumb && this.core.outer.find(".lg-thumb").css("transition-duration", this.core.settings.speed + "ms").css("width", this.thumbTotalWidth + "px").css("position", "relative"), this.setThumbItemHtml(this.core.galleryItems);
        }, o.prototype.enableThumbDrag = function() {
          var t2 = this, e2 = { cords: { startX: 0, endX: 0 }, isMoved: false, newTranslateX: 0, startTime: /* @__PURE__ */ new Date(), endTime: /* @__PURE__ */ new Date(), touchMoveTime: 0 }, i2 = false;
          this.$thumbOuter.addClass("lg-grab"), this.core.outer.find(".lg-thumb").first().on("mousedown.lg.thumb", function(s2) {
            t2.thumbTotalWidth > t2.thumbOuterWidth && (s2.preventDefault(), e2.cords.startX = s2.pageX, e2.startTime = /* @__PURE__ */ new Date(), t2.thumbClickable = false, i2 = true, t2.core.outer.get().scrollLeft += 1, t2.core.outer.get().scrollLeft -= 1, t2.$thumbOuter.removeClass("lg-grab").addClass("lg-grabbing"));
          }), this.$LG(window).on("mousemove.lg.thumb.global" + this.core.lgId, function(s2) {
            t2.core.lgOpened && i2 && (e2.cords.endX = s2.pageX, e2 = t2.onThumbTouchMove(e2));
          }), this.$LG(window).on("mouseup.lg.thumb.global" + this.core.lgId, function() {
            t2.core.lgOpened && (e2.isMoved ? e2 = t2.onThumbTouchEnd(e2) : t2.thumbClickable = true, i2 && (i2 = false, t2.$thumbOuter.removeClass("lg-grabbing").addClass("lg-grab")));
          });
        }, o.prototype.enableThumbSwipe = function() {
          var t2 = this, e2 = { cords: { startX: 0, endX: 0 }, isMoved: false, newTranslateX: 0, startTime: /* @__PURE__ */ new Date(), endTime: /* @__PURE__ */ new Date(), touchMoveTime: 0 };
          this.$lgThumb.on("touchstart.lg", function(i2) {
            t2.thumbTotalWidth > t2.thumbOuterWidth && (i2.preventDefault(), e2.cords.startX = i2.targetTouches[0].pageX, t2.thumbClickable = false, e2.startTime = /* @__PURE__ */ new Date());
          }), this.$lgThumb.on("touchmove.lg", function(i2) {
            t2.thumbTotalWidth > t2.thumbOuterWidth && (i2.preventDefault(), e2.cords.endX = i2.targetTouches[0].pageX, e2 = t2.onThumbTouchMove(e2));
          }), this.$lgThumb.on("touchend.lg", function() {
            e2.isMoved ? e2 = t2.onThumbTouchEnd(e2) : t2.thumbClickable = true;
          });
        }, o.prototype.rebuildThumbnails = function() {
          var t2 = this;
          this.$thumbOuter.addClass("lg-rebuilding-thumbnails"), setTimeout(function() {
            t2.thumbTotalWidth = t2.core.galleryItems.length * (t2.settings.thumbWidth + t2.settings.thumbMargin), t2.$lgThumb.css("width", t2.thumbTotalWidth + "px"), t2.$lgThumb.empty(), t2.setThumbItemHtml(t2.core.galleryItems), t2.animateThumb(t2.core.index);
          }, 50), setTimeout(function() {
            t2.$thumbOuter.removeClass("lg-rebuilding-thumbnails");
          }, 200);
        }, o.prototype.setTranslate = function(t2) {
          this.$lgThumb.css("transform", "translate3d(-" + t2 + "px, 0px, 0px)");
        }, o.prototype.getPossibleTransformX = function(t2) {
          return t2 > this.thumbTotalWidth - this.thumbOuterWidth && (t2 = this.thumbTotalWidth - this.thumbOuterWidth), t2 < 0 && (t2 = 0), t2;
        }, o.prototype.animateThumb = function(t2) {
          if (this.$lgThumb.css("transition-duration", this.core.settings.speed + "ms"), this.settings.animateThumb) {
            var e2 = 0;
            switch (this.settings.currentPagerPosition) {
              case "left":
                e2 = 0;
                break;
              case "middle":
                e2 = this.thumbOuterWidth / 2 - this.settings.thumbWidth / 2;
                break;
              case "right":
                e2 = this.thumbOuterWidth - this.settings.thumbWidth;
            }
            this.translateX = (this.settings.thumbWidth + this.settings.thumbMargin) * t2 - 1 - e2, this.translateX > this.thumbTotalWidth - this.thumbOuterWidth && (this.translateX = this.thumbTotalWidth - this.thumbOuterWidth), this.translateX < 0 && (this.translateX = 0), this.setTranslate(this.translateX);
          }
        }, o.prototype.onThumbTouchMove = function(t2) {
          return t2.newTranslateX = this.translateX, t2.isMoved = true, t2.touchMoveTime = (/* @__PURE__ */ new Date()).valueOf(), t2.newTranslateX -= t2.cords.endX - t2.cords.startX, t2.newTranslateX = this.getPossibleTransformX(t2.newTranslateX), this.setTranslate(t2.newTranslateX), this.$thumbOuter.addClass("lg-dragging"), t2;
        }, o.prototype.onThumbTouchEnd = function(t2) {
          t2.isMoved = false, t2.endTime = /* @__PURE__ */ new Date(), this.$thumbOuter.removeClass("lg-dragging");
          var e2 = t2.endTime.valueOf() - t2.startTime.valueOf(), i2 = t2.cords.endX - t2.cords.startX, s2 = Math.abs(i2) / e2;
          return s2 > 0.15 && t2.endTime.valueOf() - t2.touchMoveTime < 30 ? ((s2 += 1) > 2 && (s2 += 1), s2 += s2 * (Math.abs(i2) / this.thumbOuterWidth), this.$lgThumb.css("transition-duration", Math.min(s2 - 1, 2) + "settings"), i2 *= s2, this.translateX = this.getPossibleTransformX(this.translateX - i2), this.setTranslate(this.translateX)) : this.translateX = t2.newTranslateX, Math.abs(t2.cords.endX - t2.cords.startX) < this.settings.thumbnailSwipeThreshold && (this.thumbClickable = true), t2;
        }, o.prototype.getThumbHtml = function(t2, e2, i2) {
          var s2, h2 = this.core.galleryItems[e2].__slideVideoInfo || {};
          s2 = h2.youtube && this.settings.loadYouTubeThumbnail ? "//img.youtube.com/vi/" + h2.youtube[1] + "/" + this.settings.youTubeThumbSize + ".jpg" : t2;
          var n2 = document.createElement("div");
          n2.setAttribute("data-lg-item-id", e2 + ""), n2.className = "lg-thumb-item " + (e2 === this.core.index ? "active" : ""), n2.style.cssText = "width: " + this.settings.thumbWidth + "px; height: " + this.settings.thumbHeight + "; margin-right: " + this.settings.thumbMargin + "px;";
          var o2 = document.createElement("img");
          return o2.alt = i2 || "", o2.setAttribute("data-lg-item-id", e2 + ""), o2.src = s2, n2.appendChild(o2), n2;
        }, o.prototype.setThumbItemHtml = function(t2) {
          for (var e2 = 0; e2 < t2.length; e2++) {
            var i2 = this.getThumbHtml(t2[e2].thumb, e2, t2[e2].alt);
            this.$lgThumb.append(i2);
          }
        }, o.prototype.setAnimateThumbStyles = function() {
          this.settings.animateThumb && this.core.outer.addClass("lg-animate-thumb");
        }, o.prototype.manageActiveClassOnSlideChange = function() {
          var t2 = this;
          this.core.LGel.on(n + ".thumb", function(e2) {
            var i2 = t2.core.outer.find(".lg-thumb-item"), s2 = e2.detail.index;
            i2.removeClass("active"), i2.eq(s2).addClass("active");
          });
        }, o.prototype.toggleThumbBar = function() {
          var t2 = this;
          this.settings.toggleThumb && (this.core.outer.addClass("lg-can-toggle"), this.core.$toolbar.append('<button type="button" aria-label="' + this.settings.thumbnailPluginStrings.toggleThumbnails + '" class="lg-toggle-thumb lg-icon"></button>'), this.core.outer.find(".lg-toggle-thumb").first().on("click.lg", function() {
            t2.core.outer.toggleClass("lg-components-open");
          }));
        }, o.prototype.thumbKeyPress = function() {
          var t2 = this;
          this.$LG(window).on("keydown.lg.thumb.global" + this.core.lgId, function(e2) {
            t2.core.lgOpened && t2.settings.toggleThumb && (38 === e2.keyCode ? (e2.preventDefault(), t2.core.outer.addClass("lg-components-open")) : 40 === e2.keyCode && (e2.preventDefault(), t2.core.outer.removeClass("lg-components-open")));
          });
        }, o.prototype.destroy = function() {
          this.settings.thumbnail && (this.$LG(window).off(".lg.thumb.global" + this.core.lgId), this.core.LGel.off(".lg.thumb"), this.core.LGel.off(".thumb"), this.$thumbOuter.remove(), this.core.outer.removeClass("lg-has-thumb"));
        }, o;
      }();
    });
  })(lgThumbnail_min$1);
  return lgThumbnail_min$1.exports;
}
var lgThumbnail_minExports = requireLgThumbnail_min();
const lgThumbnail = /* @__PURE__ */ getDefaultExportFromCjs(lgThumbnail_minExports);
var lgZoom_min$1 = { exports: {} };
/**
 * lightgallery | 2.9.0-beta.1 | June 15th 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */
var lgZoom_min = lgZoom_min$1.exports;
var hasRequiredLgZoom_min;
function requireLgZoom_min() {
  if (hasRequiredLgZoom_min) return lgZoom_min$1.exports;
  hasRequiredLgZoom_min = 1;
  (function(module, exports) {
    !function(e, t) {
      module.exports = t();
    }(lgZoom_min, function() {
      var e = function() {
        return (e = Object.assign || function(e2) {
          for (var t2, o2 = 1, i2 = arguments.length; o2 < i2; o2++) for (var s2 in t2 = arguments[o2]) Object.prototype.hasOwnProperty.call(t2, s2) && (e2[s2] = t2[s2]);
          return e2;
        }).apply(this, arguments);
      }, t = { scale: 1, zoom: true, infiniteZoom: true, actualSize: true, showZoomInOutIcons: false, actualSizeIcons: { zoomIn: "lg-zoom-in", zoomOut: "lg-zoom-out" }, enableZoomAfter: 300, zoomPluginStrings: { zoomIn: "Zoom in", zoomOut: "Zoom out", viewActualSize: "View actual size" } }, o = "lgContainerResize", i = "lgBeforeOpen", s = "lgAfterOpen", a = "lgSlideItemLoad", n = "lgAfterSlide", r = "lgRotateLeft", l = "lgRotateRight", c = "lgFlipHorizontal", g = "lgFlipVertical";
      return function() {
        function h(o2, i2) {
          return this.core = o2, this.$LG = i2, this.settings = e(e({}, t), this.core.settings), this;
        }
        return h.prototype.buildTemplates = function() {
          var e2 = this.settings.showZoomInOutIcons ? '<button id="' + this.core.getIdName("lg-zoom-in") + '" type="button" aria-label="' + this.settings.zoomPluginStrings.zoomIn + '" class="lg-zoom-in lg-icon"></button><button id="' + this.core.getIdName("lg-zoom-out") + '" type="button" aria-label="' + this.settings.zoomPluginStrings.zoomOut + '" class="lg-zoom-out lg-icon"></button>' : "";
          this.settings.actualSize && (e2 += '<button id="' + this.core.getIdName("lg-actual-size") + '" type="button" aria-label="' + this.settings.zoomPluginStrings.viewActualSize + '" class="' + this.settings.actualSizeIcons.zoomIn + ' lg-icon"></button>'), this.core.outer.addClass("lg-use-transition-for-zoom"), this.core.$toolbar.first().append(e2);
        }, h.prototype.enableZoom = function(e2) {
          var t2 = this, o2 = this.settings.enableZoomAfter + e2.detail.delay;
          this.$LG("body").first().hasClass("lg-from-hash") && e2.detail.delay ? o2 = 0 : this.$LG("body").first().removeClass("lg-from-hash"), this.zoomableTimeout = setTimeout(function() {
            t2.isImageSlide(t2.core.index) && (t2.core.getSlideItem(e2.detail.index).addClass("lg-zoomable"), e2.detail.index === t2.core.index && t2.setZoomEssentials());
          }, o2 + 30);
        }, h.prototype.enableZoomOnSlideItemLoad = function() {
          this.core.LGel.on(a + ".zoom", this.enableZoom.bind(this));
        }, h.prototype.getDragCords = function(e2) {
          return { x: e2.pageX, y: e2.pageY };
        }, h.prototype.getSwipeCords = function(e2) {
          return { x: e2.touches[0].pageX, y: e2.touches[0].pageY };
        }, h.prototype.getDragAllowedAxises = function(e2, t2) {
          if (!this.containerRect) return { allowX: false, allowY: false };
          var o2 = this.core.getSlideItem(this.core.index).find(".lg-image").first().get(), i2 = 0, s2 = 0, a2 = o2.getBoundingClientRect();
          e2 ? (i2 = o2.offsetHeight * e2, s2 = o2.offsetWidth * e2) : t2 ? (i2 = a2.height + t2 * a2.height, s2 = a2.width + t2 * a2.width) : (i2 = a2.height, s2 = a2.width);
          var n2 = i2 > this.containerRect.height;
          return { allowX: s2 > this.containerRect.width, allowY: n2 };
        }, h.prototype.setZoomEssentials = function() {
          this.containerRect = this.core.$content.get().getBoundingClientRect();
        }, h.prototype.zoomImage = function(e2, t2, o2, i2) {
          if (this.containerRect && !(Math.abs(t2) <= 0)) {
            var s2, a2, n2 = this.containerRect.width / 2 + this.containerRect.left, r2 = this.containerRect.height / 2 + this.containerRect.top + this.scrollTop;
            1 === e2 && (this.positionChanged = false);
            var l2 = this.getDragAllowedAxises(0, t2), c2 = l2.allowY, g2 = l2.allowX;
            this.positionChanged && (s2 = this.left / (this.scale - t2), a2 = this.top / (this.scale - t2), this.pageX = n2 - s2, this.pageY = r2 - a2, this.positionChanged = false);
            var h2, m, u = this.getPossibleSwipeDragCords(t2), d = n2 - this.pageX, f = r2 - this.pageY;
            if (e2 - t2 > 1) {
              var p = (e2 - t2) / Math.abs(t2);
              h2 = (d = (t2 < 0 ? -d : d) + this.left * (p + (t2 < 0 ? -1 : 1))) / p, m = (f = (t2 < 0 ? -f : f) + this.top * (p + (t2 < 0 ? -1 : 1))) / p;
            } else {
              h2 = d * (p = (e2 - t2) * t2), m = f * p;
            }
            o2 && (g2 ? this.isBeyondPossibleLeft(h2, u.minX) ? h2 = u.minX : this.isBeyondPossibleRight(h2, u.maxX) && (h2 = u.maxX) : e2 > 1 && (h2 < u.minX ? h2 = u.minX : h2 > u.maxX && (h2 = u.maxX)), c2 ? this.isBeyondPossibleTop(m, u.minY) ? m = u.minY : this.isBeyondPossibleBottom(m, u.maxY) && (m = u.maxY) : e2 > 1 && (m < u.minY ? m = u.minY : m > u.maxY && (m = u.maxY))), this.setZoomStyles({ x: h2, y: m, scale: e2 }), this.left = h2, this.top = m, i2 && this.setZoomImageSize();
          }
        }, h.prototype.resetImageTranslate = function(e2) {
          if (this.isImageSlide(e2)) {
            var t2 = this.core.getSlideItem(e2).find(".lg-image").first();
            this.imageReset = false, t2.removeClass("reset-transition reset-transition-y reset-transition-x"), this.core.outer.removeClass("lg-actual-size"), t2.css("width", "auto").css("height", "auto"), setTimeout(function() {
              t2.removeClass("no-transition");
            }, 10);
          }
        }, h.prototype.setZoomImageSize = function() {
          var e2 = this, t2 = this.core.getSlideItem(this.core.index).find(".lg-image").first();
          setTimeout(function() {
            var o2 = e2.getCurrentImageActualSizeScale();
            e2.scale >= o2 && (t2.addClass("no-transition"), e2.imageReset = true);
          }, 500), setTimeout(function() {
            var o2 = e2.getCurrentImageActualSizeScale();
            if (e2.scale >= o2) {
              var i2 = e2.getDragAllowedAxises(e2.scale);
              t2.css("width", t2.get().naturalWidth + "px").css("height", t2.get().naturalHeight + "px"), e2.core.outer.addClass("lg-actual-size"), i2.allowX && i2.allowY ? t2.addClass("reset-transition") : i2.allowX && !i2.allowY ? t2.addClass("reset-transition-x") : !i2.allowX && i2.allowY && t2.addClass("reset-transition-y");
            }
          }, 550);
        }, h.prototype.setZoomStyles = function(e2) {
          var t2 = this.core.getSlideItem(this.core.index).find(".lg-img-wrap").first(), o2 = this.core.getSlideItem(this.core.index).find(".lg-image").first(), i2 = this.core.outer.find(".lg-current .lg-dummy-img").first();
          this.scale = e2.scale, o2.css("transform", "scale3d(" + e2.scale + ", " + e2.scale + ", 1)"), i2.css("transform", "scale3d(" + e2.scale + ", " + e2.scale + ", 1)");
          var s2 = "translate3d(" + e2.x + "px, " + e2.y + "px, 0)";
          t2.css("transform", s2);
        }, h.prototype.setActualSize = function(e2, t2) {
          var o2 = this;
          if (!this.zoomInProgress) {
            this.zoomInProgress = true;
            var i2 = this.core.galleryItems[this.core.index];
            this.resetImageTranslate(e2), setTimeout(function() {
              if (i2.src && !o2.core.outer.hasClass("lg-first-slide-loading")) {
                var e3 = o2.getCurrentImageActualSizeScale(), s2 = o2.scale;
                o2.core.outer.hasClass("lg-zoomed") ? o2.scale = 1 : o2.scale = o2.getScale(e3), o2.setPageCords(t2), o2.beginZoom(o2.scale), o2.zoomImage(o2.scale, o2.scale - s2, true, true);
              }
            }, 50), setTimeout(function() {
              o2.core.outer.removeClass("lg-grabbing").addClass("lg-grab");
            }, 60), setTimeout(function() {
              o2.zoomInProgress = false;
            }, 610);
          }
        }, h.prototype.getNaturalWidth = function(e2) {
          var t2 = this.core.getSlideItem(e2).find(".lg-image").first(), o2 = this.core.galleryItems[e2].width;
          return o2 ? parseFloat(o2) : t2.get().naturalWidth;
        }, h.prototype.getActualSizeScale = function(e2, t2) {
          return e2 >= t2 ? e2 / t2 || 2 : 1;
        }, h.prototype.getCurrentImageActualSizeScale = function() {
          var e2 = this.core.getSlideItem(this.core.index).find(".lg-image").first().get().offsetWidth, t2 = this.getNaturalWidth(this.core.index) || e2;
          return this.getActualSizeScale(t2, e2);
        }, h.prototype.getPageCords = function(e2) {
          var t2 = {};
          if (e2) t2.x = e2.pageX || e2.touches[0].pageX, t2.y = e2.pageY || e2.touches[0].pageY;
          else {
            var o2 = this.core.$content.get().getBoundingClientRect();
            t2.x = o2.width / 2 + o2.left, t2.y = o2.height / 2 + this.scrollTop + o2.top;
          }
          return t2;
        }, h.prototype.setPageCords = function(e2) {
          var t2 = this.getPageCords(e2);
          this.pageX = t2.x, this.pageY = t2.y;
        }, h.prototype.manageActualPixelClassNames = function() {
          this.core.getElementById("lg-actual-size").removeClass(this.settings.actualSizeIcons.zoomIn).addClass(this.settings.actualSizeIcons.zoomOut);
        }, h.prototype.beginZoom = function(e2) {
          return this.core.outer.removeClass("lg-zoom-drag-transition lg-zoom-dragging"), e2 > 1 ? (this.core.outer.addClass("lg-zoomed"), this.manageActualPixelClassNames()) : this.resetZoom(), e2 > 1;
        }, h.prototype.getScale = function(e2) {
          var t2 = this.getCurrentImageActualSizeScale();
          return e2 < 1 ? e2 = 1 : e2 > t2 && (e2 = t2), e2;
        }, h.prototype.init = function() {
          var e2 = this;
          if (this.settings.zoom) {
            this.buildTemplates(), this.enableZoomOnSlideItemLoad();
            var t2 = null;
            this.core.outer.on("dblclick.lg", function(t3) {
              e2.$LG(t3.target).hasClass("lg-image") && e2.setActualSize(e2.core.index, t3);
            }), this.core.outer.on("touchstart.lg", function(o2) {
              var i2 = e2.$LG(o2.target);
              1 === o2.touches.length && i2.hasClass("lg-image") && (t2 ? (clearTimeout(t2), t2 = null, o2.preventDefault(), e2.setActualSize(e2.core.index, o2)) : t2 = setTimeout(function() {
                t2 = null;
              }, 300));
            }), this.core.LGel.on(o + ".zoom " + l + ".zoom " + r + ".zoom " + c + ".zoom " + g + ".zoom", function() {
              if (e2.core.lgOpened && e2.isImageSlide(e2.core.index) && !e2.core.touchAction) {
                var t3 = e2.core.getSlideItem(e2.core.index).find(".lg-img-wrap").first();
                e2.top = 0, e2.left = 0, e2.setZoomEssentials(), e2.setZoomSwipeStyles(t3, { x: 0, y: 0 }), e2.positionChanged = true;
              }
            }), this.$LG(window).on("scroll.lg.zoom.global" + this.core.lgId, function() {
              e2.core.lgOpened && (e2.scrollTop = e2.$LG(window).scrollTop());
            }), this.core.getElementById("lg-zoom-out").on("click.lg", function() {
              if (e2.isImageSlide(e2.core.index)) {
                var t3 = 0;
                e2.imageReset && (e2.resetImageTranslate(e2.core.index), t3 = 50), setTimeout(function() {
                  var t4 = e2.scale - e2.settings.scale;
                  t4 < 1 && (t4 = 1), e2.beginZoom(t4), e2.zoomImage(t4, -e2.settings.scale, true, !e2.settings.infiniteZoom);
                }, t3);
              }
            }), this.core.getElementById("lg-zoom-in").on("click.lg", function() {
              e2.zoomIn();
            }), this.core.getElementById("lg-actual-size").on("click.lg", function() {
              e2.setActualSize(e2.core.index);
            }), this.core.LGel.on(i + ".zoom", function() {
              e2.core.outer.find(".lg-item").removeClass("lg-zoomable");
            }), this.core.LGel.on(s + ".zoom", function() {
              e2.scrollTop = e2.$LG(window).scrollTop(), e2.pageX = e2.core.outer.width() / 2, e2.pageY = e2.core.outer.height() / 2 + e2.scrollTop, e2.scale = 1;
            }), this.core.LGel.on(n + ".zoom", function(t3) {
              var o2 = t3.detail.prevIndex;
              e2.scale = 1, e2.positionChanged = false, e2.zoomInProgress = false, e2.resetZoom(o2), e2.resetImageTranslate(o2), e2.isImageSlide(e2.core.index) && e2.setZoomEssentials();
            }), this.zoomDrag(), this.pinchZoom(), this.zoomSwipe(), this.zoomableTimeout = false, this.positionChanged = false, this.zoomInProgress = false;
          }
        }, h.prototype.zoomIn = function() {
          if (this.isImageSlide(this.core.index)) {
            var e2 = this.scale + this.settings.scale;
            this.settings.infiniteZoom || (e2 = this.getScale(e2)), this.beginZoom(e2), this.zoomImage(e2, Math.min(this.settings.scale, e2 - this.scale), true, !this.settings.infiniteZoom);
          }
        }, h.prototype.resetZoom = function(e2) {
          this.core.outer.removeClass("lg-zoomed lg-zoom-drag-transition");
          var t2 = this.core.getElementById("lg-actual-size"), o2 = this.core.getSlideItem(void 0 !== e2 ? e2 : this.core.index);
          t2.removeClass(this.settings.actualSizeIcons.zoomOut).addClass(this.settings.actualSizeIcons.zoomIn), o2.find(".lg-img-wrap").first().removeAttr("style"), o2.find(".lg-image").first().removeAttr("style"), this.scale = 1, this.left = 0, this.top = 0, this.setPageCords();
        }, h.prototype.getTouchDistance = function(e2) {
          return Math.sqrt((e2.touches[0].pageX - e2.touches[1].pageX) * (e2.touches[0].pageX - e2.touches[1].pageX) + (e2.touches[0].pageY - e2.touches[1].pageY) * (e2.touches[0].pageY - e2.touches[1].pageY));
        }, h.prototype.pinchZoom = function() {
          var e2 = this, t2 = 0, o2 = false, i2 = 1, s2 = 0, a2 = this.core.getSlideItem(this.core.index);
          this.core.outer.on("touchstart.lg", function(o3) {
            if (a2 = e2.core.getSlideItem(e2.core.index), e2.isImageSlide(e2.core.index) && 2 === o3.touches.length) {
              if (o3.preventDefault(), e2.core.outer.hasClass("lg-first-slide-loading")) return;
              i2 = e2.scale || 1, e2.core.outer.removeClass("lg-zoom-drag-transition lg-zoom-dragging"), e2.setPageCords(o3), e2.resetImageTranslate(e2.core.index), e2.core.touchAction = "pinch", t2 = e2.getTouchDistance(o3);
            }
          }), this.core.$inner.on("touchmove.lg", function(n2) {
            if (2 === n2.touches.length && "pinch" === e2.core.touchAction && (e2.$LG(n2.target).hasClass("lg-item") || a2.get().contains(n2.target))) {
              n2.preventDefault();
              var r2 = e2.getTouchDistance(n2), l2 = t2 - r2;
              if (!o2 && Math.abs(l2) > 5 && (o2 = true), o2) {
                s2 = e2.scale;
                var c2 = Math.max(1, i2 + 0.02 * -l2);
                e2.scale = Math.round(100 * (c2 + Number.EPSILON)) / 100;
                var g2 = e2.scale - s2;
                e2.zoomImage(e2.scale, Math.round(100 * (g2 + Number.EPSILON)) / 100, false, false);
              }
            }
          }), this.core.$inner.on("touchend.lg", function(i3) {
            if ("pinch" === e2.core.touchAction && (e2.$LG(i3.target).hasClass("lg-item") || a2.get().contains(i3.target))) {
              if (o2 = false, t2 = 0, e2.scale <= 1) e2.resetZoom();
              else {
                var s3 = e2.getCurrentImageActualSizeScale();
                if (e2.scale >= s3) {
                  var n2 = s3 - e2.scale;
                  0 === n2 && (n2 = 0.01), e2.zoomImage(s3, n2, false, true);
                }
                e2.manageActualPixelClassNames(), e2.core.outer.addClass("lg-zoomed");
              }
              e2.core.touchAction = void 0;
            }
          });
        }, h.prototype.touchendZoom = function(e2, t2, o2, i2, s2) {
          var a2 = t2.x - e2.x, n2 = t2.y - e2.y, r2 = Math.abs(a2) / s2 + 1, l2 = Math.abs(n2) / s2 + 1;
          r2 > 2 && (r2 += 1), l2 > 2 && (l2 += 1), a2 *= r2, n2 *= l2;
          var c2 = this.core.getSlideItem(this.core.index).find(".lg-img-wrap").first(), g2 = {};
          g2.x = this.left + a2, g2.y = this.top + n2;
          var h2 = this.getPossibleSwipeDragCords();
          (Math.abs(a2) > 15 || Math.abs(n2) > 15) && (i2 && (this.isBeyondPossibleTop(g2.y, h2.minY) ? g2.y = h2.minY : this.isBeyondPossibleBottom(g2.y, h2.maxY) && (g2.y = h2.maxY)), o2 && (this.isBeyondPossibleLeft(g2.x, h2.minX) ? g2.x = h2.minX : this.isBeyondPossibleRight(g2.x, h2.maxX) && (g2.x = h2.maxX)), i2 ? this.top = g2.y : g2.y = this.top, o2 ? this.left = g2.x : g2.x = this.left, this.setZoomSwipeStyles(c2, g2), this.positionChanged = true);
        }, h.prototype.getZoomSwipeCords = function(e2, t2, o2, i2, s2) {
          var a2 = {};
          if (i2) {
            if (a2.y = this.top + (t2.y - e2.y), this.isBeyondPossibleTop(a2.y, s2.minY)) {
              var n2 = s2.minY - a2.y;
              a2.y = s2.minY - n2 / 6;
            } else if (this.isBeyondPossibleBottom(a2.y, s2.maxY)) {
              var r2 = a2.y - s2.maxY;
              a2.y = s2.maxY + r2 / 6;
            }
          } else a2.y = this.top;
          if (o2) {
            if (a2.x = this.left + (t2.x - e2.x), this.isBeyondPossibleLeft(a2.x, s2.minX)) {
              var l2 = s2.minX - a2.x;
              a2.x = s2.minX - l2 / 6;
            } else if (this.isBeyondPossibleRight(a2.x, s2.maxX)) {
              var c2 = a2.x - s2.maxX;
              a2.x = s2.maxX + c2 / 6;
            }
          } else a2.x = this.left;
          return a2;
        }, h.prototype.isBeyondPossibleLeft = function(e2, t2) {
          return e2 >= t2;
        }, h.prototype.isBeyondPossibleRight = function(e2, t2) {
          return e2 <= t2;
        }, h.prototype.isBeyondPossibleTop = function(e2, t2) {
          return e2 >= t2;
        }, h.prototype.isBeyondPossibleBottom = function(e2, t2) {
          return e2 <= t2;
        }, h.prototype.isImageSlide = function(e2) {
          var t2 = this.core.galleryItems[e2];
          return "image" === this.core.getSlideType(t2);
        }, h.prototype.getPossibleSwipeDragCords = function(e2) {
          var t2 = this.core.getSlideItem(this.core.index).find(".lg-image").first(), o2 = this.core.mediaContainerPosition.bottom, i2 = t2.get().getBoundingClientRect(), s2 = i2.height, a2 = i2.width;
          return e2 && (s2 += e2 * s2, a2 += e2 * a2), { minY: (s2 - this.containerRect.height) / 2, maxY: (this.containerRect.height - s2) / 2 + o2, minX: (a2 - this.containerRect.width) / 2, maxX: (this.containerRect.width - a2) / 2 };
        }, h.prototype.setZoomSwipeStyles = function(e2, t2) {
          e2.css("transform", "translate3d(" + t2.x + "px, " + t2.y + "px, 0)");
        }, h.prototype.zoomSwipe = function() {
          var e2, t2, o2 = this, i2 = {}, s2 = {}, a2 = false, n2 = false, r2 = false, l2 = /* @__PURE__ */ new Date(), c2 = this.core.getSlideItem(this.core.index);
          this.core.$inner.on("touchstart.lg", function(s3) {
            if (o2.isImageSlide(o2.core.index) && (c2 = o2.core.getSlideItem(o2.core.index), (o2.$LG(s3.target).hasClass("lg-item") || c2.get().contains(s3.target)) && 1 === s3.touches.length && o2.core.outer.hasClass("lg-zoomed"))) {
              s3.preventDefault(), l2 = /* @__PURE__ */ new Date(), o2.core.touchAction = "zoomSwipe", t2 = o2.core.getSlideItem(o2.core.index).find(".lg-img-wrap").first();
              var a3 = o2.getDragAllowedAxises(0);
              r2 = a3.allowY, ((n2 = a3.allowX) || r2) && (i2 = o2.getSwipeCords(s3)), e2 = o2.getPossibleSwipeDragCords(), o2.core.outer.addClass("lg-zoom-dragging lg-zoom-drag-transition");
            }
          }), this.core.$inner.on("touchmove.lg", function(l3) {
            if (1 === l3.touches.length && "zoomSwipe" === o2.core.touchAction && (o2.$LG(l3.target).hasClass("lg-item") || c2.get().contains(l3.target))) {
              l3.preventDefault(), o2.core.touchAction = "zoomSwipe", s2 = o2.getSwipeCords(l3);
              var g2 = o2.getZoomSwipeCords(i2, s2, n2, r2, e2);
              (Math.abs(s2.x - i2.x) > 15 || Math.abs(s2.y - i2.y) > 15) && (a2 = true, o2.setZoomSwipeStyles(t2, g2));
            }
          }), this.core.$inner.on("touchend.lg", function(e3) {
            if ("zoomSwipe" === o2.core.touchAction && (o2.$LG(e3.target).hasClass("lg-item") || c2.get().contains(e3.target))) {
              if (e3.preventDefault(), o2.core.touchAction = void 0, o2.core.outer.removeClass("lg-zoom-dragging"), !a2) return;
              a2 = false;
              var t3 = (/* @__PURE__ */ new Date()).valueOf() - l2.valueOf();
              o2.touchendZoom(i2, s2, n2, r2, t3);
            }
          });
        }, h.prototype.zoomDrag = function() {
          var e2, t2, o2, i2, s2 = this, a2 = {}, n2 = {}, r2 = false, l2 = false, c2 = false, g2 = false;
          this.core.outer.on("mousedown.lg.zoom", function(t3) {
            if (s2.isImageSlide(s2.core.index)) {
              var n3 = s2.core.getSlideItem(s2.core.index);
              if (s2.$LG(t3.target).hasClass("lg-item") || n3.get().contains(t3.target)) {
                e2 = /* @__PURE__ */ new Date(), i2 = s2.core.getSlideItem(s2.core.index).find(".lg-img-wrap").first();
                var l3 = s2.getDragAllowedAxises(0);
                g2 = l3.allowY, c2 = l3.allowX, s2.core.outer.hasClass("lg-zoomed") && s2.$LG(t3.target).hasClass("lg-object") && (c2 || g2) && (t3.preventDefault(), a2 = s2.getDragCords(t3), o2 = s2.getPossibleSwipeDragCords(), r2 = true, s2.core.outer.removeClass("lg-grab").addClass("lg-grabbing lg-zoom-drag-transition lg-zoom-dragging"));
              }
            }
          }), this.$LG(window).on("mousemove.lg.zoom.global" + this.core.lgId, function(e3) {
            if (r2) {
              l2 = true, n2 = s2.getDragCords(e3);
              var t3 = s2.getZoomSwipeCords(a2, n2, c2, g2, o2);
              s2.setZoomSwipeStyles(i2, t3);
            }
          }), this.$LG(window).on("mouseup.lg.zoom.global" + this.core.lgId, function(o3) {
            if (r2) {
              if (t2 = /* @__PURE__ */ new Date(), r2 = false, s2.core.outer.removeClass("lg-zoom-dragging"), l2 && (a2.x !== n2.x || a2.y !== n2.y)) {
                n2 = s2.getDragCords(o3);
                var i3 = t2.valueOf() - e2.valueOf();
                s2.touchendZoom(a2, n2, c2, g2, i3);
              }
              l2 = false;
            }
            s2.core.outer.removeClass("lg-grabbing").addClass("lg-grab");
          });
        }, h.prototype.closeGallery = function() {
          this.resetZoom(), this.zoomInProgress = false;
        }, h.prototype.destroy = function() {
          this.$LG(window).off(".lg.zoom.global" + this.core.lgId), this.core.LGel.off(".lg.zoom"), this.core.LGel.off(".zoom"), clearTimeout(this.zoomableTimeout), this.zoomableTimeout = false;
        }, h;
      }();
    });
  })(lgZoom_min$1);
  return lgZoom_min$1.exports;
}
var lgZoom_minExports = requireLgZoom_min();
const lgZoom = /* @__PURE__ */ getDefaultExportFromCjs(lgZoom_minExports);
const KEY = "7EC452A9-0CFD441C-BD984C7C-17C8456E";
function initGallery() {
  if (document.querySelector("[data-fls-gallery]")) {
    new lightGallery(document.querySelector("[data-fls-gallery]"), {
      plugins: [lgZoom, lgThumbnail],
      licenseKey: KEY,
      selector: "a",
      speed: 500
    });
  }
}
window.addEventListener("load", initGallery());
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self2) => self2.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
var inputmask_min$1 = { exports: {} };
/*!
 * dist/inputmask.min
 * https://github.com/RobinHerbots/Inputmask
 * Copyright (c) 2010 - 2024 Robin Herbots
 * Licensed under the MIT license
 * Version: 5.0.9
 */
var inputmask_min = inputmask_min$1.exports;
var hasRequiredInputmask_min;
function requireInputmask_min() {
  if (hasRequiredInputmask_min) return inputmask_min$1.exports;
  hasRequiredInputmask_min = 1;
  (function(module, exports) {
    !function(e, t) {
      module.exports = t();
    }("undefined" != typeof self ? self : inputmask_min, function() {
      return function() {
        var e = { 3976: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          t2.default = { _maxTestPos: 500, placeholder: "_", optionalmarker: ["[", "]"], quantifiermarker: ["{", "}"], groupmarker: ["(", ")"], alternatormarker: "|", escapeChar: "\\", mask: null, regex: null, oncomplete: function() {
          }, onincomplete: function() {
          }, oncleared: function() {
          }, repeat: 0, greedy: false, autoUnmask: false, removeMaskOnSubmit: false, clearMaskOnLostFocus: true, insertMode: true, insertModeVisual: true, clearIncomplete: false, alias: null, onKeyDown: function() {
          }, onBeforeMask: null, onBeforePaste: function(e3, t3) {
            return "function" == typeof t3.onBeforeMask ? t3.onBeforeMask.call(this, e3, t3) : e3;
          }, onBeforeWrite: null, onUnMask: null, showMaskOnFocus: true, showMaskOnHover: true, onKeyValidation: function() {
          }, skipOptionalPartCharacter: " ", numericInput: false, rightAlign: false, undoOnEscape: true, radixPoint: "", _radixDance: false, groupSeparator: "", keepStatic: null, positionCaretOnTab: true, tabThrough: false, supportsInputType: ["text", "tel", "url", "password", "search"], isComplete: null, preValidation: null, postValidation: null, staticDefinitionSymbol: void 0, jitMasking: false, nullable: true, inputEventOnly: false, noValuePatching: false, positionCaretOnClick: "lvp", casing: null, inputmode: "text", importDataAttributes: true, shiftPositions: true, usePrototypeDefinitions: true, validationEventTimeOut: 3e3, substitutes: {} };
        }, 7392: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          t2.default = { 9: { validator: "[0-9０-９]", definitionSymbol: "*" }, a: { validator: "[A-Za-zА-яЁёÀ-ÿµ]", definitionSymbol: "*" }, "*": { validator: "[0-9０-９A-Za-zА-яЁёÀ-ÿµ]" } };
        }, 253: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3, t3, n2) {
            if (void 0 === n2) return e3.__data ? e3.__data[t3] : null;
            e3.__data = e3.__data || {}, e3.__data[t3] = n2;
          };
        }, 3776: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.Event = void 0, t2.off = function(e3, t3) {
            var n3, i3;
            u(this[0]) && e3 && (n3 = this[0].eventRegistry, i3 = this[0], e3.split(" ").forEach(function(e4) {
              var a2 = o(e4.split("."), 2);
              (function(e5, i4) {
                var a3, r2, o2 = [];
                if (e5.length > 0) if (void 0 === t3) for (a3 = 0, r2 = n3[e5][i4].length; a3 < r2; a3++) o2.push({ ev: e5, namespace: i4 && i4.length > 0 ? i4 : "global", handler: n3[e5][i4][a3] });
                else o2.push({ ev: e5, namespace: i4 && i4.length > 0 ? i4 : "global", handler: t3 });
                else if (i4.length > 0) {
                  for (var l2 in n3) for (var s2 in n3[l2]) if (s2 === i4) if (void 0 === t3) for (a3 = 0, r2 = n3[l2][s2].length; a3 < r2; a3++) o2.push({ ev: l2, namespace: s2, handler: n3[l2][s2][a3] });
                  else o2.push({ ev: l2, namespace: s2, handler: t3 });
                }
                return o2;
              })(a2[0], a2[1]).forEach(function(e5) {
                var t4 = e5.ev, a3 = e5.handler;
                !function(e6, t5, a4) {
                  if (e6 in n3 == 1) if (i3.removeEventListener ? i3.removeEventListener(e6, a4, false) : i3.detachEvent && i3.detachEvent("on".concat(e6), a4), "global" === t5) for (var r2 in n3[e6]) n3[e6][r2].splice(n3[e6][r2].indexOf(a4), 1);
                  else n3[e6][t5].splice(n3[e6][t5].indexOf(a4), 1);
                }(t4, e5.namespace, a3);
              });
            }));
            return this;
          }, t2.on = function(e3, t3) {
            if (u(this[0])) {
              var n3 = this[0].eventRegistry, i3 = this[0];
              e3.split(" ").forEach(function(e4) {
                var a2 = o(e4.split("."), 2), r2 = a2[0], l2 = a2[1];
                !function(e5, a3) {
                  i3.addEventListener ? i3.addEventListener(e5, t3, false) : i3.attachEvent && i3.attachEvent("on".concat(e5), t3), n3[e5] = n3[e5] || {}, n3[e5][a3] = n3[e5][a3] || [], n3[e5][a3].push(t3);
                }(r2, void 0 === l2 ? "global" : l2);
              });
            }
            return this;
          }, t2.trigger = function(e3) {
            var t3 = arguments;
            if (u(this[0])) for (var n3 = this[0].eventRegistry, i3 = this[0], o2 = "string" == typeof e3 ? e3.split(" ") : [e3.type], l2 = 0; l2 < o2.length; l2++) {
              var s2 = o2[l2].split("."), f2 = s2[0], p = s2[1] || "global";
              if (void 0 !== c && "global" === p) {
                var d, h = { bubbles: true, cancelable: true, composed: true, detail: arguments[1] };
                if (c.createEvent) {
                  try {
                    if ("input" === f2) h.inputType = "insertText", d = new InputEvent(f2, h);
                    else d = new CustomEvent(f2, h);
                  } catch (e4) {
                    (d = c.createEvent("CustomEvent")).initCustomEvent(f2, h.bubbles, h.cancelable, h.detail);
                  }
                  e3.type && (0, a.default)(d, e3), i3.dispatchEvent(d);
                } else (d = c.createEventObject()).eventType = f2, d.detail = arguments[1], e3.type && (0, a.default)(d, e3), i3.fireEvent("on" + d.eventType, d);
              } else if (void 0 !== n3[f2]) {
                arguments[0] = arguments[0].type ? arguments[0] : r.default.Event(arguments[0]), arguments[0].detail = arguments.slice(1);
                var v = n3[f2];
                ("global" === p ? Object.values(v).flat() : v[p]).forEach(function(e4) {
                  return e4.apply(i3, t3);
                });
              }
            }
            return this;
          };
          var i2 = s(n2(9380)), a = s(n2(600)), r = s(n2(4963));
          function o(e3, t3) {
            return function(e4) {
              if (Array.isArray(e4)) return e4;
            }(e3) || function(e4, t4) {
              var n3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
              if (null != n3) {
                var i3, a2, r2, o2, l2 = [], s2 = true, c2 = false;
                try {
                  if (r2 = (n3 = n3.call(e4)).next, 0 === t4) ;
                  else for (; !(s2 = (i3 = r2.call(n3)).done) && (l2.push(i3.value), l2.length !== t4); s2 = true) ;
                } catch (e5) {
                  c2 = true, a2 = e5;
                } finally {
                  try {
                    if (!s2 && null != n3.return && (o2 = n3.return(), Object(o2) !== o2)) return;
                  } finally {
                    if (c2) throw a2;
                  }
                }
                return l2;
              }
            }(e3, t3) || function(e4, t4) {
              if (!e4) return;
              if ("string" == typeof e4) return l(e4, t4);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return l(e4, t4);
            }(e3, t3) || function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }();
          }
          function l(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function s(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var c = i2.default.document;
          function u(e3) {
            return e3 instanceof Element;
          }
          var f = t2.Event = void 0;
          "function" == typeof i2.default.CustomEvent ? t2.Event = f = i2.default.CustomEvent : i2.default.Event && c && c.createEvent ? (t2.Event = f = function(e3, t3) {
            t3 = t3 || { bubbles: false, cancelable: false, composed: true, detail: void 0 };
            var n3 = c.createEvent("CustomEvent");
            return n3.initCustomEvent(e3, t3.bubbles, t3.cancelable, t3.detail), n3;
          }, f.prototype = i2.default.Event.prototype) : "undefined" != typeof Event && (t2.Event = f = Event);
        }, 600: function(e2, t2) {
          function n2(e3) {
            return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, n2(e3);
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function e3() {
            var t3, i2, a, r, o, l, s = arguments[0] || {}, c = 1, u = arguments.length, f = false;
            "boolean" == typeof s && (f = s, s = arguments[c] || {}, c++);
            "object" !== n2(s) && "function" != typeof s && (s = {});
            for (; c < u; c++) if (null != (t3 = arguments[c])) for (i2 in t3) a = s[i2], s !== (r = t3[i2]) && (f && r && ("[object Object]" === Object.prototype.toString.call(r) || (o = Array.isArray(r))) ? (o ? (o = false, l = a && Array.isArray(a) ? a : []) : l = a && "[object Object]" === Object.prototype.toString.call(a) ? a : {}, s[i2] = e3(f, l, r)) : void 0 !== r && (s[i2] = r));
            return s;
          };
        }, 4963: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          var i2 = l(n2(9380)), a = l(n2(253)), r = n2(3776), o = l(n2(600));
          function l(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var s = i2.default.document;
          function c(e3) {
            return e3 instanceof c ? e3 : this instanceof c ? void (null != e3 && e3 !== i2.default && (this[0] = e3.nodeName ? e3 : void 0 !== e3[0] && e3[0].nodeName ? e3[0] : s.querySelector(e3), void 0 !== this[0] && null !== this[0] && (this[0].eventRegistry = this[0].eventRegistry || {}))) : new c(e3);
          }
          c.prototype = { on: r.on, off: r.off, trigger: r.trigger }, c.extend = o.default, c.data = a.default, c.Event = r.Event;
          t2.default = c;
        }, 9845: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.mobile = t2.iphone = t2.ie = void 0;
          var i2, a = (i2 = n2(9380)) && i2.__esModule ? i2 : { default: i2 };
          var r = a.default.navigator && a.default.navigator.userAgent || "";
          t2.ie = r.indexOf("MSIE ") > 0 || r.indexOf("Trident/") > 0, t2.mobile = a.default.navigator && a.default.navigator.userAgentData && a.default.navigator.userAgentData.mobile || a.default.navigator && a.default.navigator.maxTouchPoints || "ontouchstart" in a.default, t2.iphone = /iphone/i.test(r);
        }, 7184: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3) {
            return e3.replace(n2, "\\$1");
          };
          var n2 = new RegExp("(\\" + ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^"].join("|\\") + ")", "gim");
        }, 6030: function(e2, t2, n2) {
          function i2(e3) {
            return i2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, i2(e3);
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.EventHandlers = void 0;
          var a, r = n2(9845), o = (a = n2(9380)) && a.__esModule ? a : { default: a }, l = n2(7760), s = n2(2839), c = n2(8711), u = n2(7215), f = n2(4713);
          function p() {
            /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
            p = function() {
              return t3;
            };
            var e3, t3 = {}, n3 = Object.prototype, a2 = n3.hasOwnProperty, r2 = Object.defineProperty || function(e4, t4, n4) {
              e4[t4] = n4.value;
            }, o2 = "function" == typeof Symbol ? Symbol : {}, l2 = o2.iterator || "@@iterator", s2 = o2.asyncIterator || "@@asyncIterator", c2 = o2.toStringTag || "@@toStringTag";
            function u2(e4, t4, n4) {
              return Object.defineProperty(e4, t4, { value: n4, enumerable: true, configurable: true, writable: true }), e4[t4];
            }
            try {
              u2({}, "");
            } catch (e4) {
              u2 = function(e5, t4, n4) {
                return e5[t4] = n4;
              };
            }
            function f2(e4, t4, n4, i3) {
              var a3 = t4 && t4.prototype instanceof k ? t4 : k, o3 = Object.create(a3.prototype), l3 = new D(i3 || []);
              return r2(o3, "_invoke", { value: E(e4, n4, l3) }), o3;
            }
            function d2(e4, t4, n4) {
              try {
                return { type: "normal", arg: e4.call(t4, n4) };
              } catch (e5) {
                return { type: "throw", arg: e5 };
              }
            }
            t3.wrap = f2;
            var h2 = "suspendedStart", v2 = "suspendedYield", m2 = "executing", g2 = "completed", y2 = {};
            function k() {
            }
            function b() {
            }
            function x() {
            }
            var w = {};
            u2(w, l2, function() {
              return this;
            });
            var P = Object.getPrototypeOf, S = P && P(P(L([])));
            S && S !== n3 && a2.call(S, l2) && (w = S);
            var O = x.prototype = k.prototype = Object.create(w);
            function _(e4) {
              ["next", "throw", "return"].forEach(function(t4) {
                u2(e4, t4, function(e5) {
                  return this._invoke(t4, e5);
                });
              });
            }
            function M(e4, t4) {
              function n4(r3, o4, l3, s3) {
                var c3 = d2(e4[r3], e4, o4);
                if ("throw" !== c3.type) {
                  var u3 = c3.arg, f3 = u3.value;
                  return f3 && "object" == i2(f3) && a2.call(f3, "__await") ? t4.resolve(f3.__await).then(function(e5) {
                    n4("next", e5, l3, s3);
                  }, function(e5) {
                    n4("throw", e5, l3, s3);
                  }) : t4.resolve(f3).then(function(e5) {
                    u3.value = e5, l3(u3);
                  }, function(e5) {
                    return n4("throw", e5, l3, s3);
                  });
                }
                s3(c3.arg);
              }
              var o3;
              r2(this, "_invoke", { value: function(e5, i3) {
                function a3() {
                  return new t4(function(t5, a4) {
                    n4(e5, i3, t5, a4);
                  });
                }
                return o3 = o3 ? o3.then(a3, a3) : a3();
              } });
            }
            function E(t4, n4, i3) {
              var a3 = h2;
              return function(r3, o3) {
                if (a3 === m2) throw new Error("Generator is already running");
                if (a3 === g2) {
                  if ("throw" === r3) throw o3;
                  return { value: e3, done: true };
                }
                for (i3.method = r3, i3.arg = o3; ; ) {
                  var l3 = i3.delegate;
                  if (l3) {
                    var s3 = j(l3, i3);
                    if (s3) {
                      if (s3 === y2) continue;
                      return s3;
                    }
                  }
                  if ("next" === i3.method) i3.sent = i3._sent = i3.arg;
                  else if ("throw" === i3.method) {
                    if (a3 === h2) throw a3 = g2, i3.arg;
                    i3.dispatchException(i3.arg);
                  } else "return" === i3.method && i3.abrupt("return", i3.arg);
                  a3 = m2;
                  var c3 = d2(t4, n4, i3);
                  if ("normal" === c3.type) {
                    if (a3 = i3.done ? g2 : v2, c3.arg === y2) continue;
                    return { value: c3.arg, done: i3.done };
                  }
                  "throw" === c3.type && (a3 = g2, i3.method = "throw", i3.arg = c3.arg);
                }
              };
            }
            function j(t4, n4) {
              var i3 = n4.method, a3 = t4.iterator[i3];
              if (a3 === e3) return n4.delegate = null, "throw" === i3 && t4.iterator.return && (n4.method = "return", n4.arg = e3, j(t4, n4), "throw" === n4.method) || "return" !== i3 && (n4.method = "throw", n4.arg = new TypeError("The iterator does not provide a '" + i3 + "' method")), y2;
              var r3 = d2(a3, t4.iterator, n4.arg);
              if ("throw" === r3.type) return n4.method = "throw", n4.arg = r3.arg, n4.delegate = null, y2;
              var o3 = r3.arg;
              return o3 ? o3.done ? (n4[t4.resultName] = o3.value, n4.next = t4.nextLoc, "return" !== n4.method && (n4.method = "next", n4.arg = e3), n4.delegate = null, y2) : o3 : (n4.method = "throw", n4.arg = new TypeError("iterator result is not an object"), n4.delegate = null, y2);
            }
            function T(e4) {
              var t4 = { tryLoc: e4[0] };
              1 in e4 && (t4.catchLoc = e4[1]), 2 in e4 && (t4.finallyLoc = e4[2], t4.afterLoc = e4[3]), this.tryEntries.push(t4);
            }
            function A(e4) {
              var t4 = e4.completion || {};
              t4.type = "normal", delete t4.arg, e4.completion = t4;
            }
            function D(e4) {
              this.tryEntries = [{ tryLoc: "root" }], e4.forEach(T, this), this.reset(true);
            }
            function L(t4) {
              if (t4 || "" === t4) {
                var n4 = t4[l2];
                if (n4) return n4.call(t4);
                if ("function" == typeof t4.next) return t4;
                if (!isNaN(t4.length)) {
                  var r3 = -1, o3 = function n5() {
                    for (; ++r3 < t4.length; ) if (a2.call(t4, r3)) return n5.value = t4[r3], n5.done = false, n5;
                    return n5.value = e3, n5.done = true, n5;
                  };
                  return o3.next = o3;
                }
              }
              throw new TypeError(i2(t4) + " is not iterable");
            }
            return b.prototype = x, r2(O, "constructor", { value: x, configurable: true }), r2(x, "constructor", { value: b, configurable: true }), b.displayName = u2(x, c2, "GeneratorFunction"), t3.isGeneratorFunction = function(e4) {
              var t4 = "function" == typeof e4 && e4.constructor;
              return !!t4 && (t4 === b || "GeneratorFunction" === (t4.displayName || t4.name));
            }, t3.mark = function(e4) {
              return Object.setPrototypeOf ? Object.setPrototypeOf(e4, x) : (e4.__proto__ = x, u2(e4, c2, "GeneratorFunction")), e4.prototype = Object.create(O), e4;
            }, t3.awrap = function(e4) {
              return { __await: e4 };
            }, _(M.prototype), u2(M.prototype, s2, function() {
              return this;
            }), t3.AsyncIterator = M, t3.async = function(e4, n4, i3, a3, r3) {
              void 0 === r3 && (r3 = Promise);
              var o3 = new M(f2(e4, n4, i3, a3), r3);
              return t3.isGeneratorFunction(n4) ? o3 : o3.next().then(function(e5) {
                return e5.done ? e5.value : o3.next();
              });
            }, _(O), u2(O, c2, "Generator"), u2(O, l2, function() {
              return this;
            }), u2(O, "toString", function() {
              return "[object Generator]";
            }), t3.keys = function(e4) {
              var t4 = Object(e4), n4 = [];
              for (var i3 in t4) n4.push(i3);
              return n4.reverse(), function e5() {
                for (; n4.length; ) {
                  var i4 = n4.pop();
                  if (i4 in t4) return e5.value = i4, e5.done = false, e5;
                }
                return e5.done = true, e5;
              };
            }, t3.values = L, D.prototype = { constructor: D, reset: function(t4) {
              if (this.prev = 0, this.next = 0, this.sent = this._sent = e3, this.done = false, this.delegate = null, this.method = "next", this.arg = e3, this.tryEntries.forEach(A), !t4) for (var n4 in this) "t" === n4.charAt(0) && a2.call(this, n4) && !isNaN(+n4.slice(1)) && (this[n4] = e3);
            }, stop: function() {
              this.done = true;
              var e4 = this.tryEntries[0].completion;
              if ("throw" === e4.type) throw e4.arg;
              return this.rval;
            }, dispatchException: function(t4) {
              if (this.done) throw t4;
              var n4 = this;
              function i3(i4, a3) {
                return l3.type = "throw", l3.arg = t4, n4.next = i4, a3 && (n4.method = "next", n4.arg = e3), !!a3;
              }
              for (var r3 = this.tryEntries.length - 1; r3 >= 0; --r3) {
                var o3 = this.tryEntries[r3], l3 = o3.completion;
                if ("root" === o3.tryLoc) return i3("end");
                if (o3.tryLoc <= this.prev) {
                  var s3 = a2.call(o3, "catchLoc"), c3 = a2.call(o3, "finallyLoc");
                  if (s3 && c3) {
                    if (this.prev < o3.catchLoc) return i3(o3.catchLoc, true);
                    if (this.prev < o3.finallyLoc) return i3(o3.finallyLoc);
                  } else if (s3) {
                    if (this.prev < o3.catchLoc) return i3(o3.catchLoc, true);
                  } else {
                    if (!c3) throw new Error("try statement without catch or finally");
                    if (this.prev < o3.finallyLoc) return i3(o3.finallyLoc);
                  }
                }
              }
            }, abrupt: function(e4, t4) {
              for (var n4 = this.tryEntries.length - 1; n4 >= 0; --n4) {
                var i3 = this.tryEntries[n4];
                if (i3.tryLoc <= this.prev && a2.call(i3, "finallyLoc") && this.prev < i3.finallyLoc) {
                  var r3 = i3;
                  break;
                }
              }
              r3 && ("break" === e4 || "continue" === e4) && r3.tryLoc <= t4 && t4 <= r3.finallyLoc && (r3 = null);
              var o3 = r3 ? r3.completion : {};
              return o3.type = e4, o3.arg = t4, r3 ? (this.method = "next", this.next = r3.finallyLoc, y2) : this.complete(o3);
            }, complete: function(e4, t4) {
              if ("throw" === e4.type) throw e4.arg;
              return "break" === e4.type || "continue" === e4.type ? this.next = e4.arg : "return" === e4.type ? (this.rval = this.arg = e4.arg, this.method = "return", this.next = "end") : "normal" === e4.type && t4 && (this.next = t4), y2;
            }, finish: function(e4) {
              for (var t4 = this.tryEntries.length - 1; t4 >= 0; --t4) {
                var n4 = this.tryEntries[t4];
                if (n4.finallyLoc === e4) return this.complete(n4.completion, n4.afterLoc), A(n4), y2;
              }
            }, catch: function(e4) {
              for (var t4 = this.tryEntries.length - 1; t4 >= 0; --t4) {
                var n4 = this.tryEntries[t4];
                if (n4.tryLoc === e4) {
                  var i3 = n4.completion;
                  if ("throw" === i3.type) {
                    var a3 = i3.arg;
                    A(n4);
                  }
                  return a3;
                }
              }
              throw new Error("illegal catch attempt");
            }, delegateYield: function(t4, n4, i3) {
              return this.delegate = { iterator: L(t4), resultName: n4, nextLoc: i3 }, "next" === this.method && (this.arg = e3), y2;
            } }, t3;
          }
          function d(e3, t3) {
            var n3 = "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
            if (!n3) {
              if (Array.isArray(e3) || (n3 = function(e4, t4) {
                if (!e4) return;
                if ("string" == typeof e4) return h(e4, t4);
                var n4 = Object.prototype.toString.call(e4).slice(8, -1);
                "Object" === n4 && e4.constructor && (n4 = e4.constructor.name);
                if ("Map" === n4 || "Set" === n4) return Array.from(e4);
                if ("Arguments" === n4 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n4)) return h(e4, t4);
              }(e3)) || t3) {
                n3 && (e3 = n3);
                var i3 = 0, a2 = function() {
                };
                return { s: a2, n: function() {
                  return i3 >= e3.length ? { done: true } : { done: false, value: e3[i3++] };
                }, e: function(e4) {
                  throw e4;
                }, f: a2 };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var r2, o2 = true, l2 = false;
            return { s: function() {
              n3 = n3.call(e3);
            }, n: function() {
              var e4 = n3.next();
              return o2 = e4.done, e4;
            }, e: function(e4) {
              l2 = true, r2 = e4;
            }, f: function() {
              try {
                o2 || null == n3.return || n3.return();
              } finally {
                if (l2) throw r2;
              }
            } };
          }
          function h(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function v(e3, t3, n3, i3, a2, r2, o2) {
            try {
              var l2 = e3[r2](o2), s2 = l2.value;
            } catch (e4) {
              return void n3(e4);
            }
            l2.done ? t3(s2) : Promise.resolve(s2).then(i3, a2);
          }
          var m, g, y = t2.EventHandlers = { keyEvent: function(e3, t3, n3, i3, a2) {
            var o2 = this.inputmask, p2 = o2.opts, d2 = o2.dependencyLib, h2 = o2.maskset, v2 = this, m2 = d2(v2), g2 = e3.key, k = c.caret.call(o2, v2), b = p2.onKeyDown.call(this, e3, c.getBuffer.call(o2), k, p2);
            if (void 0 !== b) return b;
            if (g2 === s.keys.Backspace || g2 === s.keys.Delete || r.iphone && g2 === s.keys.BACKSPACE_SAFARI || e3.ctrlKey && g2 === s.keys.x && !("oncut" in v2)) e3.preventDefault(), u.handleRemove.call(o2, v2, g2, k), (0, l.writeBuffer)(v2, c.getBuffer.call(o2, true), h2.p, e3, v2.inputmask._valueGet() !== c.getBuffer.call(o2).join(""));
            else if (g2 === s.keys.End || g2 === s.keys.PageDown) {
              e3.preventDefault();
              var x = c.seekNext.call(o2, c.getLastValidPosition.call(o2));
              c.caret.call(o2, v2, e3.shiftKey ? k.begin : x, x, true);
            } else g2 === s.keys.Home && !e3.shiftKey || g2 === s.keys.PageUp ? (e3.preventDefault(), c.caret.call(o2, v2, 0, e3.shiftKey ? k.begin : 0, true)) : p2.undoOnEscape && g2 === s.keys.Escape && true !== e3.altKey ? ((0, l.checkVal)(v2, true, false, o2.undoValue.split("")), m2.trigger("click")) : g2 !== s.keys.Insert || e3.shiftKey || e3.ctrlKey || void 0 !== o2.userOptions.insertMode ? true === p2.tabThrough && g2 === s.keys.Tab ? true === e3.shiftKey ? (k.end = c.seekPrevious.call(o2, k.end, true), true === f.getTest.call(o2, k.end - 1).match.static && k.end--, k.begin = c.seekPrevious.call(o2, k.end, true), k.begin >= 0 && k.end > 0 && (e3.preventDefault(), c.caret.call(o2, v2, k.begin, k.end))) : (k.begin = c.seekNext.call(o2, k.begin, true), k.end = c.seekNext.call(o2, k.begin, true), k.end < h2.maskLength && k.end--, k.begin <= h2.maskLength && (e3.preventDefault(), c.caret.call(o2, v2, k.begin, k.end))) : e3.shiftKey || (p2.insertModeVisual && false === p2.insertMode ? g2 === s.keys.ArrowRight ? setTimeout(function() {
              var e4 = c.caret.call(o2, v2);
              c.caret.call(o2, v2, e4.begin);
            }, 0) : g2 === s.keys.ArrowLeft && setTimeout(function() {
              var e4 = c.translatePosition.call(o2, v2.inputmask.caretPos.begin);
              c.translatePosition.call(o2, v2.inputmask.caretPos.end);
              o2.isRTL ? c.caret.call(o2, v2, e4 + (e4 === h2.maskLength ? 0 : 1)) : c.caret.call(o2, v2, e4 - (0 === e4 ? 0 : 1));
            }, 0) : void 0 === o2.keyEventHook || o2.keyEventHook(e3)) : u.isSelection.call(o2, k) ? p2.insertMode = !p2.insertMode : (p2.insertMode = !p2.insertMode, c.caret.call(o2, v2, k.begin, k.begin));
            return o2.isComposing = g2 == s.keys.Process || g2 == s.keys.Unidentified, o2.ignorable = g2.length > 1 && !("textarea" === v2.tagName.toLowerCase() && g2 == s.keys.Enter), y.keypressEvent.call(this, e3, t3, n3, i3, a2);
          }, keypressEvent: function(e3, t3, n3, i3, a2) {
            var r2 = this.inputmask || this, o2 = r2.opts, f2 = r2.dependencyLib, p2 = r2.maskset, d2 = r2.el, h2 = f2(d2), v2 = e3.key;
            if (true === t3 || e3.ctrlKey && e3.altKey && !r2.ignorable || !(e3.ctrlKey || e3.metaKey || r2.ignorable)) {
              if (v2) {
                var m2, g2 = t3 ? { begin: a2, end: a2 } : c.caret.call(r2, d2);
                t3 || (v2 = o2.substitutes[v2] || v2), p2.writeOutBuffer = true;
                var y2 = u.isValid.call(r2, g2, v2, i3, void 0, void 0, void 0, t3);
                if (false !== y2 && (c.resetMaskSet.call(r2, true), m2 = void 0 !== y2.caret ? y2.caret : c.seekNext.call(r2, y2.pos.begin ? y2.pos.begin : y2.pos), p2.p = m2), m2 = o2.numericInput && void 0 === y2.caret ? c.seekPrevious.call(r2, m2) : m2, false !== n3 && (setTimeout(function() {
                  o2.onKeyValidation.call(d2, v2, y2);
                }, 0), p2.writeOutBuffer && false !== y2)) {
                  var k = c.getBuffer.call(r2);
                  (0, l.writeBuffer)(d2, k, m2, e3, true !== t3);
                }
                if (e3.preventDefault(), t3) return false !== y2 && (y2.forwardPosition = m2), y2;
              }
            } else v2 === s.keys.Enter && r2.undoValue !== r2._valueGet(true) && (r2.undoValue = r2._valueGet(true), setTimeout(function() {
              h2.trigger("change");
            }, 0));
          }, pasteEvent: (m = p().mark(function e3(t3) {
            var n3, i3, a2, r2, s2, u2;
            return p().wrap(function(e4) {
              for (; ; ) switch (e4.prev = e4.next) {
                case 0:
                  n3 = function(e5, n4, i4, a3, o2) {
                    var s3 = c.caret.call(e5, n4, void 0, void 0, true), u3 = i4.substr(0, s3.begin), f2 = i4.substr(s3.end, i4.length);
                    if (u3 == (e5.isRTL ? c.getBufferTemplate.call(e5).slice().reverse() : c.getBufferTemplate.call(e5)).slice(0, s3.begin).join("") && (u3 = ""), f2 == (e5.isRTL ? c.getBufferTemplate.call(e5).slice().reverse() : c.getBufferTemplate.call(e5)).slice(s3.end).join("") && (f2 = ""), a3 = u3 + a3 + f2, e5.isRTL && true !== r2.numericInput) {
                      a3 = a3.split("");
                      var p2, h2 = d(c.getBufferTemplate.call(e5));
                      try {
                        for (h2.s(); !(p2 = h2.n()).done; ) {
                          var v2 = p2.value;
                          a3[0] === v2 && a3.shift();
                        }
                      } catch (e6) {
                        h2.e(e6);
                      } finally {
                        h2.f();
                      }
                      a3 = a3.reverse().join("");
                    }
                    var m2 = a3;
                    if ("function" == typeof o2) {
                      if (false === (m2 = o2.call(e5, m2, r2))) return false;
                      m2 || (m2 = i4);
                    }
                    (0, l.checkVal)(n4, true, false, m2.toString().split(""), t3);
                  }, i3 = this, a2 = this.inputmask, r2 = a2.opts, s2 = a2._valueGet(true), a2.skipInputEvent = true, t3.clipboardData && t3.clipboardData.getData ? u2 = t3.clipboardData.getData("text/plain") : o.default.clipboardData && o.default.clipboardData.getData && (u2 = o.default.clipboardData.getData("Text")), n3(a2, i3, s2, u2, r2.onBeforePaste), t3.preventDefault();
                case 7:
                case "end":
                  return e4.stop();
              }
            }, e3, this);
          }), g = function() {
            var e3 = this, t3 = arguments;
            return new Promise(function(n3, i3) {
              var a2 = m.apply(e3, t3);
              function r2(e4) {
                v(a2, n3, i3, r2, o2, "next", e4);
              }
              function o2(e4) {
                v(a2, n3, i3, r2, o2, "throw", e4);
              }
              r2(void 0);
            });
          }, function(e3) {
            return g.apply(this, arguments);
          }), inputFallBackEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.opts, i3 = t3.dependencyLib;
            var a2, o2 = this, u2 = o2.inputmask._valueGet(true), p2 = (t3.isRTL ? c.getBuffer.call(t3).slice().reverse() : c.getBuffer.call(t3)).join(""), d2 = c.caret.call(t3, o2, void 0, void 0, true);
            if (p2 !== u2) {
              if (a2 = function(e4, i4, a3) {
                for (var r2, o3, l2, s2 = e4.substr(0, a3.begin).split(""), u3 = e4.substr(a3.begin).split(""), p3 = i4.substr(0, a3.begin).split(""), d3 = i4.substr(a3.begin).split(""), h3 = s2.length >= p3.length ? s2.length : p3.length, v2 = u3.length >= d3.length ? u3.length : d3.length, m2 = "", g2 = [], y2 = "~"; s2.length < h3; ) s2.push(y2);
                for (; p3.length < h3; ) p3.push(y2);
                for (; u3.length < v2; ) u3.unshift(y2);
                for (; d3.length < v2; ) d3.unshift(y2);
                var k = s2.concat(u3), b = p3.concat(d3);
                for (o3 = 0, r2 = k.length; o3 < r2; o3++) switch (l2 = f.getPlaceholder.call(t3, c.translatePosition.call(t3, o3)), m2) {
                  case "insertText":
                    b[o3 - 1] === k[o3] && a3.begin == k.length - 1 && g2.push(k[o3]), o3 = r2;
                    break;
                  case "insertReplacementText":
                  case "deleteContentBackward":
                    k[o3] === y2 ? a3.end++ : o3 = r2;
                    break;
                  default:
                    k[o3] !== b[o3] && (k[o3 + 1] !== y2 && k[o3 + 1] !== l2 && void 0 !== k[o3 + 1] || (b[o3] !== l2 || b[o3 + 1] !== y2) && b[o3] !== y2 ? b[o3 + 1] === y2 && b[o3] === k[o3 + 1] ? (m2 = "insertText", g2.push(k[o3]), a3.begin--, a3.end--) : k[o3] !== l2 && k[o3] !== y2 && (k[o3 + 1] === y2 || b[o3] !== k[o3] && b[o3 + 1] === k[o3 + 1]) ? (m2 = "insertReplacementText", g2.push(k[o3]), a3.begin--) : k[o3] === y2 ? (m2 = "deleteContentBackward", (c.isMask.call(t3, c.translatePosition.call(t3, o3), true) || b[o3] === n3.radixPoint) && a3.end++) : o3 = r2 : (m2 = "insertText", g2.push(k[o3]), a3.begin--, a3.end--));
                }
                return { action: m2, data: g2, caret: a3 };
              }(u2, p2, d2), (o2.inputmask.shadowRoot || o2.ownerDocument).activeElement !== o2 && o2.focus(), (0, l.writeBuffer)(o2, c.getBuffer.call(t3)), c.caret.call(t3, o2, d2.begin, d2.end, true), !r.mobile && t3.skipNextInsert && "insertText" === e3.inputType && "insertText" === a2.action && t3.isComposing) return false;
              switch ("insertCompositionText" === e3.inputType && "insertText" === a2.action && t3.isComposing ? t3.skipNextInsert = true : t3.skipNextInsert = false, a2.action) {
                case "insertText":
                case "insertReplacementText":
                  a2.data.forEach(function(e4, n4) {
                    var a3 = new i3.Event("keypress");
                    a3.key = e4, t3.ignorable = false, y.keypressEvent.call(o2, a3);
                  }), setTimeout(function() {
                    t3.$el.trigger("keyup");
                  }, 0);
                  break;
                case "deleteContentBackward":
                  var h2 = new i3.Event("keydown");
                  h2.key = s.keys.Backspace, y.keyEvent.call(o2, h2);
                  break;
                default:
                  (0, l.applyInputValue)(o2, u2), c.caret.call(t3, o2, d2.begin, d2.end, true);
              }
              e3.preventDefault();
            }
          }, setValueEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.dependencyLib, i3 = this, a2 = e3 && e3.detail ? e3.detail[0] : arguments[1];
            void 0 === a2 && (a2 = i3.inputmask._valueGet(true)), (0, l.applyInputValue)(i3, a2, new n3.Event("input")), (e3.detail && void 0 !== e3.detail[1] || void 0 !== arguments[2]) && c.caret.call(t3, i3, e3.detail ? e3.detail[1] : arguments[2]);
          }, focusEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.opts, i3 = t3 && t3._valueGet();
            n3.showMaskOnFocus && i3 !== c.getBuffer.call(t3).join("") && (0, l.writeBuffer)(this, c.getBuffer.call(t3), c.seekNext.call(t3, c.getLastValidPosition.call(t3))), true !== n3.positionCaretOnTab || false !== t3.mouseEnter || u.isComplete.call(t3, c.getBuffer.call(t3)) && -1 !== c.getLastValidPosition.call(t3) || y.clickEvent.apply(this, [e3, true]), t3.undoValue = t3 && t3._valueGet(true);
          }, invalidEvent: function(e3) {
            this.inputmask.validationEvent = true;
          }, mouseleaveEvent: function() {
            var e3 = this.inputmask, t3 = e3.opts, n3 = this;
            e3.mouseEnter = false, t3.clearMaskOnLostFocus && (n3.inputmask.shadowRoot || n3.ownerDocument).activeElement !== n3 && (0, l.HandleNativePlaceholder)(n3, e3.originalPlaceholder);
          }, clickEvent: function(e3, t3) {
            var n3 = this.inputmask;
            n3.clicked++;
            var i3 = this;
            if ((i3.inputmask.shadowRoot || i3.ownerDocument).activeElement === i3) {
              var a2 = c.determineNewCaretPosition.call(n3, c.caret.call(n3, i3), t3);
              void 0 !== a2 && c.caret.call(n3, i3, a2);
            }
          }, cutEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.maskset, i3 = this, a2 = c.caret.call(t3, i3), r2 = t3.isRTL ? c.getBuffer.call(t3).slice(a2.end, a2.begin) : c.getBuffer.call(t3).slice(a2.begin, a2.end), f2 = t3.isRTL ? r2.reverse().join("") : r2.join("");
            o.default.navigator && o.default.navigator.clipboard ? o.default.navigator.clipboard.writeText(f2) : o.default.clipboardData && o.default.clipboardData.getData && o.default.clipboardData.setData("Text", f2), u.handleRemove.call(t3, i3, s.keys.Delete, a2), (0, l.writeBuffer)(i3, c.getBuffer.call(t3), n3.p, e3, t3.undoValue !== t3._valueGet(true));
          }, blurEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.opts, i3 = t3.dependencyLib;
            t3.clicked = 0;
            var a2 = i3(this), r2 = this;
            if (r2.inputmask) {
              (0, l.HandleNativePlaceholder)(r2, t3.originalPlaceholder);
              var o2 = r2.inputmask._valueGet(), s2 = c.getBuffer.call(t3).slice();
              "" !== o2 && (n3.clearMaskOnLostFocus && (-1 === c.getLastValidPosition.call(t3) && o2 === c.getBufferTemplate.call(t3).join("") ? s2 = [] : l.clearOptionalTail.call(t3, s2)), false === u.isComplete.call(t3, s2) && (setTimeout(function() {
                a2.trigger("incomplete");
              }, 0), n3.clearIncomplete && (c.resetMaskSet.call(t3, false), s2 = n3.clearMaskOnLostFocus ? [] : c.getBufferTemplate.call(t3).slice())), (0, l.writeBuffer)(r2, s2, void 0, e3)), o2 = t3._valueGet(true), t3.undoValue !== o2 && ("" != o2 || t3.undoValue != c.getBufferTemplate.call(t3).join("") || t3.undoValue == c.getBufferTemplate.call(t3).join("") && t3.maskset.validPositions.length > 0) && (t3.undoValue = o2, a2.trigger("change"));
            }
          }, mouseenterEvent: function() {
            var e3 = this.inputmask, t3 = e3.opts.showMaskOnHover, n3 = this;
            if (e3.mouseEnter = true, (n3.inputmask.shadowRoot || n3.ownerDocument).activeElement !== n3) {
              var i3 = (e3.isRTL ? c.getBufferTemplate.call(e3).slice().reverse() : c.getBufferTemplate.call(e3)).join("");
              t3 && (0, l.HandleNativePlaceholder)(n3, i3);
            }
          }, submitEvent: function() {
            var e3 = this.inputmask, t3 = e3.opts;
            e3.undoValue !== e3._valueGet(true) && e3.$el.trigger("change"), -1 === c.getLastValidPosition.call(e3) && e3._valueGet && e3._valueGet() === c.getBufferTemplate.call(e3).join("") && e3._valueSet(""), t3.clearIncomplete && false === u.isComplete.call(e3, c.getBuffer.call(e3)) && e3._valueSet(""), t3.removeMaskOnSubmit && (e3._valueSet(e3.unmaskedvalue(), true), setTimeout(function() {
              (0, l.writeBuffer)(e3.el, c.getBuffer.call(e3));
            }, 0));
          }, resetEvent: function() {
            var e3 = this.inputmask;
            e3.refreshValue = true, setTimeout(function() {
              (0, l.applyInputValue)(e3.el, e3._valueGet(true));
            }, 0);
          } };
        }, 9716: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.EventRuler = void 0;
          var i2, a = n2(7760), r = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 }, o = n2(2839), l = n2(8711);
          t2.EventRuler = { on: function(e3, t3, n3) {
            var i3 = e3.inputmask.dependencyLib, s = function(t4) {
              t4.originalEvent && (t4 = t4.originalEvent || t4, arguments[0] = t4);
              var s2, c = this, u = c.inputmask, f = u ? u.opts : void 0;
              if (void 0 === u && "FORM" !== this.nodeName) {
                var p = i3.data(c, "_inputmask_opts");
                i3(c).off(), p && new r.default(p).mask(c);
              } else {
                if (["submit", "reset", "setvalue"].includes(t4.type) || "FORM" === this.nodeName || !(c.disabled || c.readOnly && !("keydown" === t4.type && t4.ctrlKey && t4.key === o.keys.c || false === f.tabThrough && t4.key === o.keys.Tab))) {
                  switch (t4.type) {
                    case "input":
                      if (true === u.skipInputEvent) return u.skipInputEvent = false, t4.preventDefault();
                      break;
                    case "click":
                    case "focus":
                      return u.validationEvent ? (u.validationEvent = false, e3.blur(), (0, a.HandleNativePlaceholder)(e3, (u.isRTL ? l.getBufferTemplate.call(u).slice().reverse() : l.getBufferTemplate.call(u)).join("")), setTimeout(function() {
                        e3.focus();
                      }, f.validationEventTimeOut), false) : (s2 = arguments, void setTimeout(function() {
                        e3.inputmask && n3.apply(c, s2);
                      }, 0));
                  }
                  var d = n3.apply(c, arguments);
                  return false === d && (t4.preventDefault(), t4.stopPropagation()), d;
                }
                t4.preventDefault();
              }
            };
            ["submit", "reset"].includes(t3) ? (s = s.bind(e3), null !== e3.form && i3(e3.form).on(t3, s)) : i3(e3).on(t3, s), e3.inputmask.events[t3] = e3.inputmask.events[t3] || [], e3.inputmask.events[t3].push(s);
          }, off: function(e3, t3) {
            if (e3.inputmask && e3.inputmask.events) {
              var n3 = e3.inputmask.dependencyLib, i3 = e3.inputmask.events;
              for (var a2 in t3 && ((i3 = [])[t3] = e3.inputmask.events[t3]), i3) {
                for (var r2 = i3[a2]; r2.length > 0; ) {
                  var o2 = r2.pop();
                  ["submit", "reset"].includes(a2) ? null !== e3.form && n3(e3.form).off(a2, o2) : n3(e3).off(a2, o2);
                }
                delete e3.inputmask.events[a2];
              }
            }
          } };
        }, 219: function(e2, t2, n2) {
          var i2 = p(n2(7184)), a = p(n2(2394)), r = n2(2839), o = n2(8711), l = n2(4713);
          function s(e3, t3) {
            return function(e4) {
              if (Array.isArray(e4)) return e4;
            }(e3) || function(e4, t4) {
              var n3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
              if (null != n3) {
                var i3, a2, r2, o2, l2 = [], s2 = true, c2 = false;
                try {
                  if (r2 = (n3 = n3.call(e4)).next, 0 === t4) ;
                  else for (; !(s2 = (i3 = r2.call(n3)).done) && (l2.push(i3.value), l2.length !== t4); s2 = true) ;
                } catch (e5) {
                  c2 = true, a2 = e5;
                } finally {
                  try {
                    if (!s2 && null != n3.return && (o2 = n3.return(), Object(o2) !== o2)) return;
                  } finally {
                    if (c2) throw a2;
                  }
                }
                return l2;
              }
            }(e3, t3) || function(e4, t4) {
              if (!e4) return;
              if ("string" == typeof e4) return c(e4, t4);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return c(e4, t4);
            }(e3, t3) || function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }();
          }
          function c(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function u(e3) {
            return u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, u(e3);
          }
          function f(e3, t3) {
            for (var n3 = 0; n3 < t3.length; n3++) {
              var i3 = t3[n3];
              i3.enumerable = i3.enumerable || false, i3.configurable = true, "value" in i3 && (i3.writable = true), Object.defineProperty(e3, (a2 = i3.key, r2 = void 0, r2 = function(e4, t4) {
                if ("object" !== u(e4) || null === e4) return e4;
                var n4 = e4[Symbol.toPrimitive];
                if (void 0 !== n4) {
                  var i4 = n4.call(e4, t4);
                  if ("object" !== u(i4)) return i4;
                  throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t4 ? String : Number)(e4);
              }(a2, "string"), "symbol" === u(r2) ? r2 : String(r2)), i3);
            }
            var a2, r2;
          }
          function p(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          n2(1313);
          var d = a.default.dependencyLib, h = function() {
            function e3(t4, n4, i4, a2) {
              !function(e4, t5) {
                if (!(e4 instanceof t5)) throw new TypeError("Cannot call a class as a function");
              }(this, e3), this.mask = t4, this.format = n4, this.opts = i4, this.inputmask = a2, this._date = new Date(1, 0, 1), this.initDateObject(t4, this.opts, this.inputmask);
            }
            var t3, n3;
            return t3 = e3, (n3 = [{ key: "date", get: function() {
              return void 0 === this._date && (this._date = new Date(1, 0, 1), this.initDateObject(void 0, this.opts, this.inputmask)), this._date;
            } }, { key: "initDateObject", value: function(e4, t4, n4) {
              var i4;
              for (P(t4).lastIndex = 0; i4 = P(t4).exec(this.format); ) {
                var a2 = /\d+$/.exec(i4[0]), r2 = a2 ? i4[0][0] + "x" : i4[0], o2 = void 0;
                if (void 0 !== e4) {
                  if (a2) {
                    var s2 = P(t4).lastIndex, c2 = j.call(n4, i4.index, t4, n4 && n4.maskset);
                    P(t4).lastIndex = s2, o2 = e4.slice(0, e4.indexOf(c2.nextMatch[0]));
                  } else {
                    for (var u2 = i4[0][0], f2 = i4.index; n4 && (t4.placeholder[l.getTest.call(n4, f2).match.placeholder] || l.getTest.call(n4, f2).match.placeholder) === u2; ) f2++;
                    var p2 = f2 - i4.index;
                    o2 = e4.slice(0, p2 || y[r2] && y[r2][4] || r2.length);
                  }
                  e4 = e4.slice(o2.length);
                }
                Object.prototype.hasOwnProperty.call(y, r2) && this.setValue(this, o2, r2, y[r2][2], y[r2][1]);
              }
            } }, { key: "setValue", value: function(e4, t4, n4, i4, a2) {
              if (void 0 !== t4) switch (i4) {
                case "ampm":
                  e4[i4] = t4, e4["raw" + i4] = t4.replace(/\s/g, "_");
                  break;
                case "month":
                  if ("mmm" === n4 || "mmmm" === n4) {
                    e4[i4] = _("mmm" === n4 ? m.monthNames.slice(0, 12).findIndex(function(e5) {
                      return t4.toLowerCase() === e5.toLowerCase();
                    }) + 1 : m.monthNames.slice(12, 24).findIndex(function(e5) {
                      return t4.toLowerCase() === e5.toLowerCase();
                    }) + 1, 2), e4[i4] = "00" === e4[i4] ? "" : e4[i4].toString(), e4["raw" + i4] = e4[i4];
                    break;
                  }
                default:
                  e4[i4] = t4.replace(/[^0-9]/g, "0"), e4["raw" + i4] = t4.replace(/\s/g, "_");
              }
              if (void 0 !== a2) {
                var r2 = e4[i4];
                ("day" === i4 && 29 === parseInt(r2) || "month" === i4 && 2 === parseInt(r2)) && (29 !== parseInt(e4.day) || 2 !== parseInt(e4.month) || "" !== e4.year && void 0 !== e4.year || e4._date.setFullYear(2012, 1, 29)), "day" === i4 && (g = true, 0 === parseInt(r2) && (r2 = 1)), "month" === i4 && (g = true), "year" === i4 && (g = true, r2.length < y[n4][4] && (r2 = _(r2, y[n4][4], true))), ("" !== r2 && !isNaN(r2) || "ampm" === i4) && a2.call(e4._date, r2);
              }
            } }, { key: "reset", value: function() {
              this._date = new Date(1, 0, 1);
            } }, { key: "reInit", value: function() {
              this._date = void 0, this.date;
            } }]) && f(t3.prototype, n3), Object.defineProperty(t3, "prototype", { writable: false }), e3;
          }(), v = (/* @__PURE__ */ new Date()).getFullYear(), m = a.default.prototype.i18n, g = false, y = { d: ["[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", Date.prototype.getDate], dd: ["0[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", function() {
            return _(Date.prototype.getDate.call(this), 2);
          }], ddd: [""], dddd: [""], m: ["[1-9]|1[012]", function(e3) {
            var t3 = e3 ? parseInt(e3) : 0;
            return t3 > 0 && t3--, Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return Date.prototype.getMonth.call(this) + 1;
          }], mm: ["0[1-9]|1[012]", function(e3) {
            var t3 = e3 ? parseInt(e3) : 0;
            return t3 > 0 && t3--, Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return _(Date.prototype.getMonth.call(this) + 1, 2);
          }], mmm: [m.monthNames.slice(0, 12).join("|"), function(e3) {
            var t3 = m.monthNames.slice(0, 12).findIndex(function(t4) {
              return e3.toLowerCase() === t4.toLowerCase();
            });
            return -1 !== t3 && Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return m.monthNames.slice(0, 12)[Date.prototype.getMonth.call(this)];
          }], mmmm: [m.monthNames.slice(12, 24).join("|"), function(e3) {
            var t3 = m.monthNames.slice(12, 24).findIndex(function(t4) {
              return e3.toLowerCase() === t4.toLowerCase();
            });
            return -1 !== t3 && Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return m.monthNames.slice(12, 24)[Date.prototype.getMonth.call(this)];
          }], yy: ["[0-9]{2}", function(e3) {
            var t3 = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(0, 2);
            Date.prototype.setFullYear.call(this, "".concat(t3).concat(e3));
          }, "year", function() {
            return _(Date.prototype.getFullYear.call(this), 2);
          }, 2], yyyy: ["[0-9]{4}", Date.prototype.setFullYear, "year", function() {
            return _(Date.prototype.getFullYear.call(this), 4);
          }, 4], h: ["[1-9]|1[0-2]", Date.prototype.setHours, "hours", Date.prototype.getHours], hh: ["0[1-9]|1[0-2]", Date.prototype.setHours, "hours", function() {
            return _(Date.prototype.getHours.call(this), 2);
          }], hx: [function(e3) {
            return "[0-9]{".concat(e3, "}");
          }, Date.prototype.setHours, "hours", function(e3) {
            return Date.prototype.getHours;
          }], H: ["1?[0-9]|2[0-3]", Date.prototype.setHours, "hours", Date.prototype.getHours], HH: ["0[0-9]|1[0-9]|2[0-3]", Date.prototype.setHours, "hours", function() {
            return _(Date.prototype.getHours.call(this), 2);
          }], Hx: [function(e3) {
            return "[0-9]{".concat(e3, "}");
          }, Date.prototype.setHours, "hours", function(e3) {
            return function() {
              return _(Date.prototype.getHours.call(this), e3);
            };
          }], M: ["[1-5]?[0-9]", Date.prototype.setMinutes, "minutes", Date.prototype.getMinutes], MM: ["0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setMinutes, "minutes", function() {
            return _(Date.prototype.getMinutes.call(this), 2);
          }], s: ["[1-5]?[0-9]", Date.prototype.setSeconds, "seconds", Date.prototype.getSeconds], ss: ["0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setSeconds, "seconds", function() {
            return _(Date.prototype.getSeconds.call(this), 2);
          }], l: ["[0-9]{3}", Date.prototype.setMilliseconds, "milliseconds", function() {
            return _(Date.prototype.getMilliseconds.call(this), 3);
          }, 3], L: ["[0-9]{2}", Date.prototype.setMilliseconds, "milliseconds", function() {
            return _(Date.prototype.getMilliseconds.call(this), 2);
          }, 2], t: ["[ap]", b, "ampm", x, 1], tt: ["[ap]m", b, "ampm", x, 2], T: ["[AP]", b, "ampm", x, 1], TT: ["[AP]M", b, "ampm", x, 2], Z: [".*", void 0, "Z", function() {
            var e3 = this.toString().match(/\((.+)\)/)[1];
            e3.includes(" ") && (e3 = (e3 = e3.replace("-", " ").toUpperCase()).split(" ").map(function(e4) {
              return s(e4, 1)[0];
            }).join(""));
            return e3;
          }], o: [""], S: [""] }, k = { isoDate: "yyyy-mm-dd", isoTime: "HH:MM:ss", isoDateTime: "yyyy-mm-dd'T'HH:MM:ss", isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'" };
          function b(e3) {
            var t3 = this.getHours();
            e3.toLowerCase().includes("p") ? this.setHours(t3 + 12) : e3.toLowerCase().includes("a") && t3 >= 12 && this.setHours(t3 - 12);
          }
          function x() {
            var e3 = this.getHours();
            return (e3 = e3 || 12) >= 12 ? "PM" : "AM";
          }
          function w(e3) {
            var t3 = /\d+$/.exec(e3[0]);
            if (t3 && void 0 !== t3[0]) {
              var n3 = y[e3[0][0] + "x"].slice("");
              return n3[0] = n3[0](t3[0]), n3[3] = n3[3](t3[0]), n3;
            }
            if (y[e3[0]]) return y[e3[0]];
          }
          function P(e3) {
            if (!e3.tokenizer) {
              var t3 = [], n3 = [];
              for (var i3 in y) if (/\.*x$/.test(i3)) {
                var a2 = i3[0] + "\\d+";
                -1 === n3.indexOf(a2) && n3.push(a2);
              } else -1 === t3.indexOf(i3[0]) && t3.push(i3[0]);
              e3.tokenizer = "(" + (n3.length > 0 ? n3.join("|") + "|" : "") + t3.join("+|") + ")+?|.", e3.tokenizer = new RegExp(e3.tokenizer, "g");
            }
            return e3.tokenizer;
          }
          function S(e3, t3, n3) {
            if (!g) return true;
            if (void 0 === e3.rawday || !isFinite(e3.rawday) && new Date(e3.date.getFullYear(), isFinite(e3.rawmonth) ? e3.month : e3.date.getMonth() + 1, 0).getDate() >= e3.day || "29" == e3.day && (!isFinite(e3.rawyear) || void 0 === e3.rawyear || "" === e3.rawyear) || new Date(e3.date.getFullYear(), isFinite(e3.rawmonth) ? e3.month : e3.date.getMonth() + 1, 0).getDate() >= e3.day) return t3;
            if ("29" == e3.day) {
              var i3 = j.call(this, t3.pos, n3, this.maskset);
              if (i3.targetMatch && "yyyy" === i3.targetMatch[0] && t3.pos - i3.targetMatchIndex == 2) return t3.remove = t3.pos + 1, t3;
            } else if (2 == e3.date.getMonth() && "30" == e3.day && void 0 !== t3.c) return e3.day = "03", e3.date.setDate(3), e3.date.setMonth(1), t3.insert = [{ pos: t3.pos, c: "0" }, { pos: t3.pos + 1, c: t3.c }], t3.caret = o.seekNext.call(this, t3.pos + 1), t3;
            return false;
          }
          function O(e3, t3, n3, a2) {
            var r2, o2, l2 = "", s2 = 0, c2 = {};
            for (P(n3).lastIndex = 0; r2 = P(n3).exec(e3); ) {
              if (void 0 === t3) if (o2 = w(r2)) l2 += "(" + o2[0] + ")", n3.placeholder && "" !== n3.placeholder ? (c2[s2] = n3.placeholder[r2.index % n3.placeholder.length], c2[n3.placeholder[r2.index % n3.placeholder.length]] = r2[0].charAt(0)) : c2[s2] = r2[0].charAt(0);
              else switch (r2[0]) {
                case "[":
                  l2 += "(";
                  break;
                case "]":
                  l2 += ")?";
                  break;
                default:
                  l2 += (0, i2.default)(r2[0]), c2[s2] = r2[0].charAt(0);
              }
              else if (o2 = w(r2)) if (true !== a2 && o2[3]) l2 += o2[3].call(t3.date);
              else o2[2] ? l2 += t3["raw" + o2[2]] : l2 += r2[0];
              else l2 += r2[0];
              s2++;
            }
            return void 0 === t3 && (n3.placeholder = c2), l2;
          }
          function _(e3, t3, n3) {
            for (e3 = String(e3), t3 = t3 || 2; e3.length < t3; ) e3 = n3 ? e3 + "0" : "0" + e3;
            return e3;
          }
          function M(e3, t3, n3) {
            return "string" == typeof e3 ? new h(e3, t3, n3, this) : e3 && "object" === u(e3) && Object.prototype.hasOwnProperty.call(e3, "date") ? e3 : void 0;
          }
          function E(e3, t3) {
            return O(t3.inputFormat, { date: e3 }, t3);
          }
          function j(e3, t3, n3) {
            var i3, a2, r2 = this, o2 = n3 && n3.tests[e3] ? t3.placeholder[n3.tests[e3][0].match.placeholder] || n3.tests[e3][0].match.placeholder : "", s2 = 0, c2 = 0;
            for (P(t3).lastIndex = 0; a2 = P(t3).exec(t3.inputFormat); ) {
              var u2 = /\d+$/.exec(a2[0]);
              if (u2) c2 = parseInt(u2[0]);
              else {
                for (var f2 = a2[0][0], p2 = s2; r2 && (t3.placeholder[l.getTest.call(r2, p2).match.placeholder] || l.getTest.call(r2, p2).match.placeholder) === f2; ) p2++;
                0 === (c2 = p2 - s2) && (c2 = a2[0].length);
              }
              if (s2 += c2, -1 != a2[0].indexOf(o2) || s2 >= e3 + 1) {
                i3 = a2, a2 = P(t3).exec(t3.inputFormat);
                break;
              }
            }
            return { targetMatchIndex: s2 - c2, nextMatch: a2, targetMatch: i3 };
          }
          a.default.extendAliases({ datetime: { mask: function(e3) {
            return e3.numericInput = false, y.S = m.ordinalSuffix.join("|"), e3.inputFormat = k[e3.inputFormat] || e3.inputFormat, e3.displayFormat = k[e3.displayFormat] || e3.displayFormat || e3.inputFormat, e3.outputFormat = k[e3.outputFormat] || e3.outputFormat || e3.inputFormat, e3.regex = O(e3.inputFormat, void 0, e3), e3.min = M(e3.min, e3.inputFormat, e3), e3.max = M(e3.max, e3.inputFormat, e3), null;
          }, placeholder: "", inputFormat: "isoDateTime", displayFormat: null, outputFormat: null, min: null, max: null, skipOptionalPartCharacter: "", preValidation: function(e3, t3, n3, i3, a2, r2, o2, l2) {
            if (l2) return true;
            if (isNaN(n3) && e3[t3] !== n3) {
              var s2 = j.call(this, t3, a2, r2);
              if (s2.nextMatch && s2.nextMatch[0] === n3 && s2.targetMatch[0].length > 1) {
                var c2 = w(s2.targetMatch)[0];
                if (new RegExp(c2).test("0" + e3[t3 - 1])) return e3[t3] = e3[t3 - 1], e3[t3 - 1] = "0", { fuzzy: true, buffer: e3, refreshFromBuffer: { start: t3 - 1, end: t3 + 1 }, pos: t3 + 1 };
              }
            }
            return true;
          }, postValidation: function(e3, t3, n3, i3, a2, r2, o2, s2) {
            var c2, u2, f2 = this;
            if (o2) return true;
            if (false === i3 && (((c2 = j.call(f2, t3 + 1, a2, r2)).targetMatch && c2.targetMatchIndex === t3 && c2.targetMatch[0].length > 1 && void 0 !== y[c2.targetMatch[0]] || (c2 = j.call(f2, t3 + 2, a2, r2)).targetMatch && c2.targetMatchIndex === t3 + 1 && c2.targetMatch[0].length > 1 && void 0 !== y[c2.targetMatch[0]]) && (u2 = w(c2.targetMatch)[0]), void 0 !== u2 && (void 0 !== r2.validPositions[t3 + 1] && new RegExp(u2).test(n3 + "0") ? (e3[t3] = n3, e3[t3 + 1] = "0", i3 = { pos: t3 + 2, caret: t3 }) : new RegExp(u2).test("0" + n3) && (e3[t3] = "0", e3[t3 + 1] = n3, i3 = { pos: t3 + 2 })), false === i3)) return i3;
            if (i3.fuzzy && (e3 = i3.buffer, t3 = i3.pos), (c2 = j.call(f2, t3, a2, r2)).targetMatch && c2.targetMatch[0] && void 0 !== y[c2.targetMatch[0]]) {
              var p2 = w(c2.targetMatch);
              u2 = p2[0];
              var d2 = e3.slice(c2.targetMatchIndex, c2.targetMatchIndex + c2.targetMatch[0].length);
              if (false === new RegExp(u2).test(d2.join("")) && 2 === c2.targetMatch[0].length && r2.validPositions[c2.targetMatchIndex] && r2.validPositions[c2.targetMatchIndex + 1] && (r2.validPositions[c2.targetMatchIndex + 1].input = "0"), "year" == p2[2]) for (var h2 = l.getMaskTemplate.call(f2, false, 1, void 0, true), m2 = t3 + 1; m2 < e3.length; m2++) e3[m2] = h2[m2], r2.validPositions.splice(t3 + 1, 1);
            }
            var g2 = i3, k2 = M.call(f2, e3.join(""), a2.inputFormat, a2);
            return g2 && !isNaN(k2.date.getTime()) && (a2.prefillYear && (g2 = function(e4, t4, n4) {
              if (e4.year !== e4.rawyear) {
                var i4 = v.toString(), a3 = e4.rawyear.replace(/[^0-9]/g, ""), r3 = i4.slice(0, a3.length), o3 = i4.slice(a3.length);
                if (2 === a3.length && a3 === r3) {
                  var l2 = new Date(v, e4.month - 1, e4.day);
                  e4.day == l2.getDate() && (!n4.max || n4.max.date.getTime() >= l2.getTime()) && (e4.date.setFullYear(v), e4.year = i4, t4.insert = [{ pos: t4.pos + 1, c: o3[0] }, { pos: t4.pos + 2, c: o3[1] }]);
                }
              }
              return t4;
            }(k2, g2, a2)), g2 = function(e4, t4, n4, i4, a3) {
              if (!t4) return t4;
              if (t4 && n4.min && !isNaN(n4.min.date.getTime())) {
                var r3;
                for (e4.reset(), P(n4).lastIndex = 0; r3 = P(n4).exec(n4.inputFormat); ) {
                  var o3;
                  if ((o3 = w(r3)) && o3[3]) {
                    for (var l2 = o3[1], s3 = e4[o3[2]], c3 = n4.min[o3[2]], u3 = n4.max ? n4.max[o3[2]] : c3 + 1, f3 = [], p3 = false, d3 = 0; d3 < c3.length; d3++) void 0 !== i4.validPositions[d3 + r3.index] || p3 ? (f3[d3] = s3[d3], p3 = p3 || s3[d3] > c3[d3]) : (d3 + r3.index == 0 && s3[d3] < c3[d3] ? (f3[d3] = s3[d3], p3 = true) : f3[d3] = c3[d3], "year" === o3[2] && s3.length - 1 == d3 && c3 != u3 && (f3 = (parseInt(f3.join("")) + 1).toString().split("")), "ampm" === o3[2] && c3 != u3 && n4.min.date.getTime() > e4.date.getTime() && (f3[d3] = u3[d3]));
                    l2.call(e4._date, f3.join(""));
                  }
                }
                t4 = n4.min.date.getTime() <= e4.date.getTime(), e4.reInit();
              }
              return t4 && n4.max && (isNaN(n4.max.date.getTime()) || (t4 = n4.max.date.getTime() >= e4.date.getTime())), t4;
            }(k2, g2 = S.call(f2, k2, g2, a2), a2, r2)), void 0 !== t3 && g2 && i3.pos !== t3 ? { buffer: O(a2.inputFormat, k2, a2).split(""), refreshFromBuffer: { start: t3, end: i3.pos }, pos: i3.caret || i3.pos } : g2;
          }, onKeyDown: function(e3, t3, n3, i3) {
            e3.ctrlKey && e3.key === r.keys.ArrowRight && (this.inputmask._valueSet(E(/* @__PURE__ */ new Date(), i3)), d(this).trigger("setvalue"));
          }, onUnMask: function(e3, t3, n3) {
            return t3 ? O(n3.outputFormat, M.call(this, e3, n3.inputFormat, n3), n3, true) : t3;
          }, casing: function(e3, t3, n3, i3) {
            if (0 == t3.nativeDef.indexOf("[ap]")) return e3.toLowerCase();
            if (0 == t3.nativeDef.indexOf("[AP]")) return e3.toUpperCase();
            var a2 = l.getTest.call(this, [n3 - 1]);
            return 0 == a2.match.def.indexOf("[AP]") || 0 === n3 || a2 && a2.input === String.fromCharCode(r.keyCode.Space) || a2 && a2.match.def === String.fromCharCode(r.keyCode.Space) ? e3.toUpperCase() : e3.toLowerCase();
          }, onBeforeMask: function(e3, t3) {
            return "[object Date]" === Object.prototype.toString.call(e3) && (e3 = E(e3, t3)), e3;
          }, insertMode: false, insertModeVisual: false, shiftPositions: false, keepStatic: false, inputmode: "numeric", prefillYear: true } });
        }, 1313: function(e2, t2, n2) {
          var i2, a = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 };
          a.default.dependencyLib.extend(true, a.default.prototype.i18n, { dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], ordinalSuffix: ["st", "nd", "rd", "th"] });
        }, 3851: function(e2, t2, n2) {
          var i2, a = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 }, r = n2(8711), o = n2(4713);
          function l(e3) {
            return function(e4) {
              if (Array.isArray(e4)) return s(e4);
            }(e3) || function(e4) {
              if ("undefined" != typeof Symbol && null != e4[Symbol.iterator] || null != e4["@@iterator"]) return Array.from(e4);
            }(e3) || function(e4, t3) {
              if (!e4) return;
              if ("string" == typeof e4) return s(e4, t3);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return s(e4, t3);
            }(e3) || function() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }();
          }
          function s(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          a.default.extendDefinitions({ A: { validator: "[A-Za-zА-яЁёÀ-ÿµ]", casing: "upper" }, "&": { validator: "[0-9A-Za-zА-яЁёÀ-ÿµ]", casing: "upper" }, "#": { validator: "[0-9A-Fa-f]", casing: "upper" } });
          var c = /25[0-5]|2[0-4][0-9]|[01][0-9][0-9]/;
          function u(e3, t3, n3, i3, a2) {
            if (n3 - 1 > -1 && "." !== t3.buffer[n3 - 1] ? (e3 = t3.buffer[n3 - 1] + e3, e3 = n3 - 2 > -1 && "." !== t3.buffer[n3 - 2] ? t3.buffer[n3 - 2] + e3 : "0" + e3) : e3 = "00" + e3, a2.greedy && parseInt(e3) > 255 && c.test("00" + e3.charAt(2))) {
              var r2 = [].concat(l(t3.buffer.slice(0, n3)), [".", e3.charAt(2)]);
              if (r2.join("").match(/\./g).length < 4) return { refreshFromBuffer: true, buffer: r2, caret: n3 + 2 };
            }
            return c.test(e3);
          }
          a.default.extendAliases({ cssunit: { regex: "[+-]?[0-9]+\\.?([0-9]+)?(px|em|rem|ex|%|in|cm|mm|pt|pc)" }, url: { regex: "(https?|ftp)://.*", autoUnmask: false, keepStatic: false, tabThrough: true }, ip: { mask: "i{1,3}.j{1,3}.k{1,3}.l{1,3}", definitions: { i: { validator: u }, j: { validator: u }, k: { validator: u }, l: { validator: u } }, onUnMask: function(e3, t3, n3) {
            return e3;
          }, inputmode: "decimal", substitutes: { ",": "." } }, email: { mask: function(e3) {
            var t3 = e3.separator, n3 = e3.quantifier, i3 = "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}.-{1,63}[.-{1,63}][.-{1,63}]", a2 = i3;
            if (t3) for (var r2 = 0; r2 < n3; r2++) a2 += "[".concat(t3).concat(i3, "]");
            return a2;
          }, greedy: false, casing: "lower", separator: null, quantifier: 5, skipOptionalPartCharacter: "", onBeforePaste: function(e3, t3) {
            return (e3 = e3.toLowerCase()).replace("mailto:", "");
          }, definitions: { "*": { validator: "[0-9１-９A-Za-zА-яЁёÀ-ÿµ!#$%&'*+/=?^_`{|}~-]" }, "-": { validator: "[0-9A-Za-z-]" } }, onUnMask: function(e3, t3, n3) {
            return e3;
          }, inputmode: "email" }, mac: { mask: "##:##:##:##:##:##" }, vin: { mask: "V{13}9{4}", definitions: { V: { validator: "[A-HJ-NPR-Za-hj-npr-z\\d]", casing: "upper" } }, clearIncomplete: true, autoUnmask: true }, ssn: { mask: "999-99-9999", postValidation: function(e3, t3, n3, i3, a2, l2, s2) {
            var c2 = o.getMaskTemplate.call(this, true, r.getLastValidPosition.call(this), true, true);
            return /^(?!219-09-9999|078-05-1120)(?!666|000|9.{2}).{3}-(?!00).{2}-(?!0{4}).{4}$/.test(c2.join(""));
          } } });
        }, 207: function(e2, t2, n2) {
          var i2 = l(n2(7184)), a = l(n2(2394)), r = n2(2839), o = n2(8711);
          function l(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var s = a.default.dependencyLib;
          function c(e3, t3) {
            for (var n3 = "", i3 = 0; i3 < e3.length; i3++) a.default.prototype.definitions[e3.charAt(i3)] || t3.definitions[e3.charAt(i3)] || t3.optionalmarker[0] === e3.charAt(i3) || t3.optionalmarker[1] === e3.charAt(i3) || t3.quantifiermarker[0] === e3.charAt(i3) || t3.quantifiermarker[1] === e3.charAt(i3) || t3.groupmarker[0] === e3.charAt(i3) || t3.groupmarker[1] === e3.charAt(i3) || t3.alternatormarker === e3.charAt(i3) ? n3 += "\\" + e3.charAt(i3) : n3 += e3.charAt(i3);
            return n3;
          }
          function u(e3, t3, n3, i3) {
            if (e3.length > 0 && t3 > 0 && (!n3.digitsOptional || i3)) {
              var a2 = e3.indexOf(n3.radixPoint), r2 = false;
              n3.negationSymbol.back === e3[e3.length - 1] && (r2 = true, e3.length--), -1 === a2 && (e3.push(n3.radixPoint), a2 = e3.length - 1);
              for (var o2 = 1; o2 <= t3; o2++) isFinite(e3[a2 + o2]) || (e3[a2 + o2] = "0");
            }
            return r2 && e3.push(n3.negationSymbol.back), e3;
          }
          function f(e3, t3) {
            var n3 = 0;
            for (var i3 in "+" === e3 && (n3 = o.seekNext.call(this, t3.validPositions.length - 1)), t3.tests) if ((i3 = parseInt(i3)) >= n3) {
              for (var a2 = 0, r2 = t3.tests[i3].length; a2 < r2; a2++) if ((void 0 === t3.validPositions[i3] || "-" === e3) && t3.tests[i3][a2].match.def === e3) return i3 + (void 0 !== t3.validPositions[i3] && "-" !== e3 ? 1 : 0);
            }
            return n3;
          }
          function p(e3, t3) {
            for (var n3 = -1, i3 = 0, a2 = t3.validPositions.length; i3 < a2; i3++) {
              var r2 = t3.validPositions[i3];
              if (r2 && r2.match.def === e3) {
                n3 = i3;
                break;
              }
            }
            return n3;
          }
          function d(e3, t3, n3, i3, a2) {
            var r2 = t3.buffer ? t3.buffer.indexOf(a2.radixPoint) : -1, o2 = (-1 !== r2 || i3 && a2.jitMasking) && new RegExp(a2.definitions[9].validator).test(e3);
            return !i3 && a2._radixDance && -1 !== r2 && o2 && null == t3.validPositions[r2] ? { insert: { pos: r2 === n3 ? r2 + 1 : r2, c: a2.radixPoint }, pos: n3 } : o2;
          }
          a.default.extendAliases({ numeric: { mask: function(e3) {
            e3.repeat = 0, e3.groupSeparator === e3.radixPoint && e3.digits && "0" !== e3.digits && ("." === e3.radixPoint ? e3.groupSeparator = "," : "," === e3.radixPoint ? e3.groupSeparator = "." : e3.groupSeparator = ""), " " === e3.groupSeparator && (e3.skipOptionalPartCharacter = void 0), e3.placeholder.length > 1 && (e3.placeholder = e3.placeholder.charAt(0)), "radixFocus" === e3.positionCaretOnClick && "" === e3.placeholder && (e3.positionCaretOnClick = "lvp");
            var t3 = "0", n3 = e3.radixPoint;
            true === e3.numericInput && void 0 === e3.__financeInput ? (t3 = "1", e3.positionCaretOnClick = "radixFocus" === e3.positionCaretOnClick ? "lvp" : e3.positionCaretOnClick, e3.digitsOptional = false, isNaN(e3.digits) && (e3.digits = 2), e3._radixDance = false, n3 = "," === e3.radixPoint ? "?" : "!", "" !== e3.radixPoint && void 0 === e3.definitions[n3] && (e3.definitions[n3] = {}, e3.definitions[n3].validator = "[" + e3.radixPoint + "]", e3.definitions[n3].placeholder = e3.radixPoint, e3.definitions[n3].static = true, e3.definitions[n3].generated = true)) : (e3.__financeInput = false, e3.numericInput = true);
            var a2, r2 = "[+]";
            if (r2 += c(e3.prefix, e3), "" !== e3.groupSeparator ? (void 0 === e3.definitions[e3.groupSeparator] && (e3.definitions[e3.groupSeparator] = {}, e3.definitions[e3.groupSeparator].validator = "[" + e3.groupSeparator + "]", e3.definitions[e3.groupSeparator].placeholder = e3.groupSeparator, e3.definitions[e3.groupSeparator].static = true, e3.definitions[e3.groupSeparator].generated = true), r2 += e3._mask(e3)) : r2 += "9{+}", void 0 !== e3.digits && 0 !== e3.digits) {
              var o2 = e3.digits.toString().split(",");
              isFinite(o2[0]) && o2[1] && isFinite(o2[1]) ? r2 += n3 + t3 + "{" + e3.digits + "}" : (isNaN(e3.digits) || parseInt(e3.digits) > 0) && (e3.digitsOptional || e3.jitMasking ? (a2 = r2 + n3 + t3 + "{0," + e3.digits + "}", e3.keepStatic = true) : r2 += n3 + t3 + "{" + e3.digits + "}");
            } else e3.inputmode = "numeric";
            return r2 += c(e3.suffix, e3), r2 += "[-]", a2 && (r2 = [a2 + c(e3.suffix, e3) + "[-]", r2]), e3.greedy = false, function(e4) {
              void 0 === e4.parseMinMaxOptions && (null !== e4.min && (e4.min = e4.min.toString().replace(new RegExp((0, i2.default)(e4.groupSeparator), "g"), ""), "," === e4.radixPoint && (e4.min = e4.min.replace(e4.radixPoint, ".")), e4.min = isFinite(e4.min) ? parseFloat(e4.min) : NaN, isNaN(e4.min) && (e4.min = Number.MIN_VALUE)), null !== e4.max && (e4.max = e4.max.toString().replace(new RegExp((0, i2.default)(e4.groupSeparator), "g"), ""), "," === e4.radixPoint && (e4.max = e4.max.replace(e4.radixPoint, ".")), e4.max = isFinite(e4.max) ? parseFloat(e4.max) : NaN, isNaN(e4.max) && (e4.max = Number.MAX_VALUE)), e4.parseMinMaxOptions = "done");
            }(e3), "" !== e3.radixPoint && e3.substituteRadixPoint && (e3.substitutes["." == e3.radixPoint ? "," : "."] = e3.radixPoint), r2;
          }, _mask: function(e3) {
            return "(" + e3.groupSeparator + "999){+|1}";
          }, digits: "*", digitsOptional: true, enforceDigitsOnBlur: false, radixPoint: ".", positionCaretOnClick: "radixFocus", _radixDance: true, groupSeparator: "", allowMinus: true, negationSymbol: { front: "-", back: "" }, prefix: "", suffix: "", min: null, max: null, SetMaxOnOverflow: false, step: 1, inputType: "text", unmaskAsNumber: false, roundingFN: Math.round, inputmode: "decimal", shortcuts: { k: "1000", m: "1000000" }, placeholder: "0", greedy: false, rightAlign: true, insertMode: true, autoUnmask: false, skipOptionalPartCharacter: "", usePrototypeDefinitions: false, stripLeadingZeroes: true, substituteRadixPoint: true, definitions: { 0: { validator: d }, 1: { validator: d, definitionSymbol: "9" }, 9: { validator: "[0-9０-９٠-٩۰-۹]", definitionSymbol: "*" }, "+": { validator: function(e3, t3, n3, i3, a2) {
            return a2.allowMinus && ("-" === e3 || e3 === a2.negationSymbol.front);
          } }, "-": { validator: function(e3, t3, n3, i3, a2) {
            return a2.allowMinus && e3 === a2.negationSymbol.back;
          } } }, preValidation: function(e3, t3, n3, i3, a2, r2, o2, l2) {
            var s2 = this;
            if (false !== a2.__financeInput && n3 === a2.radixPoint) return false;
            var c2 = e3.indexOf(a2.radixPoint), u2 = t3;
            if (t3 = function(e4, t4, n4, i4, a3) {
              return a3._radixDance && a3.numericInput && t4 !== a3.negationSymbol.back && e4 <= n4 && (n4 > 0 || t4 == a3.radixPoint) && (void 0 === i4.validPositions[e4 - 1] || i4.validPositions[e4 - 1].input !== a3.negationSymbol.back) && (e4 -= 1), e4;
            }(t3, n3, c2, r2, a2), "-" === n3 || n3 === a2.negationSymbol.front) {
              if (true !== a2.allowMinus) return false;
              var d2 = false, h = p("+", r2), v = p("-", r2);
              return -1 !== h && (d2 = [h], -1 !== v && d2.push(v)), false !== d2 ? { remove: d2, caret: u2 - a2.negationSymbol.back.length } : { insert: [{ pos: f.call(s2, "+", r2), c: a2.negationSymbol.front, fromIsValid: true }, { pos: f.call(s2, "-", r2), c: a2.negationSymbol.back, fromIsValid: void 0 }], caret: u2 + a2.negationSymbol.back.length };
            }
            if (n3 === a2.groupSeparator) return { caret: u2 };
            if (l2) return true;
            if (-1 !== c2 && true === a2._radixDance && false === i3 && n3 === a2.radixPoint && void 0 !== a2.digits && (isNaN(a2.digits) || parseInt(a2.digits) > 0) && c2 !== t3) {
              var m = f.call(s2, a2.radixPoint, r2);
              return r2.validPositions[m] && (r2.validPositions[m].generatedInput = r2.validPositions[m].generated || false), { caret: a2._radixDance && t3 === c2 - 1 ? c2 + 1 : c2 };
            }
            if (false === a2.__financeInput) {
              if (i3) {
                if (a2.digitsOptional) return { rewritePosition: o2.end };
                if (!a2.digitsOptional) {
                  if (o2.begin > c2 && o2.end <= c2) return n3 === a2.radixPoint ? { insert: { pos: c2 + 1, c: "0", fromIsValid: true }, rewritePosition: c2 } : { rewritePosition: c2 + 1 };
                  if (o2.begin < c2) return { rewritePosition: o2.begin - 1 };
                }
              } else if (!a2.showMaskOnHover && !a2.showMaskOnFocus && !a2.digitsOptional && a2.digits > 0 && "" === this.__valueGet.call(this.el)) return { rewritePosition: c2 };
            }
            return { rewritePosition: t3 };
          }, postValidation: function(e3, t3, n3, i3, a2, r2, o2) {
            if (false === i3) return i3;
            if (o2) return true;
            if (null !== a2.min || null !== a2.max) {
              var l2 = a2.onUnMask(e3.slice().reverse().join(""), void 0, s.extend({}, a2, { unmaskAsNumber: true }));
              if (null !== a2.min && l2 < a2.min && (l2.toString().length > a2.min.toString().length || l2 < 0)) return false;
              if (null !== a2.max && l2 > a2.max) return !!a2.SetMaxOnOverflow && { refreshFromBuffer: true, buffer: u(a2.max.toString().replace(".", a2.radixPoint).split(""), a2.digits, a2).reverse() };
            }
            return i3;
          }, onUnMask: function(e3, t3, n3) {
            if ("" === t3 && true === n3.nullable) return t3;
            var a2 = e3.replace(n3.prefix, "");
            return a2 = (a2 = a2.replace(n3.suffix, "")).replace(new RegExp((0, i2.default)(n3.groupSeparator), "g"), ""), "" !== n3.placeholder.charAt(0) && (a2 = a2.replace(new RegExp(n3.placeholder.charAt(0), "g"), "0")), n3.unmaskAsNumber ? ("" !== n3.radixPoint && -1 !== a2.indexOf(n3.radixPoint) && (a2 = a2.replace(i2.default.call(this, n3.radixPoint), ".")), a2 = (a2 = a2.replace(new RegExp("^" + (0, i2.default)(n3.negationSymbol.front)), "-")).replace(new RegExp((0, i2.default)(n3.negationSymbol.back) + "$"), ""), Number(a2)) : a2;
          }, isComplete: function(e3, t3) {
            var n3 = (t3.numericInput ? e3.slice().reverse() : e3).join("");
            return n3 = (n3 = (n3 = (n3 = (n3 = n3.replace(new RegExp("^" + (0, i2.default)(t3.negationSymbol.front)), "-")).replace(new RegExp((0, i2.default)(t3.negationSymbol.back) + "$"), "")).replace(t3.prefix, "")).replace(t3.suffix, "")).replace(new RegExp((0, i2.default)(t3.groupSeparator) + "([0-9]{3})", "g"), "$1"), "," === t3.radixPoint && (n3 = n3.replace((0, i2.default)(t3.radixPoint), ".")), isFinite(n3);
          }, onBeforeMask: function(e3, t3) {
            var n3;
            e3 = null !== (n3 = e3) && void 0 !== n3 ? n3 : "";
            var a2 = t3.radixPoint || ",";
            isFinite(t3.digits) && (t3.digits = parseInt(t3.digits)), "number" != typeof e3 && "number" !== t3.inputType || "" === a2 || (e3 = e3.toString().replace(".", a2));
            var r2 = "-" === e3.charAt(0) || e3.charAt(0) === t3.negationSymbol.front, o2 = e3.split(a2), l2 = o2[0].replace(/[^\-0-9]/g, ""), s2 = o2.length > 1 ? o2[1].replace(/[^0-9]/g, "") : "", c2 = o2.length > 1;
            e3 = l2 + ("" !== s2 ? a2 + s2 : s2);
            var f2 = 0;
            if ("" !== a2 && (f2 = t3.digitsOptional ? t3.digits < s2.length ? t3.digits : s2.length : t3.digits, "" !== s2 || !t3.digitsOptional)) {
              var p2 = Math.pow(10, f2 || 1);
              e3 = e3.replace((0, i2.default)(a2), "."), isNaN(parseFloat(e3)) || (e3 = (t3.roundingFN(parseFloat(e3) * p2) / p2).toFixed(f2)), e3 = e3.toString().replace(".", a2);
            }
            if (0 === t3.digits && -1 !== e3.indexOf(a2) && (e3 = e3.substring(0, e3.indexOf(a2))), null !== t3.min || null !== t3.max) {
              var d2 = e3.toString().replace(a2, ".");
              null !== t3.min && d2 < t3.min ? e3 = t3.min.toString().replace(".", a2) : null !== t3.max && d2 > t3.max && (e3 = t3.max.toString().replace(".", a2));
            }
            return r2 && "-" !== e3.charAt(0) && (e3 = "-" + e3), u(e3.toString().split(""), f2, t3, c2).join("");
          }, onBeforeWrite: function(e3, t3, n3, a2) {
            function r2(e4, t4) {
              if (false !== a2.__financeInput || t4) {
                var n4 = e4.indexOf(a2.radixPoint);
                -1 !== n4 && e4.splice(n4, 1);
              }
              if ("" !== a2.groupSeparator) for (; -1 !== (n4 = e4.indexOf(a2.groupSeparator)); ) e4.splice(n4, 1);
              return e4;
            }
            var o2, l2;
            if (a2.stripLeadingZeroes && (l2 = function(e4, t4) {
              var n4 = new RegExp("(^" + ("" !== t4.negationSymbol.front ? (0, i2.default)(t4.negationSymbol.front) + "?" : "") + (0, i2.default)(t4.prefix) + ")(.*)(" + (0, i2.default)(t4.suffix) + ("" != t4.negationSymbol.back ? (0, i2.default)(t4.negationSymbol.back) + "?" : "") + "$)").exec(e4.slice().reverse().join("")), a3 = n4 ? n4[2] : "", r3 = false;
              return a3 && (a3 = a3.split(t4.radixPoint.charAt(0))[0], r3 = new RegExp("^[0" + t4.groupSeparator + "]*").exec(a3)), !(!r3 || !(r3[0].length > 1 || r3[0].length > 0 && r3[0].length < a3.length)) && r3;
            }(t3, a2))) for (var c2 = t3.join("").lastIndexOf(l2[0].split("").reverse().join("")) - (l2[0] == l2.input ? 0 : 1), f2 = l2[0] == l2.input ? 1 : 0, p2 = l2[0].length - f2; p2 > 0; p2--) this.maskset.validPositions.splice(c2 + p2, 1), delete t3[c2 + p2];
            if (e3) switch (e3.type) {
              case "blur":
              case "checkval":
                if (null !== a2.min) {
                  var d2 = a2.onUnMask(t3.slice().reverse().join(""), void 0, s.extend({}, a2, { unmaskAsNumber: true }));
                  if (null !== a2.min && d2 < a2.min) return { refreshFromBuffer: true, buffer: u(a2.min.toString().replace(".", a2.radixPoint).split(""), a2.digits, a2).reverse() };
                }
                if (t3[t3.length - 1] === a2.negationSymbol.front) {
                  var h = new RegExp("(^" + ("" != a2.negationSymbol.front ? (0, i2.default)(a2.negationSymbol.front) + "?" : "") + (0, i2.default)(a2.prefix) + ")(.*)(" + (0, i2.default)(a2.suffix) + ("" != a2.negationSymbol.back ? (0, i2.default)(a2.negationSymbol.back) + "?" : "") + "$)").exec(r2(t3.slice(), true).reverse().join(""));
                  0 == (h ? h[2] : "") && (o2 = { refreshFromBuffer: true, buffer: [0] });
                } else if ("" !== a2.radixPoint) {
                  t3.indexOf(a2.radixPoint) === a2.suffix.length && (o2 && o2.buffer ? o2.buffer.splice(0, 1 + a2.suffix.length) : (t3.splice(0, 1 + a2.suffix.length), o2 = { refreshFromBuffer: true, buffer: r2(t3) }));
                }
                if (a2.enforceDigitsOnBlur) {
                  var v = (o2 = o2 || {}) && o2.buffer || t3.slice().reverse();
                  o2.refreshFromBuffer = true, o2.buffer = u(v, a2.digits, a2, true).reverse();
                }
            }
            return o2;
          }, onKeyDown: function(e3, t3, n3, i3) {
            var a2, o2 = s(this);
            if (3 != e3.location) {
              var l2, c2 = e3.key;
              if ((l2 = i3.shortcuts && i3.shortcuts[c2]) && l2.length > 1) return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) * parseInt(l2)), o2.trigger("setvalue"), false;
            }
            if (e3.ctrlKey) switch (e3.key) {
              case r.keys.ArrowUp:
                return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) + parseInt(i3.step)), o2.trigger("setvalue"), false;
              case r.keys.ArrowDown:
                return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) - parseInt(i3.step)), o2.trigger("setvalue"), false;
            }
            if (!e3.shiftKey && (e3.key === r.keys.Delete || e3.key === r.keys.Backspace || e3.key === r.keys.BACKSPACE_SAFARI) && n3.begin !== t3.length) {
              if (t3[e3.key === r.keys.Delete ? n3.begin - 1 : n3.end] === i3.negationSymbol.front) return a2 = t3.slice().reverse(), "" !== i3.negationSymbol.front && a2.shift(), "" !== i3.negationSymbol.back && a2.pop(), o2.trigger("setvalue", [a2.join(""), n3.begin]), false;
              if (true === i3._radixDance) {
                var f2, p2 = t3.indexOf(i3.radixPoint);
                if (i3.digitsOptional) {
                  if (0 === p2) return (a2 = t3.slice().reverse()).pop(), o2.trigger("setvalue", [a2.join(""), n3.begin >= a2.length ? a2.length : n3.begin]), false;
                } else if (-1 !== p2 && (n3.begin < p2 || n3.end < p2 || e3.key === r.keys.Delete && (n3.begin === p2 || n3.begin - 1 === p2))) return n3.begin === n3.end && (e3.key === r.keys.Backspace || e3.key === r.keys.BACKSPACE_SAFARI ? n3.begin++ : e3.key === r.keys.Delete && n3.begin - 1 === p2 && (f2 = s.extend({}, n3), n3.begin--, n3.end--)), (a2 = t3.slice().reverse()).splice(a2.length - n3.begin, n3.begin - n3.end + 1), a2 = u(a2, i3.digits, i3).join(""), f2 && (n3 = f2), o2.trigger("setvalue", [a2, n3.begin >= a2.length ? p2 + 1 : n3.begin]), false;
              }
            }
          } }, currency: { prefix: "", groupSeparator: ",", alias: "numeric", digits: 2, digitsOptional: false }, decimal: { alias: "numeric" }, integer: { alias: "numeric", inputmode: "numeric", digits: 0 }, percentage: { alias: "numeric", min: 0, max: 100, suffix: " %", digits: 0, allowMinus: false }, indianns: { alias: "numeric", _mask: function(e3) {
            return "(" + e3.groupSeparator + "99){*|1}(" + e3.groupSeparator + "999){1|1}";
          }, groupSeparator: ",", radixPoint: ".", placeholder: "0", digits: 2, digitsOptional: false } });
        }, 9380: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          var n2 = !("undefined" == typeof window || !window.document || !window.document.createElement);
          t2.default = n2 ? window : {};
        }, 7760: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.HandleNativePlaceholder = function(e3, t3) {
            var n3 = e3 ? e3.inputmask : this;
            if (i2.ie) {
              if (e3.inputmask._valueGet() !== t3 && (e3.placeholder !== t3 || "" === e3.placeholder)) {
                var a2 = o.getBuffer.call(n3).slice(), r2 = e3.inputmask._valueGet();
                if (r2 !== t3) {
                  var l2 = o.getLastValidPosition.call(n3);
                  -1 === l2 && r2 === o.getBufferTemplate.call(n3).join("") ? a2 = [] : -1 !== l2 && u.call(n3, a2), p(e3, a2);
                }
              }
            } else e3.placeholder !== t3 && (e3.placeholder = t3, "" === e3.placeholder && e3.removeAttribute("placeholder"));
          }, t2.applyInputValue = c, t2.checkVal = f, t2.clearOptionalTail = u, t2.unmaskedvalue = function(e3) {
            var t3 = e3 ? e3.inputmask : this, n3 = t3.opts, i3 = t3.maskset;
            if (e3) {
              if (void 0 === e3.inputmask) return e3.value;
              e3.inputmask && e3.inputmask.refreshValue && c(e3, e3.inputmask._valueGet(true));
            }
            for (var a2 = [], r2 = i3.validPositions, l2 = 0, s2 = r2.length; l2 < s2; l2++) r2[l2] && r2[l2].match && (1 != r2[l2].match.static || Array.isArray(i3.metadata) && true !== r2[l2].generatedInput) && a2.push(r2[l2].input);
            var u2 = 0 === a2.length ? "" : (t3.isRTL ? a2.reverse() : a2).join("");
            if ("function" == typeof n3.onUnMask) {
              var f2 = (t3.isRTL ? o.getBuffer.call(t3).slice().reverse() : o.getBuffer.call(t3)).join("");
              u2 = n3.onUnMask.call(t3, f2, u2, n3);
            }
            return u2;
          }, t2.writeBuffer = p;
          var i2 = n2(9845), a = n2(6030), r = n2(2839), o = n2(8711), l = n2(7215), s = n2(4713);
          function c(e3, t3, n3) {
            var i3 = e3 ? e3.inputmask : this, a2 = i3.opts;
            e3.inputmask.refreshValue = false, "function" == typeof a2.onBeforeMask && (t3 = a2.onBeforeMask.call(i3, t3, a2) || t3), f(e3, true, false, t3 = (t3 || "").toString().split(""), n3), i3.undoValue = i3._valueGet(true), (a2.clearMaskOnLostFocus || a2.clearIncomplete) && e3.inputmask._valueGet() === o.getBufferTemplate.call(i3).join("") && -1 === o.getLastValidPosition.call(i3) && e3.inputmask._valueSet("");
          }
          function u(e3) {
            e3.length = 0;
            for (var t3, n3 = s.getMaskTemplate.call(this, true, 0, true, void 0, true); void 0 !== (t3 = n3.shift()); ) e3.push(t3);
            return e3;
          }
          function f(e3, t3, n3, i3, r2) {
            var c2, u2 = e3 ? e3.inputmask : this, f2 = u2.maskset, d = u2.opts, h = u2.dependencyLib, v = i3.slice(), m = "", g = -1, y = d.skipOptionalPartCharacter;
            d.skipOptionalPartCharacter = "", o.resetMaskSet.call(u2, false), u2.clicked = 0, g = d.radixPoint ? o.determineNewCaretPosition.call(u2, { begin: 0, end: 0 }, false, false === d.__financeInput ? "radixFocus" : void 0).begin : 0, f2.p = g, u2.caretPos = { begin: g };
            var k = [], b = u2.caretPos;
            if (v.forEach(function(e4, t4) {
              if (void 0 !== e4) {
                var i4 = new h.Event("_checkval");
                i4.key = e4, m += e4;
                var r3 = o.getLastValidPosition.call(u2, void 0, true);
                !function(e5, t5) {
                  for (var n4 = s.getMaskTemplate.call(u2, true, 0).slice(e5, o.seekNext.call(u2, e5, false, false)).join("").replace(/'/g, ""), i5 = n4.indexOf(t5); i5 > 0 && " " === n4[i5 - 1]; ) i5--;
                  var a2 = 0 === i5 && !o.isMask.call(u2, e5) && (s.getTest.call(u2, e5).match.nativeDef === t5.charAt(0) || true === s.getTest.call(u2, e5).match.static && s.getTest.call(u2, e5).match.nativeDef === "'" + t5.charAt(0) || " " === s.getTest.call(u2, e5).match.nativeDef && (s.getTest.call(u2, e5 + 1).match.nativeDef === t5.charAt(0) || true === s.getTest.call(u2, e5 + 1).match.static && s.getTest.call(u2, e5 + 1).match.nativeDef === "'" + t5.charAt(0)));
                  if (!a2 && i5 > 0 && !o.isMask.call(u2, e5, false, true)) {
                    var r4 = o.seekNext.call(u2, e5);
                    u2.caretPos.begin < r4 && (u2.caretPos = { begin: r4 });
                  }
                  return a2;
                }(g, m) ? (c2 = a.EventHandlers.keypressEvent.call(u2, i4, true, false, n3, u2.caretPos.begin)) && (g = u2.caretPos.begin + 1, m = "") : c2 = a.EventHandlers.keypressEvent.call(u2, i4, true, false, n3, r3 + 1), c2 ? (void 0 !== c2.pos && f2.validPositions[c2.pos] && true === f2.validPositions[c2.pos].match.static && void 0 === f2.validPositions[c2.pos].alternation && (k.push(c2.pos), u2.isRTL || (c2.forwardPosition = c2.pos + 1)), p.call(u2, void 0, o.getBuffer.call(u2), c2.forwardPosition, i4, false), u2.caretPos = { begin: c2.forwardPosition, end: c2.forwardPosition }, b = u2.caretPos) : void 0 === f2.validPositions[t4] && v[t4] === s.getPlaceholder.call(u2, t4) && o.isMask.call(u2, t4, true) ? u2.caretPos.begin++ : u2.caretPos = b;
              }
            }), k.length > 0) {
              var x, w, P = o.seekNext.call(u2, -1, void 0, false);
              if (!l.isComplete.call(u2, o.getBuffer.call(u2)) && k.length <= P || l.isComplete.call(u2, o.getBuffer.call(u2)) && k.length > 0 && k.length !== P && 0 === k[0]) {
                for (var S = P; void 0 !== (x = k.shift()); ) if (x < S) {
                  var O = new h.Event("_checkval");
                  if ((w = f2.validPositions[x]).generatedInput = true, O.key = w.input, (c2 = a.EventHandlers.keypressEvent.call(u2, O, true, false, n3, S)) && void 0 !== c2.pos && c2.pos !== x && f2.validPositions[c2.pos] && true === f2.validPositions[c2.pos].match.static) k.push(c2.pos);
                  else if (!c2) break;
                  S++;
                }
              }
            }
            t3 && p.call(u2, e3, o.getBuffer.call(u2), c2 ? c2.forwardPosition : u2.caretPos.begin, r2 || new h.Event("checkval"), r2 && ("input" === r2.type && u2.undoValue !== o.getBuffer.call(u2).join("") || "paste" === r2.type)), d.skipOptionalPartCharacter = y;
          }
          function p(e3, t3, n3, i3, a2) {
            var s2 = e3 ? e3.inputmask : this, c2 = s2.opts, u2 = s2.dependencyLib;
            if (i3 && "function" == typeof c2.onBeforeWrite) {
              var f2 = c2.onBeforeWrite.call(s2, i3, t3, n3, c2);
              if (f2) {
                if (f2.refreshFromBuffer) {
                  var p2 = f2.refreshFromBuffer;
                  l.refreshFromBuffer.call(s2, true === p2 ? p2 : p2.start, p2.end, f2.buffer || t3), t3 = o.getBuffer.call(s2, true);
                }
                void 0 !== n3 && (n3 = void 0 !== f2.caret ? f2.caret : n3);
              }
            }
            if (void 0 !== e3 && (e3.inputmask._valueSet(t3.join("")), void 0 === n3 || void 0 !== i3 && "blur" === i3.type || o.caret.call(s2, e3, n3, void 0, void 0, void 0 !== i3 && "keydown" === i3.type && (i3.key === r.keys.Delete || i3.key === r.keys.Backspace)), void 0 === e3.inputmask.writeBufferHook || e3.inputmask.writeBufferHook(n3), true === a2)) {
              var d = u2(e3), h = e3.inputmask._valueGet();
              e3.inputmask.skipInputEvent = true, d.trigger("input"), setTimeout(function() {
                h === o.getBufferTemplate.call(s2).join("") ? d.trigger("cleared") : true === l.isComplete.call(s2, t3) && d.trigger("complete");
              }, 0);
            }
          }
        }, 2394: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          var i2 = v(n2(3976)), a = v(n2(7392)), r = v(n2(4963)), o = n2(9716), l = v(n2(9380)), s = n2(7760), c = n2(157), u = n2(2391), f = n2(8711), p = n2(7215), d = n2(4713);
          function h(e3) {
            return h = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, h(e3);
          }
          function v(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var m = l.default.document, g = "_inputmask_opts";
          function y(e3, t3, n3) {
            if (!(this instanceof y)) return new y(e3, t3, n3);
            this.dependencyLib = r.default, this.el = void 0, this.events = {}, this.maskset = void 0, true !== n3 && ("[object Object]" === Object.prototype.toString.call(e3) ? t3 = e3 : (t3 = t3 || {}, e3 && (t3.alias = e3)), this.opts = r.default.extend(true, {}, this.defaults, t3), this.noMasksCache = t3 && void 0 !== t3.definitions, this.userOptions = t3 || {}, k(this.opts.alias, t3, this.opts)), this.refreshValue = false, this.undoValue = void 0, this.$el = void 0, this.skipInputEvent = false, this.validationEvent = false, this.ignorable = false, this.maxLength, this.mouseEnter = false, this.clicked = 0, this.originalPlaceholder = void 0, this.isComposing = false, this.hasAlternator = false;
          }
          function k(e3, t3, n3) {
            var i3 = y.prototype.aliases[e3];
            return i3 ? (i3.alias && k(i3.alias, void 0, n3), r.default.extend(true, n3, i3), r.default.extend(true, n3, t3), true) : (null === n3.mask && (n3.mask = e3), false);
          }
          y.prototype = { dataAttribute: "data-inputmask", defaults: i2.default, definitions: a.default, aliases: {}, masksCache: {}, i18n: {}, get isRTL() {
            return this.opts.isRTL || this.opts.numericInput;
          }, mask: function(e3) {
            var t3 = this;
            return "string" == typeof e3 && (e3 = m.getElementById(e3) || m.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : Array.isArray(e3) ? e3 : [].slice.call(e3)).forEach(function(e4, n3) {
              var i3 = r.default.extend(true, {}, t3.opts);
              if (function(e5, t4, n4, i4) {
                function a3(t5, a4) {
                  var r2 = "" === i4 ? t5 : i4 + "-" + t5;
                  null !== (a4 = void 0 !== a4 ? a4 : e5.getAttribute(r2)) && ("string" == typeof a4 && (0 === t5.indexOf("on") ? a4 = l.default[a4] : "false" === a4 ? a4 = false : "true" === a4 && (a4 = true)), n4[t5] = a4);
                }
                if (true === t4.importDataAttributes) {
                  var o2, s2, c2, u2, f2 = e5.getAttribute(i4);
                  if (f2 && "" !== f2 && (f2 = f2.replace(/'/g, '"'), s2 = JSON.parse("{" + f2 + "}")), s2) {
                    for (u2 in c2 = void 0, s2) if ("alias" === u2.toLowerCase()) {
                      c2 = s2[u2];
                      break;
                    }
                  }
                  for (o2 in a3("alias", c2), n4.alias && k(n4.alias, n4, t4), t4) {
                    if (s2) {
                      for (u2 in c2 = void 0, s2) if (u2.toLowerCase() === o2.toLowerCase()) {
                        c2 = s2[u2];
                        break;
                      }
                    }
                    a3(o2, c2);
                  }
                }
                r.default.extend(true, t4, n4), ("rtl" === e5.dir || t4.rightAlign) && (e5.style.textAlign = "right");
                ("rtl" === e5.dir || t4.numericInput) && (e5.dir = "ltr", e5.removeAttribute("dir"), t4.isRTL = true);
                return Object.keys(n4).length;
              }(e4, i3, r.default.extend(true, {}, t3.userOptions), t3.dataAttribute)) {
                var a2 = (0, u.generateMaskSet)(i3, t3.noMasksCache);
                void 0 !== a2 && (void 0 !== e4.inputmask && (e4.inputmask.opts.autoUnmask = true, e4.inputmask.remove()), e4.inputmask = new y(void 0, void 0, true), e4.inputmask.opts = i3, e4.inputmask.noMasksCache = t3.noMasksCache, e4.inputmask.userOptions = r.default.extend(true, {}, t3.userOptions), e4.inputmask.el = e4, e4.inputmask.$el = (0, r.default)(e4), e4.inputmask.maskset = a2, r.default.data(e4, g, t3.userOptions), c.mask.call(e4.inputmask));
              }
            }), e3 && e3[0] && e3[0].inputmask || this;
          }, option: function(e3, t3) {
            return "string" == typeof e3 ? this.opts[e3] : "object" === h(e3) ? (r.default.extend(this.userOptions, e3), this.el && true !== t3 && this.mask(this.el), this) : void 0;
          }, unmaskedvalue: function(e3) {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), void 0 === this.el || void 0 !== e3) {
              var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
              s.checkVal.call(this, void 0, false, false, t3), "function" == typeof this.opts.onBeforeWrite && this.opts.onBeforeWrite.call(this, void 0, f.getBuffer.call(this), 0, this.opts);
            }
            return s.unmaskedvalue.call(this, this.el);
          }, remove: function() {
            if (this.el) {
              r.default.data(this.el, g, null);
              var e3 = this.opts.autoUnmask ? (0, s.unmaskedvalue)(this.el) : this._valueGet(this.opts.autoUnmask);
              e3 !== f.getBufferTemplate.call(this).join("") ? this._valueSet(e3, this.opts.autoUnmask) : this._valueSet(""), o.EventRuler.off(this.el), Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.el), "value") && this.__valueGet && Object.defineProperty(this.el, "value", { get: this.__valueGet, set: this.__valueSet, configurable: true }) : m.__lookupGetter__ && this.el.__lookupGetter__("value") && this.__valueGet && (this.el.__defineGetter__("value", this.__valueGet), this.el.__defineSetter__("value", this.__valueSet)), this.el.inputmask = void 0;
            }
            return this.el;
          }, getemptymask: function() {
            return this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), (this.isRTL ? f.getBufferTemplate.call(this).reverse() : f.getBufferTemplate.call(this)).join("");
          }, hasMaskedValue: function() {
            return !this.opts.autoUnmask;
          }, isComplete: function() {
            return this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), p.isComplete.call(this, f.getBuffer.call(this));
          }, getmetadata: function() {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), Array.isArray(this.maskset.metadata)) {
              var e3 = d.getMaskTemplate.call(this, true, 0, false).join("");
              return this.maskset.metadata.forEach(function(t3) {
                return t3.mask !== e3 || (e3 = t3, false);
              }), e3;
            }
            return this.maskset.metadata;
          }, isValid: function(e3) {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), e3) {
              var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
              s.checkVal.call(this, void 0, true, false, t3);
            } else e3 = this.isRTL ? f.getBuffer.call(this).slice().reverse().join("") : f.getBuffer.call(this).join("");
            for (var n3 = f.getBuffer.call(this), i3 = f.determineLastRequiredPosition.call(this), a2 = n3.length - 1; a2 > i3 && !f.isMask.call(this, a2); a2--) ;
            return n3.splice(i3, a2 + 1 - i3), p.isComplete.call(this, n3) && e3 === (this.isRTL ? f.getBuffer.call(this).slice().reverse().join("") : f.getBuffer.call(this).join(""));
          }, format: function(e3, t3) {
            this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache);
            var n3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
            s.checkVal.call(this, void 0, true, false, n3);
            var i3 = this.isRTL ? f.getBuffer.call(this).slice().reverse().join("") : f.getBuffer.call(this).join("");
            return t3 ? { value: i3, metadata: this.getmetadata() } : i3;
          }, setValue: function(e3) {
            this.el && (0, r.default)(this.el).trigger("setvalue", [e3]);
          }, analyseMask: u.analyseMask }, y.extendDefaults = function(e3) {
            r.default.extend(true, y.prototype.defaults, e3);
          }, y.extendDefinitions = function(e3) {
            r.default.extend(true, y.prototype.definitions, e3);
          }, y.extendAliases = function(e3) {
            r.default.extend(true, y.prototype.aliases, e3);
          }, y.format = function(e3, t3, n3) {
            return y(t3).format(e3, n3);
          }, y.unmask = function(e3, t3) {
            return y(t3).unmaskedvalue(e3);
          }, y.isValid = function(e3, t3) {
            return y(t3).isValid(e3);
          }, y.remove = function(e3) {
            "string" == typeof e3 && (e3 = m.getElementById(e3) || m.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : e3).forEach(function(e4) {
              e4.inputmask && e4.inputmask.remove();
            });
          }, y.setValue = function(e3, t3) {
            "string" == typeof e3 && (e3 = m.getElementById(e3) || m.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : e3).forEach(function(e4) {
              e4.inputmask ? e4.inputmask.setValue(t3) : (0, r.default)(e4).trigger("setvalue", [t3]);
            });
          }, y.dependencyLib = r.default, l.default.Inputmask = y;
          t2.default = y;
        }, 5296: function(e2, t2, n2) {
          function i2(e3) {
            return i2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, i2(e3);
          }
          var a = d(n2(9380)), r = d(n2(2394));
          function o(e3, t3) {
            for (var n3 = 0; n3 < t3.length; n3++) {
              var a2 = t3[n3];
              a2.enumerable = a2.enumerable || false, a2.configurable = true, "value" in a2 && (a2.writable = true), Object.defineProperty(e3, (r2 = a2.key, o2 = void 0, o2 = function(e4, t4) {
                if ("object" !== i2(e4) || null === e4) return e4;
                var n4 = e4[Symbol.toPrimitive];
                if (void 0 !== n4) {
                  var a3 = n4.call(e4, t4);
                  if ("object" !== i2(a3)) return a3;
                  throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t4 ? String : Number)(e4);
              }(r2, "string"), "symbol" === i2(o2) ? o2 : String(o2)), a2);
            }
            var r2, o2;
          }
          function l(e3) {
            var t3 = u();
            return function() {
              var n3, a2 = p(e3);
              if (t3) {
                var r2 = p(this).constructor;
                n3 = Reflect.construct(a2, arguments, r2);
              } else n3 = a2.apply(this, arguments);
              return function(e4, t4) {
                if (t4 && ("object" === i2(t4) || "function" == typeof t4)) return t4;
                if (void 0 !== t4) throw new TypeError("Derived constructors may only return object or undefined");
                return function(e5) {
                  if (void 0 === e5) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  return e5;
                }(e4);
              }(this, n3);
            };
          }
          function s(e3) {
            var t3 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
            return s = function(e4) {
              if (null === e4 || !function(e5) {
                try {
                  return -1 !== Function.toString.call(e5).indexOf("[native code]");
                } catch (t4) {
                  return "function" == typeof e5;
                }
              }(e4)) return e4;
              if ("function" != typeof e4) throw new TypeError("Super expression must either be null or a function");
              if (void 0 !== t3) {
                if (t3.has(e4)) return t3.get(e4);
                t3.set(e4, n3);
              }
              function n3() {
                return c(e4, arguments, p(this).constructor);
              }
              return n3.prototype = Object.create(e4.prototype, { constructor: { value: n3, enumerable: false, writable: true, configurable: true } }), f(n3, e4);
            }, s(e3);
          }
          function c(e3, t3, n3) {
            return c = u() ? Reflect.construct.bind() : function(e4, t4, n4) {
              var i3 = [null];
              i3.push.apply(i3, t4);
              var a2 = new (Function.bind.apply(e4, i3))();
              return n4 && f(a2, n4.prototype), a2;
            }, c.apply(null, arguments);
          }
          function u() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return false;
            if (Reflect.construct.sham) return false;
            if ("function" == typeof Proxy) return true;
            try {
              return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              })), true;
            } catch (e3) {
              return false;
            }
          }
          function f(e3, t3) {
            return f = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e4, t4) {
              return e4.__proto__ = t4, e4;
            }, f(e3, t3);
          }
          function p(e3) {
            return p = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e4) {
              return e4.__proto__ || Object.getPrototypeOf(e4);
            }, p(e3);
          }
          function d(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var h = a.default.document;
          if (h && h.head && h.head.attachShadow && a.default.customElements && void 0 === a.default.customElements.get("input-mask")) {
            var v = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4) throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && f(e4, t4);
              }(s2, e3);
              var t3, n3, a2 = l(s2);
              function s2() {
                var e4;
                !function(e5, t5) {
                  if (!(e5 instanceof t5)) throw new TypeError("Cannot call a class as a function");
                }(this, s2);
                var t4 = (e4 = a2.call(this)).getAttributeNames(), n4 = e4.attachShadow({ mode: "closed" });
                for (var i4 in e4.input = h.createElement("input"), e4.input.type = "text", n4.appendChild(e4.input), t4) Object.prototype.hasOwnProperty.call(t4, i4) && e4.input.setAttribute(t4[i4], e4.getAttribute(t4[i4]));
                var o2 = new r.default();
                return o2.dataAttribute = "", o2.mask(e4.input), e4.input.inputmask.shadowRoot = n4, e4;
              }
              return t3 = s2, (n3 = [{ key: "attributeChangedCallback", value: function(e4, t4, n4) {
                this.input.setAttribute(e4, n4);
              } }, { key: "value", get: function() {
                return this.input.value;
              }, set: function(e4) {
                this.input.value = e4;
              } }]) && o(t3.prototype, n3), Object.defineProperty(t3, "prototype", { writable: false }), s2;
            }(s(HTMLElement));
            a.default.customElements.define("input-mask", v);
          }
        }, 2839: function(e2, t2) {
          function n2(e3) {
            return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, n2(e3);
          }
          function i2(e3, t3) {
            return function(e4) {
              if (Array.isArray(e4)) return e4;
            }(e3) || function(e4, t4) {
              var n3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
              if (null != n3) {
                var i3, a2, r2, o2, l2 = [], s2 = true, c = false;
                try {
                  if (r2 = (n3 = n3.call(e4)).next, 0 === t4) ;
                  else for (; !(s2 = (i3 = r2.call(n3)).done) && (l2.push(i3.value), l2.length !== t4); s2 = true) ;
                } catch (e5) {
                  c = true, a2 = e5;
                } finally {
                  try {
                    if (!s2 && null != n3.return && (o2 = n3.return(), Object(o2) !== o2)) return;
                  } finally {
                    if (c) throw a2;
                  }
                }
                return l2;
              }
            }(e3, t3) || function(e4, t4) {
              if (!e4) return;
              if ("string" == typeof e4) return a(e4, t4);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return a(e4, t4);
            }(e3, t3) || function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }();
          }
          function a(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function r(e3, t3) {
            var n3 = Object.keys(e3);
            if (Object.getOwnPropertySymbols) {
              var i3 = Object.getOwnPropertySymbols(e3);
              t3 && (i3 = i3.filter(function(t4) {
                return Object.getOwnPropertyDescriptor(e3, t4).enumerable;
              })), n3.push.apply(n3, i3);
            }
            return n3;
          }
          function o(e3, t3, i3) {
            return (t3 = function(e4) {
              var t4 = function(e5, t5) {
                if ("object" !== n2(e5) || null === e5) return e5;
                var i4 = e5[Symbol.toPrimitive];
                if (void 0 !== i4) {
                  var a2 = i4.call(e5, t5);
                  if ("object" !== n2(a2)) return a2;
                  throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t5 ? String : Number)(e5);
              }(e4, "string");
              return "symbol" === n2(t4) ? t4 : String(t4);
            }(t3)) in e3 ? Object.defineProperty(e3, t3, { value: i3, enumerable: true, configurable: true, writable: true }) : e3[t3] = i3, e3;
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.keys = t2.keyCode = void 0, t2.toKey = function(e3, t3) {
            return s[e3] || (t3 ? String.fromCharCode(e3) : String.fromCharCode(e3).toLowerCase());
          }, t2.toKeyCode = function(e3) {
            return l[e3];
          };
          var l = t2.keyCode = function(e3) {
            for (var t3 = 1; t3 < arguments.length; t3++) {
              var n3 = null != arguments[t3] ? arguments[t3] : {};
              t3 % 2 ? r(Object(n3), true).forEach(function(t4) {
                o(e3, t4, n3[t4]);
              }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(n3)) : r(Object(n3)).forEach(function(t4) {
                Object.defineProperty(e3, t4, Object.getOwnPropertyDescriptor(n3, t4));
              });
            }
            return e3;
          }({ c: 67, x: 88, z: 90, BACKSPACE_SAFARI: 127, Enter: 13, Meta_LEFT: 91, Meta_RIGHT: 92, Space: 32 }, { Alt: 18, AltGraph: 18, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, ArrowUp: 38, Backspace: 8, CapsLock: 20, Control: 17, ContextMenu: 93, Dead: 221, Delete: 46, End: 35, Escape: 27, F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, Home: 36, Insert: 45, NumLock: 144, PageDown: 34, PageUp: 33, Pause: 19, PrintScreen: 44, Process: 229, Shift: 16, ScrollLock: 145, Tab: 9, Unidentified: 229 }), s = Object.entries(l).reduce(function(e3, t3) {
            var n3 = i2(t3, 2), a2 = n3[0], r2 = n3[1];
            return e3[r2] = void 0 === e3[r2] ? a2 : e3[r2], e3;
          }, {});
          t2.keys = Object.entries(l).reduce(function(e3, t3) {
            var n3 = i2(t3, 2), a2 = n3[0];
            n3[1];
            return e3[a2] = "Space" === a2 ? " " : a2, e3;
          }, {});
        }, 2391: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.analyseMask = function(e3, t3, n3) {
            var i3, a2, s2, c2, u, f, p = /(?:[?*+]|\{[0-9+*]+(?:,[0-9+*]*)?(?:\|[0-9+*]*)?\})|[^.?*+^${[]()|\\]+|./g, d = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, h = false, v = new o.default(), m = [], g = [], y = false;
            function k(e4, i4, a3) {
              a3 = void 0 !== a3 ? a3 : e4.matches.length;
              var o2 = e4.matches[a3 - 1];
              if (t3) {
                if (0 === i4.indexOf("[") || h && /\\d|\\s|\\w|\\p/i.test(i4) || "." === i4) {
                  var s3 = n3.casing ? "i" : "";
                  /\\p\{.*}/i.test(i4) && (s3 += "u"), e4.matches.splice(a3++, 0, { fn: new RegExp(i4, s3), static: false, optionality: false, newBlockMarker: void 0 === o2 ? "master" : o2.def !== i4, casing: null, def: i4, placeholder: "object" === l(n3.placeholder) ? n3.placeholder[v.matches.length] : void 0, nativeDef: i4 });
                } else h && (i4 = i4[i4.length - 1]), i4.split("").forEach(function(t4, i5) {
                  o2 = e4.matches[a3 - 1], e4.matches.splice(a3++, 0, { fn: /[a-z]/i.test(n3.staticDefinitionSymbol || t4) ? new RegExp("[" + (n3.staticDefinitionSymbol || t4) + "]", n3.casing ? "i" : "") : null, static: true, optionality: false, newBlockMarker: void 0 === o2 ? "master" : o2.def !== t4 && true !== o2.static, casing: null, def: n3.staticDefinitionSymbol || t4, placeholder: void 0 !== n3.staticDefinitionSymbol ? t4 : "object" === l(n3.placeholder) ? n3.placeholder[v.matches.length] : void 0, nativeDef: (h ? "'" : "") + t4 });
                });
                h = false;
              } else {
                var c3 = n3.definitions && n3.definitions[i4] || n3.usePrototypeDefinitions && r.default.prototype.definitions[i4];
                c3 && !h ? e4.matches.splice(a3++, 0, { fn: c3.validator ? "string" == typeof c3.validator ? new RegExp(c3.validator, n3.casing ? "i" : "") : new function() {
                  this.test = c3.validator;
                }() : /./, static: c3.static || false, optionality: c3.optional || false, defOptionality: c3.optional || false, newBlockMarker: void 0 === o2 || c3.optional ? "master" : o2.def !== (c3.definitionSymbol || i4), casing: c3.casing, def: c3.definitionSymbol || i4, placeholder: c3.placeholder, nativeDef: i4, generated: c3.generated }) : (e4.matches.splice(a3++, 0, { fn: /[a-z]/i.test(n3.staticDefinitionSymbol || i4) ? new RegExp("[" + (n3.staticDefinitionSymbol || i4) + "]", n3.casing ? "i" : "") : null, static: true, optionality: false, newBlockMarker: void 0 === o2 ? "master" : o2.def !== i4 && true !== o2.static, casing: null, def: n3.staticDefinitionSymbol || i4, placeholder: void 0 !== n3.staticDefinitionSymbol ? i4 : void 0, nativeDef: (h ? "'" : "") + i4 }), h = false);
              }
            }
            function b() {
              if (m.length > 0) {
                if (k(c2 = m[m.length - 1], a2), c2.isAlternator) {
                  u = m.pop();
                  for (var e4 = 0; e4 < u.matches.length; e4++) u.matches[e4].isGroup && (u.matches[e4].isGroup = false);
                  m.length > 0 ? (c2 = m[m.length - 1]).matches.push(u) : v.matches.push(u);
                }
              } else k(v, a2);
            }
            function x(e4) {
              var t4 = new o.default(true);
              return t4.openGroup = false, t4.matches = e4, t4;
            }
            function w() {
              if ((s2 = m.pop()).openGroup = false, void 0 !== s2) if (m.length > 0) {
                if ((c2 = m[m.length - 1]).matches.push(s2), c2.isAlternator) {
                  u = m.pop();
                  for (var e4 = 0; e4 < u.matches.length; e4++) u.matches[e4].isGroup = false, u.matches[e4].alternatorGroup = false;
                  m.length > 0 ? (c2 = m[m.length - 1]).matches.push(u) : v.matches.push(u);
                }
              } else v.matches.push(s2);
              else b();
            }
            function P(e4) {
              var t4 = e4.pop();
              return t4.isQuantifier && (t4 = x([e4.pop(), t4])), t4;
            }
            t3 && (n3.optionalmarker[0] = void 0, n3.optionalmarker[1] = void 0);
            for (; i3 = t3 ? d.exec(e3) : p.exec(e3); ) {
              if (a2 = i3[0], t3) {
                switch (a2.charAt(0)) {
                  case "?":
                    a2 = "{0,1}";
                    break;
                  case "+":
                  case "*":
                    a2 = "{" + a2 + "}";
                    break;
                  case "|":
                    if (0 === m.length) {
                      var S = x(v.matches);
                      S.openGroup = true, m.push(S), v.matches = [], y = true;
                    }
                }
                switch (a2) {
                  case "\\d":
                    a2 = "[0-9]";
                    break;
                  case "\\p":
                    a2 += d.exec(e3)[0], a2 += d.exec(e3)[0];
                }
              }
              if (h) b();
              else switch (a2.charAt(0)) {
                case "$":
                case "^":
                  t3 || b();
                  break;
                case n3.escapeChar:
                  h = true, t3 && b();
                  break;
                case n3.optionalmarker[1]:
                case n3.groupmarker[1]:
                  w();
                  break;
                case n3.optionalmarker[0]:
                  m.push(new o.default(false, true));
                  break;
                case n3.groupmarker[0]:
                  m.push(new o.default(true));
                  break;
                case n3.quantifiermarker[0]:
                  var O = new o.default(false, false, true), _ = (a2 = a2.replace(/[{}?]/g, "")).split("|"), M = _[0].split(","), E = isNaN(M[0]) ? M[0] : parseInt(M[0]), j = 1 === M.length ? E : isNaN(M[1]) ? M[1] : parseInt(M[1]), T = isNaN(_[1]) ? _[1] : parseInt(_[1]);
                  "*" !== E && "+" !== E || (E = "*" === j ? 0 : 1), O.quantifier = { min: E, max: j, jit: T };
                  var A = m.length > 0 ? m[m.length - 1].matches : v.matches;
                  (i3 = A.pop()).isGroup || (i3 = x([i3])), A.push(i3), A.push(O);
                  break;
                case n3.alternatormarker:
                  if (m.length > 0) {
                    var D = (c2 = m[m.length - 1]).matches[c2.matches.length - 1];
                    f = c2.openGroup && (void 0 === D.matches || false === D.isGroup && false === D.isAlternator) ? m.pop() : P(c2.matches);
                  } else f = P(v.matches);
                  if (f.isAlternator) m.push(f);
                  else if (f.alternatorGroup ? (u = m.pop(), f.alternatorGroup = false) : u = new o.default(false, false, false, true), u.matches.push(f), m.push(u), f.openGroup) {
                    f.openGroup = false;
                    var L = new o.default(true);
                    L.alternatorGroup = true, m.push(L);
                  }
                  break;
                default:
                  b();
              }
            }
            y && w();
            for (; m.length > 0; ) s2 = m.pop(), v.matches.push(s2);
            v.matches.length > 0 && (!function e4(i4) {
              i4 && i4.matches && i4.matches.forEach(function(a3, r2) {
                var o2 = i4.matches[r2 + 1];
                (void 0 === o2 || void 0 === o2.matches || false === o2.isQuantifier) && a3 && a3.isGroup && (a3.isGroup = false, t3 || (k(a3, n3.groupmarker[0], 0), true !== a3.openGroup && k(a3, n3.groupmarker[1]))), e4(a3);
              });
            }(v), g.push(v));
            (n3.numericInput || n3.isRTL) && function e4(t4) {
              for (var i4 in t4.matches = t4.matches.reverse(), t4.matches) if (Object.prototype.hasOwnProperty.call(t4.matches, i4)) {
                var a3 = parseInt(i4);
                if (t4.matches[i4].isQuantifier && t4.matches[a3 + 1] && t4.matches[a3 + 1].isGroup) {
                  var r2 = t4.matches[i4];
                  t4.matches.splice(i4, 1), t4.matches.splice(a3 + 1, 0, r2);
                }
                void 0 !== t4.matches[i4].matches ? t4.matches[i4] = e4(t4.matches[i4]) : t4.matches[i4] = ((o2 = t4.matches[i4]) === n3.optionalmarker[0] ? o2 = n3.optionalmarker[1] : o2 === n3.optionalmarker[1] ? o2 = n3.optionalmarker[0] : o2 === n3.groupmarker[0] ? o2 = n3.groupmarker[1] : o2 === n3.groupmarker[1] && (o2 = n3.groupmarker[0]), o2);
              }
              var o2;
              return t4;
            }(g[0]);
            return g;
          }, t2.generateMaskSet = function(e3, t3) {
            var n3;
            function o2(e4, t4) {
              var n4 = t4.repeat, i3 = t4.groupmarker, r2 = t4.quantifiermarker, o3 = t4.keepStatic;
              if (n4 > 0 || "*" === n4 || "+" === n4) {
                var l2 = "*" === n4 ? 0 : "+" === n4 ? 1 : n4;
                if (l2 != n4) e4 = i3[0] + e4 + i3[1] + r2[0] + l2 + "," + n4 + r2[1];
                else for (var c3 = e4, u2 = 1; u2 < l2; u2++) e4 += c3;
              }
              if (true === o3) {
                var f = e4.match(new RegExp("(.)\\[([^\\]]*)\\]", "g"));
                f && f.forEach(function(t5, n5) {
                  var i4 = function(e5, t6) {
                    return function(e6) {
                      if (Array.isArray(e6)) return e6;
                    }(e5) || function(e6, t7) {
                      var n6 = null == e6 ? null : "undefined" != typeof Symbol && e6[Symbol.iterator] || e6["@@iterator"];
                      if (null != n6) {
                        var i5, a2, r4, o5, l3 = [], s2 = true, c4 = false;
                        try {
                          if (r4 = (n6 = n6.call(e6)).next, 0 === t7) ;
                          else for (; !(s2 = (i5 = r4.call(n6)).done) && (l3.push(i5.value), l3.length !== t7); s2 = true) ;
                        } catch (e7) {
                          c4 = true, a2 = e7;
                        } finally {
                          try {
                            if (!s2 && null != n6.return && (o5 = n6.return(), Object(o5) !== o5)) return;
                          } finally {
                            if (c4) throw a2;
                          }
                        }
                        return l3;
                      }
                    }(e5, t6) || function(e6, t7) {
                      if (!e6) return;
                      if ("string" == typeof e6) return s(e6, t7);
                      var n6 = Object.prototype.toString.call(e6).slice(8, -1);
                      "Object" === n6 && e6.constructor && (n6 = e6.constructor.name);
                      if ("Map" === n6 || "Set" === n6) return Array.from(e6);
                      if ("Arguments" === n6 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n6)) return s(e6, t7);
                    }(e5, t6) || function() {
                      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                    }();
                  }(t5.split("["), 2), r3 = i4[0], o4 = i4[1];
                  o4 = o4.replace("]", ""), e4 = e4.replace(new RegExp("".concat((0, a.default)(r3), "\\[").concat((0, a.default)(o4), "\\]")), r3.charAt(0) === o4.charAt(0) ? "(".concat(r3, "|").concat(r3).concat(o4, ")") : "".concat(r3, "[").concat(o4, "]"));
                });
              }
              return e4;
            }
            function c2(e4, n4, a2) {
              var s2, c3, u2 = false;
              return null !== e4 && "" !== e4 || ((u2 = null !== a2.regex) ? e4 = (e4 = a2.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (u2 = true, e4 = ".*")), 1 === e4.length && false === a2.greedy && 0 !== a2.repeat && (a2.placeholder = ""), e4 = o2(e4, a2), c3 = u2 ? "regex_" + a2.regex : a2.numericInput ? e4.split("").reverse().join("") : e4, null !== a2.keepStatic && (c3 = "ks_" + a2.keepStatic + c3), "object" === l(a2.placeholder) && (c3 = "ph_" + JSON.stringify(a2.placeholder) + c3), void 0 === r.default.prototype.masksCache[c3] || true === t3 ? (s2 = { mask: e4, maskToken: r.default.prototype.analyseMask(e4, u2, a2), validPositions: [], _buffer: void 0, buffer: void 0, tests: {}, excludes: {}, metadata: n4, maskLength: void 0, jitOffset: {} }, true !== t3 && (r.default.prototype.masksCache[c3] = s2, s2 = i2.default.extend(true, {}, r.default.prototype.masksCache[c3]))) : s2 = i2.default.extend(true, {}, r.default.prototype.masksCache[c3]), s2;
            }
            "function" == typeof e3.mask && (e3.mask = e3.mask(e3));
            if (Array.isArray(e3.mask)) {
              if (e3.mask.length > 1) {
                null === e3.keepStatic && (e3.keepStatic = true);
                var u = e3.groupmarker[0];
                return (e3.isRTL ? e3.mask.reverse() : e3.mask).forEach(function(t4) {
                  u.length > 1 && (u += e3.alternatormarker), void 0 !== t4.mask && "function" != typeof t4.mask ? u += t4.mask : u += t4;
                }), c2(u += e3.groupmarker[1], e3.mask, e3);
              }
              e3.mask = e3.mask.pop();
            }
            n3 = e3.mask && void 0 !== e3.mask.mask && "function" != typeof e3.mask.mask ? c2(e3.mask.mask, e3.mask, e3) : c2(e3.mask, e3.mask, e3);
            null === e3.keepStatic && (e3.keepStatic = false);
            return n3;
          };
          var i2 = c(n2(4963)), a = c(n2(7184)), r = c(n2(2394)), o = c(n2(9695));
          function l(e3) {
            return l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, l(e3);
          }
          function s(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function c(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
        }, 157: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.mask = function() {
            var e3 = this, t3 = this.opts, n3 = this.el, c = this.dependencyLib;
            r.EventRuler.off(n3);
            var u = function(t4, n4) {
              var i3 = t4.getAttribute("type"), a2 = "input" === t4.tagName.toLowerCase() && n4.supportsInputType.includes(i3) || t4.isContentEditable || "textarea" === t4.tagName.toLowerCase();
              if (!a2) if ("input" === t4.tagName.toLowerCase()) {
                var s2 = document.createElement("input");
                s2.setAttribute("type", i3), a2 = "text" === s2.type, s2 = null;
              } else a2 = "partial";
              return false !== a2 ? function(t5) {
                var i4, a3;
                function s3() {
                  return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== l.getLastValidPosition.call(e3) || true !== n4.nullable ? (this.inputmask.shadowRoot || this.ownerDocument).activeElement === this && n4.clearMaskOnLostFocus ? (e3.isRTL ? o.clearOptionalTail.call(e3, l.getBuffer.call(e3).slice()).reverse() : o.clearOptionalTail.call(e3, l.getBuffer.call(e3).slice())).join("") : i4.call(this) : "" : i4.call(this);
                }
                function u2(e4) {
                  a3.call(this, e4), this.inputmask && (0, o.applyInputValue)(this, e4);
                }
                if (!t5.inputmask.__valueGet) {
                  if (true !== n4.noValuePatching) {
                    if (Object.getOwnPropertyDescriptor) {
                      var f2 = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t5), "value") : void 0;
                      f2 && f2.get && f2.set ? (i4 = f2.get, a3 = f2.set, Object.defineProperty(t5, "value", { get: s3, set: u2, configurable: true })) : "input" !== t5.tagName.toLowerCase() && (i4 = function() {
                        return this.textContent;
                      }, a3 = function(e4) {
                        this.textContent = e4;
                      }, Object.defineProperty(t5, "value", { get: s3, set: u2, configurable: true }));
                    } else document.__lookupGetter__ && t5.__lookupGetter__("value") && (i4 = t5.__lookupGetter__("value"), a3 = t5.__lookupSetter__("value"), t5.__defineGetter__("value", s3), t5.__defineSetter__("value", u2));
                    t5.inputmask.__valueGet = i4, t5.inputmask.__valueSet = a3;
                  }
                  t5.inputmask._valueGet = function(t6) {
                    return e3.isRTL && true !== t6 ? i4.call(this.el).split("").reverse().join("") : i4.call(this.el);
                  }, t5.inputmask._valueSet = function(t6, n5) {
                    a3.call(this.el, null == t6 ? "" : true !== n5 && e3.isRTL ? t6.split("").reverse().join("") : t6);
                  }, void 0 === i4 && (i4 = function() {
                    return this.value;
                  }, a3 = function(e4) {
                    this.value = e4;
                  }, function(t6) {
                    if (c.valHooks && (void 0 === c.valHooks[t6] || true !== c.valHooks[t6].inputmaskpatch)) {
                      var i5 = c.valHooks[t6] && c.valHooks[t6].get ? c.valHooks[t6].get : function(e4) {
                        return e4.value;
                      }, a4 = c.valHooks[t6] && c.valHooks[t6].set ? c.valHooks[t6].set : function(e4, t7) {
                        return e4.value = t7, e4;
                      };
                      c.valHooks[t6] = { get: function(t7) {
                        if (t7.inputmask) {
                          if (t7.inputmask.opts.autoUnmask) return t7.inputmask.unmaskedvalue();
                          var a5 = i5(t7);
                          return -1 !== l.getLastValidPosition.call(e3, void 0, void 0, t7.inputmask.maskset.validPositions) || true !== n4.nullable ? a5 : "";
                        }
                        return i5(t7);
                      }, set: function(e4, t7) {
                        var n5 = a4(e4, t7);
                        return e4.inputmask && (0, o.applyInputValue)(e4, t7), n5;
                      }, inputmaskpatch: true };
                    }
                  }(t5.type), function(e4) {
                    r.EventRuler.on(e4, "mouseenter", function() {
                      var e5 = this, t6 = e5.inputmask._valueGet(true);
                      t6 != (e5.inputmask.isRTL ? l.getBuffer.call(e5.inputmask).slice().reverse() : l.getBuffer.call(e5.inputmask)).join("") && (0, o.applyInputValue)(e5, t6);
                    });
                  }(t5));
                }
              }(t4) : t4.inputmask = void 0, a2;
            }(n3, t3);
            if (false !== u) {
              e3.originalPlaceholder = n3.placeholder, e3.maxLength = void 0 !== n3 ? n3.maxLength : void 0, -1 === e3.maxLength && (e3.maxLength = void 0), "inputMode" in n3 && null === n3.getAttribute("inputmode") && (n3.inputMode = t3.inputmode, n3.setAttribute("inputmode", t3.inputmode)), true === u && (t3.showMaskOnFocus = t3.showMaskOnFocus && -1 === ["cc-number", "cc-exp"].indexOf(n3.autocomplete), i2.iphone && (t3.insertModeVisual = false, n3.setAttribute("autocorrect", "off")), r.EventRuler.on(n3, "submit", a.EventHandlers.submitEvent), r.EventRuler.on(n3, "reset", a.EventHandlers.resetEvent), r.EventRuler.on(n3, "blur", a.EventHandlers.blurEvent), r.EventRuler.on(n3, "focus", a.EventHandlers.focusEvent), r.EventRuler.on(n3, "invalid", a.EventHandlers.invalidEvent), r.EventRuler.on(n3, "click", a.EventHandlers.clickEvent), r.EventRuler.on(n3, "mouseleave", a.EventHandlers.mouseleaveEvent), r.EventRuler.on(n3, "mouseenter", a.EventHandlers.mouseenterEvent), r.EventRuler.on(n3, "paste", a.EventHandlers.pasteEvent), r.EventRuler.on(n3, "cut", a.EventHandlers.cutEvent), r.EventRuler.on(n3, "complete", t3.oncomplete), r.EventRuler.on(n3, "incomplete", t3.onincomplete), r.EventRuler.on(n3, "cleared", t3.oncleared), true !== t3.inputEventOnly && r.EventRuler.on(n3, "keydown", a.EventHandlers.keyEvent), (i2.mobile || t3.inputEventOnly) && n3.removeAttribute("maxLength"), r.EventRuler.on(n3, "input", a.EventHandlers.inputFallBackEvent)), r.EventRuler.on(n3, "setvalue", a.EventHandlers.setValueEvent), void 0 === e3.applyMaskHook || e3.applyMaskHook(), l.getBufferTemplate.call(e3).join(""), e3.undoValue = e3._valueGet(true);
              var f = (n3.inputmask.shadowRoot || n3.ownerDocument).activeElement;
              if ("" !== n3.inputmask._valueGet(true) || false === t3.clearMaskOnLostFocus || f === n3) {
                (0, o.applyInputValue)(n3, n3.inputmask._valueGet(true), t3);
                var p = l.getBuffer.call(e3).slice();
                false === s.isComplete.call(e3, p) && t3.clearIncomplete && l.resetMaskSet.call(e3, false), t3.clearMaskOnLostFocus && f !== n3 && (-1 === l.getLastValidPosition.call(e3) ? p = [] : o.clearOptionalTail.call(e3, p)), (false === t3.clearMaskOnLostFocus || t3.showMaskOnFocus && f === n3 || "" !== n3.inputmask._valueGet(true)) && (0, o.writeBuffer)(n3, p), f === n3 && l.caret.call(e3, n3, l.seekNext.call(e3, l.getLastValidPosition.call(e3)));
              }
            }
          };
          var i2 = n2(9845), a = n2(6030), r = n2(9716), o = n2(7760), l = n2(8711), s = n2(7215);
        }, 9695: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3, t3, n2, i2) {
            this.matches = [], this.openGroup = e3 || false, this.alternatorGroup = false, this.isGroup = e3 || false, this.isOptional = t3 || false, this.isQuantifier = n2 || false, this.isAlternator = i2 || false, this.quantifier = { min: 1, max: 1 };
          };
        }, 3194: function() {
          Array.prototype.includes || Object.defineProperty(Array.prototype, "includes", { value: function(e2, t2) {
            if (null == this) throw new TypeError('"this" is null or not defined');
            var n2 = Object(this), i2 = n2.length >>> 0;
            if (0 === i2) return false;
            for (var a = 0 | t2, r = Math.max(a >= 0 ? a : i2 - Math.abs(a), 0); r < i2; ) {
              if (n2[r] === e2) return true;
              r++;
            }
            return false;
          } });
        }, 9302: function() {
          var e2 = Function.bind.call(Function.call, Array.prototype.reduce), t2 = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable), n2 = Function.bind.call(Function.call, Array.prototype.concat), i2 = Object.keys;
          Object.entries || (Object.entries = function(a) {
            return e2(i2(a), function(e3, i3) {
              return n2(e3, "string" == typeof i3 && t2(a, i3) ? [[i3, a[i3]]] : []);
            }, []);
          });
        }, 7149: function() {
          function e2(t2) {
            return e2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
              return typeof e3;
            } : function(e3) {
              return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
            }, e2(t2);
          }
          "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" === e2("test".__proto__) ? function(e3) {
            return e3.__proto__;
          } : function(e3) {
            return e3.constructor.prototype;
          });
        }, 4013: function() {
          String.prototype.includes || (String.prototype.includes = function(e2, t2) {
            return "number" != typeof t2 && (t2 = 0), !(t2 + e2.length > this.length) && -1 !== this.indexOf(e2, t2);
          });
        }, 8711: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.caret = function(e3, t3, n3, i3, r2) {
            var o2, l2 = this, s2 = this.opts;
            if (void 0 === t3) return "selectionStart" in e3 && "selectionEnd" in e3 ? (t3 = e3.selectionStart, n3 = e3.selectionEnd) : a.default.getSelection ? (o2 = a.default.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== e3 && o2.commonAncestorContainer !== e3 || (t3 = o2.startOffset, n3 = o2.endOffset) : document.selection && document.selection.createRange && (n3 = (t3 = 0 - (o2 = document.selection.createRange()).duplicate().moveStart("character", -e3.inputmask._valueGet().length)) + o2.text.length), { begin: i3 ? t3 : f.call(l2, t3), end: i3 ? n3 : f.call(l2, n3) };
            if (Array.isArray(t3) && (n3 = l2.isRTL ? t3[0] : t3[1], t3 = l2.isRTL ? t3[1] : t3[0]), void 0 !== t3.begin && (n3 = l2.isRTL ? t3.begin : t3.end, t3 = l2.isRTL ? t3.end : t3.begin), "number" == typeof t3) {
              t3 = i3 ? t3 : f.call(l2, t3), n3 = "number" == typeof (n3 = i3 ? n3 : f.call(l2, n3)) ? n3 : t3;
              var c2 = parseInt(((e3.ownerDocument.defaultView || a.default).getComputedStyle ? (e3.ownerDocument.defaultView || a.default).getComputedStyle(e3, null) : e3.currentStyle).fontSize) * n3;
              if (e3.scrollLeft = c2 > e3.scrollWidth ? c2 : 0, e3.inputmask.caretPos = { begin: t3, end: n3 }, s2.insertModeVisual && false === s2.insertMode && t3 === n3 && (r2 || n3++), e3 === (e3.inputmask.shadowRoot || e3.ownerDocument).activeElement) {
                if ("setSelectionRange" in e3) e3.setSelectionRange(t3, n3);
                else if (a.default.getSelection) {
                  if (o2 = document.createRange(), void 0 === e3.firstChild || null === e3.firstChild) {
                    var u2 = document.createTextNode("");
                    e3.appendChild(u2);
                  }
                  o2.setStart(e3.firstChild, t3 < e3.inputmask._valueGet().length ? t3 : e3.inputmask._valueGet().length), o2.setEnd(e3.firstChild, n3 < e3.inputmask._valueGet().length ? n3 : e3.inputmask._valueGet().length), o2.collapse(true);
                  var p = a.default.getSelection();
                  p.removeAllRanges(), p.addRange(o2);
                } else e3.createTextRange && ((o2 = e3.createTextRange()).collapse(true), o2.moveEnd("character", n3), o2.moveStart("character", t3), o2.select());
                void 0 === e3.inputmask.caretHook || e3.inputmask.caretHook.call(l2, { begin: t3, end: n3 });
              }
            }
          }, t2.determineLastRequiredPosition = function(e3) {
            var t3, n3, i3 = this, a2 = i3.maskset, l2 = i3.dependencyLib, c2 = s.call(i3), u2 = {}, f2 = a2.validPositions[c2], p = o.getMaskTemplate.call(i3, true, s.call(i3), true, true), d = p.length, h = void 0 !== f2 ? f2.locator.slice() : void 0;
            for (t3 = c2 + 1; t3 < p.length; t3++) h = (n3 = o.getTestTemplate.call(i3, t3, h, t3 - 1)).locator.slice(), u2[t3] = l2.extend(true, {}, n3);
            var v = f2 && void 0 !== f2.alternation ? f2.locator[f2.alternation] : void 0;
            for (t3 = d - 1; t3 > c2 && (((n3 = u2[t3]).match.optionality || n3.match.optionalQuantifier && n3.match.newBlockMarker || v && (v !== u2[t3].locator[f2.alternation] && true !== n3.match.static || true === n3.match.static && n3.locator[f2.alternation] && r.checkAlternationMatch.call(i3, n3.locator[f2.alternation].toString().split(","), v.toString().split(",")) && "" !== o.getTests.call(i3, t3)[0].def)) && p[t3] === o.getPlaceholder.call(i3, t3, n3.match)); t3--) d--;
            return e3 ? { l: d, def: u2[d] ? u2[d].match : void 0 } : d;
          }, t2.determineNewCaretPosition = function(e3, t3, n3) {
            var i3, a2, r2, f2 = this, p = f2.maskset, d = f2.opts;
            t3 && (f2.isRTL ? e3.end = e3.begin : e3.begin = e3.end);
            if (e3.begin === e3.end) {
              switch (n3 = n3 || d.positionCaretOnClick) {
                case "none":
                  break;
                case "select":
                  e3 = { begin: 0, end: l.call(f2).length };
                  break;
                case "ignore":
                  e3.end = e3.begin = u.call(f2, s.call(f2));
                  break;
                case "radixFocus":
                  if (f2.clicked > 1 && 0 === p.validPositions.length) break;
                  if (function(e4) {
                    if ("" !== d.radixPoint && 0 !== d.digits) {
                      var t4 = p.validPositions;
                      if (void 0 === t4[e4] || void 0 === t4[e4].input) {
                        if (e4 < u.call(f2, -1)) return true;
                        var n4 = l.call(f2).indexOf(d.radixPoint);
                        if (-1 !== n4) {
                          for (var i4 = 0, a3 = t4.length; i4 < a3; i4++) if (t4[i4] && n4 < i4 && t4[i4].input !== o.getPlaceholder.call(f2, i4)) return false;
                          return true;
                        }
                      }
                    }
                    return false;
                  }(e3.begin)) {
                    var h = l.call(f2).join("").indexOf(d.radixPoint);
                    e3.end = e3.begin = d.numericInput ? u.call(f2, h) : h;
                    break;
                  }
                default:
                  if (i3 = e3.begin, a2 = s.call(f2, i3, true), i3 <= (r2 = u.call(f2, -1 !== a2 || c.call(f2, 0) ? a2 : -1))) e3.end = e3.begin = c.call(f2, i3, false, true) ? i3 : u.call(f2, i3);
                  else {
                    var v = p.validPositions[a2], m = o.getTestTemplate.call(f2, r2, v ? v.match.locator : void 0, v), g = o.getPlaceholder.call(f2, r2, m.match);
                    if ("" !== g && l.call(f2)[r2] !== g && true !== m.match.optionalQuantifier && true !== m.match.newBlockMarker || !c.call(f2, r2, d.keepStatic, true) && m.match.def === g) {
                      var y = u.call(f2, r2);
                      (i3 >= y || i3 === r2) && (r2 = y);
                    }
                    e3.end = e3.begin = r2;
                  }
              }
              return e3;
            }
          }, t2.getBuffer = l, t2.getBufferTemplate = function() {
            var e3 = this.maskset;
            void 0 === e3._buffer && (e3._buffer = o.getMaskTemplate.call(this, false, 1), void 0 === e3.buffer && (e3.buffer = e3._buffer.slice()));
            return e3._buffer;
          }, t2.getLastValidPosition = s, t2.isMask = c, t2.resetMaskSet = function(e3) {
            var t3 = this.maskset;
            t3.buffer = void 0, true !== e3 && (t3.validPositions = [], t3.p = 0);
            false === e3 && (t3.tests = {}, t3.jitOffset = {});
          }, t2.seekNext = u, t2.seekPrevious = function(e3, t3) {
            var n3 = this, i3 = e3 - 1;
            if (e3 <= 0) return 0;
            for (; i3 > 0 && (true === t3 && (true !== o.getTest.call(n3, i3).match.newBlockMarker || !c.call(n3, i3, void 0, true)) || true !== t3 && !c.call(n3, i3, void 0, true)); ) i3--;
            return i3;
          }, t2.translatePosition = f;
          var i2, a = (i2 = n2(9380)) && i2.__esModule ? i2 : { default: i2 }, r = n2(7215), o = n2(4713);
          function l(e3) {
            var t3 = this, n3 = t3.maskset;
            return void 0 !== n3.buffer && true !== e3 || (n3.buffer = o.getMaskTemplate.call(t3, true, s.call(t3), true), void 0 === n3._buffer && (n3._buffer = n3.buffer.slice())), n3.buffer;
          }
          function s(e3, t3, n3) {
            var i3 = this.maskset, a2 = -1, r2 = -1, o2 = n3 || i3.validPositions;
            void 0 === e3 && (e3 = -1);
            for (var l2 = 0, s2 = o2.length; l2 < s2; l2++) o2[l2] && (t3 || true !== o2[l2].generatedInput) && (l2 <= e3 && (a2 = l2), l2 >= e3 && (r2 = l2));
            return -1 === a2 || a2 === e3 ? r2 : -1 === r2 || e3 - a2 < r2 - e3 ? a2 : r2;
          }
          function c(e3, t3, n3) {
            var i3 = this, a2 = this.maskset, r2 = o.getTestTemplate.call(i3, e3).match;
            if ("" === r2.def && (r2 = o.getTest.call(i3, e3).match), true !== r2.static) return r2.fn;
            if (true === n3 && void 0 !== a2.validPositions[e3] && true !== a2.validPositions[e3].generatedInput) return true;
            if (true !== t3 && e3 > -1) {
              if (n3) {
                var l2 = o.getTests.call(i3, e3);
                return l2.length > 1 + ("" === l2[l2.length - 1].match.def ? 1 : 0);
              }
              var s2 = o.determineTestTemplate.call(i3, e3, o.getTests.call(i3, e3)), c2 = o.getPlaceholder.call(i3, e3, s2.match);
              return s2.match.def !== c2;
            }
            return false;
          }
          function u(e3, t3, n3) {
            var i3 = this;
            void 0 === n3 && (n3 = true);
            for (var a2 = e3 + 1; "" !== o.getTest.call(i3, a2).match.def && (true === t3 && (true !== o.getTest.call(i3, a2).match.newBlockMarker || !c.call(i3, a2, void 0, true)) || true !== t3 && !c.call(i3, a2, void 0, n3)); ) a2++;
            return a2;
          }
          function f(e3) {
            var t3 = this.opts, n3 = this.el;
            return !this.isRTL || "number" != typeof e3 || t3.greedy && "" === t3.placeholder || !n3 || (e3 = this._valueGet().length - e3) < 0 && (e3 = 0), e3;
          }
        }, 4713: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.determineTestTemplate = f, t2.getDecisionTaker = s, t2.getMaskTemplate = function(e3, t3, n3, i3, a2) {
            var r2 = this, o2 = this.opts, l2 = this.maskset, s2 = o2.greedy;
            a2 && o2.greedy && (o2.greedy = false, r2.maskset.tests = {});
            t3 = t3 || 0;
            var p2, d2, v, m, g = [], y = 0;
            do {
              if (true === e3 && l2.validPositions[y]) d2 = (v = a2 && l2.validPositions[y].match.optionality && void 0 === l2.validPositions[y + 1] && (true === l2.validPositions[y].generatedInput || l2.validPositions[y].input == o2.skipOptionalPartCharacter && y > 0) ? f.call(r2, y, h.call(r2, y, p2, y - 1)) : l2.validPositions[y]).match, p2 = v.locator.slice(), g.push(true === n3 ? v.input : false === n3 ? d2.nativeDef : c.call(r2, y, d2));
              else {
                d2 = (v = u.call(r2, y, p2, y - 1)).match, p2 = v.locator.slice();
                var k = true !== i3 && (false !== o2.jitMasking ? o2.jitMasking : d2.jit);
                (m = (m || l2.validPositions[y - 1]) && d2.static && d2.def !== o2.groupSeparator && null === d2.fn) || false === k || void 0 === k || "number" == typeof k && isFinite(k) && k > y ? g.push(false === n3 ? d2.nativeDef : c.call(r2, g.length, d2)) : m = false;
              }
              y++;
            } while (true !== d2.static || "" !== d2.def || t3 > y);
            "" === g[g.length - 1] && g.pop();
            false === n3 && void 0 !== l2.maskLength || (l2.maskLength = y - 1);
            return o2.greedy = s2, g;
          }, t2.getPlaceholder = c, t2.getTest = p, t2.getTestTemplate = u, t2.getTests = h, t2.isSubsetOf = d;
          var i2, a = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 }, r = n2(8711);
          function o(e3) {
            return o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, o(e3);
          }
          function l(e3, t3) {
            var n3 = (null != e3.alternation ? e3.mloc[s(e3)] : e3.locator).join("");
            if ("" !== n3) for (n3 = n3.split(":")[0]; n3.length < t3; ) n3 += "0";
            return n3;
          }
          function s(e3) {
            var t3 = e3.locator[e3.alternation];
            return "string" == typeof t3 && t3.length > 0 && (t3 = t3.split(",")[0]), void 0 !== t3 ? t3.toString() : "";
          }
          function c(e3, t3, n3) {
            var i3 = this, a2 = this.opts, l2 = this.maskset;
            if (void 0 !== (t3 = t3 || p.call(i3, e3).match).placeholder || true === n3) {
              if ("" !== t3.placeholder && true === t3.static && true !== t3.generated) {
                var s2 = r.getLastValidPosition.call(i3, e3), c2 = r.seekNext.call(i3, s2);
                return (n3 ? e3 <= c2 : e3 < c2) ? a2.staticDefinitionSymbol && t3.static ? t3.nativeDef : t3.def : "function" == typeof t3.placeholder ? t3.placeholder(a2) : t3.placeholder;
              }
              return "function" == typeof t3.placeholder ? t3.placeholder(a2) : t3.placeholder;
            }
            if (true === t3.static) {
              if (e3 > -1 && void 0 === l2.validPositions[e3]) {
                var u2, f2 = h.call(i3, e3), d2 = [];
                if ("string" == typeof a2.placeholder && f2.length > 1 + ("" === f2[f2.length - 1].match.def ? 1 : 0)) {
                  for (var v = 0; v < f2.length; v++) if ("" !== f2[v].match.def && true !== f2[v].match.optionality && true !== f2[v].match.optionalQuantifier && (true === f2[v].match.static || void 0 === u2 || false !== f2[v].match.fn.test(u2.match.def, l2, e3, true, a2)) && (d2.push(f2[v]), true === f2[v].match.static && (u2 = f2[v]), d2.length > 1 && /[0-9a-bA-Z]/.test(d2[0].match.def))) return a2.placeholder.charAt(e3 % a2.placeholder.length);
                }
              }
              return t3.def;
            }
            return "object" === o(a2.placeholder) ? t3.def : a2.placeholder.charAt(e3 % a2.placeholder.length);
          }
          function u(e3, t3, n3) {
            return this.maskset.validPositions[e3] || f.call(this, e3, h.call(this, e3, t3 ? t3.slice() : t3, n3));
          }
          function f(e3, t3) {
            var n3 = this.opts, i3 = 0, a2 = function(e4, t4) {
              var n4 = 0, i4 = false;
              t4.forEach(function(e5) {
                e5.match.optionality && (0 !== n4 && n4 !== e5.match.optionality && (i4 = true), (0 === n4 || n4 > e5.match.optionality) && (n4 = e5.match.optionality));
              }), n4 && (0 == e4 || 1 == t4.length ? n4 = 0 : i4 || (n4 = 0));
              return n4;
            }(e3, t3);
            e3 = e3 > 0 ? e3 - 1 : 0;
            var r2, o2, s2, c2 = l(p.call(this, e3));
            n3.greedy && t3.length > 1 && "" === t3[t3.length - 1].match.def && (i3 = 1);
            for (var u2 = 0; u2 < t3.length - i3; u2++) {
              var f2 = t3[u2];
              r2 = l(f2, c2.length);
              var d2 = Math.abs(r2 - c2);
              (true !== f2.unMatchedAlternationStopped || t3.filter(function(e4) {
                return true !== e4.unMatchedAlternationStopped;
              }).length <= 1) && (void 0 === o2 || "" !== r2 && d2 < o2 || s2 && !n3.greedy && s2.match.optionality && s2.match.optionality - a2 > 0 && "master" === s2.match.newBlockMarker && (!f2.match.optionality || f2.match.optionality - a2 < 1 || !f2.match.newBlockMarker) || s2 && !n3.greedy && s2.match.optionalQuantifier && !f2.match.optionalQuantifier) && (o2 = d2, s2 = f2);
            }
            return s2;
          }
          function p(e3, t3) {
            var n3 = this.maskset;
            return n3.validPositions[e3] ? n3.validPositions[e3] : (t3 || h.call(this, e3))[0];
          }
          function d(e3, t3, n3) {
            function i3(e4) {
              for (var t4, n4 = [], i4 = -1, a2 = 0, r2 = e4.length; a2 < r2; a2++) if ("-" === e4.charAt(a2)) for (t4 = e4.charCodeAt(a2 + 1); ++i4 < t4; ) n4.push(String.fromCharCode(i4));
              else i4 = e4.charCodeAt(a2), n4.push(e4.charAt(a2));
              return n4.join("");
            }
            return e3.match.def === t3.match.nativeDef || !(!(n3.regex || e3.match.fn instanceof RegExp && t3.match.fn instanceof RegExp) || true === e3.match.static || true === t3.match.static) && ("." === t3.match.fn.source || -1 !== i3(t3.match.fn.source.replace(/[[\]/]/g, "")).indexOf(i3(e3.match.fn.source.replace(/[[\]/]/g, ""))));
          }
          function h(e3, t3, n3) {
            var i3, r2, o2 = this, l2 = this.dependencyLib, s2 = this.maskset, c2 = this.opts, u2 = this.el, p2 = s2.maskToken, h2 = t3 ? n3 : 0, v = t3 ? t3.slice() : [0], m = [], g = false, y = t3 ? t3.join("") : "", k = false;
            function b(t4, n4, r3, l3) {
              function f2(r4, l4, p4) {
                function v3(e4, t5) {
                  var n5 = 0 === t5.matches.indexOf(e4);
                  return n5 || t5.matches.every(function(i4, a2) {
                    return true === i4.isQuantifier ? n5 = v3(e4, t5.matches[a2 - 1]) : Object.prototype.hasOwnProperty.call(i4, "matches") && (n5 = v3(e4, i4)), !n5;
                  }), n5;
                }
                function w2(e4, t5, n5) {
                  var i4, a2;
                  if ((s2.tests[e4] || s2.validPositions[e4]) && (s2.validPositions[e4] ? [s2.validPositions[e4]] : s2.tests[e4]).every(function(e5, r6) {
                    if (e5.mloc[t5]) return i4 = e5, false;
                    var o4 = void 0 !== n5 ? n5 : e5.alternation, l5 = void 0 !== e5.locator[o4] ? e5.locator[o4].toString().indexOf(t5) : -1;
                    return (void 0 === a2 || l5 < a2) && -1 !== l5 && (i4 = e5, a2 = l5), true;
                  }), i4) {
                    var r5 = i4.locator[i4.alternation], o3 = i4.mloc[t5] || i4.mloc[r5] || i4.locator;
                    if (-1 !== o3[o3.length - 1].toString().indexOf(":")) o3.pop();
                    return o3.slice((void 0 !== n5 ? n5 : i4.alternation) + 1);
                  }
                  return void 0 !== n5 ? w2(e4, t5) : void 0;
                }
                function P2(t5, n5) {
                  return true === t5.match.static && true !== n5.match.static && n5.match.fn.test(t5.match.def, s2, e3, false, c2, false);
                }
                function S2(e4, t5) {
                  var n5 = e4.alternation, i4 = void 0 === t5 || n5 <= t5.alternation && -1 === e4.locator[n5].toString().indexOf(t5.locator[n5]);
                  if (!i4 && n5 > t5.alternation) {
                    for (var a2 = 0; a2 < n5; a2++) if (e4.locator[a2] !== t5.locator[a2]) {
                      n5 = a2, i4 = true;
                      break;
                    }
                  }
                  return !!i4 && function(n6) {
                    e4.mloc = e4.mloc || {};
                    var i5 = e4.locator[n6];
                    if (void 0 !== i5) {
                      if ("string" == typeof i5 && (i5 = i5.split(",")[0]), void 0 === e4.mloc[i5] && (e4.mloc[i5] = e4.locator.slice(), e4.mloc[i5].push(":".concat(e4.alternation))), void 0 !== t5) {
                        for (var a3 in t5.mloc) "string" == typeof a3 && (a3 = parseInt(a3.split(",")[0])), e4.mloc[a3 + 0] = t5.mloc[a3];
                        e4.locator[n6] = Object.keys(e4.mloc).join(",");
                      }
                      return e4.alternation > n6 && (e4.alternation = n6), true;
                    }
                    return e4.alternation = void 0, false;
                  }(n5);
                }
                function O(e4, t5) {
                  if (e4.locator.length !== t5.locator.length) return false;
                  for (var n5 = e4.alternation + 1; n5 < e4.locator.length; n5++) if (e4.locator[n5] !== t5.locator[n5]) return false;
                  return true;
                }
                if (h2 > e3 + c2._maxTestPos) throw new Error("Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. ".concat(s2.mask));
                if (h2 === e3 && void 0 === r4.matches) {
                  if (m.push({ match: r4, locator: l4.reverse(), cd: y, mloc: {} }), !r4.optionality || void 0 !== p4 || !(c2.definitions && c2.definitions[r4.nativeDef] && c2.definitions[r4.nativeDef].optional || a.default.prototype.definitions[r4.nativeDef] && a.default.prototype.definitions[r4.nativeDef].optional)) return true;
                  g = true, h2 = e3;
                } else if (void 0 !== r4.matches) {
                  if (r4.isGroup && p4 !== r4) return function() {
                    if (r4 = f2(t4.matches[t4.matches.indexOf(r4) + 1], l4, p4)) return true;
                  }();
                  if (r4.isOptional) return function() {
                    var t5 = r4, a2 = m.length;
                    if (r4 = b(r4, n4, l4, p4), m.length > 0) {
                      if (m.forEach(function(e4, t6) {
                        t6 >= a2 && (e4.match.optionality = e4.match.optionality ? e4.match.optionality + 1 : 1);
                      }), i3 = m[m.length - 1].match, void 0 !== p4 || !v3(i3, t5)) return r4;
                      g = true, h2 = e3;
                    }
                  }();
                  if (r4.isAlternator) return function() {
                    function i4(e4) {
                      for (var t5, n5 = e4.matches[0].matches ? e4.matches[0].matches.length : 1, i5 = 0; i5 < e4.matches.length && n5 === (t5 = e4.matches[i5].matches ? e4.matches[i5].matches.length : 1); i5++) ;
                      return n5 !== t5;
                    }
                    o2.hasAlternator = true;
                    var a2, v4 = r4, y2 = [], b2 = m.slice(), x2 = l4.length, _ = n4.length > 0 ? n4.shift() : -1;
                    if (-1 === _ || "string" == typeof _) {
                      var M, E = h2, j = n4.slice(), T = [];
                      if ("string" == typeof _) T = _.split(",");
                      else for (M = 0; M < v4.matches.length; M++) T.push(M.toString());
                      if (void 0 !== s2.excludes[e3]) {
                        for (var A = T.slice(), D = 0, L = s2.excludes[e3].length; D < L; D++) {
                          var C = s2.excludes[e3][D].toString().split(":");
                          l4.length == C[1] && T.splice(T.indexOf(C[0]), 1);
                        }
                        0 === T.length && (delete s2.excludes[e3], T = A);
                      }
                      (true === c2.keepStatic || isFinite(parseInt(c2.keepStatic)) && E >= c2.keepStatic) && (T = T.slice(0, 1));
                      for (var B = 0; B < T.length; B++) {
                        M = parseInt(T[B]), m = [], n4 = "string" == typeof _ && w2(h2, M, x2) || j.slice();
                        var I = v4.matches[M];
                        if (I && f2(I, [M].concat(l4), p4)) r4 = true;
                        else if (0 === B && (k = i4(v4)), I && I.matches && I.matches.length > v4.matches[0].matches.length) break;
                        a2 = m.slice(), h2 = E, m = [];
                        for (var R = 0; R < a2.length; R++) {
                          var F = a2[R], N = false;
                          F.alternation = F.alternation || x2, S2(F);
                          for (var V = 0; V < y2.length; V++) {
                            var G = y2[V];
                            if ("string" != typeof _ || void 0 !== F.alternation && T.includes(F.locator[F.alternation].toString())) {
                              if (F.match.nativeDef === G.match.nativeDef) {
                                N = true, S2(G, F);
                                break;
                              }
                              if (d(F, G, c2)) {
                                S2(F, G) && (N = true, y2.splice(y2.indexOf(G), 0, F));
                                break;
                              }
                              if (d(G, F, c2)) {
                                S2(G, F);
                                break;
                              }
                              if (P2(F, G)) {
                                O(F, G) || void 0 !== u2.inputmask.userOptions.keepStatic ? S2(F, G) && (N = true, y2.splice(y2.indexOf(G), 0, F)) : c2.keepStatic = true;
                                break;
                              }
                              if (P2(G, F)) {
                                S2(G, F);
                                break;
                              }
                            }
                          }
                          N || y2.push(F);
                        }
                      }
                      m = b2.concat(y2), h2 = e3, g = m.length > 0 && k, r4 = y2.length > 0 && !k, k && g && !r4 && m.forEach(function(e4, t5) {
                        e4.unMatchedAlternationStopped = true;
                      }), n4 = j.slice();
                    } else r4 = f2(v4.matches[_] || t4.matches[_], [_].concat(l4), p4);
                    if (r4) return true;
                  }();
                  if (r4.isQuantifier && p4 !== t4.matches[t4.matches.indexOf(r4) - 1]) return function() {
                    for (var a2 = r4, o3 = false, u3 = n4.length > 0 ? n4.shift() : 0; u3 < (isNaN(a2.quantifier.max) ? u3 + 1 : a2.quantifier.max) && h2 <= e3; u3++) {
                      var p5 = t4.matches[t4.matches.indexOf(a2) - 1];
                      if (r4 = f2(p5, [u3].concat(l4), p5)) {
                        if (m.forEach(function(t5, n5) {
                          (i3 = x(p5, t5.match) ? t5.match : m[m.length - 1].match).optionalQuantifier = u3 >= a2.quantifier.min, i3.jit = (u3 + 1) * (p5.matches.indexOf(i3) + 1) > a2.quantifier.jit, i3.optionalQuantifier && v3(i3, p5) && (g = true, h2 = e3, c2.greedy && null == s2.validPositions[e3 - 1] && u3 > a2.quantifier.min && -1 != ["*", "+"].indexOf(a2.quantifier.max) && (m.pop(), y = void 0), o3 = true, r4 = false), !o3 && i3.jit && (s2.jitOffset[e3] = p5.matches.length - p5.matches.indexOf(i3));
                        }), o3) break;
                        return true;
                      }
                    }
                  }();
                  if (r4 = b(r4, n4, l4, p4)) return true;
                } else h2++;
              }
              for (var p3 = n4.length > 0 ? n4.shift() : 0; p3 < t4.matches.length; p3++) if (true !== t4.matches[p3].isQuantifier) {
                var v2 = f2(t4.matches[p3], [p3].concat(r3), l3);
                if (v2 && h2 === e3) return v2;
                if (h2 > e3) break;
              }
            }
            function x(e4, t4) {
              var n4 = -1 != e4.matches.indexOf(t4);
              return n4 || e4.matches.forEach(function(e5, i4) {
                void 0 === e5.matches || n4 || (n4 = x(e5, t4));
              }), n4;
            }
            if (e3 > -1) {
              if (void 0 === t3) {
                for (var w, P = e3 - 1; void 0 === (w = s2.validPositions[P] || s2.tests[P]) && P > -1; ) P--;
                void 0 !== w && P > -1 && (v = function(e4, t4) {
                  var n4, i4 = [];
                  return Array.isArray(t4) || (t4 = [t4]), t4.length > 0 && (void 0 === t4[0].alternation || true === c2.keepStatic ? 0 === (i4 = f.call(o2, e4, t4.slice()).locator.slice()).length && (i4 = t4[0].locator.slice()) : t4.forEach(function(e5) {
                    "" !== e5.def && (0 === i4.length ? (n4 = e5.alternation, i4 = e5.locator.slice()) : e5.locator[n4] && -1 === i4[n4].toString().indexOf(e5.locator[n4]) && (i4[n4] += "," + e5.locator[n4]));
                  })), i4;
                }(P, w), y = v.join(""), h2 = P);
              }
              if (s2.tests[e3] && s2.tests[e3][0].cd === y) return s2.tests[e3];
              for (var S = v.shift(); S < p2.length; S++) {
                if (b(p2[S], v, [S]) && h2 === e3 || h2 > e3) break;
              }
            }
            return (0 === m.length || g) && m.push({ match: { fn: null, static: true, optionality: false, casing: null, def: "", placeholder: "" }, locator: k && 0 === m.filter(function(e4) {
              return true !== e4.unMatchedAlternationStopped;
            }).length ? [0] : [], mloc: {}, cd: y }), void 0 !== t3 && s2.tests[e3] ? r2 = l2.extend(true, [], m) : (s2.tests[e3] = l2.extend(true, [], m), r2 = s2.tests[e3]), m.forEach(function(e4) {
              e4.match.optionality = e4.match.defOptionality || false;
            }), r2;
          }
        }, 7215: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.alternate = l, t2.checkAlternationMatch = function(e3, t3, n3) {
            for (var i3, a2 = this.opts.greedy ? t3 : t3.slice(0, 1), r2 = false, o2 = void 0 !== n3 ? n3.split(",") : [], l2 = 0; l2 < o2.length; l2++) -1 !== (i3 = e3.indexOf(o2[l2])) && e3.splice(i3, 1);
            for (var s2 = 0; s2 < e3.length; s2++) if (a2.includes(e3[s2])) {
              r2 = true;
              break;
            }
            return r2;
          }, t2.handleRemove = function(e3, t3, n3, i3, s2) {
            var c2 = this, u2 = this.maskset, f2 = this.opts;
            if ((f2.numericInput || c2.isRTL) && (t3 === a.keys.Backspace ? t3 = a.keys.Delete : t3 === a.keys.Delete && (t3 = a.keys.Backspace), c2.isRTL)) {
              var p2 = n3.end;
              n3.end = n3.begin, n3.begin = p2;
            }
            var d2, h2 = r.getLastValidPosition.call(c2, void 0, true);
            n3.end >= r.getBuffer.call(c2).length && h2 >= n3.end && (n3.end = h2 + 1);
            t3 === a.keys.Backspace ? n3.end - n3.begin < 1 && (n3.begin = r.seekPrevious.call(c2, n3.begin)) : t3 === a.keys.Delete && n3.begin === n3.end && (n3.end = r.isMask.call(c2, n3.end, true, true) ? n3.end + 1 : r.seekNext.call(c2, n3.end) + 1);
            false !== (d2 = v.call(c2, n3)) && ((true !== i3 && false !== f2.keepStatic || null !== f2.regex && -1 !== o.getTest.call(c2, n3.begin).match.def.indexOf("|")) && l.call(c2, true), true !== i3 && (u2.p = t3 === a.keys.Delete ? n3.begin + d2 : n3.begin, u2.p = r.determineNewCaretPosition.call(c2, { begin: u2.p, end: u2.p }, false, false === f2.insertMode && t3 === a.keys.Backspace ? "none" : void 0).begin));
          }, t2.isComplete = c, t2.isSelection = u, t2.isValid = f, t2.refreshFromBuffer = d, t2.revalidateMask = v;
          var i2 = n2(6030), a = n2(2839), r = n2(8711), o = n2(4713);
          function l(e3, t3, n3, i3, a2, s2) {
            var c2 = this, u2 = this.dependencyLib, p2 = this.opts, d2 = c2.maskset;
            if (!c2.hasAlternator) return false;
            var h2, v2, m, g, y, k, b, x, w, P, S, O = u2.extend(true, [], d2.validPositions), _ = u2.extend(true, {}, d2.tests), M = false, E = false, j = void 0 !== a2 ? a2 : r.getLastValidPosition.call(c2);
            if (s2 && (P = s2.begin, S = s2.end, s2.begin > s2.end && (P = s2.end, S = s2.begin)), -1 === j && void 0 === a2) h2 = 0, v2 = (g = o.getTest.call(c2, h2)).alternation;
            else for (; j >= 0; j--) if ((m = d2.validPositions[j]) && void 0 !== m.alternation) {
              if (j <= (e3 || 0) && g && g.locator[m.alternation] !== m.locator[m.alternation]) break;
              h2 = j, v2 = d2.validPositions[h2].alternation, g = m;
            }
            if (void 0 !== v2) {
              b = parseInt(h2), d2.excludes[b] = d2.excludes[b] || [], true !== e3 && d2.excludes[b].push((0, o.getDecisionTaker)(g) + ":" + g.alternation);
              var T = [], A = -1;
              for (y = b; b < r.getLastValidPosition.call(c2, void 0, true) + 1; y++) -1 === A && e3 <= y && void 0 !== t3 && (T.push(t3), A = T.length - 1), (k = d2.validPositions[b]) && true !== k.generatedInput && (void 0 === s2 || y < P || y >= S) && T.push(k.input), d2.validPositions.splice(b, 1);
              for (-1 === A && void 0 !== t3 && (T.push(t3), A = T.length - 1); void 0 !== d2.excludes[b] && d2.excludes[b].length < 10; ) {
                for (d2.tests = {}, r.resetMaskSet.call(c2, true), M = true, y = 0; y < T.length && (x = M.caret || 0 == p2.insertMode && null != x ? r.seekNext.call(c2, x) : r.getLastValidPosition.call(c2, void 0, true) + 1, w = T[y], M = f.call(c2, x, w, false, i3, true)); y++) y === A && (E = M), 1 == e3 && M && (E = { caretPos: y });
                if (M) break;
                if (r.resetMaskSet.call(c2), g = o.getTest.call(c2, b), d2.validPositions = u2.extend(true, [], O), d2.tests = u2.extend(true, {}, _), !d2.excludes[b]) {
                  E = l.call(c2, e3, t3, n3, i3, b - 1, s2);
                  break;
                }
                if (null != g.alternation) {
                  var D = (0, o.getDecisionTaker)(g);
                  if (-1 !== d2.excludes[b].indexOf(D + ":" + g.alternation)) {
                    E = l.call(c2, e3, t3, n3, i3, b - 1, s2);
                    break;
                  }
                  for (d2.excludes[b].push(D + ":" + g.alternation), y = b; y < r.getLastValidPosition.call(c2, void 0, true) + 1; y++) d2.validPositions.splice(b);
                } else delete d2.excludes[b];
              }
            }
            return E && false === p2.keepStatic || delete d2.excludes[b], E;
          }
          function s(e3, t3, n3) {
            var i3 = this.opts, r2 = this.maskset;
            switch (i3.casing || t3.casing) {
              case "upper":
                e3 = e3.toUpperCase();
                break;
              case "lower":
                e3 = e3.toLowerCase();
                break;
              case "title":
                var o2 = r2.validPositions[n3 - 1];
                e3 = 0 === n3 || o2 && o2.input === String.fromCharCode(a.keyCode.Space) ? e3.toUpperCase() : e3.toLowerCase();
                break;
              default:
                if ("function" == typeof i3.casing) {
                  var l2 = Array.prototype.slice.call(arguments);
                  l2.push(r2.validPositions), e3 = i3.casing.apply(this, l2);
                }
            }
            return e3;
          }
          function c(e3) {
            var t3 = this, n3 = this.opts, i3 = this.maskset;
            if ("function" == typeof n3.isComplete) return n3.isComplete(e3, n3);
            if ("*" !== n3.repeat) {
              var a2 = false, l2 = r.determineLastRequiredPosition.call(t3, true), s2 = l2.l;
              if (void 0 === l2.def || l2.def.newBlockMarker || l2.def.optionality || l2.def.optionalQuantifier) {
                a2 = true;
                for (var c2 = 0; c2 <= s2; c2++) {
                  var u2 = o.getTestTemplate.call(t3, c2).match;
                  if (true !== u2.static && void 0 === i3.validPositions[c2] && (false === u2.optionality || void 0 === u2.optionality || u2.optionality && 0 == u2.newBlockMarker) && (false === u2.optionalQuantifier || void 0 === u2.optionalQuantifier) || true === u2.static && "" != u2.def && e3[c2] !== o.getPlaceholder.call(t3, c2, u2)) {
                    a2 = false;
                    break;
                  }
                }
              }
              return a2;
            }
          }
          function u(e3) {
            var t3 = this.opts.insertMode ? 0 : 1;
            return this.isRTL ? e3.begin - e3.end > t3 : e3.end - e3.begin > t3;
          }
          function f(e3, t3, n3, i3, a2, p2, m) {
            var g = this, y = this.dependencyLib, k = this.opts, b = g.maskset;
            n3 = true === n3;
            var x = e3;
            function w(e4) {
              if (void 0 !== e4) {
                if (void 0 !== e4.remove && (Array.isArray(e4.remove) || (e4.remove = [e4.remove]), e4.remove.sort(function(e5, t5) {
                  return g.isRTL ? e5.pos - t5.pos : t5.pos - e5.pos;
                }).forEach(function(e5) {
                  v.call(g, { begin: e5, end: e5 + 1 });
                }), e4.remove = void 0), void 0 !== e4.insert && (Array.isArray(e4.insert) || (e4.insert = [e4.insert]), e4.insert.sort(function(e5, t5) {
                  return g.isRTL ? t5.pos - e5.pos : e5.pos - t5.pos;
                }).forEach(function(e5) {
                  "" !== e5.c && f.call(g, e5.pos, e5.c, void 0 === e5.strict || e5.strict, void 0 !== e5.fromIsValid ? e5.fromIsValid : i3);
                }), e4.insert = void 0), e4.refreshFromBuffer && e4.buffer) {
                  var t4 = e4.refreshFromBuffer;
                  d.call(g, true === t4 ? t4 : t4.start, t4.end, e4.buffer), e4.refreshFromBuffer = void 0;
                }
                void 0 !== e4.rewritePosition && (x = e4.rewritePosition, e4 = true);
              }
              return e4;
            }
            function P(t4, n4, a3) {
              var l2 = false;
              return o.getTests.call(g, t4).every(function(c2, f2) {
                var p3 = c2.match;
                if (r.getBuffer.call(g, true), false !== (l2 = (!p3.jit || void 0 !== b.validPositions[r.seekPrevious.call(g, t4)]) && (null != p3.fn ? p3.fn.test(n4, b, t4, a3, k, u.call(g, e3)) : (n4 === p3.def || n4 === k.skipOptionalPartCharacter) && "" !== p3.def && { c: o.getPlaceholder.call(g, t4, p3, true) || p3.def, pos: t4 }))) {
                  var d2 = void 0 !== l2.c ? l2.c : n4, h2 = t4;
                  return d2 = d2 === k.skipOptionalPartCharacter && true === p3.static ? o.getPlaceholder.call(g, t4, p3, true) || p3.def : d2, true !== (l2 = w(l2)) && void 0 !== l2.pos && l2.pos !== t4 && (h2 = l2.pos), true !== l2 && void 0 === l2.pos && void 0 === l2.c ? false : (false === v.call(g, e3, y.extend({}, c2, { input: s.call(g, d2, p3, h2) }), i3, h2) && (l2 = false), false);
                }
                return true;
              }), l2;
            }
            void 0 !== e3.begin && (x = g.isRTL ? e3.end : e3.begin);
            var S = true, O = y.extend(true, [], b.validPositions);
            if (false === k.keepStatic && void 0 !== b.excludes[x] && true !== a2 && true !== i3) for (var _ = x; _ < (g.isRTL ? e3.begin : e3.end); _++) void 0 !== b.excludes[_] && (b.excludes[_] = void 0, delete b.tests[_]);
            if ("function" == typeof k.preValidation && true !== i3 && true !== p2 && (S = w(S = k.preValidation.call(g, r.getBuffer.call(g), x, t3, u.call(g, e3), k, b, e3, n3 || a2))), true === S) {
              if (S = P(x, t3, n3), (!n3 || true === i3) && false === S && true !== p2) {
                var M = b.validPositions[x];
                if (!M || true !== M.match.static || M.match.def !== t3 && t3 !== k.skipOptionalPartCharacter) {
                  if (k.insertMode || void 0 === b.validPositions[r.seekNext.call(g, x)] || e3.end > x) {
                    var E = false;
                    if (b.jitOffset[x] && void 0 === b.validPositions[r.seekNext.call(g, x)] && false !== (S = f.call(g, x + b.jitOffset[x], t3, true, true)) && (true !== a2 && (S.caret = x), E = true), e3.end > x && (b.validPositions[x] = void 0), !E && !r.isMask.call(g, x, k.keepStatic && 0 === x)) {
                      for (var j = x + 1, T = r.seekNext.call(g, x, false, 0 !== x); j <= T; j++) if (false !== (S = P(j, t3, n3))) {
                        S = h.call(g, x, void 0 !== S.pos ? S.pos : j) || S, x = j;
                        break;
                      }
                    }
                  }
                } else S = { caret: r.seekNext.call(g, x) };
              }
              g.hasAlternator && true !== a2 && !n3 && (a2 = true, false === S && k.keepStatic && (c.call(g, r.getBuffer.call(g)) || 0 === x) ? S = l.call(g, x, t3, n3, i3, void 0, e3) : (u.call(g, e3) && b.tests[x] && b.tests[x].length > 1 && k.keepStatic || 1 == S && true !== k.numericInput && b.tests[x] && b.tests[x].length > 1 && r.getLastValidPosition.call(g, void 0, true) > x) && (S = l.call(g, true))), true === S && (S = { pos: x });
            }
            if ("function" == typeof k.postValidation && true !== i3 && true !== p2) {
              var A = k.postValidation.call(g, r.getBuffer.call(g, true), void 0 !== e3.begin ? g.isRTL ? e3.end : e3.begin : e3, t3, S, k, b, n3, m);
              void 0 !== A && (S = true === A ? S : A);
            }
            S && void 0 === S.pos && (S.pos = x), false === S || true === p2 ? (r.resetMaskSet.call(g, true), b.validPositions = y.extend(true, [], O)) : h.call(g, void 0, x, true);
            var D = w(S);
            void 0 !== g.maxLength && (r.getBuffer.call(g).length > g.maxLength && !i3 && (r.resetMaskSet.call(g, true), b.validPositions = y.extend(true, [], O), D = false));
            return D;
          }
          function p(e3, t3, n3) {
            for (var i3 = this.maskset, a2 = false, r2 = o.getTests.call(this, e3), l2 = 0; l2 < r2.length; l2++) {
              if (r2[l2].match && (r2[l2].match.nativeDef === t3.match[n3.shiftPositions ? "def" : "nativeDef"] && (!n3.shiftPositions || !t3.match.static) || r2[l2].match.nativeDef === t3.match.nativeDef || n3.regex && !r2[l2].match.static && r2[l2].match.fn.test(t3.input, i3, e3, false, n3))) {
                a2 = true;
                break;
              }
              if (r2[l2].match && r2[l2].match.def === t3.match.nativeDef) {
                a2 = void 0;
                break;
              }
            }
            return false === a2 && void 0 !== i3.jitOffset[e3] && (a2 = p.call(this, e3 + i3.jitOffset[e3], t3, n3)), a2;
          }
          function d(e3, t3, n3) {
            var a2, o2, l2 = this, s2 = this.maskset, c2 = this.opts, u2 = this.dependencyLib, f2 = c2.skipOptionalPartCharacter, p2 = l2.isRTL ? n3.slice().reverse() : n3;
            if (c2.skipOptionalPartCharacter = "", true === e3) r.resetMaskSet.call(l2, false), e3 = 0, t3 = n3.length, o2 = r.determineNewCaretPosition.call(l2, { begin: 0, end: 0 }, false).begin;
            else {
              for (a2 = e3; a2 < t3; a2++) s2.validPositions.splice(e3, 0);
              o2 = e3;
            }
            var d2 = new u2.Event("keypress");
            for (a2 = e3; a2 < t3; a2++) {
              d2.key = p2[a2].toString(), l2.ignorable = false;
              var h2 = i2.EventHandlers.keypressEvent.call(l2, d2, true, false, false, o2);
              false !== h2 && void 0 !== h2 && (o2 = h2.forwardPosition);
            }
            c2.skipOptionalPartCharacter = f2;
          }
          function h(e3, t3, n3) {
            var i3 = this, a2 = this.maskset, l2 = this.dependencyLib;
            if (void 0 === e3) for (e3 = t3 - 1; e3 > 0 && !a2.validPositions[e3]; e3--) ;
            for (var s2 = e3; s2 < t3; s2++) {
              if (void 0 === a2.validPositions[s2] && !r.isMask.call(i3, s2, false)) {
                if (0 == s2 ? o.getTest.call(i3, s2) : a2.validPositions[s2 - 1]) {
                  var c2 = o.getTests.call(i3, s2).slice();
                  "" === c2[c2.length - 1].match.def && c2.pop();
                  var u2, p2 = o.determineTestTemplate.call(i3, s2, c2);
                  if (p2 && (true !== p2.match.jit || "master" === p2.match.newBlockMarker && (u2 = a2.validPositions[s2 + 1]) && true === u2.match.optionalQuantifier) && ((p2 = l2.extend({}, p2, { input: o.getPlaceholder.call(i3, s2, p2.match, true) || p2.match.def })).generatedInput = true, v.call(i3, s2, p2, true), true !== n3)) {
                    var d2 = a2.validPositions[t3].input;
                    return a2.validPositions[t3] = void 0, f.call(i3, t3, d2, true, true);
                  }
                }
              }
            }
          }
          function v(e3, t3, n3, i3) {
            var a2 = this, l2 = this.maskset, s2 = this.opts, c2 = this.dependencyLib;
            function d2(e4, t4, n4) {
              var i4 = t4[e4];
              if (void 0 !== i4 && true === i4.match.static && true !== i4.match.optionality && (void 0 === t4[0] || void 0 === t4[0].alternation)) {
                var a3 = n4.begin <= e4 - 1 ? t4[e4 - 1] && true === t4[e4 - 1].match.static && t4[e4 - 1] : t4[e4 - 1], r2 = n4.end > e4 + 1 ? t4[e4 + 1] && true === t4[e4 + 1].match.static && t4[e4 + 1] : t4[e4 + 1];
                return a3 && r2;
              }
              return false;
            }
            var h2 = 0, v2 = void 0 !== e3.begin ? e3.begin : e3, m = void 0 !== e3.end ? e3.end : e3, g = true;
            if (e3.begin > e3.end && (v2 = e3.end, m = e3.begin), i3 = void 0 !== i3 ? i3 : v2, void 0 === n3 && (v2 !== m || s2.insertMode && void 0 !== l2.validPositions[i3] || void 0 === t3 || t3.match.optionalQuantifier || t3.match.optionality)) {
              var y, k = c2.extend(true, [], l2.validPositions), b = r.getLastValidPosition.call(a2, void 0, true);
              l2.p = v2;
              var x = u.call(a2, e3) ? v2 : i3;
              for (y = b; y >= x; y--) l2.validPositions.splice(y, 1), void 0 === t3 && delete l2.tests[y + 1];
              var w, P, S = i3, O = S;
              for (t3 && (l2.validPositions[i3] = c2.extend(true, {}, t3), O++, S++), null == k[m] && l2.jitOffset[m] && (m += l2.jitOffset[m] + 1), y = t3 ? m : m - 1; y <= b; y++) {
                if (void 0 !== (w = k[y]) && true !== w.generatedInput && (y >= m || y >= v2 && d2(y, k, { begin: v2, end: m }))) {
                  for (; "" !== o.getTest.call(a2, O).match.def; ) {
                    if (false !== (P = p.call(a2, O, w, s2)) || "+" === w.match.def) {
                      "+" === w.match.def && r.getBuffer.call(a2, true);
                      var _ = f.call(a2, O, w.input, "+" !== w.match.def, true);
                      if (g = false !== _, S = (_.pos || O) + 1, !g && P) break;
                    } else g = false;
                    if (g) {
                      void 0 === t3 && w.match.static && y === e3.begin && h2++;
                      break;
                    }
                    if (!g && r.getBuffer.call(a2), O > l2.maskLength) break;
                    O++;
                  }
                  "" == o.getTest.call(a2, O).match.def && (g = false), O = S;
                }
                if (!g) break;
              }
              if (!g) return l2.validPositions = c2.extend(true, [], k), r.resetMaskSet.call(a2, true), false;
            } else t3 && o.getTest.call(a2, i3).match.cd === t3.match.cd && (l2.validPositions[i3] = c2.extend(true, {}, t3));
            return r.resetMaskSet.call(a2, true), h2;
          }
        } }, t = {};
        function n(i2) {
          var a = t[i2];
          if (void 0 !== a) return a.exports;
          var r = t[i2] = { exports: {} };
          return e[i2](r, r.exports, n), r.exports;
        }
        var i = {};
        return function() {
          var e2 = i;
          Object.defineProperty(e2, "__esModule", { value: true }), e2.default = void 0, n(7149), n(3194), n(9302), n(4013), n(3851), n(219), n(207), n(5296);
          var t2, a = (t2 = n(2394)) && t2.__esModule ? t2 : { default: t2 };
          e2.default = a.default;
        }(), i;
      }();
    });
  })(inputmask_min$1);
  return inputmask_min$1.exports;
}
requireInputmask_min();
function inputMask() {
  const inputMasks = document.querySelectorAll("input[data-fls-input-mask]");
  inputMasks.forEach((inputMask2) => {
    Inputmask({ "mask": `${inputMask2.dataset.flsInputMask}` }).mask(inputMask2);
  });
}
document.querySelector("input[data-fls-input-mask]") ? window.addEventListener("load", inputMask) : null;
function formInit() {
  function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
      for (const form of forms) {
        !form.hasAttribute("data-fls-form-novalidate") ? form.setAttribute("novalidate", true) : null;
        form.addEventListener("submit", function(e) {
          const form2 = e.target;
          formSubmitAction(form2, e);
        });
        form.addEventListener("reset", function(e) {
          const form2 = e.target;
          formValidate.formClean(form2);
        });
      }
    }
    async function formSubmitAction(form, e) {
      const error = formValidate.getErrors(form);
      if (error === 0) {
        if (form.dataset.flsForm === "ajax") {
          e.preventDefault();
          const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
          const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
          const formData = new FormData(form);
          form.classList.add("--sending");
          const response = await fetch(formAction, {
            method: formMethod,
            body: formData
          });
          if (response.ok) {
            let responseResult = await response.json();
            form.classList.remove("--sending");
            formSent(form, responseResult);
          } else {
            form.classList.remove("--sending");
          }
        } else if (form.dataset.flsForm === "dev") {
          e.preventDefault();
          formSent(form);
        }
      } else {
        e.preventDefault();
        if (form.querySelector(".--form-error") && form.hasAttribute("data-fls-form-gotoerr")) {
          const formGoToErrorClass = form.dataset.flsFormGotoerr ? form.dataset.flsFormGotoerr : ".--form-error";
          gotoBlock(formGoToErrorClass);
        }
      }
    }
    function formSent(form, responseResult = ``) {
      document.dispatchEvent(new CustomEvent("formSent", {
        detail: {
          form
        }
      }));
      setTimeout(() => {
        if (window.flsPopup) {
          const popup = form.dataset.flsFormPopup;
          popup ? window.flsPopup.open(popup) : null;
        }
      }, 0);
      formValidate.formClean(form);
    }
  }
  function formFieldsInit() {
    document.body.addEventListener("focusin", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.add("--form-focus");
          targetElement.parentElement.classList.add("--form-focus");
        }
        formValidate.removeError(targetElement);
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.removeError(targetElement) : null;
      }
    });
    document.body.addEventListener("focusout", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.remove("--form-focus");
          targetElement.parentElement.classList.remove("--form-focus");
        }
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.validateInput(targetElement) : null;
      }
    });
  }
  formSubmit();
  formFieldsInit();
}
document.querySelector("[data-fls-form]") ? window.addEventListener("load", formInit) : null;
