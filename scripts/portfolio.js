// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(
  SplitText,
  ScrollTrigger,
  InertiaPlugin,
  Draggable,
  Flip,
  CustomEase
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
CustomEase.create("parallax", "0.7, 0.05, 0.13, 1");
CustomEase.create("custom", ".87,0,.13,1");
CustomEase.create("cubic-default", "0.625, 0.05, 0, 1");
CustomEase.create("out-strong", "0, 0, 0, 1");
CustomEase.create("inOut-strong", ".9, 0, 0, .9");
gsap.defaults({ ease: "osmo", duration: durationDefault });

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Always run these (don’t put them after a return)
  initNavigation();
  initCursorMarqueeEffect();
  initThemeToggle();

  const loadingContainer = document.querySelector("[data-loading-container]");
  if (!loadingContainer) return;

  const preloaderHeading = loadingContainer.querySelector(
    "[preloader-heading]"
  );
  const preloaderImgs = loadingContainer.querySelector("[data-preloader-imgs]");
  const preloaderCounter = loadingContainer.querySelector(
    "[data-preloader-counter]"
  );

  if (preloaderHeading) gsap.set(preloaderHeading, { autoAlpha: 1 });
  if (preloaderImgs) gsap.set(preloaderImgs, { autoAlpha: 1 });
  if (preloaderCounter) gsap.set(preloaderCounter, { autoAlpha: 1 });

  const split = SplitText.create(preloaderHeading, {
    type: "chars, words",
    mask: "words",
    charsClass: "char",
  });

  const animateCounter = (counter, targetDigit, duration, delay = 0) => {
    if (!counter) return;
    const nums = counter.querySelectorAll(".num");
    if (!nums.length) return;

    const numHeight = nums[0].clientHeight;

    let targetIndex = [...nums]
      .map((n) => n.textContent)
      .lastIndexOf(String(targetDigit));
    if (targetIndex === -1) targetIndex = nums.length - 1;

    return gsap.to(counter, {
      y: -(targetIndex * numHeight),
      duration,
      delay,
      ease: "power2.inOut",
    });
  };

  const animateImages = () => {
    const container = loadingContainer.querySelector(".images-container");
    const imagesWrapper = container?.querySelector(".img");
    const images = imagesWrapper?.querySelectorAll(".preloader_image");
    if (!images || !images.length) return gsap.timeline();

    const tl = gsap.timeline();
    tl.from(images, {
      scale: 0,
      duration: 0.8,
      ease: "power2.inOut",
      stagger: { each: 0.2, from: "start" },
    }).to(".preloader_images", {
      y: "100%",
      duration: 1.25,
      ease: "power3.inOut",
      onStart: () => {
        gsap.to(".digit", { x: "300%", duration: 1.25, ease: "power3.inOut" });
      },
    });

    return tl;
  };

  const animiHeader = () => {
    const chars = preloaderHeading.querySelectorAll(".char");
    const tl = gsap.timeline();

    tl.from(chars, {
      yPercent: 100,
      duration: 0.75,
      stagger: { each: 0.025, from: "start" },
      ease: "power3.inOut",
    }).to(chars, {
      yPercent: -100,
      duration: 0.75,
      delay: 0.25,
      stagger: { each: 0.025, from: "end" },
      ease: "power3.inOut",
    });

    return tl;
  };

  const tl = gsap.timeline({
    onComplete: () => split.revert(), // cleanup
  });

  tl.add(() => {
    animateCounter(document.querySelector(".counter-1"), 1, 2.75, 0);
    animateCounter(document.querySelector(".counter-2"), 0, 2.5, 0);
    animateCounter(document.querySelector(".counter-3"), 0, 2.5, 0);
  });

  tl.add(animateImages(), "<");
  tl.add(animiHeader(), "<90%");

  tl.to(".preloader_top-wrapper", {
    clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)",
    duration: 1.25,
    ease: "power4.out",
    onStart: () => {
      gsap.to(".preloader_bottom-wrapper", {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        duration: 1.25,
        ease: "power4.out",
      });
    },
  }).to(
    ".preloader",
    {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => gsap.set(".preloader", { display: "none" }),
    },
    "<85%"
  );
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
  if (has("[data-marquee-scroll-direction-target]"))
    initMarqueeScrollDirection();
  if (has("[data-accelerating-globe]")) initAcceleratingGlobe();
  if (has(".id-floating-icons")) initFloatingIcons();
  if (has("[data-directional-hover]")) initDirectionalListHover();
  //   if (has("[js-scrollflip-element]")) initFlipAnimation();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();
  if (has(".swiper-slider-group")) initSwiperSliders();
  if (has("[data-horizontal-scroll]")) initHorizontalScroll();
  if (has("[js-scrollflip-element]")) initFlipAnimation();
  if (has("[data-split-lines]")) initSplitLines();
  if (has("[data-animi]")) initScrollAnimations();

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
  const tl = gsap.timeline();

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
  const transitionDark = transitionWrap.querySelector("[data-transition-dark]");
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

  tl.set(transitionWrap, {
    zIndex: 2,
  });

  tl.fromTo(
    transitionDark,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 0.75,
      duration: 1.2,
      ease: "parallax",
    },
    0
  );

  tl.fromTo(
    current,
    {
      y: "0vh",
    },
    {
      y: "-40vh",
      duration: 1.2,
      ease: "parallax",
    },
    0
  );

  tl.set(transitionDark, {
    autoAlpha: 0,
  });

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 0);

  tl.set(next, {
    zIndex: 3,
  });

  tl.fromTo(
    next,
    {
      y: "100vh",
    },
    {
      y: "0vh",
      duration: 1.2,
      clearProps: "all",
      ease: "parallax",
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

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
  //closeNavigation();
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
  reinitFsPrevNext();

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
  debug: false, // Set to 'false' in production
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

// ============================================================================
// NAVIGATION
// ============================================================================

function initNavigation() {
  document
    .querySelectorAll('[data-navigation-toggle="toggle"]')
    .forEach((toggleBtn) => {
      toggleBtn.addEventListener("click", () => {
        const navStatusEl = document.querySelector("[data-navigation-status]");
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

  document
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

// ============================================================================
// MARQUEE EFFECTS
// ============================================================================

function initCursorMarqueeEffect() {
  const hoverOutDelay = 0.4;
  const followDuration = 0.4;
  const speedMultiplier = 5;

  const cursor = document.querySelector("[data-cursor-marquee-status]");
  if (!cursor) return;

  const targets = cursor.querySelectorAll("[data-cursor-marquee-text-target]");

  const xTo = gsap.quickTo(cursor, "x", {
    duration: followDuration,
    ease: "power3",
  });
  const yTo = gsap.quickTo(cursor, "y", {
    duration: followDuration,
    ease: "power3",
  });
  const rotateTo = gsap.quickTo(cursor, "rotation", {
    duration: followDuration,
    ease: "power3",
  });

  function randomAngle() {
    return gsap.utils.random(-12, 12);
  }

  let pauseTimeout = null;
  let activeEl = null;
  let lastX = 0;
  let lastY = 0;

  function playFor(el) {
    if (!el) return;
    if (pauseTimeout) clearTimeout(pauseTimeout);

    const text = el.getAttribute("data-cursor-marquee-text") || "";
    const sec = (text.length || 1) / speedMultiplier;

    targets.forEach((t) => {
      t.textContent = text;
      t.style.animationPlayState = "running";
      t.style.animationDuration = sec + "s";
    });

    cursor.setAttribute("data-cursor-marquee-status", "active");
    activeEl = el;
    rotateTo(randomAngle());
  }

  function pauseLater() {
    cursor.setAttribute("data-cursor-marquee-status", "not-active");
    if (pauseTimeout) clearTimeout(pauseTimeout);

    pauseTimeout = setTimeout(() => {
      targets.forEach((t) => {
        t.style.animationPlayState = "paused";
      });
    }, hoverOutDelay * 1000);

    activeEl = null;
  }

  function checkTarget() {
    const el = document.elementFromPoint(lastX, lastY);
    const hit = el && el.closest("[data-cursor-marquee-text]");

    if (hit !== activeEl) {
      if (activeEl) pauseLater();
      if (hit) playFor(hit);
    }
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      xTo(lastX);
      yTo(lastY);
      checkTarget();
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      xTo(lastX);
      yTo(lastY);
      checkTarget();
    },
    { passive: true }
  );

  setTimeout(() => {
    cursor.setAttribute("data-cursor-marquee-status", "not-active");
  }, 500);
}

function initMarqueeScrollDirection() {
  nextPage
    .querySelectorAll("[data-marquee-scroll-direction-target]")
    .forEach((marquee) => {
      const marqueeContent = marquee.querySelector(
        "[data-marquee-collection-target]"
      );
      const marqueeScroll = marquee.querySelector(
        "[data-marquee-scroll-target]"
      );

      if (!marqueeContent || !marqueeScroll) return;

      const {
        marqueeSpeed: speed,
        marqueeDirection: direction,
        marqueeDuplicate: duplicate,
        marqueeScrollSpeed: scrollSpeed,
      } = marquee.dataset;

      const marqueeSpeedAttr = parseFloat(speed);
      const marqueeDirectionAttr = direction === "right" ? 1 : -1;
      const duplicateAmount = parseInt(duplicate || 0);
      const scrollSpeedAttr = parseFloat(scrollSpeed);
      const speedMultiplier =
        window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

      let marqueeSpeed =
        marqueeSpeedAttr *
        (marqueeContent.offsetWidth / window.innerWidth) *
        speedMultiplier;

      marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
      marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
      }

      const marqueeItems = marquee.querySelectorAll(
        "[data-marquee-collection-target]"
      );
      const animation = gsap
        .to(marqueeItems, {
          xPercent: -100,
          repeat: -1,
          duration: marqueeSpeed,
          ease: "linear",
        })
        .totalProgress(0.5);

      gsap.set(marqueeItems, {
        xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
      });
      animation.timeScale(marqueeDirectionAttr);
      animation.play();

      marquee.setAttribute("data-marquee-status", "normal");

      ScrollTrigger.create({
        trigger: marquee,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const isInverted = self.direction === 1;
          const currentDirection = isInverted
            ? -marqueeDirectionAttr
            : marqueeDirectionAttr;

          animation.timeScale(currentDirection);
          marquee.setAttribute(
            "data-marquee-status",
            isInverted ? "normal" : "inverted"
          );
        },
      });

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

// ============================================================================
// THEME TOGGLE
// ============================================================================

function initThemeToggle() {
  const toggleBtn = document.getElementById("toggleBtn");
  const body = document.body;
  const darkImg = document.getElementById("darkImg");
  const lightImg = document.getElementById("lightImg");

  if (!toggleBtn) return;

  let isDark = sessionStorage.getItem("theme") === "light" ? false : true;

  body.classList.toggle("u-theme-light", !isDark);
  if (isDark) {
    darkImg.classList.add("active");
    lightImg.classList.remove("active");
  } else {
    lightImg.classList.add("active");
    darkImg.classList.remove("active");
  }

  toggleBtn.addEventListener("click", () => {
    isDark = !isDark;
    sessionStorage.setItem("theme", isDark ? "dark" : "light");
    body.classList.toggle("u-theme-light", !isDark);

    if (isDark) {
      gsap.to(lightImg, {
        duration: 0.2,
        rotation: 0,
        scale: 0.75,
        onComplete: () => {
          lightImg.classList.remove("active");
          darkImg.classList.add("active");
          gsap.fromTo(
            darkImg,
            { rotation: -45 },
            {
              rotation: 0,
              scale: 1,
              duration: 0.2,
              ease: "elastic.out(1.2, 1)",
            }
          );
        },
      });
    } else {
      gsap.to(darkImg, {
        duration: 0.2,
        rotation: 0,
        scale: 0.75,
        onComplete: () => {
          darkImg.classList.remove("active");
          lightImg.classList.add("active");
          gsap.fromTo(
            lightImg,
            { rotation: -45 },
            {
              rotation: 0,
              scale: 1,
              duration: 0.2,
              ease: "elastic.out(1.2, 1)",
            }
          );
        },
      });
    }
  });
}

// ============================================================================
// ACCELERATING GLOBE
// ============================================================================

function initAcceleratingGlobe() {
  nextPage
    .querySelectorAll("[data-accelerating-globe]")
    .forEach(function (globe) {
      const circles = globe.querySelectorAll(
        "[data-accelerating-globe-circle]"
      );
      if (circles.length < 8) return; // Min 8

      const tl = gsap.timeline({
        repeat: -1,
        defaults: { duration: 1, ease: "none" },
      });

      const widths = [
        ["50%", "37.5%"],
        ["37.5%", "25%"],
        ["25%", "12.5%"],
        ["calc(12.5% + 1px)", "calc(0% + 1px)"],
        ["calc(0% + 1px)", "calc(12.5% + 1px)"],
        ["12.5%", "25%"],
        ["25%", "37.5%"],
        ["37.5%", "50%"],
      ];

      circles.forEach((el, i) => {
        const [fromW, toW] = widths[i];
        tl.fromTo(el, { width: fromW }, { width: toW }, i === 0 ? 0 : "<");
      });

      let lastY = window.scrollY;
      let lastT = performance.now();
      let stopTimeout;

      function onScroll() {
        const now = performance.now();
        const dy = window.scrollY - lastY;
        const dt = now - lastT;
        lastY = window.scrollY;
        lastT = now;

        const velocity = dt > 0 ? (dy / dt) * 1000 : 0; // px/s
        const boost = Math.abs(velocity * 0.005);
        const targetScale = boost + 1;

        tl.timeScale(targetScale);

        clearTimeout(stopTimeout);
        stopTimeout = setTimeout(() => {
          gsap.to(tl, {
            timeScale: 1,
            duration: 0.6,
            ease: "power2.out",
            overwrite: true,
          });
        }, 100);
      }

      window.addEventListener("scroll", onScroll, { passive: true });
    });
}

// ============================================================================
// SWIPER SLIDERS
// ============================================================================

function initSwiperSliders() {
  let sliderOne = new Swiper(".swiper-background", {
    slidesPerView: 1,
    speed: 1200,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    effect: "fade",
    parallax: true,
    navigation: {
      nextEl: ".swiper_control-next",
      prevEl: ".swiper_control-prev",
    },
  });

  let sliderTwo = new Swiper(".swiper-title", {
    slidesPerView: 1,
    spaceBetween: 0,
    simulateTouch: false,
    loop: true,
    grabCursor: false,
    speed: 1200,
    parallax: true,
  });

  let sliderThree = new Swiper(".swiper-small", {
    slidesPerView: 1,
    spaceBetween: 0,
    direction: "vertical",
    simulateTouch: false,
    loop: true,
    grabCursor: false,
    speed: 1200,
    parallax: true,
    slideActiveClass: "is-active",
  });

  sliderOne.controller.control = [sliderTwo, sliderThree];
  sliderTwo.controller.control = sliderOne;
  sliderThree.controller.control = sliderOne;
}

// ============================================================================
// SCROLL ANIMATIONS
// ============================================================================

function initScrollAnimations() {
  const boxes = nextPage.querySelectorAll("[data-animi]");

  const animations = {
    up: { from: { opacity: 0, y: 25 }, to: { opacity: 1, y: 0 } },
    down: { from: { opacity: 0, y: -25 }, to: { opacity: 1, y: 0 } },
    left: { from: { opacity: 0, x: 25 }, to: { opacity: 1, x: 0 } },
    right: { from: { opacity: 0, x: -25 }, to: { opacity: 1, x: 0 } },
    scale: { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1 } },
    opa: { from: { opacity: 0 }, to: { opacity: 1 } },
  };

  if (boxes.length === 0) {
    console.warn("No elements with [data-animi] attribute found.");
    return;
  }

  gsap.set("[data-animi]", { autoAlpha: 1, opacity: 0 });

  boxes.forEach((box) => {
    const animationName = box.getAttribute("data-animi");
    const duration = parseFloat(box.getAttribute("data-duration")) || 1.5;
    const delay = parseFloat(box.getAttribute("data-delay")) || 0;
    const ease = box.getAttribute("data-ease") || "expo.out";

    if (!animations[animationName]) {
      console.warn(`Animation "${animationName}" not found.`);
      return;
    }

    ScrollTrigger.create({
      trigger: box,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.fromTo(box, animations[animationName].from, {
          ...animations[animationName].to,
          duration,
          delay,
          ease,
        });
      },
    });
  });
}

// ============================================================================
// FLIP ANIMATIONS
// ============================================================================

function initFlipAnimation() {
  let zoneEl = $("[js-scrollflip-element='zone']");
  let targetEl = $("[js-scrollflip-element='target']").first();
  let flipTl;

  function createTimeline() {
    if (flipTl) {
      flipTl.kill();
      gsap.set(targetEl, { clearProps: "all" });
    }

    flipTl = gsap.timeline({
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

        flipTl.add(
          Flip.fit(targetEl[0], nextZoneEl[0], {
            duration: zoneDifference,
            ease: "power2.inOut",
          })
        );
      }
    });
  }

  createTimeline();

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createTimeline, 250);
  });
}

// ============================================================================
// INTERACTIVE CARD EFFECTS
// ============================================================================

function initFloatingIcons() {
  const card = nextPage.querySelector(".id");
  const icons = nextPage.querySelectorAll(".id-floating-icons");

  if (!card) return;

  card.addEventListener("mouseenter", () => {
    icons.forEach((icon, i) => {
      const xOffset = gsap.utils.random(150, 300);
      const yBaseTop = gsap.utils.mapRange(0, 2, -150, 150, i);
      const yBaseBottom = gsap.utils.mapRange(3, 5, -150, 150, i);
      const rotateDeg = gsap.utils.random(0, 60);

      gsap.set(icon, { opacity: 0 });

      gsap.to(icon, {
        duration: 1.5,
        opacity: 1,
        x: i < 3 ? `-${xOffset}%` : `${xOffset}%`,
        y: i < 3 ? yBaseTop : yBaseBottom,
        rotation: i < 3 ? `-${rotateDeg}` : rotateDeg,
        ease: "elastic.out(1.2, 1)",
      });
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(icons, {
      duration: 1.2,
      x: 0,
      y: 0,
      opacity: 0,
      rotation: 0,
      ease: "elastic.out(1.2, 1)",
    });
  });
}

// ============================================================================
// HORIZONTAL SCROLL ANIMATIONS
// ============================================================================
function initHorizontalScroll() {
  document.fonts.ready.then(function () {
    let typeSplit;

    function runSplitType() {
      typeSplit = SplitText.create(".heading-hero", {
        type: "chars, words",
        mask: "words",
        charsClass: "char",
      });
    }

    runSplitType();

    let windowWidth = window.innerWidth;
    window.addEventListener("resize", function () {
      if (windowWidth !== window.innerWidth) {
        windowWidth = window.innerWidth;
        typeSplit.revert();
        runSplitType();
      }
    });

    function setTrackHeights() {
      $(".horizontal-scroll_section-height").each(function () {
        let trackWidth = $(this).find(".horizontal-scroll_track").outerWidth();
        $(this).height(trackWidth);
      });
    }

    setTrackHeights();
    window.addEventListener("resize", setTrackHeights);

    let horizontalMainTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".horizontal-scroll_section-height",
        start: "top center",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    horizontalMainTl.to(".horizontal-scroll_track", {
      xPercent: -100,
      ease: "none",
    });

    // Image scale animations
    $(".image-wrapper-static").each(function () {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: $(this),
            containerAnimation: horizontalMainTl,
            start: "left 90%",
            end: "left 10%",
            scrub: 0.5,
          },
        })
        .from($(this).find(".is-2016-1, .is-2016-2"), {
          yPercent: 50,
          scale: 0.8,
          rotation: (Math.random() - 0.5) * 60,
          ease: "elastic.out(1.2, 1)",
          duration: 1,
        });
    });

    // Icon animations
    $(".icon-1x1-small").each(function () {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: $(this),
            containerAnimation: horizontalMainTl,
            start: "left 80%",
            end: "right 60%",
            scrub: true,
          },
        })
        .to($(this), {
          scale: 1.25,
          ease: "elastic.out(1.2, 1)",
          duration: 1,
          color: `var(--text-color--text-secondary)`,
        });
    });

    // Timeline image animations
    $(".image-wrapper-timeline").each(function () {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: $(this),
            containerAnimation: horizontalMainTl,
            start: "left 90%",
            end: "left 10%",
            scrub: 0.5,
          },
        })
        .from($(this).find(".image-cover"), {
          rotation: (Math.random() - 0.5) * 60,
          yPercent: (Math.random() - 0.5) * 10,
          ease: "elastic.out(1.2, 1)",
          scale: 0,
          duration: 1,
          stagger: { amount: 0.5 },
        });
    });

    // SVG path animations
    document.querySelectorAll(".horizontal-svg path").forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });

    $(".horizontal-svg").each(function () {
      const path = $(this).find("path")[0];

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: this,
          containerAnimation: horizontalMainTl,
          start: "left 90%",
          end: "left 10%",
          scrub: 0.5,
        },
      });
    });

    // Horizontal icon animations
    $(".horizontal-icon").each(function () {
      gsap.from($(this), {
        rotation: gsap.utils.random(0, 60),
        yPercent: gsap.utils.random(-10, 10),
        xPercent: gsap.utils.random(-20, 20),
        scale: 0,
        ease: "elastic.out(1.2, 1)",
        scrollTrigger: {
          trigger: $(this),
          containerAnimation: horizontalMainTl,
          start: "left 90%",
          end: "left 10%",
          scrub: 0.5,
        },
      });
    });

    // Hero heading letter animations
    $(".heading-hero")
      .find(".char")
      .each(function () {
        gsap.from($(this), {
          yPercent: gsap.utils.random(-100, 100),
          ease: "elastic.out(1.2, 1)",
          scrollTrigger: {
            trigger: $(this),
            containerAnimation: horizontalMainTl,
            start: "left 90%",
            end: "left 10%",
            scrub: 0.5,
          },
        });
      });
  });
}

