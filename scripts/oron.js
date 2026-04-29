gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

const easeFade = CustomEase.create("fade", "M0,0 C0.25,0.1 0.25,1 1,1");

// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

function has(selector) {
  return document.querySelector(selector) !== null;
}

function initPixelatedScrollTransition() {
  // Defaults — edit these to change fallbacks if no data-attribute is added
  const defaultColumns = 12;
  const defaultRows = 6;
  const defaultMode = "cover";
  const defaultScrollStart = { cover: "bottom 60%", reveal: "top bottom" };
  const defaultScrollEnd = { cover: "bottom top", reveal: "top center" };
  const defaultScrub = 0.3;
  const defaultPixelDuration = 0.1;
  const defaultStaggerAmount = 1.5;

  // Class names applied to generated elements
  const panelClass = "pixelated-scroll-transition__panel";
  const columnClass = "pixelated-scroll-transition__col";
  const pixelClass = "pixelated-scroll-transition__pixel";

  // Breakpoints
  const breakpoints = {
    mobile: "(max-width: 478px)",
    landscape: "(max-width: 767px)",
    tablet: "(max-width: 991px)",
  };

  const instances = [];
  let mm = null;

  function getColumns(wrapper) {
    const base = parseInt(wrapper.dataset.columns, 10) || defaultColumns;

    if (window.matchMedia(breakpoints.mobile).matches) {
      return (
        parseInt(wrapper.dataset.columnsMobile, 10) ||
        Math.max(4, Math.round(base * 0.4))
      );
    }
    if (window.matchMedia(breakpoints.landscape).matches) {
      return (
        parseInt(wrapper.dataset.columnsLandscape, 10) ||
        Math.max(6, Math.round(base * 0.6))
      );
    }
    if (window.matchMedia(breakpoints.tablet).matches) {
      return (
        parseInt(wrapper.dataset.columnsTablet, 10) ||
        Math.max(8, Math.round(base * 0.75))
      );
    }
    return base;
  }

  function getMode(wrapper) {
    return wrapper.dataset.mode === "reveal" ? "reveal" : defaultMode;
  }

  function getRows(wrapper) {
    const base = parseInt(wrapper.dataset.rows, 10) || defaultRows;

    if (window.matchMedia(breakpoints.mobile).matches) {
      return parseInt(wrapper.dataset.rowsMobile, 10) || base;
    }
    if (window.matchMedia(breakpoints.landscape).matches) {
      return parseInt(wrapper.dataset.rowsLandscape, 10) || base;
    }
    if (window.matchMedia(breakpoints.tablet).matches) {
      return parseInt(wrapper.dataset.rowsTablet, 10) || base;
    }
    return base;
  }

  function getScrollStart(wrapper, mode) {
    return wrapper.dataset.scrollStart || defaultScrollStart[mode];
  }

  function getScrollEnd(wrapper, mode) {
    return wrapper.dataset.scrollEnd || defaultScrollEnd[mode];
  }

  function createCol() {
    const col = document.createElement("div");
    col.classList.add(columnClass);
    col.setAttribute("data-pixelated-scroll-column", "");
    return col;
  }

  function createPixel() {
    const pixel = document.createElement("div");
    pixel.classList.add(pixelClass);
    pixel.setAttribute("data-pixelated-scroll-pixel", "");
    return pixel;
  }

  function buildGrid(wrapper, cols, rows) {
    const panel = document.createElement("div");
    panel.classList.add(panelClass);
    panel.setAttribute("data-pixelated-scroll-panel", "");

    const fragment = document.createDocumentFragment();
    for (let c = 0; c < cols; c++) {
      const col = createCol();
      for (let r = 0; r < rows; r++) {
        col.appendChild(createPixel());
      }
      fragment.appendChild(col);
    }
    panel.appendChild(fragment);
    wrapper.appendChild(panel);

    return { panel };
  }

  function collectCells(panel, cols, rows, mode) {
    const columns = panel.querySelectorAll("[data-pixelated-scroll-column]");
    const cellData = [];

    for (let r = 0; r < rows; r++) {
      columns.forEach((col, c) => {
        const pixel = col.children[r];
        if (!pixel) return;

        const dist = rows - 1 - r;
        const priority =
          dist * 50 + Math.random() * 300 + Math.sin(c * 0.3) * 30;

        cellData.push({ element: pixel, priority });
      });
    }

    cellData.sort((a, b) => a.priority - b.priority);
    return cellData.map((d) => d.element);
  }

  function createAnimation(wrapper, cells, section, mode) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: getScrollStart(wrapper, mode),
        end: getScrollEnd(wrapper, mode),
        scrub: defaultScrub,
        invalidateOnRefresh: true,
      },
    });

    const fromAlpha = mode === "cover" ? 0 : 1;
    const toAlpha = mode === "cover" ? 1 : 0;

    gsap.set(cells, { autoAlpha: fromAlpha });
    tl.to(cells, {
      autoAlpha: toAlpha,
      duration: defaultPixelDuration,
      stagger: { amount: defaultStaggerAmount, from: "start" },
      ease: "none",
    });

    return tl;
  }

  function setupInstance(wrapper) {
    const section = wrapper.closest("section") || wrapper.parentElement;
    const cols = getColumns(wrapper);
    const rows = getRows(wrapper);
    const mode = getMode(wrapper);

    const { panel } = buildGrid(wrapper, cols, rows);
    const cells = collectCells(panel, cols, rows, mode);
    const tl = createAnimation(wrapper, cells, section, mode);

    return { wrapper, tl };
  }

  function destroyInstance(instance) {
    if (instance.tl) {
      instance.tl.scrollTrigger?.kill();
      instance.tl.kill();
    }
    const panel = instance.wrapper.querySelector(
      "[data-pixelated-scroll-panel]"
    );
    if (panel) panel.remove();
  }

  function buildAll() {
    const wrappers = document.querySelectorAll(
      "[data-pixelated-scroll-transition]"
    );
    wrappers.forEach((wrapper) => {
      instances.push(setupInstance(wrapper));
    });
    ScrollTrigger.refresh();
  }

  function destroyAll() {
    instances.forEach(destroyInstance);
    instances.length = 0;
  }

  const wrappers = document.querySelectorAll(
    "[data-pixelated-scroll-transition]"
  );
  if (!wrappers.length) return;

  mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 992px)",
      isTablet: "(min-width: 768px) and (max-width: 991px)",
      isLandscape: "(min-width: 479px) and (max-width: 767px)",
      isMobile: "(max-width: 478px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      if (context.conditions.reduceMotion) return;

      buildAll();

      return () => {
        destroyAll();
      };
    }
  );
}

function initDraggableMarquee() {
  const wrappers = document.querySelectorAll("[data-draggable-marquee-init]");

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized")
      return;

    const collection = wrapper.querySelector(
      "[data-draggable-marquee-collection]"
    );
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, "data-duration", 20);
    const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
    const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute("data-draggable-marquee-clone", "");
      listClone.setAttribute("aria-hidden", "true");
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);

    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px",
      },
    });

    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (
      wrapper.getAttribute("data-direction") || "left"
    ).toLowerCase();
    const baseDirection = initialDirectionAttr === "right" ? -1 : 1;

    const timeScale = { value: 1 };

    timeScale.value = baseDirection;
    wrapper.setAttribute(
      "data-direction",
      baseDirection < 0 ? "right" : "left"
    );

    if (baseDirection < 0) marqueeLoop.progress(1);

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute(
        "data-direction",
        timeScale.value < 0 ? "right" : "left"
      );
    }

    applyTimeScale();

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity;
        velocityTimeScale = gsap.utils.clamp(
          -multiplier,
          multiplier,
          velocityTimeScale
        );

        gsap.killTweensOf(timeScale);

        const restingDirection = velocityTimeScale < 0 ? -1 : 1;

        gsap
          .timeline({ onUpdate: applyTimeScale })
          .to(timeScale, {
            value: velocityTimeScale,
            duration: 0.1,
            overwrite: true,
          })
          .to(timeScale, { value: restingDirection, duration: 1.0 });
      },
    });

    // Pause marquee when scrolled out of view
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        marqueeLoop.resume();
        applyTimeScale();
        marqueeObserver.enable();
      },
      onEnterBack: () => {
        marqueeLoop.resume();
        applyTimeScale();
        marqueeObserver.enable();
      },
      onLeave: () => {
        marqueeLoop.pause();
        marqueeObserver.disable();
      },
      onLeaveBack: () => {
        marqueeLoop.pause();
        marqueeObserver.disable();
      },
    });

    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
  });
}

function initStickyStepsBasic() {
  const containers = document.querySelectorAll("[data-sticky-steps-init]");
  if (!containers.length) return;

  containers.forEach((container) => {
    const items = [...container.querySelectorAll("[data-sticky-steps-item]")];
    if (!items.length) return;

    function updateSteps() {
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const anchor = item.querySelector("[data-sticky-steps-anchor]");
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const anchorCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - anchorCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      items.forEach((item, index) => {
        let status = "active";

        if (index < closestIndex) status = "before";
        if (index > closestIndex) status = "after";

        item.setAttribute("data-sticky-steps-item-status", status);
      });
    }

    window.addEventListener("scroll", updateSteps);
    window.addEventListener("resize", updateSteps);

    requestAnimationFrame(updateSteps);
  });
}

function initDirectionalButtonHover() {
  // Button hover animation
  document.querySelectorAll("[data-btn-hover]").forEach((button) => {
    button.addEventListener("mouseenter", handleHover);
    button.addEventListener("mouseleave", handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Get the button's dimensions and center
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const buttonCenterX = buttonRect.left + buttonWidth / 2;
    const buttonCenterY = buttonRect.top + buttonHeight / 2;

    // Calculate mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Offset from the top-left corner in percentage
    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

    // Offset from the center in percentage
    let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;

    // Convert to absolute values
    offsetXFromCenter = Math.abs(offsetXFromCenter);

    // Update position and size of .btn__circle
    const circle = button.querySelector(".btn__circle");
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
    }
  }
}

function initAccordionCSS() {
  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== singleAccordion)
                sibling.setAttribute("data-accordion-status", "not-active");
            });
        }
      });
    });
}

// function initTabSystem() {
//   const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

//   wrappers.forEach((wrapper) => {
//     const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
//     const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

//     let activeContent = null;
//     let activeVisual = null;
//     let isAnimating = false;

//     function switchTab(index) {
//       if (isAnimating || contentItems[index] === activeContent) return;

//       isAnimating = true;

//       const outgoingContent = activeContent;
//       const outgoingVisual = activeVisual;

//       const incomingContent = contentItems[index];
//       const incomingVisual = visualItems[index];

//       const tl = gsap.timeline({
//         defaults: { duration: 0.65, ease: "power3" },
//         onComplete: () => {
//           activeContent = incomingContent;
//           activeVisual = incomingVisual;
//           isAnimating = false;

//           requestAnimationFrame(() => {
//             ScrollTrigger.refresh();
//           });
//         },
//       });

//       // OUT
//       if (outgoingContent) {
//         outgoingContent.classList.remove("active");
//         outgoingVisual?.classList.remove("active");

