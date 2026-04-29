// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(
  CustomEase,
  ScrollTrigger,
  Flip,
  Observer,
  SplitText,
  InertiaPlugin,
  DrawSVGPlugin,
  Draggable
);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

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
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
  if (has("[data-navigation-status]")) initNavigation();
  if (has("[data-inertia-init]")) initMomentumBasedCardsHover();
  if (has("[data-scroll-animation]")) initScrolltriggerAnimations();
  if (has("[data-flick-cards-init]")) initFlickCards();
  if (has("[data-flickity-type]")) initFlickitySlider();
  if (has("[data-img-fade]")) initImageFade();
  if (has("[data-vimeo]")) initVimeo();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();
  if (has("[data-marquee-scroll-direction-target]"))
    initMarqueeScrollDirection();
  if (has("[js-scrollflip-element]")) initFlipAnimations();

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
  const transitionWrap = document.querySelector("[data-once-transition-wrap]");
  const transitionSVGPath = transitionWrap.querySelectorAll("svg path");
  const transitionLogo = transitionWrap.querySelector(
    "[data-once-transition-logo]"
  );

  const tl = gsap.timeline({
    defaults: {
      delay: 0.25,
    },
  });

  tl.set(transitionWrap, {
    autoAlpha: 1,
  });

  tl.set(transitionSVGPath, {
    strokeWidth: "35%",
    drawSVG: "0% 100%",
  });

  tl.set(transitionLogo, {
    autoAlpha: 1,
  });

  tl.to(
    transitionSVGPath,
    {
      duration: 1.25,
      drawSVG: "100% 100%",
      strokeWidth: "5%",
      ease: "Power1.easeInOut",
    },
    0
  );

  tl.to(
    transitionLogo,
    {
      autoAlpha: 0,
    },
    "< 0.125"
  );

  tl.call(
    () => {
      resetPage(next);
    },
    null,
    0
  );

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionSVGPath = transitionWrap.querySelectorAll("svg path");
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");

  const transitionSVGColor =
    next.getAttribute("data-transition-color") || "#ff764a";
  gsap.set(transitionSVGPath, { stroke: transitionSVGColor });

  const tl = gsap.timeline({
    onComplete: () => {
      current.remove();
    },
  });

  closeNavigation();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.set(
    next,
    {
      autoAlpha: 0,
    },
    0
  );

  tl.set(transitionSVGPath, {
    strokeWidth: "5%",
    drawSVG: "0% 0%",
  });

  tl.set(transitionLogo, {
    autoAlpha: 0,
  });

  tl.to(transitionSVGPath, {
    duration: 1,
    drawSVG: "0% 100%",
    ease: "Power1.easeInOut",
  });

  tl.to(
    transitionSVGPath,
    {
      strokeWidth: "35%",
      duration: 0.75,
      ease: "Power1.easeInOut",
    },
    "< 0.25"
  );
  tl.to(
    transitionLogo,
    {
      autoAlpha: 1,
    },
    "< 0.25"
  );

  return tl;
}

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionSVGPath = transitionWrap.querySelectorAll("svg path");
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");

  const transitionSVGColor =
    next.getAttribute("data-transition-color") || "#ff764a";
  gsap.set(transitionSVGPath, { stroke: transitionSVGColor });

  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 1);

  tl.set(
    next,
    {
      autoAlpha: 1,
    },
    "startEnter"
  );

  tl.set(transitionSVGPath, {
    drawSVG: "0% 100%",
  });

  tl.set(transitionLogo, {
    autoAlpha: 1,
  });

  tl.to(
    transitionSVGPath,
    {
      duration: 1.25,
      drawSVG: "100% 100%",
      strokeWidth: "5%",
      ease: "Power1.easeInOut",
    },
    "startEnter"
  );

  tl.to(
    transitionLogo,
    {
      autoAlpha: 0,
    },
    "< 0.25"
  );

  tl.fromTo(
    next.querySelector("h1"),
    {
      yPercent: 25,
      autoAlpha: 0,
    },
    {
      yPercent: 0,
      autoAlpha: 1,
      ease: "expo.out",
      duration: 1,
    },
    "< 0.75"
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

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
  resetWebflow(data);
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
  debug: true, // Set to 'false' in production
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

function closeNavigation() {
  const navStatusEl = document.querySelector("[data-navigation-status]");
  if (!navStatusEl) return;

  navStatusEl.setAttribute("data-navigation-status", "not-active");

  // If using Lenis and you stopped it when opening nav:
  if (lenis && typeof lenis.start === "function") {
    lenis.start();
  }
}

// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

function initNavigation() {
  nextPage
    .querySelectorAll('[data-navigation-toggle="toggle"]')
    .forEach((toggleBtn) => {
      toggleBtn.addEventListener("click", () => {
        const navStatusEl = nextPage.querySelector("[data-navigation-status]");
        if (!navStatusEl) return;

        if (
          navStatusEl.getAttribute("data-navigation-status") === "not-active"
        ) {
          navStatusEl.setAttribute("data-navigation-status", "active");
        } else {
          navStatusEl.setAttribute("data-navigation-status", "not-active");
        }
      });
    });

  nextPage
    .querySelectorAll('[data-navigation-toggle="close"]')
    .forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        const navStatusEl = document.querySelector("[data-navigation-status]");
        if (!navStatusEl) return;
        navStatusEl.setAttribute("data-navigation-status", "not-active");
      });
    });

  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
      const navStatusEl = document.querySelector("[data-navigation-status]");
      if (!navStatusEl) return;
      if (navStatusEl.getAttribute("data-navigation-status") === "active") {
        navStatusEl.setAttribute("data-navigation-status", "not-active");
      }
    }
  });
}

