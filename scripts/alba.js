// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger, SplitText);

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

function initStackingCardsParallax() {
  const cards = document.querySelectorAll("[data-stacking-cards-item]");

  if (cards.length < 2) return;

  cards.forEach((card, i) => {
    // Skip over the first section
    if (i === 0) return;

    // When current section is in view, target the PREVIOUS one
    const previousCard = cards[i - 1];
    if (!previousCard) return;

    // Find any element inside the previous card
    const previousCardImage = previousCard.querySelector(
      "[data-stacking-cards-img]"
    );

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
      { yPercent: 0, scale: 1 },
      { yPercent: 50, scale: 0.8 }
    );
  });
}

function initGlobalParallax() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)",
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;

      const ctx = gsap.context(() => {
        document
          .querySelectorAll('[data-parallax="trigger"]')
          .forEach((trigger) => {
            // Check if this trigger has to be disabled on smaller breakpoints
            const disable = trigger.getAttribute("data-parallax-disable");
            if (
              (disable === "mobile" && isMobile) ||
              (disable === "mobileLandscape" && isMobileLandscape) ||
              (disable === "tablet" && isTablet)
            ) {
              return;
            }

            // Optional: you can target an element inside a trigger if necessary
            const target =
              trigger.querySelector('[data-parallax="target"]') || trigger;

            // Get the direction value to decide between xPercent or yPercent tween
            const direction =
              trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";

            // Get the scrub value, our default is 'true' because that feels nice with Lenis
            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true;

            // Get the start position in %
            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20;

            // Get the end position in %
            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20;

            // Get the start value of the ScrollTrigger
            const scrollStartRaw =
              trigger.getAttribute("data-parallax-scroll-start") ||
              "top bottom";
            const scrollStart = `clamp(${scrollStartRaw})`;

            // Get the end value of the ScrollTrigger
            const scrollEndRaw =
              trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
            const scrollEnd = `clamp(${scrollEndRaw})`;

            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub,
                },
              }
            );
          });
      });

      return () => ctx.revert();
    }
  );
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

function initAccordian() {
  // Hide all content panels
  $(".acc-container .acc .acc-content").hide();

  // Open the first one by default
  $(".acc-container .acc:first-child .acc-content").show();
  $(".acc-container .acc:first-child .acc-head").addClass("active");

  // Click handler
  $(".acc-head").on("click", function () {
    const $this = $(this);
    const $content = $this.siblings(".acc-content");

    if ($this.hasClass("active")) {
      // Collapse current
      $content.slideUp();
      $this.removeClass("active");
    } else {
      // Close all others
      $(".acc-head.active").removeClass("active");
      $(".acc-content:visible").slideUp();

      // Open clicked
      $content.slideDown();
      $this.addClass("active");
    }
  });
}

function initNavChange() {
  const mm = gsap.matchMedia();

  mm.add("(min-width: 992px)", () => {
    const nav = document.querySelector(".nav_component");
    const links = document.querySelectorAll(".nav_link");
    const logo = document.querySelector(".nav_logo-link");
    const menuIcon = document.querySelector(".nav_menu-icon");

    ScrollTrigger.create({
      start: "top top",
      end: "+=250",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Nav background fades from transparent to white
        gsap.to(nav, {
          backgroundColor: `rgba(255,255,255,${progress})`,
          duration: 0.1,
          overwrite: "auto",
        });

        // Text and icons fade from white to #471618
        const textColor = gsap.utils.interpolate(
          "#ffffff",
          "#471618",
          progress
        );

        gsap.to([logo, menuIcon, ...links], {
          color: textColor,
          duration: 0.1,
          overwrite: "auto",
        });
      },
    });
  });
}