//         tl.to(outgoingVisual, { autoAlpha: 0, yPercent: 3 }, 0).to(
//           outgoingContent.querySelector('[data-tabs="item-details"]'),
//           { height: 0 },
//           0
//         );
//       }

//       // IN
//       incomingContent.classList.add("active");
//       incomingVisual.classList.add("active");

//       tl.fromTo(
//         incomingVisual,
//         { autoAlpha: 0, yPercent: 3 },
//         { autoAlpha: 1, yPercent: 0 },
//         0.3
//       ).fromTo(
//         incomingContent.querySelector('[data-tabs="item-details"]'),
//         { height: 0 },
//         { height: "auto" },
//         0
//       );
//     }

//     // init first tab
//     switchTab(0);

//     // click events
//     contentItems.forEach((item, i) =>
//       item.addEventListener("click", () => {
//         if (item === activeContent) return;
//         switchTab(i);
//       })
//     );
//   });
// }

function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

  const hashMap = {
    "#farmers": "farmer",
    "#investors": "investor",
  };

  const currentHash = window.location.hash;
  const targetType = hashMap[currentHash];

  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

    let activeContent = null;
    let activeVisual = null;
    let isAnimating = false;

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;

      isAnimating = true;

      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;

      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];

      const tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power2.out" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;

          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        },
      });

      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");

        tl.to(outgoingVisual, { autoAlpha: 0, y: 32 }, 0);
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");

      tl.fromTo(
        incomingVisual,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0 },
        0.3
      );
    }

    let initialIndex = 0;

    if (wrapper.hasAttribute("data-tabs-hash") && targetType) {
      contentItems.forEach((item, i) => {
        if (item.getAttribute("data-type") === targetType) {
          initialIndex = i;
        }
      });
    }

    switchTab(initialIndex);

    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return;
        switchTab(i);
      })
    );
  });
}

function initAdvancedFormValidation() {
  const forms = document.querySelectorAll("[data-form-validate]");

  forms.forEach((formContainer) => {
    const startTime = new Date().getTime();

    const form = formContainer.querySelector("form");
    if (!form) return;

    const validateFields = form.querySelectorAll("[data-validate]");
    const dataSubmit = form.querySelector("[data-submit]");
    if (!dataSubmit) return;

    const realSubmitInput = dataSubmit.querySelector('input[type="submit"]');
    if (!realSubmitInput) return;

    function isSpam() {
      const currentTime = new Date().getTime();
      return currentTime - startTime < 5000;
    }

    // Disable select options with invalid values on page load
    validateFields.forEach(function (fieldGroup) {
      const select = fieldGroup.querySelector("select");
      if (select) {
        const options = select.querySelectorAll("option");
        options.forEach(function (option) {
          if (
            option.value === "" ||
            option.value === "disabled" ||
            option.value === "null" ||
            option.value === "false"
          ) {
            option.setAttribute("disabled", "disabled");
          }
        });
      }
    });

    function validateAndStartLiveValidationForAll() {
      let allValid = true;
      let firstInvalidField = null;

      validateFields.forEach(function (fieldGroup) {
        const input = fieldGroup.querySelector("input, textarea, select");
        const radioCheckGroup = fieldGroup.querySelector(
          "[data-radiocheck-group]"
        );
        if (!input && !radioCheckGroup) return;

        if (input) input.__validationStarted = true;
        if (radioCheckGroup) {
          radioCheckGroup.__validationStarted = true;
          const inputs = radioCheckGroup.querySelectorAll(
            'input[type="radio"], input[type="checkbox"]'
          );
          inputs.forEach(function (input) {
            input.__validationStarted = true;
          });
        }

        updateFieldStatus(fieldGroup);

        if (!isValid(fieldGroup)) {
          allValid = false;
          if (!firstInvalidField) {
            firstInvalidField = input || radioCheckGroup.querySelector("input");
          }
        }
      });

      if (!allValid && firstInvalidField) {
        firstInvalidField.focus();
      }

      return allValid;
    }

    function isValid(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );
      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        const checkedInputs = radioCheckGroup.querySelectorAll("input:checked");
        const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;
        const max =
          parseInt(radioCheckGroup.getAttribute("max")) || inputs.length;
        const checkedCount = checkedInputs.length;

        if (inputs[0].type === "radio") {
          return checkedCount >= 1;
        } else {
          if (inputs.length === 1) {
            return inputs[0].checked;
          } else {
            return checkedCount >= min && checkedCount <= max;
          }
        }
      } else {
        const input = fieldGroup.querySelector("input, textarea, select");
        if (!input) return false;

        let valid = true;
        const min = parseInt(input.getAttribute("min")) || 0;
        const max = parseInt(input.getAttribute("max")) || Infinity;
        const value = input.value.trim();
        const length = value.length;

        if (input.tagName.toLowerCase() === "select") {
          if (
            value === "" ||
            value === "disabled" ||
            value === "null" ||
            value === "false"
          ) {
            valid = false;
          }
        } else if (input.type === "email") {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          valid = emailPattern.test(value);
        } else {
          if (input.hasAttribute("min") && length < min) valid = false;
          if (input.hasAttribute("max") && length > max) valid = false;
        }

        return valid;
      }
    }

    function updateFieldStatus(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );
      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        const checkedInputs = radioCheckGroup.querySelectorAll("input:checked");

        if (checkedInputs.length > 0) {
          fieldGroup.classList.add("is--filled");
        } else {
          fieldGroup.classList.remove("is--filled");
        }

        const valid = isValid(fieldGroup);

        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          const anyInputValidationStarted = Array.from(inputs).some(
            (input) => input.__validationStarted
          );
          if (anyInputValidationStarted) {
            fieldGroup.classList.add("is--error");
          } else {
            fieldGroup.classList.remove("is--error");
          }
        }
      } else {
        const input = fieldGroup.querySelector("input, textarea, select");
        if (!input) return;

        const value = input.value.trim();

        if (value) {
          fieldGroup.classList.add("is--filled");
        } else {
          fieldGroup.classList.remove("is--filled");
        }

        const valid = isValid(fieldGroup);

        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          if (input.__validationStarted) {
            fieldGroup.classList.add("is--error");
          } else {
            fieldGroup.classList.remove("is--error");
          }
        }
      }
    }

    validateFields.forEach(function (fieldGroup) {
      const input = fieldGroup.querySelector("input, textarea, select");
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );

      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        inputs.forEach(function (input) {
          input.__validationStarted = false;

          input.addEventListener("change", function () {
            requestAnimationFrame(function () {
              if (!input.__validationStarted) {
                const checkedCount =
                  radioCheckGroup.querySelectorAll("input:checked").length;
                const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;

                if (checkedCount >= min) {
                  input.__validationStarted = true;
                }
              }

              if (input.__validationStarted) {
                updateFieldStatus(fieldGroup);
              }
            });
          });

          input.addEventListener("blur", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        });
      } else if (input) {
        input.__validationStarted = false;

        if (input.tagName.toLowerCase() === "select") {
          input.addEventListener("change", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        } else {
          input.addEventListener("input", function () {
            const value = input.value.trim();
            const length = value.length;
            const min = parseInt(input.getAttribute("min")) || 0;
            const max = parseInt(input.getAttribute("max")) || Infinity;

            if (!input.__validationStarted) {
              if (input.type === "email") {
                if (isValid(fieldGroup)) input.__validationStarted = true;
              } else {
                if (
                  (input.hasAttribute("min") && length >= min) ||
                  (input.hasAttribute("max") && length <= max)
                ) {
                  input.__validationStarted = true;
                }
              }
            }

            if (input.__validationStarted) {
              updateFieldStatus(fieldGroup);
            }
          });

          input.addEventListener("blur", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        }
      }
    });

    dataSubmit.addEventListener("click", function () {
      if (validateAndStartLiveValidationForAll()) {
        if (isSpam()) {
          alert("Form submitted too quickly. Please try again.");
          return;
        }
        realSubmitInput.click();
      }
    });

    form.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        if (validateAndStartLiveValidationForAll()) {
          if (isSpam()) {
            alert("Form submitted too quickly. Please try again.");
            return;
          }
          realSubmitInput.click();
        }
      }
    });

    form.addEventListener("submit", function () {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (window.ScrollTrigger) {
            console.log("refreshed");
            ScrollTrigger.refresh(true);
          }
        }, 1000);
      });
    });
  });
}

function initCheckSectionThemeScroll() {
  const navBarHeight = document.querySelector("[data-nav-bar-height]");
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  function checkThemeSection() {
    const themeSections = document.querySelectorAll("[data-theme-section]");

    themeSections.forEach(function (themeSection) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      if (
        themeSectionTop <= themeObserverOffset &&
        themeSectionBottom >= themeObserverOffset
      ) {
        const themeSectionActive =
          themeSection.getAttribute("data-theme-section");

        let navTheme;
        if (themeSectionActive === "dark") {
          navTheme = "light";
        } else if (themeSectionActive === "light") {
          navTheme = "dark";
        } else {
          navTheme = themeSectionActive; // fallback
        }

        document.querySelectorAll("[data-theme-nav]").forEach(function (elem) {
          if (elem.getAttribute("data-theme-nav") !== navTheme) {
            elem.setAttribute("data-theme-nav", navTheme);
          }
        });
      }
    });
  }

  function startThemeCheck() {
    document.addEventListener("scroll", checkThemeSection);
  }

  checkThemeSection();
  startThemeCheck();
}

function initStaggerAnmi() {
  let elements = document.querySelectorAll("[data-stagger-wrapper]");

  elements.forEach((el) => {
    let items = el.querySelectorAll("[data-stagger-item]");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out", duration: 0.5 },
    });

    items.forEach((item) => {
      tl.to(item, {
        opacity: 1,
        y: 0,
        stagger: {
          each: 0.08,
          from: "start",
        },
      });
    });
  });
}

function initStructureModelAnimation() {
  const wrapper = document.querySelector(".structure_model-wrapper");
  if (!wrapper) return;

  const headings = wrapper.querySelectorAll("h6");
  const items = wrapper.querySelectorAll(".structure_model-item-wrapper");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top 80%",
      once: true, // run only once
    },
  });

  // 1. Expand wrapper
  tl.to(wrapper, {
    scaleX: 1,
    duration: 0.8,
    ease: "power2.out",
  });

  // 2. Headings fade in
  tl.to(
    headings,
    {
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
    },
    "-=0.3"
  );

  // 3. Items animate in
  tl.to(
    items,
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: {
        each: 0.08,
        from: "start",
      },
      ease: "power2.out",
    },
    "-=0.2"
  );
}

