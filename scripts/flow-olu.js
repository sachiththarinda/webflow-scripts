// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(CustomEase, Observer, Flip, MorphSVGPlugin);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;
const IS_DESKTOP = window.matchMedia("(min-width: 768px)").matches;
const IS_LARGE_DESKTOP = window.matchMedia("(min-width: 1025px)").matches;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", (e) => (reducedMotion = e.matches));
rmMQ.addListener?.((e) => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Runs once on first load
  // if (has('[data-something]')) initSomething();
  initNavigationMorph();
  if (has("[data-modal-target]")) initModalBasic();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
  if (has("[data-btn-hover]")) initDirectionalButtonHover();
  if (has("[data-layout-group]")) initGridLayoutFlip();
  if (has("[data-swiper-group]")) initSwiperSlider();
  if (has("[data-hover-slider]")) initHoverSlider();
  if (has("[data-fade-slider]")) initImageFadeSlider();
  if (has("[data-swiper-journey]")) initJourneySlider();
  // if (has("[data-splide-wrapper]")) initSplideSlider();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();
  if (has("[grid-elem]")) initGridImageAnimation();
  initNavigationColorChange();
  // initNavigationHideOnScroll();
  if (has("[data-marquee-scroll-direction-target]"))
    initMarqueeScrollDirection();
  initTextReveal();
  if (has("[data-gallery]")) createLightbox(document);

  if (hasLenis) {
    lenis.resize();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const preloader = document.querySelector(".preloader");
  const flipTarget = document.querySelector("[data-preloader-flip]");
  const svg = document.querySelector("[data-preloader-svg]");
  const svgInitial = document.querySelector("[data-preloader-svg-initial]");
  const svgFinal = document.querySelector("[data-preloader-svg-final]");
  const dividerLine = document.querySelector("[data-divider-line]");

  const tl = gsap.timeline({
    defaults: {
      delay: 0.25,
    },
  });

  tl.add("startEnter", 1.5);

  if (dividerLine) {
    gsap.set(dividerLine, {
      width: "0%",
    });
  }

  // Optional if preloader might be hidden initially
  // tl.set(preloader, { autoAlpha: 1 });

  tl.to(svgInitial, {
    duration: 1,
    morphSVG: svgFinal,
    ease: "power2.inOut",
  });

  // Flip tween (timeline will wait because we return it)
  tl.add(() => {
    const state = Flip.getState(svg);
    flipTarget.appendChild(svg);

    return Flip.from(state, {
      duration: 1,
      ease: "power2.inOut",
      absolute: true,
    });
  });

  if (preloader) {
    tl.to(preloader, {
      duration: 1.2,
      delay: 0.75,
      opacity: 0,
      ease: "power2.inOut",
    });

    tl.add(() => {
      preloader.remove();
    });
  }
  if (dividerLine) {
    tl.to(
      dividerLine,
      {
        width: "100%",
        duration: 1,
        ease: "circ.out",
      },
      "startEnter+=0.75"
    );
  }

  // Now reset after EVERYTHING finishes
  tl.call(() => resetPage(next));

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector(
    "[data-transition-panel]"
  );
  const transitionLabel = transitionWrap.querySelector(
    "[data-transition-label]"
  );
  const transitionLabelText = transitionWrap.querySelector(
    "[data-transition-label-text]"
  );
  const transitionDarkWrap = document.querySelector(
    "[data-transition-dark-wrap]"
  );
  const transitionDark = transitionDarkWrap?.querySelector(
    "[data-transition-dark]"
  );

  const nextPageName = next.getAttribute("data-page-name");
  transitionLabelText.innerText = nextPageName || "Hi there";

  const tl = gsap.timeline({
    onComplete: () => {
      if (transitionDark) gsap.set(transitionDark, { autoAlpha: 0 });
      if (transitionDarkWrap) gsap.set(transitionDarkWrap, { autoAlpha: 0 });
      current.remove();
    },
  });

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  if (transitionDarkWrap) {
    gsap.set(
      transitionDarkWrap,
      {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1001,
        autoAlpha: 1,
      },
      0
    );
  }
  if (transitionDark) {
    gsap.set(transitionDark, { autoAlpha: 0 });
  }

  tl.set(
    transitionPanel,
    {
      autoAlpha: 1,
    },
    0
  );

  tl.set(
    next,
    {
      autoAlpha: 0,
    },
    0
  );

  if (transitionDark) {
    tl.to(
      transitionDark,
      {
        autoAlpha: 0.75,
        duration: 1,
        ease: "power3.out",
      },
      0
    );
  }

  tl.fromTo(
    transitionPanel,
    {
      yPercent: 0,
    },
    {
      yPercent: -100,
      duration: 0.8,
    },
    0
  );

  tl.fromTo(
    transitionLabel,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
    },
    "<+=0.2"
  );

  tl.fromTo(
    current,
    {
      y: "0vh",
    },
    {
      y: "-15vh",
      duration: 0.8,
    },
    0
  );
}

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector(
    "[data-transition-panel]"
  );
  const transitionLabel = transitionWrap.querySelector(
    "[data-transition-label]"
  );
  const transitionLabelText = transitionWrap.querySelector(
    "[data-transition-label-text]"
  );

  const dividerLine = next.querySelector("[data-divider-line]");

  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 1.25);

  if (dividerLine) {
    gsap.set(dividerLine, {
      width: "0%",
    });
  }

  tl.set(
    next,
    {
      autoAlpha: 1,
    },
    "startEnter"
  );

  tl.fromTo(
    transitionPanel,
    {
      yPercent: -100,
    },
    {
      yPercent: -200,
      duration: 1,
      overwrite: "auto",
      immediateRender: false,
    },
    "startEnter"
  );

  tl.set(
    transitionPanel,
    {
      autoAlpha: 0,
    },
    ">"
  );

  tl.fromTo(
    transitionLabel,
    {
      autoAlpha: 1,
    },
    {
      autoAlpha: 0,
      duration: 0.4,
      overwrite: "auto",
      immediateRender: false,
    },
    "startEnter+=0.1"
  );
  if (dividerLine) {
    tl.to(
      dividerLine,
      {
        width: "100%",
        duration: 1,
        ease: "circ.out",
      },
      "startEnter+=0.25"
    );
  }
  tl.from(
    next,
    {
      y: "15vh",
      duration: 1,
    },
    "startEnter"
  );

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise((resolve) => {
    tl.call(resolve, null, "pageReady");
  });
}