function initNavHideOnScroll() {
  let lastScroll = 0;
  const nav = document.querySelector(".nav_component");

  ScrollTrigger.create({
    start: "top top",
    end: "max",
    onUpdate: (self) => {
      const currentScroll = self.scroll();

      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling DOWN → hide nav
        gsap.to(nav, {
          y: "-100%",
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        // Scrolling UP → show nav
        gsap.to(nav, {
          y: "0%",
          duration: 0.3,
          ease: "power2.out",
        });
      }

      lastScroll = currentScroll;
    },
  });
}

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

function initSlideShow(el) {
  // Save all elements in an object for easy reference
  const ui = {
    el,
    slides: Array.from(el.querySelectorAll('[data-slideshow="slide"]')),
    inner: Array.from(el.querySelectorAll('[data-slideshow="parallax"]')),
    thumbs: Array.from(el.querySelectorAll('[data-slideshow="thumb"]')),
  };

  let current = 0;
  const length = ui.slides.length;
  let animating = false;
  let observer;
  let animationDuration = 0.9; // Define the duration of your 'slide' here

  ui.slides.forEach((slide, index) => {
    slide.setAttribute("data-index", index);
  });
  ui.thumbs.forEach((thumb, index) => {
    thumb.setAttribute("data-index", index);
  });

  ui.slides[current].classList.add("is--current");
  ui.thumbs[current].classList.add("is--current");

  function navigate(direction, targetIndex = null) {
    if (animating) return;
    animating = true;
    observer.disable();

    const previous = current;
    current =
      targetIndex !== null && targetIndex !== undefined
        ? targetIndex
        : direction === 1
        ? current < length - 1
          ? current + 1
          : 0
        : current > 0
        ? current - 1
        : length - 1;

    const currentSlide = ui.slides[previous];
    const currentInner = ui.inner[previous];
    const upcomingSlide = ui.slides[current];
    const upcomingInner = ui.inner[current];

    gsap
      .timeline({
        defaults: {
          duration: animationDuration,
          ease: "slideshow-wipe",
        },
        onStart: function () {
          upcomingSlide.classList.add("is--current");
          ui.thumbs[previous].classList.remove("is--current");
          ui.thumbs[current].classList.add("is--current");
        },
        onComplete: function () {
          currentSlide.classList.remove("is--current");
          animating = false;
          // Re-enable observer after a short delay
          setTimeout(() => observer.enable(), animationDuration);
        },
      })
      .to(currentSlide, { xPercent: -direction * 100 }, 0)
      .to(currentInner, { xPercent: direction * 50 }, 0)
      .fromTo(upcomingSlide, { xPercent: direction * 100 }, { xPercent: 0 }, 0)
      .fromTo(upcomingInner, { xPercent: -direction * 50 }, { xPercent: 0 }, 0);
  }

  function onClick(event) {
    const targetIndex = parseInt(
      event.currentTarget.getAttribute("data-index"),
      10
    );
    if (targetIndex === current || animating) return;
    const direction = targetIndex > current ? 1 : -1;
    navigate(direction, targetIndex);
  }

  ui.thumbs.forEach((thumb) => {
    thumb.addEventListener("click", onClick);
  });

  observer = Observer.create({
    target: el,
    type: "wheel,touch,pointer",
    // Drag events to go left/right
    onLeft: () => {
      if (!animating) navigate(1);
    },
    onRight: () => {
      if (!animating) navigate(-1);
    },
    // For wheel events, check horizontal movement
    onWheel: (event) => {
      if (animating) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        if (event.deltaX > 50) {
          navigate(1);
        } else if (event.deltaX < -50) {
          navigate(-1);
        }
      }
    },
    wheelSpeed: -1,
    tolerance: 10,
  });

  // Cleanup function if you need it
  return {
    destroy: function () {
      if (observer) observer.kill();
      ui.thumbs.forEach((thumb) => {
        thumb.removeEventListener("click", onClick);
      });
    },
  };
}

function initParallaxImageGalleryThumbnails() {
  let wrappers = document.querySelectorAll('[data-slideshow="wrap"]');
  wrappers.forEach((wrap) => initSlideShow(wrap));
}

// function initOrbit() {
//   const rot = 15;

//   // Clockwise group
//   gsap.to(".tags-rotate.cw", {
//     rotate: rot,
//     ease: "none",
//     scrollTrigger: {
//       trigger: ".orbit",
//       start: "top bottom",
//       end: "bottom top",
//       scrub: true,
//     },
//   });

//   // Counter-clockwise group
//   gsap.to(".tags-rotate.ccw", {
//     rotate: -rot,
//     ease: "none",
//     scrollTrigger: {
//       trigger: ".orbit",
//       start: "top bottom",
//       end: "bottom top",
//       scrub: true,
//     },
//   });

//   // Keep ALL tags upright (important)
//   gsap.to(".tag", {
//     rotate: (i, el) => {
//       // detect parent direction
//       return el.closest(".ccw") ? rot : -rot;
//     },
//     ease: "none",
//     scrollTrigger: {
//       trigger: ".orbit",
//       start: "top bottom",
//       end: "bottom top",
//       scrub: true,
//     },
//   });
// }