function initAnimi() {
  let elements = document.querySelectorAll("[data-animi]");
  elements.forEach((el) => {
    const delay = parseFloat(el.getAttribute("data-delay")) || 0;

    gsap.to(el, {
      opacity: 1,
      y: "0rem",
      filter: "blur(0px)",
      duration: 1,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });
}

function adjustGrid() {
  return new Promise((resolve) => {
    const transition = document.querySelector(".transition");
    if (!transition) return resolve();

    const computedStyle = window.getComputedStyle(transition);

    let gridTemplateRows = computedStyle.getPropertyValue("grid-template-rows");
    let rows;

    if (gridTemplateRows.includes("repeat")) {
      const match = gridTemplateRows.match(/repeat\((\d+),/);
      rows = match ? parseInt(match[1]) : 8;
    } else {
      rows = gridTemplateRows.split(" ").length;
    }

    const blockSize = window.innerHeight / rows;
    const columns = Math.ceil(window.innerWidth / blockSize);

    transition.style.gridTemplateColumns = `repeat(${columns}, ${blockSize}px)`;

    const totalBlocks = columns * rows;

    // Clear existing blocks
    transition.innerHTML = "";

    // Generate blocks
    for (let i = 0; i < totalBlocks; i++) {
      const block = document.createElement("div");
      block.classList.add("transition-block");
      transition.appendChild(block);
    }

    resolve();
  });
}

function initVimeoBGVideo() {
  // Select all elements that have [data-vimeo-bg-init]
  const vimeoPlayers = document.querySelectorAll("[data-vimeo-bg-init]");

  vimeoPlayers.forEach(function (vimeoElement, index) {
    // Add Vimeo URL ID to the iframe [src]
    // Looks like: https://player.vimeo.com/video/1019191082
    const vimeoVideoID = vimeoElement.getAttribute("data-vimeo-video-id");
    if (!vimeoVideoID) return;
    const vimeoVideoURL = `https://player.vimeo.com/video/${vimeoVideoID}?api=1&background=1&autoplay=1&loop=1&muted=1`;
    vimeoElement.querySelector("iframe").setAttribute("src", vimeoVideoURL);

    // Assign an ID to each element
    const videoIndexID = "vimeo-bg-basic-index-" + index;
    vimeoElement.setAttribute("id", videoIndexID);

    const iframeID = vimeoElement.id;
    const player = new Vimeo.Player(iframeID);

    player.setVolume(0);

    player.on("bufferend", function () {
      vimeoElement.setAttribute("data-vimeo-activated", "true");
      vimeoElement.setAttribute("data-vimeo-loaded", "true");
    });

    // Update Aspect Ratio if [data-vimeo-update-size="true"]
    let videoAspectRatio;
    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      player.getVideoWidth().then(function (width) {
        player.getVideoHeight().then(function (height) {
          videoAspectRatio = height / width;
          const beforeEl = vimeoElement.querySelector(".vimeo-bg__before");
          if (beforeEl) {
            beforeEl.style.paddingTop = videoAspectRatio * 100 + "%";
          }
        });
      });
    }

    // Function to adjust video sizing
    function adjustVideoSizing() {
      const containerAspectRatio =
        (vimeoElement.offsetHeight / vimeoElement.offsetWidth) * 100;

      const iframeWrapper = vimeoElement.querySelector(
        ".vimeo-bg__iframe-wrapper"
      );
      if (iframeWrapper && videoAspectRatio) {
        if (containerAspectRatio > videoAspectRatio * 100) {
          iframeWrapper.style.width = `${
            (containerAspectRatio / (videoAspectRatio * 100)) * 100
          }%`;
        } else {
          iframeWrapper.style.width = "";
        }
      }
    }
    // Adjust video sizing initially
    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      adjustVideoSizing();
      player.getVideoWidth().then(function () {
        player.getVideoHeight().then(function () {
          adjustVideoSizing();
        });
      });
    } else {
      adjustVideoSizing();
    }
    // Adjust video sizing on resize
    window.addEventListener("resize", adjustVideoSizing);
  });
}

function initTextReveal() {
  const elements = document.querySelectorAll(
    "[data-split-lines], [data-split-words]"
  );

  elements.forEach((el) => {
    gsap.set(el, { autoAlpha: 1 });

    const delay = parseFloat(el.getAttribute("data-delay")) || 0;

    //detect type
    let type = "lines";
    if (el.hasAttribute("data-split-words")) {
      type = "words";
    }

    SplitText.create(el, {
      type: type,
      autoSplit: true,
      mask: type === "lines" ? "lines" : undefined,
      onSplit(instance) {
        const targets = type === "lines" ? instance.lines : instance.words;

        return gsap.from(targets, {
          duration: 1,
          yPercent: type === "lines" ? 110 : 75,
          opacity: type === "words" ? 0 : 0,
          stagger: type === "lines" ? 0.08 : 0.08,
          delay: delay,
          ease: "power2.out",
          transformOrigin: "bottom left",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        });
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (has("[data-split-lines]" || "[data-split-words]")) initTextReveal();
  if (has("[data-vimeo-bg-init]")) initVimeoBGVideo();
  if (has("[data-animi]")) initAnimi();
  if (has("[data-stagger-wrapper]")) initStaggerAnmi();
  initDraggableMarquee();
  initPixelatedScrollTransition();
  initDirectionalButtonHover();
  if (has("[data-sticky-steps-init]")) initStickyStepsBasic();
  if (has("[data-accordion-css-init]")) initAccordionCSS();
  if (has('[data-tabs="wrapper"]')) initTabSystem();
  if (has("[data-form-validate]")) initAdvancedFormValidation();
  if (has("[data-nav-bar-height]")) initCheckSectionThemeScroll();
  if (has(".structure_model-wrapper")) initStructureModelAnimation();
  /*
  adjustGrid().then(() => {
    // Page load GSAP timeline
    let pageLoadTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(".transition", { display: "none" });
      },
      defaults: {
        ease: "linear",
      },
    });

    pageLoadTimeline
      .to(
        ".transition-block",
        {
          opacity: 0,
          duration: 0.12,
          stagger: { amount: 0.75, from: "random" },
        },
        0.1
      )
      .fromTo(
        "[data-title-svg] rect",
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.001,
          stagger: { amount: 1, from: "random" },
        },
        "<+=0.25"
      );

    // Pre-process all valid links
    const validLinks = Array.from(document.querySelectorAll("a")).filter(
      (link) => {
        const href = link.getAttribute("href") || "";
        const hostname = new URL(link.href, window.location.origin).hostname;

        return (
          hostname === window.location.hostname && // Same domain
          !href.startsWith("#") && // Not an anchor link
          link.getAttribute("target") !== "_blank" && // Not opening in a new tab
          !link.hasAttribute("data-transition-prevent") // No 'data-transition-prevent' attribute
        );
      }
    );

    // Add event listeners to pre-processed valid links
    validLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Prevent the default behavior and go to the destination after animation
        event.preventDefault();
        const destination = link.href;

        // Show loading grid with animation
        gsap.set(".transition", { display: "grid" });
        gsap.fromTo(
          ".transition-block",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.001,
            ease: "linear",
            stagger: { amount: 0.5, from: "random" },
            onComplete: () => {
              // After grid is full, navigate to the other page
              window.location.href = destination;
            },
          }
        );
      });
    });

    // Handle the back button behavior
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });

    // Additional transition page animation
    const tl = gsap.timeline({
      defaults: { ease: "linear" },
      onStart: () => {
        gsap.set("[data-transition-preload]", {
          display: "grid",
          background: "transparent",
        });
      },
      onComplete: () => {
        gsap.set("[data-transition-preload]", { display: "none" });
      },
    });

    tl.to(".transition-block", {
      opacity: 0,
      duration: 0.12,
      stagger: { amount: 0.75, from: "random" },
    });
  });
  */
});

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

const easeFade = CustomEase.create("fade", "M0,0 C0.25,0.1 0.25,1 1,1");

// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

function has(selector) {
  return document.querySelector(selector) !== null;
}

function initPixelatedScrollTransition() {
  // Defaults — edit these to change fallbacks if no data-attribute is added
  const defaultColumns = 12;
  const defaultRows = 6;
  const defaultMode = "cover";
  const defaultScrollStart = { cover: "bottom 60%", reveal: "top bottom" };
  const defaultScrollEnd = { cover: "bottom top", reveal: "top center" };
  const defaultScrub = 0.3;
  const defaultPixelDuration = 0.1;
  const defaultStaggerAmount = 1.5;

  // Class names applied to generated elements
  const panelClass = "pixelated-scroll-transition__panel";
  const columnClass = "pixelated-scroll-transition__col";
  const pixelClass = "pixelated-scroll-transition__pixel";

  // Breakpoints
  const breakpoints = {
    mobile: "(max-width: 478px)",
    landscape: "(max-width: 767px)",
    tablet: "(max-width: 991px)",
  };

  const instances = [];
  let mm = null;

  function getColumns(wrapper) {
    const base = parseInt(wrapper.dataset.columns, 10) || defaultColumns;

    if (window.matchMedia(breakpoints.mobile).matches) {
      return (
        parseInt(wrapper.dataset.columnsMobile, 10) ||
        Math.max(4, Math.round(base * 0.4))
      );
    }
    if (window.matchMedia(breakpoints.landscape).matches) {
      return (
        parseInt(wrapper.dataset.columnsLandscape, 10) ||
        Math.max(6, Math.round(base * 0.6))
      );
    }
    if (window.matchMedia(breakpoints.tablet).matches) {
      return (
        parseInt(wrapper.dataset.columnsTablet, 10) ||
        Math.max(8, Math.round(base * 0.75))
      );
    }
    return base;
  }

  function getMode(wrapper) {
    return wrapper.dataset.mode === "reveal" ? "reveal" : defaultMode;
  }

  function getRows(wrapper) {
    const base = parseInt(wrapper.dataset.rows, 10) || defaultRows;

    if (window.matchMedia(breakpoints.mobile).matches) {
      return parseInt(wrapper.dataset.rowsMobile, 10) || base;
    }
    if (window.matchMedia(breakpoints.landscape).matches) {
      return parseInt(wrapper.dataset.rowsLandscape, 10) || base;
    }
    if (window.matchMedia(breakpoints.tablet).matches) {
      return parseInt(wrapper.dataset.rowsTablet, 10) || base;
    }
    return base;
  }

  function getScrollStart(wrapper, mode) {
    return wrapper.dataset.scrollStart || defaultScrollStart[mode];
  }

  function getScrollEnd(wrapper, mode) {
    return wrapper.dataset.scrollEnd || defaultScrollEnd[mode];
  }

  function createCol() {
    const col = document.createElement("div");
    col.classList.add(columnClass);
    col.setAttribute("data-pixelated-scroll-column", "");
    return col;
  }

  function createPixel() {
    const pixel = document.createElement("div");
    pixel.classList.add(pixelClass);
    pixel.setAttribute("data-pixelated-scroll-pixel", "");
    return pixel;
  }

  function buildGrid(wrapper, cols, rows) {
    const panel = document.createElement("div");
    panel.classList.add(panelClass);
    panel.setAttribute("data-pixelated-scroll-panel", "");

    const fragment = document.createDocumentFragment();
    for (let c = 0; c < cols; c++) {
      const col = createCol();
      for (let r = 0; r < rows; r++) {
        col.appendChild(createPixel());
      }
      fragment.appendChild(col);
    }
    panel.appendChild(fragment);
    wrapper.appendChild(panel);

    return { panel };
  }

  function collectCells(panel, cols, rows, mode) {
    const columns = panel.querySelectorAll("[data-pixelated-scroll-column]");
    const cellData = [];

    for (let r = 0; r < rows; r++) {
      columns.forEach((col, c) => {
        const pixel = col.children[r];
        if (!pixel) return;

        const dist = rows - 1 - r;
        const priority =
          dist * 50 + Math.random() * 300 + Math.sin(c * 0.3) * 30;

        cellData.push({ element: pixel, priority });
      });
    }

    cellData.sort((a, b) => a.priority - b.priority);
    return cellData.map((d) => d.element);
  }

  function createAnimation(wrapper, cells, section, mode) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: getScrollStart(wrapper, mode),
        end: getScrollEnd(wrapper, mode),
        scrub: defaultScrub,
        invalidateOnRefresh: true,
      },
    });

    const fromAlpha = mode === "cover" ? 0 : 1;
    const toAlpha = mode === "cover" ? 1 : 0;

    gsap.set(cells, { autoAlpha: fromAlpha });
    tl.to(cells, {
      autoAlpha: toAlpha,
      duration: defaultPixelDuration,
      stagger: { amount: defaultStaggerAmount, from: "start" },
      ease: "none",
    });

    return tl;
  }

  function setupInstance(wrapper) {
    const section = wrapper.closest("section") || wrapper.parentElement;
    const cols = getColumns(wrapper);
    const rows = getRows(wrapper);
    const mode = getMode(wrapper);

    const { panel } = buildGrid(wrapper, cols, rows);
    const cells = collectCells(panel, cols, rows, mode);
    const tl = createAnimation(wrapper, cells, section, mode);

    return { wrapper, tl };
  }

  function destroyInstance(instance) {
    if (instance.tl) {
      instance.tl.scrollTrigger?.kill();
      instance.tl.kill();
    }
    const panel = instance.wrapper.querySelector(
      "[data-pixelated-scroll-panel]"
    );
    if (panel) panel.remove();
  }

  function buildAll() {
    const wrappers = document.querySelectorAll(
      "[data-pixelated-scroll-transition]"
    );
    wrappers.forEach((wrapper) => {
      instances.push(setupInstance(wrapper));
    });
    ScrollTrigger.refresh();
  }

  function destroyAll() {
    instances.forEach(destroyInstance);
    instances.length = 0;
  }

  const wrappers = document.querySelectorAll(
    "[data-pixelated-scroll-transition]"
  );
  if (!wrappers.length) return;

  mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 992px)",
      isTablet: "(min-width: 768px) and (max-width: 991px)",
      isLandscape: "(min-width: 479px) and (max-width: 767px)",
      isMobile: "(max-width: 478px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      if (context.conditions.reduceMotion) return;

      buildAll();

      return () => {
        destroyAll();
      };
    }
  );
}