function runPageOnceAnimationHome(next) {
  const preloader = document.querySelector(".preloader");
  const flipTarget = document.querySelector("[data-preloader-flip]");
  const svg = document.querySelector("[data-preloader-svg]");
  const svgInitial = document.querySelector("[data-preloader-svg-initial]");
  const svgFinal = document.querySelector("[data-preloader-svg-final]");
  const dividerLine = next.querySelector("[data-divider-line]");
  const marqueeElem = next.querySelector("[hero_marquee]");
  const bottomElems = next.querySelectorAll("[hero_bottom_elem]");

  const tl = gsap.timeline({
    defaults: {
      delay: 0.25,
    },
  });

  tl.add("startEnter", 1.75);

  gsap.set(dividerLine, {
    width: "0%",
  });
  gsap.set(marqueeElem, {
    opacity: 0,
    yPercent: 110,
  });
  gsap.set(bottomElems, {
    yPercent: 110,
    opacity: 0,
  });

  // Optional if preloader might be hidden initially
  // tl.set(preloader, { autoAlpha: 1 });

  tl.to(svgInitial, {
    duration: 1,
    morphSVG: svgFinal,
    ease: "power2.inOut",
  });

  // Flip tween (timeline will wait because we return it)
  tl.add(() => {
    const state = Flip.getState(svg);
    flipTarget.appendChild(svg);

    return Flip.from(state, {
      duration: 1,
      ease: "power2.inOut",
      absolute: true,
    });
  });

  if (preloader) {
    tl.to(preloader, {
      duration: 1.2,
      delay: 0.75,
      opacity: 0,
      ease: "power2.inOut",
    });

    tl.add(() => {
      preloader.remove();
    });
  }
  tl.to(
    marqueeElem,
    {
      opacity: 1,
      duration: 1,
      yPercent: 0,
      ease: "power2.out",
    },
    "startEnter+=0.25"
  );
  tl.to(
    dividerLine,
    {
      width: "100%",
      duration: 1,
      ease: "circ.out",
    },
    "startEnter+=0.75"
  );
  tl.to(
    bottomElems,
    {
      opacity: 1,
      yPercent: 0,
      stagger: 0.25,
      ease: "circ.out",
    },
    "startEnter+=1"
  );
  // Now reset after EVERYTHING finishes
  tl.call(() => resetPage(next));

  return tl;
}

function runPageEnterAnimationToHome(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector(
    "[data-transition-panel]"
  );
  const transitionLabel = transitionWrap.querySelector(
    "[data-transition-label]"
  );

  const dividerLine = next.querySelector("[data-divider-line]");
  const marqueeElem = next.querySelector("[hero_marquee]");
  const bottomElems = next.querySelectorAll("[hero_bottom_elem]");

  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 1.25);

  gsap.set(dividerLine, {
    width: "0%",
  });
  gsap.set(marqueeElem, {
    opacity: 0,
    yPercent: 110,
  });
  gsap.set(bottomElems, {
    yPercent: 110,
    opacity: 0,
  });

  tl.set(
    next,
    {
      autoAlpha: 1,
    },
    "startEnter"
  );

  tl.fromTo(
    transitionPanel,
    {
      yPercent: -100,
    },
    {
      yPercent: -200,
      duration: 1,
      overwrite: "auto",
      immediateRender: false,
    },
    "startEnter"
  );

  tl.set(
    transitionPanel,
    {
      autoAlpha: 0,
    },
    ">"
  );

  tl.fromTo(
    transitionLabel,
    {
      autoAlpha: 1,
    },
    {
      autoAlpha: 0,
      duration: 0.4,
      overwrite: "auto",
      immediateRender: false,
    },
    "startEnter+=0.1"
  );
  tl.to(
    marqueeElem,
    {
      opacity: 1,
      duration: 1,
      yPercent: 0,
      ease: "power2.out",
    },
    "startEnter+=0.25"
  );
  tl.to(
    dividerLine,
    {
      width: "100%",
      duration: 1,
      ease: "circ.out",
    },
    "startEnter+=0.75"
  );
  tl.to(
    bottomElems,
    {
      opacity: 1,
      yPercent: 0,
      stagger: 0.25,
      ease: "circ.out",
    },
    "startEnter+=1"
  );

  tl.from(
    next,
    {
      y: "15vh",
      duration: 1,
    },
    "startEnter"
  );

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise((resolve) => {
    tl.call(resolve, null, "pageReady");
  });
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });

  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }

  closeWebflowNav();
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
});