/**
 * Momentum Based Cards Hover
 */
function initMomentumBasedCardsHover() {
  // Abort if pointer can't hover or is not fine (e.g. touch screens)
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  // Ensure GSAP and InertiaPlugin are loaded
  if (typeof gsap === "undefined" || typeof InertiaPlugin === "undefined") {
    console.warn("GSAP or InertiaPlugin not found.");
    return;
  }

  // Constants for tuning interaction
  const xyMultiplier = 30; // affects x/y offset strength
  const rotationMultiplier = 20; // affects rotational velocity
  const inertiaResistance = 200; // higher = faster stop

  // Clamp functions to limit max values
  const clampXY = gsap.utils.clamp(-1080, 1080);
  const clampRot = gsap.utils.clamp(-60, 60);

  nextPage.querySelectorAll("[data-inertia-init]").forEach((root) => {
    let prevX = 0,
      prevY = 0;
    let velX = 0,
      velY = 0;
    let rafId = null;

    // Pointer movement tracking for velocity
    root.addEventListener("mousemove", (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        velX = e.clientX - prevX;
        velY = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        rafId = null;
      });
    });

    // Inertia effect on each interactive card element
    root.querySelectorAll("[data-inertia-element]").forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        const target = el.querySelector("[data-inertia-child]");
        if (!target) return;

        // Calculate offset from element center
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        // Torque calculation and normalization
        const rawTorque = offsetX * velY - offsetY * velX;
        const leverDistance = Math.hypot(offsetX, offsetY) || 1;
        const angularForce = rawTorque / leverDistance;

        // Velocity + rotation clamped values
        const velocityX = clampXY(velX * xyMultiplier);
        const velocityY = clampXY(velY * xyMultiplier);
        const rotationVelocity = clampRot(angularForce * rotationMultiplier);

        // Apply GSAP inertia animation
        gsap.to(target, {
          inertia: {
            x: { velocity: velocityX, end: 0 },
            y: { velocity: velocityY, end: 0 },
            rotation: { velocity: rotationVelocity, end: 0 },
            resistance: inertiaResistance,
          },
          overwrite: true,
        });
      });
    });
  });
}