function initDraggableMarquee() {
  const wrappers = document.querySelectorAll("[data-draggable-marquee-init]");

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized")
      return;

    const collection = wrapper.querySelector(
      "[data-draggable-marquee-collection]"
    );
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, "data-duration", 20);
    const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
    const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute("data-draggable-marquee-clone", "");
      listClone.setAttribute("aria-hidden", "true");
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);

    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px",
      },
    });

    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (
      wrapper.getAttribute("data-direction") || "left"
    ).toLowerCase();
    const baseDirection = initialDirectionAttr === "right" ? -1 : 1;

    const timeScale = { value: 1 };

    timeScale.value = baseDirection;
    wrapper.setAttribute(
      "data-direction",
      baseDirection < 0 ? "right" : "left"
    );

    if (baseDirection < 0) marqueeLoop.progress(1);

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute(
        "data-direction",
        timeScale.value < 0 ? "right" : "left"
      );
    }

    applyTimeScale();

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity;
        velocityTimeScale = gsap.utils.clamp(
          -multiplier,
          multiplier,
          velocityTimeScale
        );

        gsap.killTweensOf(timeScale);

        const restingDirection = velocityTimeScale < 0 ? -1 : 1;

        gsap
          .timeline({ onUpdate: applyTimeScale })
          .to(timeScale, {
            value: velocityTimeScale,
            duration: 0.1,
            overwrite: true,
          })
          .to(timeScale, { value: restingDirection, duration: 1.0 });
      },
    });

    // Pause marquee when scrolled out of view
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        marqueeLoop.resume();
        applyTimeScale();
        marqueeObserver.enable();
      },
      onEnterBack: () => {
        marqueeLoop.resume();
        applyTimeScale();
        marqueeObserver.enable();
      },
      onLeave: () => {
        marqueeLoop.pause();
        marqueeObserver.disable();
      },
      onLeaveBack: () => {
        marqueeLoop.pause();
        marqueeObserver.disable();
      },
    });

    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
  });
}

function initStickyStepsBasic() {
  const containers = document.querySelectorAll("[data-sticky-steps-init]");
  if (!containers.length) return;

  containers.forEach((container) => {
    const items = [...container.querySelectorAll("[data-sticky-steps-item]")];
    if (!items.length) return;

    function updateSteps() {
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const anchor = item.querySelector("[data-sticky-steps-anchor]");
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const anchorCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - anchorCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      items.forEach((item, index) => {
        let status = "active";

        if (index < closestIndex) status = "before";
        if (index > closestIndex) status = "after";

        item.setAttribute("data-sticky-steps-item-status", status);
      });
    }

    window.addEventListener("scroll", updateSteps);
    window.addEventListener("resize", updateSteps);

    requestAnimationFrame(updateSteps);
  });
}

function initDirectionalButtonHover() {
  // Button hover animation
  document.querySelectorAll("[data-btn-hover]").forEach((button) => {
    button.addEventListener("mouseenter", handleHover);
    button.addEventListener("mouseleave", handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Get the button's dimensions and center
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const buttonCenterX = buttonRect.left + buttonWidth / 2;
    const buttonCenterY = buttonRect.top + buttonHeight / 2;

    // Calculate mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Offset from the top-left corner in percentage
    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

    // Offset from the center in percentage
    let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;

    // Convert to absolute values
    offsetXFromCenter = Math.abs(offsetXFromCenter);

    // Update position and size of .btn__circle
    const circle = button.querySelector(".btn__circle");
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
    }
  }
}

function initAccordionCSS() {
  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== singleAccordion)
                sibling.setAttribute("data-accordion-status", "not-active");
            });
        }
      });
    });
}

// function initTabSystem() {
//   const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

//   wrappers.forEach((wrapper) => {
//     const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
//     const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

//     let activeContent = null;
//     let activeVisual = null;
//     let isAnimating = false;

//     function switchTab(index) {
//       if (isAnimating || contentItems[index] === activeContent) return;

//       isAnimating = true;

//       const outgoingContent = activeContent;
//       const outgoingVisual = activeVisual;

//       const incomingContent = contentItems[index];
//       const incomingVisual = visualItems[index];

//       const tl = gsap.timeline({
//         defaults: { duration: 0.65, ease: "power3" },
//         onComplete: () => {
//           activeContent = incomingContent;
//           activeVisual = incomingVisual;
//           isAnimating = false;

//           requestAnimationFrame(() => {
//             ScrollTrigger.refresh();
//           });
//         },
//       });

//       // OUT
//       if (outgoingContent) {
//         outgoingContent.classList.remove("active");
//         outgoingVisual?.classList.remove("active");

//         tl.to(outgoingVisual, { autoAlpha: 0, yPercent: 3 }, 0).to(
//           outgoingContent.querySelector('[data-tabs="item-details"]'),
//           { height: 0 },
//           0
//         );
//       }

//       // IN
//       incomingContent.classList.add("active");
//       incomingVisual.classList.add("active");

//       tl.fromTo(
//         incomingVisual,
//         { autoAlpha: 0, yPercent: 3 },
//         { autoAlpha: 1, yPercent: 0 },
//         0.3
//       ).fromTo(
//         incomingContent.querySelector('[data-tabs="item-details"]'),
//         { height: 0 },
//         { height: "auto" },
//         0
//       );
//     }

//     // init first tab
//     switchTab(0);

//     // click events
//     contentItems.forEach((item, i) =>
//       item.addEventListener("click", () => {
//         if (item === activeContent) return;
//         switchTab(i);
//       })
//     );
//   });
// }

function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

  const hashMap = {
    "#farmers": "farmer",
    "#investors": "investor",
  };

  const currentHash = window.location.hash;
  const targetType = hashMap[currentHash];

  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

    let activeContent = null;
    let activeVisual = null;
    let isAnimating = false;

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;

      isAnimating = true;

      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;

      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];

      const tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power2.out" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;

          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        },
      });

      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");

        tl.to(outgoingVisual, { autoAlpha: 0, y: 32 }, 0);
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");

      tl.fromTo(
        incomingVisual,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0 },
        0.3
      );
    }

    let initialIndex = 0;

    if (wrapper.hasAttribute("data-tabs-hash") && targetType) {
      contentItems.forEach((item, i) => {
        if (item.getAttribute("data-type") === targetType) {
          initialIndex = i;
        }
      });
    }

    switchTab(initialIndex);

    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return;
        switchTab(i);
      })
    );
  });
}

