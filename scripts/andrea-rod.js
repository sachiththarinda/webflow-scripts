// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

gsap.registerPlugin(ScrollTrigger, Flip, SplitText, CustomEase);

const customEase = CustomEase.create("custom", ".87,0,.13,1");
const ultraSmooth = CustomEase.create("ultraSmooth", "0.77, 0, 0.175, 1");

function initBackgroundZoom() {
  const containers = document.querySelectorAll("[data-bg-zoom-init]");
  if (!containers.length) return;

  let masterTimeline;

  const getScrollRange = ({ trigger, start, endTrigger, end }) => {
    const st = ScrollTrigger.create({ trigger, start, endTrigger, end });
    const range = Math.max(1, st.end - st.start);
    st.kill();
    return range;
  };

  const bgZoomTimeline = () => {
    if (masterTimeline) masterTimeline.kill();

    masterTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger:
          containers[0].querySelector("[data-bg-zoom-start]") || containers[0],
        start: "center center", // Change to "center center" to start from center of [data-bg-zoom-start]
        endTrigger: containers[containers.length - 1],
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    containers.forEach((container) => {
      const startEl = container.querySelector("[data-bg-zoom-start]");
      const endEl = container.querySelector("[data-bg-zoom-end]");
      const contentEl = container.querySelector("[data-bg-zoom-content]");
      const darkEl = container.querySelector("[data-bg-zoom-dark]");
      const imgEl = container.querySelector("[data-bg-zoom-img]");
      if (!startEl || !endEl || !contentEl) return;

      const startRadius = getComputedStyle(startEl).borderRadius;
      const endRadius = getComputedStyle(endEl).borderRadius;
      const hasRadius = startRadius !== "0px" || endRadius !== "0px";
      contentEl.style.overflow = hasRadius ? "hidden" : "";
      if (hasRadius) gsap.set(contentEl, { borderRadius: startRadius });

      Flip.fit(contentEl, startEl, { scale: false });

      // Part 1 - Move from Start to End position
      const zoomScrollRange = getScrollRange({
        trigger: startEl,
        start: "center center", // Change to "center center" to start from center of [data-bg-zoom-start]
        endTrigger: endEl,
        end: "center center",
      });

      // Part 2 - End position to out of view
      const afterScrollRange = getScrollRange({
        trigger: endEl,
        start: "center center",
        endTrigger: container,
        end: "bottom top",
      });

      // Master Timeline
      masterTimeline.add(
        Flip.fit(contentEl, endEl, {
          duration: zoomScrollRange,
          ease: "none",
          scale: false,
        })
      );

      // Border Radius
      if (hasRadius) {
        masterTimeline.to(
          contentEl,
          {
            borderRadius: endRadius,
            duration: zoomScrollRange,
          },
          "<"
        );
      }

      // Content Y Position
      masterTimeline.to(contentEl, {
        y: `+=${afterScrollRange}`,
        duration: afterScrollRange,
      });

      // Dark Overlay
      if (darkEl) {
        gsap.set(darkEl, { opacity: 0 });
        masterTimeline.to(
          darkEl,
          {
            opacity: 0.75,
            duration: afterScrollRange * 0.25,
          },
          "<"
        );
      }

      // Image scale
      if (imgEl) {
        gsap.set(imgEl, { scale: 1, transformOrigin: "50% 50%" });
        masterTimeline.to(
          imgEl,
          {
            scale: 1.25,
            yPercent: -10,
            duration: afterScrollRange,
          },
          "<"
        );
      }
    });

    ScrollTrigger.refresh();
  };

  bgZoomTimeline();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(bgZoomTimeline, 100);
  });
}

function initSplitLines() {
  const headings = document.querySelectorAll("[data-split-chars]");

  headings.forEach((heading) => {
    if (heading.dataset.splitPlayed === "true") return;

    const delay = parseFloat(heading.dataset.delay) || 0;
    const from = heading.dataset.from || "edges";

    heading.dataset.splitPlayed = "true";

    if (heading._splitText) {
      heading._splitText.revert();
    }

    heading._splitText = SplitText.create(heading, {
      type: "chars, lines",
      autoSplit: true,
      mask: "lines",
    });

    const anim = gsap.from(heading._splitText.chars, {
      duration: 0.8,
      yPercent: 110,
      stagger: {
        each: 0.01,
        from: from,
      },
      delay: delay,
      ease: "expo.out",
      paused: true,
    });

    ScrollTrigger.create({
      trigger: heading,
      start: "top 90%",
      once: true,
      onEnter: () => anim.play(),
      invalidateOnRefresh: false,
    });
  });
}