barba.hooks.enter((data) => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter((data) => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);

  // Settle
  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: false,
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,

      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(
          data.current.container,
          data.next.container
        );
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      },
    },
    {
      name: "home-tansition",
      sync: true,
      to: { namespace: ["home"] },

      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimationHome(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        console.log("goint to home");
        return runPageLeaveAnimation(
          data.current.container,
          data.next.container
        );
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimationToHome(data.next.container);
      },
    },
  ],
});

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light",
  },
  dark: {
    nav: "light",
    transition: "dark",
  },
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;

  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector("[data-theme-transition]");
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector("[data-theme-nav]");
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });

  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement("template");
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll("[data-barba-update]");
  var currentNodes = document.querySelectorAll("nav [data-barba-update]");

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute("aria-current");
    if (newStatus !== null) {
      curr.setAttribute("aria-current", newStatus);
    } else {
      curr.removeAttribute("aria-current");
    }

    // Class list sync
    var newClassList = next.getAttribute("class") || "";
    curr.setAttribute("class", newClassList);
  });
}

function closeWebflowNav() {
  document.querySelectorAll(".w-nav").forEach((nav) => {
    const btn = nav.querySelector(".w-nav-button.w--open");
    if (btn) btn.click();
  });
}
// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const GRID_DEFAULTS = {
  gridBackground: "transparent",
  gridSizeDesktop: 38,
  gridSizeMobile: 20,
  gridBorderSize: 0,
  gridBorderColor: "rgba(0, 0, 0, 0)",
  gridColors: [
    "rgba(239, 232, 221, 0.8)",
    "rgba(239, 232, 221, 0.6)",
    "rgba(239, 232, 221, 0.2)",
  ],
};

// ============================================
// NAVIGATION ANIMATIONS
// ============================================
function initNavigationMorph() {
  const navTl = gsap.timeline({ paused: true });

  navTl.to("#nav_initial", {
    duration: 0.5,
    morphSVG: "#nav_final",
    ease: "power2.inOut",
  });

  const navElement = document.querySelector(".nav_elem");

  navElement.addEventListener("mouseenter", () => navTl.play());
  navElement.addEventListener("mouseleave", () => navTl.reverse());
}

function initNavigationColorChange() {
  if (!IS_LARGE_DESKTOP) return;

  const navTargets = [".nav_elem", ".nav_link"];
  const primaryColor = "var(--base-color-brand--primary)";
  const secondaryColor = "var(--base-color-brand--secondary)";

  gsap.utils.toArray("[data-nav-black]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      toggleClass: {
        targets: ".nav_link",
        className: "nav--black",
      },
      onEnter: () =>
        gsap.to(navTargets, {
          color: primaryColor,
          duration: 1.2,
          ease: "expo.out",
        }),
      onLeave: () =>
        gsap.to(navTargets, {
          color: secondaryColor,
          duration: 1.2,
          ease: "expo.out",
        }),
      onEnterBack: () =>
        gsap.to(navTargets, {
          color: primaryColor,
          duration: 1.2,
          ease: "expo.out",
        }),
      onLeaveBack: () =>
        gsap.to(navTargets, {
          color: secondaryColor,
          duration: 1.2,
          ease: "expo.out",
        }),
    });
  });
}

function initNavigationHideOnScroll() {
  ScrollTrigger.create({
    start: "top -100",
    end: 9999999,
    onUpdate: ({ direction }) => {
      const yPosition = direction === -1 ? "0%" : "-120";
      gsap.to(".nav_component", {
        y: yPosition,
        duration: 0.8,
        ease: "Power2.easeOut",
      });
    },
  });
}