function initAdvancedFormValidation() {
  const forms = document.querySelectorAll("[data-form-validate]");

  forms.forEach((formContainer) => {
    const startTime = new Date().getTime();

    const form = formContainer.querySelector("form");
    if (!form) return;

    const validateFields = form.querySelectorAll("[data-validate]");
    const dataSubmit = form.querySelector("[data-submit]");
    if (!dataSubmit) return;

    const realSubmitInput = dataSubmit.querySelector('input[type="submit"]');
    if (!realSubmitInput) return;

    function isSpam() {
      const currentTime = new Date().getTime();
      return currentTime - startTime < 5000;
    }

    // Disable select options with invalid values on page load
    validateFields.forEach(function (fieldGroup) {
      const select = fieldGroup.querySelector("select");
      if (select) {
        const options = select.querySelectorAll("option");
        options.forEach(function (option) {
          if (
            option.value === "" ||
            option.value === "disabled" ||
            option.value === "null" ||
            option.value === "false"
          ) {
            option.setAttribute("disabled", "disabled");
          }
        });
      }
    });

    function validateAndStartLiveValidationForAll() {
      let allValid = true;
      let firstInvalidField = null;

      validateFields.forEach(function (fieldGroup) {
        const input = fieldGroup.querySelector("input, textarea, select");
        const radioCheckGroup = fieldGroup.querySelector(
          "[data-radiocheck-group]"
        );
        if (!input && !radioCheckGroup) return;

        if (input) input.__validationStarted = true;
        if (radioCheckGroup) {
          radioCheckGroup.__validationStarted = true;
          const inputs = radioCheckGroup.querySelectorAll(
            'input[type="radio"], input[type="checkbox"]'
          );
          inputs.forEach(function (input) {
            input.__validationStarted = true;
          });
        }

        updateFieldStatus(fieldGroup);

        if (!isValid(fieldGroup)) {
          allValid = false;
          if (!firstInvalidField) {
            firstInvalidField = input || radioCheckGroup.querySelector("input");
          }
        }
      });

      if (!allValid && firstInvalidField) {
        firstInvalidField.focus();
      }

      return allValid;
    }

    function isValid(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );
      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        const checkedInputs = radioCheckGroup.querySelectorAll("input:checked");
        const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;
        const max =
          parseInt(radioCheckGroup.getAttribute("max")) || inputs.length;
        const checkedCount = checkedInputs.length;

        if (inputs[0].type === "radio") {
          return checkedCount >= 1;
        } else {
          if (inputs.length === 1) {
            return inputs[0].checked;
          } else {
            return checkedCount >= min && checkedCount <= max;
          }
        }
      } else {
        const input = fieldGroup.querySelector("input, textarea, select");
        if (!input) return false;

        let valid = true;
        const min = parseInt(input.getAttribute("min")) || 0;
        const max = parseInt(input.getAttribute("max")) || Infinity;
        const value = input.value.trim();
        const length = value.length;

        if (input.tagName.toLowerCase() === "select") {
          if (
            value === "" ||
            value === "disabled" ||
            value === "null" ||
            value === "false"
          ) {
            valid = false;
          }
        } else if (input.type === "email") {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          valid = emailPattern.test(value);
        } else {
          if (input.hasAttribute("min") && length < min) valid = false;
          if (input.hasAttribute("max") && length > max) valid = false;
        }

        return valid;
      }
    }

    function updateFieldStatus(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );
      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        const checkedInputs = radioCheckGroup.querySelectorAll("input:checked");

        if (checkedInputs.length > 0) {
          fieldGroup.classList.add("is--filled");
        } else {
          fieldGroup.classList.remove("is--filled");
        }

        const valid = isValid(fieldGroup);

        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          const anyInputValidationStarted = Array.from(inputs).some(
            (input) => input.__validationStarted
          );
          if (anyInputValidationStarted) {
            fieldGroup.classList.add("is--error");
          } else {
            fieldGroup.classList.remove("is--error");
          }
        }
      } else {
        const input = fieldGroup.querySelector("input, textarea, select");
        if (!input) return;

        const value = input.value.trim();

        if (value) {
          fieldGroup.classList.add("is--filled");
        } else {
          fieldGroup.classList.remove("is--filled");
        }

        const valid = isValid(fieldGroup);

        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          if (input.__validationStarted) {
            fieldGroup.classList.add("is--error");
          } else {
            fieldGroup.classList.remove("is--error");
          }
        }
      }
    }

    validateFields.forEach(function (fieldGroup) {
      const input = fieldGroup.querySelector("input, textarea, select");
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );

      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        inputs.forEach(function (input) {
          input.__validationStarted = false;

          input.addEventListener("change", function () {
            requestAnimationFrame(function () {
              if (!input.__validationStarted) {
                const checkedCount =
                  radioCheckGroup.querySelectorAll("input:checked").length;
                const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;

                if (checkedCount >= min) {
                  input.__validationStarted = true;
                }
              }

              if (input.__validationStarted) {
                updateFieldStatus(fieldGroup);
              }
            });
          });

          input.addEventListener("blur", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        });
      } else if (input) {
        input.__validationStarted = false;

        if (input.tagName.toLowerCase() === "select") {
          input.addEventListener("change", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        } else {
          input.addEventListener("input", function () {
            const value = input.value.trim();
            const length = value.length;
            const min = parseInt(input.getAttribute("min")) || 0;
            const max = parseInt(input.getAttribute("max")) || Infinity;

            if (!input.__validationStarted) {
              if (input.type === "email") {
                if (isValid(fieldGroup)) input.__validationStarted = true;
              } else {
                if (
                  (input.hasAttribute("min") && length >= min) ||
                  (input.hasAttribute("max") && length <= max)
                ) {
                  input.__validationStarted = true;
                }
              }
            }

            if (input.__validationStarted) {
              updateFieldStatus(fieldGroup);
            }
          });

          input.addEventListener("blur", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        }
      }
    });

    dataSubmit.addEventListener("click", function () {
      if (validateAndStartLiveValidationForAll()) {
        if (isSpam()) {
          alert("Form submitted too quickly. Please try again.");
          return;
        }
        realSubmitInput.click();
      }
    });

    form.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        if (validateAndStartLiveValidationForAll()) {
          if (isSpam()) {
            alert("Form submitted too quickly. Please try again.");
            return;
          }
          realSubmitInput.click();
        }
      }
    });

    form.addEventListener("submit", function () {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (window.ScrollTrigger) {
            console.log("refreshed");
            ScrollTrigger.refresh(true);
          }
        }, 1000);
      });
    });
  });
}

function initCheckSectionThemeScroll() {
  const navBarHeight = document.querySelector("[data-nav-bar-height]");
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  function checkThemeSection() {
    const themeSections = document.querySelectorAll("[data-theme-section]");

    themeSections.forEach(function (themeSection) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      if (
        themeSectionTop <= themeObserverOffset &&
        themeSectionBottom >= themeObserverOffset
      ) {
        const themeSectionActive =
          themeSection.getAttribute("data-theme-section");

        let navTheme;
        if (themeSectionActive === "dark") {
          navTheme = "light";
        } else if (themeSectionActive === "light") {
          navTheme = "dark";
        } else {
          navTheme = themeSectionActive; // fallback
        }

        document.querySelectorAll("[data-theme-nav]").forEach(function (elem) {
          if (elem.getAttribute("data-theme-nav") !== navTheme) {
            elem.setAttribute("data-theme-nav", navTheme);
          }
        });
      }
    });
  }

  function startThemeCheck() {
    document.addEventListener("scroll", checkThemeSection);
  }

  checkThemeSection();
  startThemeCheck();
}

function initStaggerAnmi() {
  let elements = document.querySelectorAll("[data-stagger-wrapper]");

  elements.forEach((el) => {
    let items = el.querySelectorAll("[data-stagger-item]");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out", duration: 0.5 },
    });

    items.forEach((item) => {
      tl.to(item, {
        opacity: 1,
        y: 0,
        stagger: {
          each: 0.08,
          from: "start",
        },
      });
    });
  });
}

function initStructureModelAnimation() {
  const wrapper = document.querySelector(".structure_model-wrapper");
  if (!wrapper) return;

  const headings = wrapper.querySelectorAll("h6");
  const items = wrapper.querySelectorAll(".structure_model-item-wrapper");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top 80%",
      once: true, // run only once
    },
  });

  // 1. Expand wrapper
  tl.to(wrapper, {
    scaleX: 1,
    duration: 0.8,
    ease: "power2.out",
  });

  // 2. Headings fade in
  tl.to(
    headings,
    {
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
    },
    "-=0.3"
  );

  // 3. Items animate in
  tl.to(
    items,
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: {
        each: 0.08,
        from: "start",
      },
      ease: "power2.out",
    },
    "-=0.2"
  );
}