function initScrolltriggerAnimations() {
  $('[data-scroll-animation="draw"]').each(function () {
    let triggerElement = $(this);
    let targetElement = $(this).find("path");

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 100%",
        end: "100% 0%",
        toggleActions: "play none none reset",
      },
    });

    tl.fromTo(
      targetElement,
      {
        drawSVG: "0% 0%",
      },
      {
        delay: 0.1,
        drawSVG: "0% 100%",
        duration: 0.8,
        clearProps: "all",
      }
    );
  });

  $('[data-scroll-animation="draw-stagger"]').each(function () {
    let triggerElement = $(this);
    let targetElement = $(this).find("path");

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 100%",
        end: "100% 0%",
        toggleActions: "play none none reset",
      },
    });

    tl.fromTo(
      targetElement,
      {
        drawSVG: "0% 0%",
      },
      {
        delay: 0.1,
        drawSVG: "0% 100%",
        duration: 0.8,
        stagger: 0.4,
        clearProps: "all",
      }
    );
  });

  $('[data-scroll-animation="sticker"]').each(function () {
    let triggerElement = $(this);
    let targetElement = $(this);

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 100%",
        end: "100% 0%",
        toggleActions: "play none none reset",
      },
    });

    tl.from(targetElement, {
      xPercent: () => gsap.utils.random(-45, 45),
      yPercent: () => gsap.utils.random(-45, 45),
      rotation: () => gsap.utils.random(-45, 45),
      scale: 0,
      duration: 0.8,
      ease: "elastic.out(1,0.75)",
      clearProps: "all",
    });
  });

  $('[data-scroll-animation="sticker-draw"]').each(function () {
    let triggerElement = $(this);
    let targetElement = $(this)
      .find('[data-scroll-animation-target="draw"]')
      .find("path");
    let targetElementSticker = $(this).find(
      '[data-scroll-animation-target="sticker"]'
    );

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "25% 100%",
        end: "100% 0%",
        toggleActions: "play none none reset",
      },
    });

    tl.from(targetElementSticker, {
      delay: 0.1,
      xPercent: -45,
      yPercent: 45,
      rotate: -45,
      scale: 0,
      duration: 0.8,
      ease: "elastic.out(1,0.75)",
      clearProps: "all",
    });

    tl.fromTo(
      targetElement,
      {
        drawSVG: "0% 0%",
      },
      {
        drawSVG: "0% 100%",
        duration: 0.8,
        clearProps: "all",
      },
      "<"
    );
  });

  $('[data-scroll-animation="draw-sticker"]').each(function () {
    let triggerElement = $(this);
    let targetElement = $(this)
      .find('[data-scroll-animation-target="draw"]')
      .find("path");
    let targetElementSticker = $(this).find(
      '[data-scroll-animation-target="sticker"]'
    );

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "25% 100%",
        end: "100% 0%",
        toggleActions: "play none none reset",
      },
    });

    tl.fromTo(
      targetElement,
      {
        drawSVG: "0% 0%",
      },
      {
        delay: 0.1,
        drawSVG: "0% 100%",
        duration: 0.8,
        clearProps: "all",
      }
    );

    tl.from(
      targetElementSticker,
      {
        xPercent: -45,
        yPercent: 45,
        rotate: -45,
        scale: 0,
        duration: 0.8,
        ease: "elastic.out(1,0.75)",
        clearProps: "all",
      },
      "< 0.5"
    );
  });

  $('[data-scroll-animation="stickers"]').each(function () {
    let triggerElement = $(this);
    let targetElement = $(this).find("[data-scroll-animation-target]");

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 100%",
        end: "100% 0%",
        toggleActions: "play none none reset",
      },
    });

    tl.from(targetElement, {
      xPercent: () => gsap.utils.random(-45, 45),
      yPercent: () => gsap.utils.random(-45, 45),
      rotation: () => gsap.utils.random(-45, 45),
      scale: 0,
      duration: 0.8,
      ease: "elastic.out(1,0.75)",
      stagger: {
        amount: 1,
        from: "random",
      },
      clearProps: "all",
    });
  });
}

/**
 * Flip image
 */
function initFlipAnimations() {
  // SETUP PLUGINS
  ScrollTrigger.normalizeScroll(true);
  // SETUP ELEMENTS
  let zoneEl = $("[js-scrollflip-element='zone']"),
    targetEl = $("[js-scrollflip-element='target']").first();
  // SETUP TIMELINE
  let tl;
  function createTimeline() {
    if (tl) {
      tl.kill();
      gsap.set(targetEl, { clearProps: "all" });
    }
    tl = gsap.timeline({
      scrollTrigger: {
        trigger: zoneEl.first(),
        start: "center center",
        endTrigger: zoneEl.last(),
        end: "center center",
        scrub: true,
      },
    });
    zoneEl.each(function (index) {
      let nextZoneEl = zoneEl.eq(index + 1);
      if (nextZoneEl.length) {
        let nextZoneDistance =
          nextZoneEl.offset().top + nextZoneEl.innerHeight() / 2;
        let thisZoneDistance = $(this).offset().top + $(this).innerHeight() / 2;
        let zoneDifference = nextZoneDistance - thisZoneDistance;
        tl.add(
          Flip.fit(targetEl[0], nextZoneEl[0], {
            duration: zoneDifference,
            ease: "power2.inOut",
            borderRadius: "var(--size--0-625rem)",
          })
        );
      }
    });
  }
  createTimeline();
  // SETUP RESIZE
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      createTimeline();
    }, 250);
  });
}

/**
 * Marquee Scroll Direction
 */
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

/**
 * Flick Cards
 */