// ============================================
// MARQUEE SCROLL ANIMATION
// ============================================
function initMarqueeScrollDirection() {
  nextPage
    .querySelectorAll("[data-marquee-scroll-direction-target]")
    .forEach((marquee) => {
      // Query marquee elements
      const marqueeContent = marquee.querySelector(
        "[data-marquee-collection-target]"
      );
      const marqueeScroll = marquee.querySelector(
        "[data-marquee-scroll-target]"
      );
      if (!marqueeContent || !marqueeScroll) return;

      // Get data attributes
      const {
        marqueeSpeed: speed,
        marqueeDirection: direction,
        marqueeDuplicate: duplicate,
        marqueeScrollSpeed: scrollSpeed,
      } = marquee.dataset;

      // Convert data attributes to usable types
      const marqueeSpeedAttr = parseFloat(speed);
      const marqueeDirectionAttr = direction === "right" ? 1 : -1; // 1 for right, -1 for left
      const duplicateAmount = parseInt(duplicate || 0);
      const scrollSpeedAttr = parseFloat(scrollSpeed);
      const speedMultiplier =
        window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

      let marqueeSpeed =
        marqueeSpeedAttr *
        (marqueeContent.offsetWidth / window.innerWidth) *
        speedMultiplier;

      // Precompute styles for the scroll container
      marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
      marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

      // Duplicate marquee content
      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
      }

      // GSAP animation for marquee content
      const marqueeItems = marquee.querySelectorAll(
        "[data-marquee-collection-target]"
      );
      const animation = gsap
        .to(marqueeItems, {
          xPercent: -100, // Move completely out of view
          repeat: -1,
          duration: marqueeSpeed,
          ease: "linear",
        })
        .totalProgress(0.5);

      // Initialize marquee in the correct direction
      gsap.set(marqueeItems, {
        xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
      });
      animation.timeScale(marqueeDirectionAttr); // Set correct direction
      animation.play(); // Start animation immediately

      // Set initial marquee status
      marquee.setAttribute("data-marquee-status", "normal");

      // ScrollTrigger logic for direction inversion
      ScrollTrigger.create({
        trigger: marquee,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const isInverted = self.direction === 1; // Scrolling down
          const currentDirection = isInverted
            ? -marqueeDirectionAttr
            : marqueeDirectionAttr;

          // Update animation direction and marquee status
          animation.timeScale(currentDirection);
          marquee.setAttribute(
            "data-marquee-status",
            isInverted ? "normal" : "inverted"
          );
        },
      });

      // Extra speed effect on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: marquee,
          start: "0% 100%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      const scrollStart =
        marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
      const scrollEnd = -scrollStart;

      tl.fromTo(
        marqueeScroll,
        { x: `${scrollStart}vw` },
        { x: `${scrollEnd}vw`, ease: "none" }
      );
    });
}

// ============================================
// GRID ANIMATION
// ============================================
function initGrid(el) {
  const gridBackground =
    el.getAttribute("data-grid-background") || GRID_DEFAULTS.gridBackground;
  const gridSizeDesktop =
    parseInt(el.getAttribute("data-grid-size-desktop")) ||
    GRID_DEFAULTS.gridSizeDesktop;
  const gridSizeMobile =
    parseInt(el.getAttribute("data-grid-size-mobile")) ||
    GRID_DEFAULTS.gridSizeMobile;
  const gridBorderSize =
    parseFloat(el.getAttribute("data-grid-border-size")) ||
    GRID_DEFAULTS.gridBorderSize;
  const gridBorderColor =
    el.getAttribute("data-grid-border-color") || GRID_DEFAULTS.gridBorderColor;

  let gridColors = GRID_DEFAULTS.gridColors;
  const attrColors = el.getAttribute("data-grid-colors");
  if (attrColors) {
    try {
      gridColors = JSON.parse(attrColors);
    } catch (e) {
      try {
        gridColors = JSON.parse(attrColors.replace(/'/g, '"'));
      } catch (e2) {
        gridColors = GRID_DEFAULTS.gridColors;
      }
    }
  }

  el.style.backgroundColor = gridBackground;
  const canvas = document.createElement("canvas");
  el.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let cols,
    rows,
    squareSize,
    blocks,
    lastHoveredIndex = null;

  function setupGrid() {
    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeight;
    cols = window.innerWidth < 992 ? gridSizeMobile : gridSizeDesktop;
    squareSize = canvas.width / cols;
    rows = Math.ceil(canvas.height / squareSize);
    const offsetY = canvas.height - rows * squareSize;

    blocks = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        blocks.push({
          x: x * squareSize,
          y: offsetY + y * squareSize,
          color: "white",
          alpha: 0,
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blocks.forEach((block) => {
      ctx.fillStyle = block.color;
      ctx.globalAlpha = block.alpha;
      ctx.fillRect(block.x, block.y, squareSize, squareSize);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = gridBorderColor;
      ctx.lineWidth = gridBorderSize;
      ctx.strokeRect(block.x, block.y, squareSize, squareSize);
    });
    requestAnimationFrame(draw);
  }

  function fadeOut(block) {
    gsap.to(block, { alpha: 0, duration: 0.2, delay: 0.25 });
  }

  if (!supportsTouch()) {
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const hoveredIndex = blocks.findIndex(
        (block) =>
          mouseX >= block.x &&
          mouseX < block.x + squareSize &&
          mouseY >= block.y &&
          mouseY < block.y + squareSize
      );

      if (hoveredIndex !== -1 && hoveredIndex !== lastHoveredIndex) {
        const block = blocks[hoveredIndex];
        block.color = gridColors[Math.floor(Math.random() * gridColors.length)];
        gsap.to(block, { alpha: 1, duration: 0.1, overwrite: true });
        fadeOut(block);
        lastHoveredIndex = hoveredIndex;
      }
    });
  }

  window.addEventListener("resize", debounce(setupGrid, 200));

  setupGrid();
  draw();
}

function initGrids() {
  if (window.innerWidth < 992) return;
  document.querySelectorAll("[data-grid]").forEach((el) => initGrid(el));
}

function initGridLayoutFlip() {
  const groups = nextPage.querySelectorAll("[data-layout-group]");
  const ACTIVE_CLASS = "is--active"; // The classes toggled on your buttons

  groups.forEach((group) => {
    let activeTween = null;

    const buttons = group.querySelectorAll("[data-layout-button]");
    const grid = group.querySelector("[data-layout-grid]");
    const collection = group.querySelector("[data-layout-grid-collection]");
    if (!buttons.length || !grid || !collection) {
      console.warn(
        "Missing required HTML elements. Check the Osmo resoure documentation!"
      );
      return;
    }

    // a11y init
    buttons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.classList.contains(ACTIVE_CLASS)))
    );

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetLayout = btn.getAttribute("data-layout-button"); // "large" | "small"
        const currentLayout = group.getAttribute("data-layout-status");
        if (currentLayout === targetLayout) return;

        // Kill any in-flight animation
        if (activeTween) {
          activeTween.kill();
          activeTween = null;
        }

        // Reduced-motion: just toggle and refresh
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          group.setAttribute("data-layout-status", targetLayout);
          buttons.forEach((b) => {
            const isActive = b === btn;
            b.classList.toggle(ACTIVE_CLASS, isActive);
            b.setAttribute("aria-pressed", String(isActive));
          });
          window.ScrollTrigger?.refresh?.();
          if (window.lenis?.resize) window.lenis.resize();
          return;
        }

        // Record state of items
        const items = grid.querySelectorAll("[data-layout-grid-item]");
        const state = Flip.getState(items, { simple: true });

        // Measure current height on the collection (force layout first)
        collection.getBoundingClientRect();
        const prevH = collection.offsetHeight;

        // Switch to target layout
        group.setAttribute("data-layout-status", targetLayout);
        buttons.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle(ACTIVE_CLASS, isActive);
          b.setAttribute("aria-pressed", String(isActive));
        });

        // Measure next height after switching
        collection.getBoundingClientRect();
        const nextH = collection.offsetHeight;

        // Pin collection height so items can go absolute without collapsing
        gsap.set(collection, { height: prevH });

        // Build timeline: Flip + collection height animation
        const tl = gsap.timeline({
          onStart: () => {
            group.setAttribute("data-transitioning", "true");
          },
          onInterrupt: () => {
            group.removeAttribute("data-transitioning");
            gsap.set(collection, { clearProps: "height" });
          },
          onComplete: () => {
            group.removeAttribute("data-transitioning");
            gsap.set(collection, { clearProps: "height" });
            window.ScrollTrigger?.refresh?.();
            if (window.lenis?.resize) window.lenis.resize();
            activeTween = null;
          },
        });

        tl.add(
          Flip.from(state, {
            duration: 0.65,
            ease: "power4.inOut",
            absolute: true,
            nested: true,
            prune: true,
            stagger:
              targetLayout === "large"
                ? { each: 0.03, from: "end" }
                : { each: 0.03, from: "start" },
          }),
          0
        ).to(
          collection,
          {
            height: nextH,
            duration: 0.65,
            ease: "power4.inOut",
          },
          0
        );

        activeTween = tl;
      });
    });
  });
}