function initAnimi() {
  let elements = document.querySelectorAll("[data-animi]");
  elements.forEach((el) => {
    const delay = parseFloat(el.getAttribute("data-delay")) || 0;

    gsap.to(el, {
      opacity: 1,
      y: "0rem",
      filter: "blur(0px)",
      duration: 1,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });
}

function adjustGrid() {
  return new Promise((resolve) => {
    const transition = document.querySelector(".transition");
    if (!transition) return resolve();

    const computedStyle = window.getComputedStyle(transition);

    let gridTemplateRows = computedStyle.getPropertyValue("grid-template-rows");
    let rows;

    if (gridTemplateRows.includes("repeat")) {
      const match = gridTemplateRows.match(/repeat\((\d+),/);
      rows = match ? parseInt(match[1]) : 8;
    } else {
      rows = gridTemplateRows.split(" ").length;
    }

    const blockSize = window.innerHeight / rows;
    const columns = Math.ceil(window.innerWidth / blockSize);

    transition.style.gridTemplateColumns = `repeat(${columns}, ${blockSize}px)`;

    const totalBlocks = columns * rows;

    // Clear existing blocks
    transition.innerHTML = "";

    // Generate blocks
    for (let i = 0; i < totalBlocks; i++) {
      const block = document.createElement("div");
      block.classList.add("transition-block");
      transition.appendChild(block);
    }

    resolve();
  });
}

function initVimeoBGVideo() {
  // Select all elements that have [data-vimeo-bg-init]
  const vimeoPlayers = document.querySelectorAll("[data-vimeo-bg-init]");

  vimeoPlayers.forEach(function (vimeoElement, index) {
    // Add Vimeo URL ID to the iframe [src]
    // Looks like: https://player.vimeo.com/video/1019191082
    const vimeoVideoID = vimeoElement.getAttribute("data-vimeo-video-id");
    if (!vimeoVideoID) return;
    const vimeoVideoURL = `https://player.vimeo.com/video/${vimeoVideoID}?api=1&background=1&autoplay=1&loop=1&muted=1`;
    vimeoElement.querySelector("iframe").setAttribute("src", vimeoVideoURL);

    // Assign an ID to each element
    const videoIndexID = "vimeo-bg-basic-index-" + index;
    vimeoElement.setAttribute("id", videoIndexID);

    const iframeID = vimeoElement.id;
    const player = new Vimeo.Player(iframeID);

    player.setVolume(0);

    player.on("bufferend", function () {
      vimeoElement.setAttribute("data-vimeo-activated", "true");
      vimeoElement.setAttribute("data-vimeo-loaded", "true");
    });

    // Update Aspect Ratio if [data-vimeo-update-size="true"]
    let videoAspectRatio;
    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      player.getVideoWidth().then(function (width) {
        player.getVideoHeight().then(function (height) {
          videoAspectRatio = height / width;
          const beforeEl = vimeoElement.querySelector(".vimeo-bg__before");
          if (beforeEl) {
            beforeEl.style.paddingTop = videoAspectRatio * 100 + "%";
          }
        });
      });
    }

    // Function to adjust video sizing
    function adjustVideoSizing() {
      const containerAspectRatio =
        (vimeoElement.offsetHeight / vimeoElement.offsetWidth) * 100;

      const iframeWrapper = vimeoElement.querySelector(
        ".vimeo-bg__iframe-wrapper"
      );
      if (iframeWrapper && videoAspectRatio) {
        if (containerAspectRatio > videoAspectRatio * 100) {
          iframeWrapper.style.width = `${
            (containerAspectRatio / (videoAspectRatio * 100)) * 100
          }%`;
        } else {
          iframeWrapper.style.width = "";
        }
      }
    }
    // Adjust video sizing initially
    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      adjustVideoSizing();
      player.getVideoWidth().then(function () {
        player.getVideoHeight().then(function () {
          adjustVideoSizing();
        });
      });
    } else {
      adjustVideoSizing();
    }
    // Adjust video sizing on resize
    window.addEventListener("resize", adjustVideoSizing);
  });
}

function initTextReveal() {
  const elements = document.querySelectorAll(
    "[data-split-lines], [data-split-words]"
  );

  elements.forEach((el) => {
    gsap.set(el, { autoAlpha: 1 });

    const delay = parseFloat(el.getAttribute("data-delay")) || 0;

    //detect type
    let type = "lines";
    if (el.hasAttribute("data-split-words")) {
      type = "words";
    }

    SplitText.create(el, {
      type: type,
      autoSplit: true,
      mask: type === "lines" ? "lines" : undefined,
      onSplit(instance) {
        const targets = type === "lines" ? instance.lines : instance.words;

        return gsap.from(targets, {
          duration: 1,
          yPercent: type === "lines" ? 110 : 75,
          opacity: type === "words" ? 0 : 0,
          stagger: type === "lines" ? 0.08 : 0.08,
          delay: delay,
          ease: "power2.out",
          transformOrigin: "bottom left",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        });
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (has("[data-split-lines]" || "[data-split-words]")) initTextReveal();
  if (has("[data-vimeo-bg-init]")) initVimeoBGVideo();
  if (has("[data-animi]")) initAnimi();
  if (has("[data-stagger-wrapper]")) initStaggerAnmi();
  initDraggableMarquee();
  initPixelatedScrollTransition();
  initDirectionalButtonHover();
  if (has("[data-sticky-steps-init]")) initStickyStepsBasic();
  if (has("[data-accordion-css-init]")) initAccordionCSS();
  if (has('[data-tabs="wrapper"]')) initTabSystem();
  if (has("[data-form-validate]")) initAdvancedFormValidation();
  if (has("[data-nav-bar-height]")) initCheckSectionThemeScroll();
  if (has(".structure_model-wrapper")) initStructureModelAnimation();
  /*
  adjustGrid().then(() => {
    // Page load GSAP timeline
    let pageLoadTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(".transition", { display: "none" });
      },
      defaults: {
        ease: "linear",
      },
    });

    pageLoadTimeline
      .to(
        ".transition-block",
        {
          opacity: 0,
          duration: 0.12,
          stagger: { amount: 0.75, from: "random" },
        },
        0.1
      )
      .fromTo(
        "[data-title-svg] rect",
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.001,
          stagger: { amount: 1, from: "random" },
        },
        "<+=0.25"
      );

    // Pre-process all valid links
    const validLinks = Array.from(document.querySelectorAll("a")).filter(
      (link) => {
        const href = link.getAttribute("href") || "";
        const hostname = new URL(link.href, window.location.origin).hostname;

        return (
          hostname === window.location.hostname && // Same domain
          !href.startsWith("#") && // Not an anchor link
          link.getAttribute("target") !== "_blank" && // Not opening in a new tab
          !link.hasAttribute("data-transition-prevent") // No 'data-transition-prevent' attribute
        );
      }
    );

    // Add event listeners to pre-processed valid links
    validLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Prevent the default behavior and go to the destination after animation
        event.preventDefault();
        const destination = link.href;

        // Show loading grid with animation
        gsap.set(".transition", { display: "grid" });
        gsap.fromTo(
          ".transition-block",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.001,
            ease: "linear",
            stagger: { amount: 0.5, from: "random" },
            onComplete: () => {
              // After grid is full, navigate to the other page
              window.location.href = destination;
            },
          }
        );
      });
    });

    // Handle the back button behavior
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });

    // Additional transition page animation
    const tl = gsap.timeline({
      defaults: { ease: "linear" },
      onStart: () => {
        gsap.set("[data-transition-preload]", {
          display: "grid",
          background: "transparent",
        });
      },
      onComplete: () => {
        gsap.set("[data-transition-preload]", { display: "none" });
      },
    });

    tl.to(".transition-block", {
      opacity: 0,
      duration: 0.12,
      stagger: { amount: 0.75, from: "random" },
    });
  });
  */
});

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

const easeFade = CustomEase.create("fade", "M0,0 C0.25,0.1 0.25,1 1,1");

// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

function has(selector) {
  return document.querySelector(selector) !== null;
}

function initPixelatedScrollTransition() {
  // Defaults — edit these to change fallbacks if no data-attribute is added
  const defaultColumns = 12;
  const defaultRows = 6;
  const defaultMode = "cover";
  const defaultScrollStart = { cover: "bottom 60%", reveal: "top bottom" };
  const defaultScrollEnd = { cover: "bottom top", reveal: "top center" };
  const defaultScrub = 0.3;
  const defaultPixelDuration = 0.1;
  const defaultStaggerAmount = 1.5;

  // Class names applied to generated elements
  const panelClass = "pixelated-scroll-transition__panel";
  const columnClass = "pixelated-scroll-transition__col";
  const pixelClass = "pixelated-scroll-transition__pixel";

  // Breakpoints
  const breakpoints = {
    mobile: "(max-width: 478px)",
    landscape: "(max-width: 767px)",
    tablet: "(max-width: 991px)",
  };

  const instances = [];
  let mm = null;

  function getColumns(wrapper) {
    const base = parseInt(wrapper.dataset.columns, 10) || defaultColumns;

    if (window.matchMedia(breakpoints.mobile).matches) {
      return (
        parseInt(wrapper.dataset.columnsMobile, 10) ||
        Math.max(4, Math.round(base * 0.4))
      );
    }
    if (window.matchMedia(breakpoints.landscape).matches) {
      return (
        parseInt(wrapper.dataset.columnsLandscape, 10) ||
        Math.max(6, Math.round(base * 0.6))
      );
    }
    if (window.matchMedia(breakpoints.tablet).matches) {
      return (
        parseInt(wrapper.dataset.columnsTablet, 10) ||
        Math.max(8, Math.round(base * 0.75))
      );
    }
    return base;
  }

  function getMode(wrapper) {
    return wrapper.dataset.mode === "reveal" ? "reveal" : defaultMode;
  }

  function getRows(wrapper) {
    const base = parseInt(wrapper.dataset.rows, 10) || defaultRows;

    if (window.matchMedia(breakpoints.mobile).matches) {
      return parseInt(wrapper.dataset.rowsMobile, 10) || base;
    }
    if (window.matchMedia(breakpoints.landscape).matches) {
      return parseInt(wrapper.dataset.rowsLandscape, 10) || base;
    }
    if (window.matchMedia(breakpoints.tablet).matches) {
      return parseInt(wrapper.dataset.rowsTablet, 10) || base;
    }
    return base;
  }

  function getScrollStart(wrapper, mode) {
    return wrapper.dataset.scrollStart || defaultScrollStart[mode];
  }

  function getScrollEnd(wrapper, mode) {
    return wrapper.dataset.scrollEnd || defaultScrollEnd[mode];
  }

  function createCol() {
    const col = document.createElement("div");
    col.classList.add(columnClass);
    col.setAttribute("data-pixelated-scroll-column", "");
    return col;
  }

  function createPixel() {
    const pixel = document.createElement("div");
    pixel.classList.add(pixelClass);
    pixel.setAttribute("data-pixelated-scroll-pixel", "");
    return pixel;
  }

  function buildGrid(wrapper, cols, rows) {
    const panel = document.createElement("div");
    panel.classList.add(panelClass);
    panel.setAttribute("data-pixelated-scroll-panel", "");

    const fragment = document.createDocumentFragment();
    for (let c = 0; c < cols; c++) {
      const col = createCol();
      for (let r = 0; r < rows; r++) {
        col.appendChild(createPixel());
      }
      fragment.appendChild(col);
    }
    panel.appendChild(fragment);
    wrapper.appendChild(panel);

    return { panel };
  }

  function collectCells(panel, cols, rows, mode) {
    const columns = panel.querySelectorAll("[data-pixelated-scroll-column]");
    const cellData = [];

    for (let r = 0; r < rows; r++) {
      columns.forEach((col, c) => {
        const pixel = col.children[r];
        if (!pixel) return;

        const dist = rows - 1 - r;
        const priority =
          dist * 50 + Math.random() * 300 + Math.sin(c * 0.3) * 30;

        cellData.push({ element: pixel, priority });
      });
    }

    cellData.sort((a, b) => a.priority - b.priority);
    return cellData.map((d) => d.element);
  }

  function createAnimation(wrapper, cells, section, mode) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: getScrollStart(wrapper, mode),
        end: getScrollEnd(wrapper, mode),
        scrub: defaultScrub,
        invalidateOnRefresh: true,
      },
    });

    const fromAlpha = mode === "cover" ? 0 : 1;
    const toAlpha = mode === "cover" ? 1 : 0;

    gsap.set(cells, { autoAlpha: fromAlpha });
    tl.to(cells, {
      autoAlpha: toAlpha,
      duration: defaultPixelDuration,
      stagger: { amount: defaultStaggerAmount, from: "start" },
      ease: "none",
    });

    return tl;
  }

  function setupInstance(wrapper) {
    const section = wrapper.closest("section") || wrapper.parentElement;
    const cols = getColumns(wrapper);
    const rows = getRows(wrapper);
    const mode = getMode(wrapper);

    const { panel } = buildGrid(wrapper, cols, rows);
    const cells = collectCells(panel, cols, rows, mode);
    const tl = createAnimation(wrapper, cells, section, mode);

    return { wrapper, tl };
  }

  function destroyInstance(instance) {
    if (instance.tl) {
      instance.tl.scrollTrigger?.kill();
      instance.tl.kill();
    }
    const panel = instance.wrapper.querySelector(
      "[data-pixelated-scroll-panel]"
    );
    if (panel) panel.remove();
  }

  function buildAll() {
    const wrappers = document.querySelectorAll(
      "[data-pixelated-scroll-transition]"
    );
    wrappers.forEach((wrapper) => {
      instances.push(setupInstance(wrapper));
    });
    ScrollTrigger.refresh();
  }

  function destroyAll() {
    instances.forEach(destroyInstance);
    instances.length = 0;
  }

  const wrappers = document.querySelectorAll(
    "[data-pixelated-scroll-transition]"
  );
  if (!wrappers.length) return;

  mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 992px)",
      isTablet: "(min-width: 768px) and (max-width: 991px)",
      isLandscape: "(min-width: 479px) and (max-width: 767px)",
      isMobile: "(max-width: 478px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      if (context.conditions.reduceMotion) return;

      buildAll();

      return () => {
        destroyAll();
      };
    }
  );
}