function initFlickCards() {
  const init = nextPage.querySelector("[data-flick-cards-init]");
  if (!init) return;
  const list = init.querySelector("[data-flick-cards-list]");
  const dragger = init.querySelector("[data-flick-cards-dragger]");
  const cards = Array.from(list.querySelectorAll("[data-flick-cards-item]"));
  //   const mirrorList = init.querySelector("[data-flick-cards-list-mirror]");
  //   const mirrorCards = mirrorList
  //     ? Array.from(mirrorList.querySelectorAll("[data-flick-cards-item-mirror]"))
  //     : [];
  const total = cards.length;
  if (total < 7) return;

  let activeIdx = 0;
  const W = init.clientWidth;
  const swipeThreshold = 0.1;
  const mod = (n, m) => ((n % m) + m) % m;

  function overridePlayPause(player) {
    const origPlay = player.play.bind(player);
    const origPause = player.pause.bind(player);
    let pendingPlay = null;

    player.play = function () {
      if (!pendingPlay) {
        pendingPlay = origPlay().finally(() => {
          pendingPlay = null;
        });
      }
      return pendingPlay;
    };

    player.pause = function () {
      if (pendingPlay) {
        return pendingPlay.then(() => origPause()).catch(() => {});
      }
      return origPause();
    };
  }

  function waitForPlayerLoaded(player) {
    return new Promise((resolve) => {
      player.on("loaded", () => resolve());
    });
  }

  function waitForValidVideoDimensions(player, attempts = 10, delay = 150) {
    return new Promise((resolve, reject) => {
      const tryGet = (n) => {
        Promise.all([player.getVideoWidth(), player.getVideoHeight()])
          .then(([vw, vh]) => {
            if (vw > 0 && vh > 0) {
              resolve([vw, vh]);
            } else if (n > 0) {
              setTimeout(() => tryGet(n - 1), delay);
            } else {
              reject("Failed to get video dimensions");
            }
          })
          .catch(reject);
      };
      tryGet(attempts);
    });
  }

  const slides = cards.map((card) => {
    const wrap = card.querySelector("[data-flick-cards-video]");
    if (!wrap) return null;
    const vidId = wrap.dataset.flickCardsVideoId;
    if (!vidId) return null;
    const iframe = wrap.querySelector("iframe[data-flick-cards-video-iframe]");
    if (!iframe) return null;
    wrap.setAttribute("data-flick-cards-video-status", "not-active");
    return { wrap, iframe, vidId, player: null, loaded: false };
  });

  function loadSlide(i) {
    const idx = mod(i, total);
    const slide = slides[idx];
    if (!slide) return Promise.resolve();
    if (slide.loaded) return Promise.resolve(slide.player);

    slide.loaded = true;
    // Inject Vimeo URL
    slide.iframe.src =
      `https://player.vimeo.com/video/${slide.vidId}` +
      `?api=1&muted=1&loop=1&background=1`;

    slide.player = new Vimeo.Player(slide.iframe, {
      id: slide.vidId,
      muted: true,
      loop: true,
      autoplay: false,
    });

    overridePlayPause(slide.player);

    // resolve when we actually hit “play”
    return new Promise((resolve) => {
      function onPlay() {
        slide.wrap.setAttribute("data-flick-cards-video-status", "active");

        // ─── Wait for metadata and size the video ───
        waitForPlayerLoaded(slide.player)
          .then(() => waitForValidVideoDimensions(slide.player))
          .then(([vw, vh]) => {
            const { width: cw, height: ch } =
              slide.wrap.getBoundingClientRect();
            const videoRatio = vw / vh;
            const cardRatio = cw / ch;
            let wPerc, hPerc;
            if (videoRatio > cardRatio) {
              hPerc = 100;
              wPerc = (videoRatio / cardRatio) * 100;
            } else {
              wPerc = 100;
              hPerc = (cardRatio / videoRatio) * 100;
            }
            slide.iframe.style.width = `${wPerc}%`;
            slide.iframe.style.height = `${hPerc}%`;
          });

        resolve(slide.player);
        slide.player.off("play", onPlay);
      }

      slide.player.on("play", onPlay);
      slide.player.play();
    });
  }

  loadSlide(activeIdx)
    .then((player) => {
      // kick off neighbors
      [activeIdx - 1, activeIdx + 1].forEach(loadSlide);
      return player;
    })
    .then(() => {
      // now safe‐pause every non-active video
      slides.forEach((s, i) => {
        if (!s || !s.loaded || i === activeIdx) return;
        s.player.pause();
      });
    });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const i = slides.findIndex((s) => s && s.iframe === entry.target);
        if (i !== activeIdx) return;
        entry.isIntersecting
          ? slides[i].player.play()
          : slides[i].player.pause();
      });
    },
    { threshold: 0 }
  );
  slides.forEach((s) => {
    if (s) io.observe(s.iframe);
  });

  function getCfg(i, ci) {
    let diff = i - ci;
    if (diff > total / 2) diff -= total;
    else if (diff < -total / 2) diff += total;
    switch (diff) {
      case 0:
        return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
      case 1:
        return { x: 25, y: 1, rot: 10, s: 0.9, o: 1, z: 4 };
      case -1:
        return { x: -25, y: 1, rot: -10, s: 0.9, o: 1, z: 4 };
      case 2:
        return { x: 45, y: 5, rot: 15, s: 0.8, o: 1, z: 3 };
      case -2:
        return { x: -45, y: 5, rot: -15, s: 0.8, o: 1, z: 3 };
      default:
        const dir = diff > 0 ? 1 : -1;
        return { x: 55 * dir, y: 5, rot: 20 * dir, s: 0.6, o: 0, z: 2 };
    }
  }

  function renderDiscrete(ci) {
    cards.forEach((card, i) => {
      const cfg = getCfg(i, ci);
      let status;
      if (cfg.x === 0) status = "active";
      else if (cfg.x === 25) status = "2-after";
      else if (cfg.x === -25) status = "2-before";
      else if (cfg.x === 45) status = "3-after";
      else if (cfg.x === -45) status = "3-before";
      else status = "hidden";

      card.setAttribute("data-flick-cards-item-status", status);
      card.style.zIndex = cfg.z;
      //   if (mirrorCards[i]) {
      //     mirrorCards[i].setAttribute(
      //       "data-flick-cards-item-status-mirror",
      //       status
      //     );
      //   }

      gsap.to(card, {
        duration: 0.6,
        ease: "elastic.out(1.2,1)",
        xPercent: cfg.x,
        yPercent: cfg.y,
        rotation: cfg.rot,
        scale: cfg.s,
        opacity: cfg.o,
      });
    });
  }
  renderDiscrete(activeIdx);

  Draggable.create(dragger, {
    type: "x",
    cursor: "inherit",
    activeCursor: "inherit",
    bounds: { minX: -W / 2, maxX: W / 2 },
    edgeResistance: 0.8,
    inertia: false,

    onPress() {
      init.setAttribute("data-flick-drag-status", "grabbing");
      console.log("onPress");
    },

    onDrag() {
      const raw = this.x / W;
      const prog = Math.min(1, Math.abs(raw));
      const dir = raw > 0 ? -1 : 1;
      const nextCi = mod(activeIdx + dir, total);

      cards.forEach((card, i) => {
        const a = getCfg(i, activeIdx);
        const b = getCfg(i, nextCi);
        const mix = (prop) => a[prop] + (b[prop] - a[prop]) * prog;
        gsap.set(card, {
          xPercent: mix("x"),
          yPercent: mix("y"),
          rotation: mix("rot"),
          scale: mix("s"),
          opacity: mix("o"),
        });
      });
    },

    onRelease() {
      const raw = this.x / W;
      let shift = 0;
      if (raw > swipeThreshold) shift = -1;
      else if (raw < -swipeThreshold) shift = 1;

      const prevIdx = activeIdx;
      activeIdx = mod(activeIdx + shift, total);
      renderDiscrete(activeIdx);

      // Load new + neighbors
      loadSlide(activeIdx).then(() => {
        [activeIdx - 1, activeIdx + 1].forEach(loadSlide);
      });

      // Safe‐pause old & safe‐play new
      const old = slides[prevIdx],
        nw = slides[activeIdx];
      if (old) old.player.pause();
      if (nw) nw.player.play();

      // Snap back
      gsap.to(this.target, {
        x: 0,
        duration: 0.3,
        ease: "power1.out",
      });
      init.setAttribute("data-flick-drag-status", "grab");
    },
  });
}