// ============================================
// GRID IMAGE ANIMATION
// ============================================
function initGridImageAnimation() {
  nextPage.querySelectorAll("[grid-elem]").forEach((el) => {
    gsap.set(el, {
      overflow: "hidden",
    });

    const targetElement = el.querySelector("[grid-img]");
    if (!targetElement) return;

    gsap.set(targetElement, {
      scale: 1.25,
      rotation: 10,
      opacity: 0,
    });

    gsap.to(targetElement, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 75%",
      },
    });
  });
}

// ============================================
// BUTTON HOVER ANIMATION
// ============================================
function initDirectionalButtonHover() {
  // Button hover animation
  nextPage.querySelectorAll("[data-btn-hover]").forEach((button) => {
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

// ============================================
// MODAL ANIMATION
// ============================================
function initModalBasic() {
  const modalGroup = document.querySelector("[data-modal-group-status]");
  const modals = document.querySelectorAll("[data-modal-name]");
  const modalTargets = document.querySelectorAll("[data-modal-target]");

  // Open modal
  modalTargets.forEach((modalTarget) => {
    modalTarget.addEventListener("click", function () {
      const modalTargetName = this.getAttribute("data-modal-target");

      // Close all modals
      modalTargets.forEach((target) =>
        target.setAttribute("data-modal-status", "not-active")
      );
      modals.forEach((modal) =>
        modal.setAttribute("data-modal-status", "not-active")
      );

      // Activate clicked modal
      document
        .querySelector(`[data-modal-target="${modalTargetName}"]`)
        .setAttribute("data-modal-status", "active");
      document
        .querySelector(`[data-modal-name="${modalTargetName}"]`)
        .setAttribute("data-modal-status", "active");

      // Set group to active
      if (modalGroup) {
        modalGroup.setAttribute("data-modal-group-status", "active");
      }
    });
  });

  // Close modal
  document.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
    closeBtn.addEventListener("click", closeAllModals);
  });

  // Close modal on `Escape` key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  // Function to close all modals
  function closeAllModals() {
    modalTargets.forEach((target) =>
      target.setAttribute("data-modal-status", "not-active")
    );

    if (modalGroup) {
      modalGroup.setAttribute("data-modal-group-status", "not-active");
    }
  }
}

// ============================================
// HOME SWIPER SLIDER
// ============================================
function initSwiperSlider() {
  const swiperSliderGroups = nextPage.querySelectorAll("[data-swiper-group]");
  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderBackground = swiperGroup.querySelector(
      "[data-swiper-background]"
    );
    const swiperSliderTitle = swiperGroup.querySelector("[data-swiper-title]");
    const swiperSliderSmall = swiperGroup.querySelector("[data-swiper-small]");
    if (!swiperSliderBackground || !swiperSliderTitle || !swiperSliderSmall)
      return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");

    const sliderOne = new Swiper(swiperSliderBackground, {
      slidesPerView: 1,
      //centeredSlides: true,
      speed: 1200,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      effect: "fade",
      parallax: true,
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
    });

    // Title slider
    const sliderTwo = new Swiper(swiperSliderTitle, {
      slidesPerView: 1,
      //centeredSlides: true,
      spaceBetween: 0,
      //direction: "vertical",
      simulateTouch: false,
      loop: true,
      grabCursor: false,
      speed: 1200,
      parallax: true,
    });

    // Small slider
    const sliderThree = new Swiper(swiperSliderSmall, {
      slidesPerView: 1,
      //centeredSlides: true,
      spaceBetween: 0,
      //direction: "vertical",
      simulateTouch: false,
      loop: true,
      grabCursor: false,
      speed: 1200,
      parallax: true,
      slideActiveClass: "is-active",
    });

    // Bidirectional control to ensure full sync
    sliderOne.controller.control = [sliderTwo, sliderThree];
    sliderTwo.controller.control = sliderOne;
    sliderThree.controller.control = sliderOne;
  });
}