// ============================================================================
// DIRECTIONAL LIST HOVER
// ============================================================================
function initDirectionalListHover() {
  const directionMap = {
    top: "translateY(-100%)",
    bottom: "translateY(100%)",
    left: "translateX(-100%)",
    right: "translateX(100%)",
  };

  nextPage.querySelectorAll("[data-directional-hover]").forEach((container) => {
    const type = container.getAttribute("data-type") || "all";

    container
      .querySelectorAll("[data-directional-hover-item]")
      .forEach((item) => {
        const tile = item.querySelector("[data-directional-hover-tile]");
        if (!tile) return;

        item.addEventListener("mouseenter", (e) => {
          const dir = getDirection(e, item, type);
          tile.style.transition = "none";
          tile.style.transform = directionMap[dir] || "translate(0, 0)";
          void tile.offsetHeight;
          tile.style.transition = "";
          tile.style.transform = "translate(0%, 0%)";
          item.setAttribute("data-status", `enter-${dir}`);
        });

        item.addEventListener("mouseleave", (e) => {
          const dir = getDirection(e, item, type);
          item.setAttribute("data-status", `leave-${dir}`);
          tile.style.transform = directionMap[dir] || "translate(0, 0)";
        });
      });

    function getDirection(event, el, type) {
      const { left, top, width: w, height: h } = el.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;

      if (type === "y") return y < h / 2 ? "top" : "bottom";
      if (type === "x") return x < w / 2 ? "left" : "right";

      const distances = {
        top: y,
        right: w - x,
        bottom: h - y,
        left: x,
      };

      return Object.entries(distances).reduce((a, b) =>
        a[1] < b[1] ? a : b
      )[0];
    }
  });
}

// ============================================================================
// TEXT ANIMATIONS
// ============================================================================
function initSplitLines() {
  let headings = nextPage.querySelectorAll("[data-split-lines]");
  headings.forEach((heading) => {
    gsap.set(heading, { autoAlpha: 1 });
    SplitText.create(heading, {
      type: "lines",
      autoSplit: true,
      mask: "lines",
      onSplit(instance) {
        return gsap.from(instance.lines, {
          duration: 1.2,
          yPercent: 110,
          stagger: 0.1,
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

// ============================================================================
// PrevNext
// ============================================================================
function reinitFsPrevNext() {
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    "cmsprevnext",
    () => {
      window.fsAttributes.cmsprevnext.init();
    },
  ]);
}