function initDraggableMarquee() {
  const wrappers = document.querySelectorAll("[data-draggable-marquee-init]");

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized")
      return;

    const collection = wrapper.querySelector(
      "[data-draggable-marquee-collection]"
    );
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, "data-duration", 20);
    const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
    const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute("data-draggable-marquee-clone", "");
      listClone.setAttribute("aria-hidden", "true");
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);

    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px",
      },
    });

    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (
      wrapper.getAttribute("data-direction") || "left"
    ).toLowerCase();
    const baseDirection = initialDirectionAttr === "right" ? -1 : 1;

    const timeScale = { value: 1 };

    timeScale.value = baseDirection;
    wrapper.setAttribute(
      "data-direction",
      baseDirection < 0 ? "right" : "left"
    );

    if (baseDirection < 0) marqueeLoop.progress(1);

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute(
        "data-direction",
        timeScale.value < 0 ? "right" : "left"
      );
    }

    applyTimeScale();

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity;
        velocityTimeScale = gsap.utils.clamp(
          -multiplier,
          multiplier,
          velocityTimeScale
        );

        gsap.killTweensOf(timeScale);

        const restingDirection = velocityTimeScale < 0 ? -1 : 1;

        gsap
          .timeline({ onUpdate: applyTimeScale })
          .to(timeScale, {
            value: velocityTimeScale,
            duration: 0.1,
            overwrite: true,
          })
          .to(timeScale, { value: restingDirection, duration: 1.0 });
      },
    });

    // Pause marquee when scrolled out of view
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        marqueeLoop.resume();
        applyTimeScale();
        marqueeObserver.enable();
      },
      onEnterBack: () => {
        marqueeLoop.resume();
        applyTimeScale();
        marqueeObserver.enable();
      },
      onLeave: () => {
        marqueeLoop.pause();
        marqueeObserver.disable();
      },
      onLeaveBack: () => {
        marqueeLoop.pause();
        marqueeObserver.disable();
      },
    });

    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
  });
}

function initStickyStepsBasic() {
  const containers = document.querySelectorAll("[data-sticky-steps-init]");
  if (!containers.length) return;

  containers.forEach((container) => {
    const items = [...container.querySelectorAll("[data-sticky-steps-item]")];
    if (!items.length) return;

    function updateSteps() {
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const anchor = item.querySelector("[data-sticky-steps-anchor]");
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const anchorCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - anchorCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      items.forEach((item, index) => {
        let status = "active";

        if (index < closestIndex) status = "before";
        if (index > closestIndex) status = "after";

        item.setAttribute("data-sticky-steps-item-status", status);
      });
    }

    window.addEventListener("scroll", updateSteps);
    window.addEventListener("resize", updateSteps);

    requestAnimationFrame(updateSteps);
  });
}

function initDirectionalButtonHover() {
  // Button hover animation
  document.querySelectorAll("[data-btn-hover]").forEach((button) => {
    button.addEventListener("mouseenter", handleHover);
    button.addEventListener("mouseleave", handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Get the button's dimensions and center
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const buttonCenterX = buttonRect.left + buttonWidth / 2;
    const buttonCenterY = buttonRect.top + buttonHeight / 2;

    // Calculate mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Offset from the top-left corner in percentage
    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

    // Offset from the center in percentage
    let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;

    // Convert to absolute values
    offsetXFromCenter = Math.abs(offsetXFromCenter);

    // Update position and size of .btn__circle
    const circle = button.querySelector(".btn__circle");
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
    }
  }
}

function initAccordionCSS() {
  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== singleAccordion)
                sibling.setAttribute("data-accordion-status", "not-active");
            });
        }
      });
    });
}

// function initTabSystem() {
//   const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

//   wrappers.forEach((wrapper) => {
//     const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
//     const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

//     let activeContent = null;
//     let activeVisual = null;
//     let isAnimating = false;

//     function switchTab(index) {
//       if (isAnimating || contentItems[index] === activeContent) return;

//       isAnimating = true;

//       const outgoingContent = activeContent;
//       const outgoingVisual = activeVisual;

//       const incomingContent = contentItems[index];
//       const incomingVisual = visualItems[index];

//       const tl = gsap.timeline({
//         defaults: { duration: 0.65, ease: "power3" },
//         onComplete: () => {
//           activeContent = incomingContent;
//           activeVisual = incomingVisual;
//           isAnimating = false;

//           requestAnimationFrame(() => {
//             ScrollTrigger.refresh();
//           });
//         },
//       });

//       // OUT
//       if (outgoingContent) {
//         outgoingContent.classList.remove("active");
//         outgoingVisual?.classList.remove("active");

//         tl.to(outgoingVisual, { autoAlpha: 0, yPercent: 3 }, 0).to(
//           outgoingContent.querySelector('[data-tabs="item-details"]'),
//           { height: 0 },
//           0
//         );
//       }

//       // IN
//       incomingContent.classList.add("active");
//       incomingVisual.classList.add("active");

//       tl.fromTo(
//         incomingVisual,
//         { autoAlpha: 0, yPercent: 3 },
//         { autoAlpha: 1, yPercent: 0 },
//         0.3
//       ).fromTo(
//         incomingContent.querySelector('[data-tabs="item-details"]'),
//         { height: 0 },
//         { height: "auto" },
//         0
//       );
//     }

//     // init first tab
//     switchTab(0);

//     // click events
//     contentItems.forEach((item, i) =>
//       item.addEventListener("click", () => {
//         if (item === activeContent) return;
//         switchTab(i);
//       })
//     );
//   });
// }

function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

  const hashMap = {
    "#farmers": "farmer",
    "#investors": "investor",
  };

  const currentHash = window.location.hash;
  const targetType = hashMap[currentHash];

  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

    let activeContent = null;
    let activeVisual = null;
    let isAnimating = false;

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;

      isAnimating = true;

      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;

      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];

      const tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power2.out" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;

          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        },
      });

      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");

        tl.to(outgoingVisual, { autoAlpha: 0, y: 32 }, 0);
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");

      tl.fromTo(
        incomingVisual,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0 },
        0.3
      );
    }

    let initialIndex = 0;

    if (wrapper.hasAttribute("data-tabs-hash") && targetType) {
      contentItems.forEach((item, i) => {
        if (item.getAttribute("data-type") === targetType) {
          initialIndex = i;
        }
      });
    }

    switchTab(initialIndex);

    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return;
        switchTab(i);
      })
    );
  });
}

function initAdvancedFormValidation() {
  const forms = document.querySelectorAll("[data-form-validate]");

  forms.forEach((formContainer) => {
    const startTime = new Date().getTime();

    const form = formContainer.querySelector("form");
    if (!form) return;

    const validateFields = form.querySelectorAll("[data-validate]");
    const dataSubmit = form.querySelector("[data-submit]");
    if (!dataSubmit) return;

    const realSubmitInput = dataSubmit.querySelector('input[type="submit"]');
    if (!realSubmitInput) return;

    function isSpam() {
      const currentTime = new Date().getTime();
      return currentTime - startTime < 5000;
    }

    // Disable select options with invalid values on page load
    validateFields.forEach(function (fieldGroup) {
      const select = fieldGroup.querySelector("select");
      if (select) {
        const options = select.querySelectorAll("option");
        options.forEach(function (option) {
          if (
            option.value === "" ||
            option.value === "disabled" ||
            option.value === "null" ||
            option.value === "false"
          ) {
            option.setAttribute("disabled", "disabled");
          }
        });
      }
    });

    function validateAndStartLiveValidationForAll() {
      let allValid = true;
      let firstInvalidField = null;

      validateFields.forEach(function (fieldGroup) {
        const input = fieldGroup.querySelector("input, textarea, select");
        const radioCheckGroup = fieldGroup.querySelector(
          "[data-radiocheck-group]"
        );
        if (!input && !radioCheckGroup) return;

        if (input) input.__validationStarted = true;
        if (radioCheckGroup) {
          radioCheckGroup.__validationStarted = true;
          const inputs = radioCheckGroup.querySelectorAll(
            'input[type="radio"], input[type="checkbox"]'
          );
          inputs.forEach(function (input) {
            input.__validationStarted = true;
          });
        }

        updateFieldStatus(fieldGroup);

        if (!isValid(fieldGroup)) {
          allValid = false;
          if (!firstInvalidField) {
            firstInvalidField = input || radioCheckGroup.querySelector("input");
          }
        }
      });

      if (!allValid && firstInvalidField) {
        firstInvalidField.focus();
      }

      return allValid;
    }

    function isValid(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );
      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        const checkedInputs = radioCheckGroup.querySelectorAll("input:checked");
        const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;
        const max =
          parseInt(radioCheckGroup.getAttribute("max")) || inputs.length;
        const checkedCount = checkedInputs.length;

        if (inputs[0].type === "radio") {
          return checkedCount >= 1;
        } else {
          if (inputs.length === 1) {
            return inputs[0].checked;
          } else {
            return checkedCount >= min && checkedCount <= max;
          }
        }
      } else {
        const input = fieldGroup.querySelector("input, textarea, select");
        if (!input) return false;

        let valid = true;
        const min = parseInt(input.getAttribute("min")) || 0;
        const max = parseInt(input.getAttribute("max")) || Infinity;
        const value = input.value.trim();
        const length = value.length;

        if (input.tagName.toLowerCase() === "select") {
          if (
            value === "" ||
            value === "disabled" ||
            value === "null" ||
            value === "false"
          ) {
            valid = false;
          }
        } else if (input.type === "email") {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          valid = emailPattern.test(value);
        } else {
          if (input.hasAttribute("min") && length < min) valid = false;
          if (input.hasAttribute("max") && length > max) valid = false;
        }

        return valid;
      }
    }

    function updateFieldStatus(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );
      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        const checkedInputs = radioCheckGroup.querySelectorAll("input:checked");

        if (checkedInputs.length > 0) {
          fieldGroup.classList.add("is--filled");
        } else {
          fieldGroup.classList.remove("is--filled");
        }

        const valid = isValid(fieldGroup);

        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          const anyInputValidationStarted = Array.from(inputs).some(
            (input) => input.__validationStarted
          );
          if (anyInputValidationStarted) {
            fieldGroup.classList.add("is--error");
          } else {
            fieldGroup.classList.remove("is--error");
          }
        }
      } else {
        const input = fieldGroup.querySelector("input, textarea, select");
        if (!input) return;

        const value = input.value.trim();

        if (value) {
          fieldGroup.classList.add("is--filled");
        } else {
          fieldGroup.classList.remove("is--filled");
        }

        const valid = isValid(fieldGroup);

        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          if (input.__validationStarted) {
            fieldGroup.classList.add("is--error");
          } else {
            fieldGroup.classList.remove("is--error");
          }
        }
      }
    }

    validateFields.forEach(function (fieldGroup) {
      const input = fieldGroup.querySelector("input, textarea, select");
      const radioCheckGroup = fieldGroup.querySelector(
        "[data-radiocheck-group]"
      );

      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        );
        inputs.forEach(function (input) {
          input.__validationStarted = false;

          input.addEventListener("change", function () {
            requestAnimationFrame(function () {
              if (!input.__validationStarted) {
                const checkedCount =
                  radioCheckGroup.querySelectorAll("input:checked").length;
                const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;

                if (checkedCount >= min) {
                  input.__validationStarted = true;
                }
              }

              if (input.__validationStarted) {
                updateFieldStatus(fieldGroup);
              }
            });
          });

          input.addEventListener("blur", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        });
      } else if (input) {
        input.__validationStarted = false;

        if (input.tagName.toLowerCase() === "select") {
          input.addEventListener("change", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        } else {
          input.addEventListener("input", function () {
            const value = input.value.trim();
            const length = value.length;
            const min = parseInt(input.getAttribute("min")) || 0;
            const max = parseInt(input.getAttribute("max")) || Infinity;

            if (!input.__validationStarted) {
              if (input.type === "email") {
                if (isValid(fieldGroup)) input.__validationStarted = true;
              } else {
                if (
                  (input.hasAttribute("min") && length >= min) ||
                  (input.hasAttribute("max") && length <= max)
                ) {
                  input.__validationStarted = true;
                }
              }
            }

            if (input.__validationStarted) {
              updateFieldStatus(fieldGroup);
            }
          });

          input.addEventListener("blur", function () {
            input.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        }
      }
    });

    dataSubmit.addEventListener("click", function () {
      if (validateAndStartLiveValidationForAll()) {
        if (isSpam()) {
          alert("Form submitted too quickly. Please try again.");
          return;
        }
        realSubmitInput.click();
      }
    });

    form.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        if (validateAndStartLiveValidationForAll()) {
          if (isSpam()) {
            alert("Form submitted too quickly. Please try again.");
            return;
          }
          realSubmitInput.click();
        }
      }
    });

    form.addEventListener("submit", function () {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (window.ScrollTrigger) {
            console.log("refreshed");
            ScrollTrigger.refresh(true);
          }
        }, 1000);
      });
    });
  });
}