// ============================================
// HOME HOVER SLIDER
// ============================================
function initHoverSlider() {
  const hoverSliderWrapper = nextPage.querySelectorAll("[data-hover-slider]");

  hoverSliderWrapper.forEach((hoverSlider) => {
    const previewWrappers = hoverSlider.querySelectorAll(".menu-preview-img");
    const menuLinks = hoverSlider.querySelectorAll(".process_menu_link");
    let currentIndex = 0;

    menuLinks[0].classList.add("is-active");

    previewWrappers.forEach((img, index) => {
      gsap.set(img, {
        opacity: index === 0 ? 1 : 0,
        scale: index === 0 ? 1 : 1.25,
        rotation: index === 0 ? 0 : 10,
        zIndex: index === 0 ? 2 : 1,
      });
    });

    menuLinks.forEach((link, index) => {
      link.addEventListener("mouseenter", () => {
        if (index === currentIndex) return;

        currentIndex = index;

        // Toggle is-active class
        menuLinks.forEach((l, i) => {
          l.classList.toggle("is-active", i === index);
        });

        previewWrappers.forEach((wrapper, i) => {
          gsap.killTweensOf(wrapper);

          if (i === index) {
            gsap.set(wrapper, { zIndex: 2 });
            gsap.fromTo(
              wrapper,
              {
                opacity: 0,
                scale: 1.25,
                rotation: 10,
              },
              {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.75,
                ease: "power2.out",
                overwrite: "auto",
              }
            );
          } else {
            gsap.set(wrapper, { zIndex: 1 });
            gsap.to(wrapper, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        });
      });
    });
  });
}

// ============================================
// JOURNEY SLIDER
// ============================================
function initJourneySlider() {
  const swiperSliderJourney = nextPage.querySelectorAll(
    "[data-swiper-journey]"
  );
  swiperSliderJourney.forEach((swiper) => {
    const swiperJourneyContent = swiper.querySelector(
      "[data-swiper-journey-content]"
    );
    const swiperJourneyTimeline = swiper.querySelector(
      "[data-swiper-journey-timeline]"
    );
    if (!swiperSliderJourney || !swiperJourneyTimeline) return;

    const sliderTwo = new Swiper(swiperJourneyContent, {
      slidesPerView: 1,
      spaceBetween: 40,
      simulateTouch: false,
      loop: true,
      grabCursor: false,
      speed: 1200,
      parallax: true,
      loopAddBlankSlides: true,
      slideToClickedSlide: true,
    });

    const sliderOne = new Swiper(swiperJourneyTimeline, {
      speed: 1200,
      slidesPerView: 1.25,
      loop: true,
      grabCursor: true,
      slideToClickedSlide: true,
      slideActiveClass: "is-active",
      slideDuplicateActiveClass: "is-active",
      loopAddBlankSlides: true,
      thumbs: {
        swiper: sliderTwo,
      },
      breakpoints: {
        // mobile landscape
        480: {
          slidesPerView: 1.25,
        },
        // tablet
        768: {
          slidesPerView: 2,
        },
        // desktop
        992: {
          slidesPerView: 2,
        },
      },
    });

    //sliderOne.controller.control = sliderTwo;
  });
}

// ============================================
// TEAM SLIDER
// ============================================
function initSplideSlider() {
  const splideSliderWarpper = nextPage.querySelectorAll(
    "[data-splide-wrapper]"
  );
  splideSliderWarpper.forEach((splide) => {
    const splideSlider = splide.querySelector("[data-splide-slider]");
    if (!splide) return;

    const splideList = splide.querySelector("[data-splide-list]");

    const mySlider = new Splide(splideSlider, {
      autoWidth: true,
      focus: "center",
      drag: "free",
      type: "loop",
      arrows: false,
      pagination: false,
      speed: 600,
      dragAngleThreshold: 60,
      waitForTransition: false,
      updateOnMove: true,
    }).mount();

    Observer.create({
      target: splideList, // The track element that scrolls
      type: "pointer,touch,wheel",
      onChangeX(self) {
        const velocity = 1 - Math.abs(self.velocityX * 0.0002);
        const scaleAmount = gsap.utils.clamp(0.8, 1, velocity);
        gsap.to(".team_img-wrapper", {
          scale: scaleAmount,
          ease: "none",
          duration: 0.6,
          overwrite: true,
        });
      },
      onStop() {
        gsap.to(".team_img-wrapper", {
          scale: 1,
          ease: "power1.out",
          duration: 0.4,
          overwrite: true,
        });
      },
    });
  });
}
// ============================================
// HOME FADE SLIDER
// ============================================
function initImageFadeSlider() {
  const fadeSliderWrapper = nextPage.querySelectorAll("[data-fade-slider]");

  fadeSliderWrapper.forEach((fadeSlider) => {
    const allCovers = fadeSlider.querySelectorAll(".home_philosophy-image");

    const covers = [...allCovers].reverse();

    gsap.set(covers, { opacity: 1 });

    const tl = gsap.timeline({ repeat: -1 });

    covers.forEach((cover, index) => {
      tl.to(cover, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
      });
    });

    tl.to(
      covers,
      {
        opacity: 1,
        duration: 0,
        ease: "power2.inOut",
      },
      "-=1.5"
    );
  });
}

// ============================================
// TEXT REVEAL ANIMATION
// ============================================
function initTextReveal() {
  let headings = nextPage.querySelectorAll("[lines-slide-up]");
  headings.forEach((heading) => {
    gsap.set(heading, { autoAlpha: 1 });

    SplitText.create(heading, {
      type: "lines",
      autoSplit: true,
      mask: "lines",
      onSplit(instance) {
        return gsap.from(instance.lines, {
          duration: 1,
          yPercent: 110,
          opacity: 0,
          stagger: 0.08,
          // rotation: 10,
          transformOrigin: "bottom left",
          ease: "expo.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 90%",
            once: true,
          },
        });
      },
    });
  });
}