function initOrbit() {
  const rot = 15;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".orbit",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  // Rotate groups
  tl.to(
    ".tags-rotate.cw",
    {
      rotate: rot,
      ease: "none",
    },
    0
  )

    .to(
      ".tags-rotate.ccw",
      {
        rotate: -rot,
        ease: "none",
      },
      0
    )

    // Keep text upright
    .to(
      ".tag",
      {
        rotate: (i, el) => (el.closest(".cw") ? -rot : rot),
        ease: "none",
      },
      0
    );
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

// function initTextReveal() {
//   let headings = document.querySelectorAll("[data-split-lines]");

//   headings.forEach((heading) => {
//     gsap.set(heading, { autoAlpha: 1 });

//     const delay = parseFloat(heading.getAttribute("data-delay")) || 0;

//     SplitText.create(heading, {
//       type: "lines",
//       autoSplit: true,
//       mask: "lines",
//       onSplit(instance) {
//         return gsap.from(instance.lines, {
//           duration: 0.8,
//           yPercent: 110,
//           stagger: 0.08,
//           delay: delay,
//           transformOrigin: "bottom left",
//           ease: "expo.out",
//           scrollTrigger: {
//             trigger: heading,
//             start: "top 90%",
//             once: true,
//           },
//         });
//       },
//     });
//   });
// }
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
          duration: 0.8,
          yPercent: type === "lines" ? 110 : 50,
          opacity: type === "words" ? 0 : 1,
          stagger: type === "lines" ? 0.08 : 0.03,
          delay: delay,
          ease: "expo.out",
          transformOrigin: "bottom left",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        });
      },
    });
  });
}

function initScrollAnimations() {
  const boxes = document.querySelectorAll("[data-animi]");

  const animations = {
    up: { from: { opacity: 0, y: 25 }, to: { opacity: 1, y: 0 } },
    down: { from: { opacity: 0, y: -25 }, to: { opacity: 1, y: 0 } },
    left: { from: { opacity: 0, x: 25 }, to: { opacity: 1, x: 0 } },
    right: { from: { opacity: 0, x: -25 }, to: { opacity: 1, x: 0 } },
    scale: { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1 } },
    opa: { from: { opacity: 0 }, to: { opacity: 1 } },
  };

  if (!boxes.length) return;

  boxes.forEach((box) => {
    const animationName = box.getAttribute("data-animi");
    const duration = parseFloat(box.getAttribute("data-duration")) || 1.2;
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
          overwrite: "auto",
        });
      },
    });
  });
}

function initHighlightText() {
  let splitHeadingTargets = document.querySelectorAll("[data-highlight-text]");
  splitHeadingTargets.forEach((heading) => {
    const scrollStart =
      heading.getAttribute("data-highlight-scroll-start") || "top 90%";
    const scrollEnd =
      heading.getAttribute("data-highlight-scroll-end") || "center 40%";
    const fadedValue = heading.getAttribute("data-highlight-fade") || 0.2; // Opacity of letter
    const staggerValue = heading.getAttribute("data-highlight-stagger") || 0.1; // Smoother reveal

    new SplitText(heading, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        let ctx = gsap.context(() => {
          let tl = gsap.timeline({
            scrollTrigger: {
              scrub: true,
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
            },
          });
          tl.from(self.chars, {
            autoAlpha: fadedValue,
            stagger: staggerValue,
            ease: "linear",
          });
        });
        return ctx; // return our animations so GSAP can clean them up when onSplit fires
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initTextReveal();
  initScrollAnimations();
  initHighlightText();
  if (has("[data-marquee-scroll-direction-target]"))
    initMarqueeScrollDirection();
  if (has("[data-stacking-cards-item]")) initStackingCardsParallax();
  if (has("[data-parallax]")) initGlobalParallax();
  if (has("[data-accordian]")) initAccordian();
  if (has("[data-wf--navigation--variant='base']")) initNavChange();
  initNavHideOnScroll();
  if (has("[data-bg-zoom-init]")) initBackgroundZoom();
  if (has("[data-slideshow]")) initParallaxImageGalleryThumbnails();
  if (has("[data-tags-rotate]")) initOrbit();
  if (has("[data-sticky-steps-init]")) initStickyStepsBasic();
});