/**
 * Image Fading loop
 */
function initImageFade() {
  const allCovers = nextPage.querySelectorAll(".about-image-cover");

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
}

/**
 * Vimeo bg
 */
function initVimeo() {
  const iframe1 = document.getElementById("vimeo-hero");
  const player1 = new Vimeo.Player(iframe1);
  const thumb1 = document.querySelector(".video-thumb");

  player1.on("play", function () {
    thumb1.style.opacity = "0";
  });

  player1.on("error", function () {
    thumb1.style.opacity = "1";
  });
}

/**
 * Flickity Slider
 */
function initFlickitySlider() {
  // Select all slider groups with the specified data attribute
  const sliderCards = nextPage.querySelectorAll('[data-flickity-type="cards"]');

  sliderCards.forEach((slider, index) => {
    // Give each slider a unique ID
    const sliderIndexID = "flickity-type-cards-id-" + index;
    slider.id = sliderIndexID;

    // Count slides
    let slidesCount = slider.querySelectorAll("[data-flickity-item]").length;
    slider.setAttribute("data-flickity-count", slidesCount);

    // Set Active status
    slider.setAttribute("data-flickity-status", "active");

    // Select the element containing the slide list
    const sliderEl = document.querySelector(
      "#" + sliderIndexID + " [data-flickity-list]"
    );
    if (!sliderEl) return;

    // Initialize Flickity on the slider element
    const flickitySlider = new Flickity(sliderEl, {
      watchCSS: true,
      contain: true,
      wrapAround: false,
      dragThreshold: 10,
      prevNextButtons: false,
      pageDots: false,
      cellAlign: "left",
      selectedAttraction: 0.015,
      friction: 0.25,
      percentPosition: true,
      freeScroll: false,
      on: {
        dragStart: () => {
          // Disable pointer events during drag
          sliderEl.style.pointerEvents = "none";
        },
        dragEnd: () => {
          // Re-enable pointer events after drag
          sliderEl.style.pointerEvents = "auto";
        },
        change: function () {
          updateArrows();
          updateDots();
        },
      },
    });

    // Get Flickity instance data
    const flickity = Flickity.data(sliderEl);

    // Set up previous click functionality
    const prevButton = slider.querySelector('[data-flickity-control="prev"]');
    if (prevButton) {
      prevButton.setAttribute("disabled", "");
      prevButton.addEventListener("click", function () {
        flickity.previous();
      });
    }

    // Set up next click functionality
    const nextButton = slider.querySelector('[data-flickity-control="next"]');
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        flickity.next();
      });
    }

    // Update arrows using CSS var(--flick-col) count
    function updateArrows() {
      const inviewColumns = parseInt(
        window.getComputedStyle(sliderEl).getPropertyValue("--flick-col"),
        10
      );
      if (!flickity.cells[flickity.selectedIndex - 1]) {
        if (prevButton) prevButton.setAttribute("disabled", "disabled");
        if (nextButton) nextButton.removeAttribute("disabled");
      } else if (!flickity.cells[flickity.selectedIndex + inviewColumns]) {
        if (nextButton) nextButton.setAttribute("disabled", "disabled");
        if (prevButton) prevButton.removeAttribute("disabled");
      } else {
        if (prevButton) prevButton.removeAttribute("disabled");
        if (nextButton) nextButton.removeAttribute("disabled");
      }
    }

    // Set up dots click functionality
    const dots = slider.querySelectorAll("[data-flickity-dot]");
    if (dots.length) {
      dots.forEach((dot, index) => {
        dot.addEventListener("click", function () {
          const inviewColumns = parseInt(
            window.getComputedStyle(sliderEl).getPropertyValue("--flick-col"),
            10
          );
          const maxIndex = flickity.cells.length - inviewColumns;
          let targetIndex = index;
          if (targetIndex > maxIndex) {
            targetIndex = maxIndex;
          }
          flickity.select(targetIndex);
        });
      });
    }

    // Update dots using CSS var(--flick-col) count
    function updateDots() {
      const inviewColumns = parseInt(
        window.getComputedStyle(sliderEl).getPropertyValue("--flick-col"),
        10
      );
      const maxIndex = flickity.cells.length - inviewColumns;
      const activeIndex =
        flickity.selectedIndex < maxIndex ? flickity.selectedIndex : maxIndex;
      const dots = slider.querySelectorAll("[data-flickity-dot]");
      dots.forEach((dot, index) => {
        dot.setAttribute(
          "data-flickity-dot",
          index === activeIndex ? "active" : ""
        );
      });
    }
  });
}

/**
 * Reset Webflow
 */
function resetWebflow(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let webflowPageId = $(dom).find("html").attr("data-wf-page");
  $("html").attr("data-wf-page", webflowPageId);
  window.Webflow && window.Webflow.destroy();
  window.Webflow && window.Webflow.ready();
  window.Webflow && window.Webflow.require("ix2").init();
}