// ============================================
// GALLERY LIGHTBOX
// ============================================
function createLightbox(
  container,
  { onStart, onOpen, onClose, onCloseComplete } = {}
) {
  const elements = {
    wrapper: container.querySelector('[data-lightbox="wrapper"]'),
    triggers: container.querySelectorAll('[data-lightbox="trigger"]'),
    triggerParents: container.querySelectorAll(
      '[data-lightbox="trigger-parent"]'
    ),
    items: container.querySelectorAll('[data-lightbox="item"]'),
    nav: container.querySelectorAll('[data-lightbox="nav"]'),
    counter: {
      current: container.querySelector('[data-lightbox="counter-current"]'),
      total: container.querySelector('[data-lightbox="counter-total"]'),
    },
    buttons: {
      prev: container.querySelector('[data-lightbox="prev"]'),
      next: container.querySelector('[data-lightbox="next"]'),
      close: container.querySelector('[data-lightbox="close"]'),
    },
  };

  // Create our main timeline that will coordinate all animations
  const mainTimeline = gsap.timeline();

  // ————————— COUNTER ————————— //
  if (elements.counter.total) {
    elements.counter.total.textContent = elements.triggers.length;
  }

  // ————————— CLOSE FUNCTION ————————— //
  function closeLightbox() {
    // on close callback
    onClose?.();

    // First, we clear any running animations to prevent conflicts
    mainTimeline.clear();
    gsap.killTweensOf([
      elements.wrapper,
      elements.nav,
      elements.triggerParents,
      elements.items,
      container.querySelector('[data-lightbox="original"]'),
    ]);

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        elements.wrapper.classList.remove("is-active");

        // Show all hidden images in lightbox items
        elements.items.forEach((item) => {
          item.classList.remove("is-active");
          const lightboxImage = item.querySelector("img");
          if (lightboxImage) {
            lightboxImage.style.display = "";
          }
        });

        // Clear any lingering transform properties on the original image
        const originalImg = container.querySelector(
          '[data-lightbox="original"]'
        );
        if (originalImg) {
          gsap.set(originalImg, { clearProps: "all" });
        }

        // Remove the fixed height from the trigger parent
        const originalParent = container.querySelector(
          '[data-lightbox="original-parent"]'
        );
        if (originalParent) {
          originalParent.parentElement.style.removeProperty("height");
        }

        // on close complete callback
        onCloseComplete?.();
      },
    });

    // First, find and move back the original item
    const originalItem = container.querySelector('[data-lightbox="original"]');
    const originalParent = container.querySelector(
      '[data-lightbox="original-parent"]'
    );

    if (originalItem && originalParent) {
      // Before moving the item back, clear its transforms
      gsap.set(originalItem, { clearProps: "all" });
      // Move the item back to its original parent
      originalParent.appendChild(originalItem);
      originalParent.removeAttribute("data-lightbox");
      originalItem.removeAttribute("data-lightbox");
    }

    // Find active slide
    let activeLightboxSlide = container.querySelector(
      '[data-lightbox="item"].is-active'
    );

    // Return animation
    tl.to(elements.triggerParents, {
      autoAlpha: 1,
      duration: 0.5,
      stagger: 0.03,
      overwrite: true,
    })
      .to(
        elements.nav,
        {
          autoAlpha: 0,
          y: "1rem",
          duration: 0.4,
          stagger: 0,
        },
        "<"
      )
      .to(
        elements.wrapper,
        {
          backgroundColor: "rgba(0,0,0,0)",
          duration: 0.4,
        },
        "<"
      )
      .to(
        activeLightboxSlide,
        {
          autoAlpha: 0,
          duration: 0.4,
        },
        "<"
      )
      .set([elements.items, activeLightboxSlide, elements.triggerParents], {
        clearProps: "all",
      });

    // Add this timeline to our main timeline
    mainTimeline.add(tl);
  }

  // ————————— CLICK-OUTSIDE FUNCTIONALITY ————————— //
  function handleOutsideClick(event) {
    if (event.detail === 0) {
      return;
    }

    const clickedElement = event.target;
    const isOutside = !clickedElement.closest(
      '[data-lightbox="item"].is-active img, [data-lightbox="nav"], [data-lightbox="close"], [data-lightbox="trigger"]'
    );

    if (isOutside) {
      closeLightbox();
    }
  }

  // ————————— TOGGLE ACTIVE ITEM IN LIGHTBOX ————————— //
  function updateActiveItem(index) {
    elements.items.forEach((item) => item.classList.remove("is-active"));
    elements.items[index].classList.add("is-active");

    if (elements.counter.current) {
      elements.counter.current.textContent = index + 1;
    }
  }

  // ————————— CLICK TO OPEN ————————— //
  elements.triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      // On start of open callback
      onStart?.();

      // Clear any running animations before starting new ones
      mainTimeline.clear();
      gsap.killTweensOf([
        elements.wrapper,
        elements.nav,
        elements.triggerParents,
      ]);

      const img = trigger.querySelector("img");
      const state = Flip.getState(img);

      // Store the trigger's current height before the FLIP animation
      // So the grid does not collapse
      const triggerRect = trigger.getBoundingClientRect();
      trigger.parentElement.style.height = `${triggerRect.height}px`;

      // Save element and parent that was clicked
      trigger.setAttribute("data-lightbox", "original-parent");
      img.setAttribute("data-lightbox", "original");

      // Set correct lightbox item to visible
      updateActiveItem(index);

      // Start listening for clicks outside of lightbox
      container.addEventListener("click", handleOutsideClick);

      const tl = gsap.timeline({
        onComplete: () => {
          // On open callback
          onOpen?.();
        },
      });
      elements.wrapper.classList.add("is-active");
      const targetItem = elements.items[index];

      // Hide the original image in the lightbox item
      const lightboxImage = targetItem.querySelector("img");
      if (lightboxImage) {
        lightboxImage.style.display = "none";
      }

      // Fade out other grid items
      elements.triggerParents.forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          gsap.to(otherTrigger, {
            autoAlpha: 0,
            duration: 0.4,
            stagger: 0.02,
            overwrite: true,
          });
        }
      });

      // Flip clicked image into lightbox
      if (!targetItem.contains(img)) {
        targetItem.appendChild(img);
        tl.add(
          Flip.from(state, {
            targets: img,
            absolute: true,
            duration: 0.6,
            ease: "power2.inOut",
          }),
          0
        );
      }

      // Animate in our navigation and background
      tl.to(
        elements.wrapper,
        {
          backgroundColor: "rgba(0,0,0,0.75)",
          duration: 0.6,
        },
        0
      ).fromTo(
        elements.nav,
        {
          autoAlpha: 0,
          y: "1rem",
        },
        {
          autoAlpha: 1,
          y: "0rem",
          duration: 0.6,
          stagger: { each: 0.05, from: "center" },
        },
        0.2
      );

      // Add this timeline to our main timeline
      mainTimeline.add(tl);
    });
  });

  // ————————— NAV BUTTONS ————————— //
  if (elements.buttons.next) {
    elements.buttons.next.addEventListener("click", () => {
      const currentIndex = Array.from(elements.items).findIndex((item) =>
        item.classList.contains("is-active")
      );
      const nextIndex = (currentIndex + 1) % elements.items.length;
      updateActiveItem(nextIndex);
    });
  }

  if (elements.buttons.prev) {
    elements.buttons.prev.addEventListener("click", () => {
      const currentIndex = Array.from(elements.items).findIndex((item) =>
        item.classList.contains("is-active")
      );
      const prevIndex =
        (currentIndex - 1 + elements.items.length) % elements.items.length;
      updateActiveItem(prevIndex);
    });
  }

  if (elements.buttons.close) {
    elements.buttons.close.addEventListener("click", closeLightbox);
  }

  // ————————— KEYBOARD NAV ————————— //
  document.addEventListener("keydown", (event) => {
    if (!elements.wrapper.classList.contains("is-active")) return;
    switch (event.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowRight":
        elements.buttons.next?.click();
        break;
      case "ArrowLeft":
        elements.buttons.prev?.click();
        break;
    }
  });
}