function initCheckSectionThemeScroll() {
  const navBarHeight = document.querySelector("[data-nav-bar-height]");
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  function checkThemeSection() {
    const themeSections = document.querySelectorAll("[data-theme-section]");

    themeSections.forEach(function (themeSection) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      if (
        themeSectionTop <= themeObserverOffset &&
        themeSectionBottom >= themeObserverOffset
      ) {
        const themeSectionActive =
          themeSection.getAttribute("data-theme-section");

        let navTheme;
        if (themeSectionActive === "dark") {
          navTheme = "light";
        } else if (themeSectionActive === "light") {
          navTheme = "dark";
        } else {
          navTheme = themeSectionActive; // fallback
        }

        document.querySelectorAll("[data-theme-nav]").forEach(function (elem) {
          if (elem.getAttribute("data-theme-nav") !== navTheme) {
            elem.setAttribute("data-theme-nav", navTheme);
          }
        });
      }
    });
  }

  function startThemeCheck() {
    document.addEventListener("scroll", checkThemeSection);
  }

  checkThemeSection();
  startThemeCheck();
}

function initStaggerAnmi() {
  let elements = document.querySelectorAll("[data-stagger-wrapper]");

  elements.forEach((el) => {
    let items = el.querySelectorAll("[data-stagger-item]");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out", duration: 0.5 },
    });

    items.forEach((item) => {
      tl.to(item, {
        opacity: 1,
        y: 0,
        stagger: {
          each: 0.08,
          from: "start",
        },
      });
    });
  });
}

function initStructureModelAnimation() {
  const wrapper = document.querySelector(".structure_model-wrapper");
  if (!wrapper) return;

  const headings = wrapper.querySelectorAll("h6");
  const items = wrapper.querySelectorAll(".structure_model-item-wrapper");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top 80%",
      once: true, // run only once
    },
  });

  // 1. Expand wrapper
  tl.to(wrapper, {
    scaleX: 1,
    duration: 0.8,
    ease: "power2.out",
  });

  // 2. Headings fade in
  tl.to(
    headings,
    {
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
    },
    "-=0.3"
  );

  // 3. Items animate in
  tl.to(
    items,
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: {
        each: 0.08,
        from: "start",
      },
      ease: "power2.out",
    },
    "-=0.2"
  );
}

function initAnimi() {
  let elements = document.querySelectorAll("[data-animi]");
  elements.forEach((el) => {
    const delay = parseFloat(el.getAttribute("data-delay")) || 0;

    gsap.to(el, {
      opacity: 1,
      y: "0rem",
      filter: "blur(0px)",
      duration: 1,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });
}

function adjustGrid() {
  return new Promise((resolve) => {
    const transition = document.querySelector(".transition");
    if (!transition) return resolve();

    const computedStyle = window.getComputedStyle(transition);

    let gridTemplateRows = computedStyle.getPropertyValue("grid-template-rows");
    let rows;

    if (gridTemplateRows.includes("repeat")) {
      const match = gridTemplateRows.match(/repeat\((\d+),/);
      rows = match ? parseInt(match[1]) : 8;
    } else {
      rows = gridTemplateRows.split(" ").length;
    }

    const blockSize = window.innerHeight / rows;
    const columns = Math.ceil(window.innerWidth / blockSize);

    transition.style.gridTemplateColumns = `repeat(${columns}, ${blockSize}px)`;

    const totalBlocks = columns * rows;

    // Clear existing blocks
    transition.innerHTML = "";

    // Generate blocks
    for (let i = 0; i < totalBlocks; i++) {
      const block = document.createElement("div");
      block.classList.add("transition-block");
      transition.appendChild(block);
    }

    resolve();
  });
}

function initVimeoBGVideo() {
  // Select all elements that have [data-vimeo-bg-init]
  const vimeoPlayers = document.querySelectorAll("[data-vimeo-bg-init]");

  vimeoPlayers.forEach(function (vimeoElement, index) {
    // Add Vimeo URL ID to the iframe [src]
    // Looks like: https://player.vimeo.com/video/1019191082
    const vimeoVideoID = vimeoElement.getAttribute("data-vimeo-video-id");
    if (!vimeoVideoID) return;
    const vimeoVideoURL = `https://player.vimeo.com/video/${vimeoVideoID}?api=1&background=1&autoplay=1&loop=1&muted=1`;
    vimeoElement.querySelector("iframe").setAttribute("src", vimeoVideoURL);

    // Assign an ID to each element
    const videoIndexID = "vimeo-bg-basic-index-" + index;
    vimeoElement.setAttribute("id", videoIndexID);

    const iframeID = vimeoElement.id;
    const player = new Vimeo.Player(iframeID);

    player.setVolume(0);

    player.on("bufferend", function () {
      vimeoElement.setAttribute("data-vimeo-activated", "true");
      vimeoElement.setAttribute("data-vimeo-loaded", "true");
    });

    // Update Aspect Ratio if [data-vimeo-update-size="true"]
    let videoAspectRatio;
    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      player.getVideoWidth().then(function (width) {
        player.getVideoHeight().then(function (height) {
          videoAspectRatio = height / width;
          const beforeEl = vimeoElement.querySelector(".vimeo-bg__before");
          if (beforeEl) {
            beforeEl.style.paddingTop = videoAspectRatio * 100 + "%";
          }
        });
      });
    }

    // Function to adjust video sizing
    function adjustVideoSizing() {
      const containerAspectRatio =
        (vimeoElement.offsetHeight / vimeoElement.offsetWidth) * 100;

      const iframeWrapper = vimeoElement.querySelector(
        ".vimeo-bg__iframe-wrapper"
      );
      if (iframeWrapper && videoAspectRatio) {
        if (containerAspectRatio > videoAspectRatio * 100) {
          iframeWrapper.style.width = `${
            (containerAspectRatio / (videoAspectRatio * 100)) * 100
          }%`;
        } else {
          iframeWrapper.style.width = "";
        }
      }
    }
    // Adjust video sizing initially
    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      adjustVideoSizing();
      player.getVideoWidth().then(function () {
        player.getVideoHeight().then(function () {
          adjustVideoSizing();
        });
      });
    } else {
      adjustVideoSizing();
    }
    // Adjust video sizing on resize
    window.addEventListener("resize", adjustVideoSizing);
  });
}

function initTextReveal() {
  const elements = document.querySelectorAll(
    "[data-split-lines], [data-split-words]"
  );

  elements.forEach((el) => {
    gsap.set(el, { autoAlpha: 1 });

    const delay = parseFloat(el.getAttribute("data-delay")) || 0;

    //detect type
    let type = "lines";
    if (el.hasAttribute("data-split-words")) {
      type = "words";
    }

    SplitText.create(el, {
      type: type,
      autoSplit: true,
      mask: type === "lines" ? "lines" : undefined,
      onSplit(instance) {
        const targets = type === "lines" ? instance.lines : instance.words;

        return gsap.from(targets, {
          duration: 1,
          yPercent: type === "lines" ? 110 : 75,
          opacity: type === "words" ? 0 : 0,
          stagger: type === "lines" ? 0.08 : 0.08,
          delay: delay,
          ease: "power2.out",
          transformOrigin: "bottom left",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        });
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (has("[data-split-lines]" || "[data-split-words]")) initTextReveal();
  if (has("[data-vimeo-bg-init]")) initVimeoBGVideo();
  if (has("[data-animi]")) initAnimi();
  if (has("[data-stagger-wrapper]")) initStaggerAnmi();
  initDraggableMarquee();
  initPixelatedScrollTransition();
  initDirectionalButtonHover();
  if (has("[data-sticky-steps-init]")) initStickyStepsBasic();
  if (has("[data-accordion-css-init]")) initAccordionCSS();
  if (has('[data-tabs="wrapper"]')) initTabSystem();
  if (has("[data-form-validate]")) initAdvancedFormValidation();
  if (has("[data-nav-bar-height]")) initCheckSectionThemeScroll();
  if (has(".structure_model-wrapper")) initStructureModelAnimation();
  /*
  adjustGrid().then(() => {
    // Page load GSAP timeline
    let pageLoadTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(".transition", { display: "none" });
      },
      defaults: {
        ease: "linear",
      },
    });

    pageLoadTimeline
      .to(
        ".transition-block",
        {
          opacity: 0,
          duration: 0.12,
          stagger: { amount: 0.75, from: "random" },
        },
        0.1
      )
      .fromTo(
        "[data-title-svg] rect",
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.001,
          stagger: { amount: 1, from: "random" },
        },
        "<+=0.25"
      );

    // Pre-process all valid links
    const validLinks = Array.from(document.querySelectorAll("a")).filter(
      (link) => {
        const href = link.getAttribute("href") || "";
        const hostname = new URL(link.href, window.location.origin).hostname;

        return (
          hostname === window.location.hostname && // Same domain
          !href.startsWith("#") && // Not an anchor link
          link.getAttribute("target") !== "_blank" && // Not opening in a new tab
          !link.hasAttribute("data-transition-prevent") // No 'data-transition-prevent' attribute
        );
      }
    );

    // Add event listeners to pre-processed valid links
    validLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Prevent the default behavior and go to the destination after animation
        event.preventDefault();
        const destination = link.href;

        // Show loading grid with animation
        gsap.set(".transition", { display: "grid" });
        gsap.fromTo(
          ".transition-block",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.001,
            ease: "linear",
            stagger: { amount: 0.5, from: "random" },
            onComplete: () => {
              // After grid is full, navigate to the other page
              window.location.href = destination;
            },
          }
        );
      });
    });

    // Handle the back button behavior
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });

    // Additional transition page animation
    const tl = gsap.timeline({
      defaults: { ease: "linear" },
      onStart: () => {
        gsap.set("[data-transition-preload]", {
          display: "grid",
          background: "transparent",
        });
      },
      onComplete: () => {
        gsap.set("[data-transition-preload]", { display: "none" });
      },
    });

    tl.to(".transition-block", {
      opacity: 0,
      duration: 0.12,
      stagger: { amount: 0.75, from: "random" },
    });
  });
  */
});