function initImageScale() {
  document.querySelectorAll("[img-wrapper]").forEach((wrapper) => {
    let img = wrapper.querySelector("[img]");

    if (!img) return;

    gsap.fromTo(
      img,
      { scale: 1.25 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}

function initMarqueeScrollDirection() {
  document
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

function initStackingCardsParallax() {
  const cards = document.querySelectorAll("[data-stacking-cards-item]");

  if (cards.length < 2) return;

  cards.forEach((card, i) => {
    // Skip over the first section
    if (i === 0) return;

    // When current section is in view, target the PREVIOUS one
    const previousCard = cards[i - 1];
    if (!previousCard) return;

    let tl = gsap.timeline({
      defaults: {
        ease: "none",
        duration: 1,
      },
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      previousCard,
      { yPercent: 0, scale: 1, backgroundColor: "#ffffff" },
      { yPercent: 50, scale: 0.8, backgroundColor: "#f4f4f4" }
    );
  });
}

function initRotatingImageTrail() {
  var area = document.querySelector("[data-trail-area]");
  if (!area) return;

  var collection = area.querySelector("[data-trail-collection]");
  if (!collection) return;

  var items = collection.querySelectorAll("[data-trail-item]");
  if (!items.length) return;

  // Distance logic
  var index = 0;
  var lastCloneX = null;
  var lastCloneY = null;

  var cardWidth = items[0].getBoundingClientRect().width;
  var stepDistance = cardWidth * 0.5;

  function spawnTrailItem(x, y) {
    var original = items[index];
    var clone = original.cloneNode(true);

    clone.style.left = x + "px";
    clone.style.top = y + "px";

    clone.setAttribute("data-trail-item", "hidden");

    area.appendChild(clone);

    void clone.getBoundingClientRect();

    clone.setAttribute("data-trail-item", "visible");

    setTimeout(function () {
      clone.setAttribute("data-trail-item", "transition-out");
    }, 400);

    setTimeout(function () {
      clone.remove();
    }, 1200);

    index = (index + 1) % items.length;
    lastCloneX = x;
    lastCloneY = y;
  }

  // Mouse movement logic
  area.addEventListener("mousemove", function (event) {
    var rect = area.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      lastCloneX = null;
      lastCloneY = null;
      return;
    }

    if (lastCloneX === null || lastCloneY === null) {
      spawnTrailItem(x, y);
      return;
    }

    var dx = x - lastCloneX;
    var dy = y - lastCloneY;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= stepDistance) {
      spawnTrailItem(x, y);
    }
  });
}

function initFooterParallax() {
  document.querySelectorAll("[data-footer-parallax]").forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "clamp(top bottom)",
        end: "clamp(top top)",
        scrub: true,
      },
    });

    const inner = el.querySelector("[data-footer-parallax-inner]");
    const dark = el.querySelector("[data-footer-parallax-dark]");

    if (inner) {
      tl.from(inner, {
        yPercent: -25,
        ease: "linear",
      });
    }

    if (dark) {
      tl.from(
        dark,
        {
          opacity: 0.5,
          ease: "linear",
        },
        "<"
      );
    }
  });
}

function initLoader() {
  const heroImg = document.querySelector("[hero-bg]");
  const heroHeader = document.querySelector("[hero-header]");
  const heroDivider = document.querySelector("[hero-divider]");
  const heroText1 = document.querySelector("[hero-text_1]");
  const heroText2 = document.querySelector("[hero-text_2]");

  if (!heroImg || !heroHeader || !heroDivider || !heroText1 || !heroText2)
    return;

  /* Initial states */
  gsap.set(heroImg, {
    scale: 0,
    rotateZ: 20,
    transformOrigin: "50% 50%",
  });

  gsap.set(heroDivider, {
    scaleX: 0,
  });

  /* Split text (no mask) */
  const splitHeader = new SplitText(heroHeader, {
    type: "lines,chars",
    mask: "lines",
  });

  const splitText1 = new SplitText(heroText1, {
    type: "lines,chars",
    mask: "lines",
  });

  const splitText2 = new SplitText(heroText2, {
    type: "lines,chars",
    mask: "lines",
  });

  /* Timeline */
  const tl = gsap.timeline({
    defaults: {
      ease: "expo.out",
    },
  });

  tl.to(heroImg, {
    scale: 1,
    rotateZ: 0,
    duration: 1.5,
    ease: "expo.inOut",
  })
    .from(
      splitHeader.chars,
      {
        yPercent: 110,
        duration: 1,
        stagger: {
          each: 0.02,
          from: "center",
        },
      },
      "-=50%"
    )
    .to(
      heroDivider,
      {
        scaleX: 1,
        duration: 1.25,
        ease: customEase,
      },
      "-=90%"
    )
    .from(
      splitText1.chars,
      {
        yPercent: 110,
        duration: 1,
        stagger: {
          each: 0.02,
          from: "start",
        },
      },
      "-=50%"
    )
    .from(
      splitText2.chars,
      {
        yPercent: 110,
        duration: 1,
        stagger: {
          each: 0.02,
          from: "end",
        },
      },
      "<"
    );
}

document.addEventListener("DOMContentLoaded", function () {
  document.body.style.opacity = "1";
  initLoader();
  initBackgroundZoom();
  initSplitLines();
  initImageScale();
  initMarqueeScrollDirection();
  initStackingCardsParallax();
  initRotatingImageTrail();
  initFooterParallax();
});
