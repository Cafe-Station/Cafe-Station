
const beanSeeds = [
  [-58, -10, 0.0, -18],
  [-31, 16, 0.02, 22],
  [-8, -4, 0.04, -11],
  [18, 10, 0.06, 32],
  [43, -13, 0.08, -29],
  [65, 8, 0.1, 16],
  [-46, 20, 0.12, 38],
  [-21, -16, 0.14, -32],
  [6, 19, 0.16, 14],
  [33, -6, 0.18, -20],
  [57, 15, 0.2, 30],
  [-64, 5, 0.22, -15],
  [-35, -7, 0.24, 26],
  [-4, 12, 0.26, -35],
  [27, -18, 0.28, 19],
  [51, 4, 0.3, -25],
];

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const phase = (value, start, end) =>
  clamp((value - start) / (end - start));

document.addEventListener("DOMContentLoaded", () => {
  const story = document.querySelector(".coffee-story");
  let frame = 0;

  if (story) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const render = () => {
      frame = 0;

      const rect = story.getBoundingClientRect();
      const distance = Math.max(
        1,
        story.offsetHeight - window.innerHeight,
      );

      const progress = reduceMotion
        ? 0.96
        : clamp(-rect.top / distance);

      const pourBeans = phase(progress, 0.02, 0.28);
      const lockPortafilter = phase(progress, 0.27, 0.58);
      const pressure = phase(progress, 0.34, 0.64);
      const cupArrive = phase(progress, 0.48, 0.66);
      const pourCoffee = phase(progress, 0.64, 0.92);
      const finish = phase(progress, 0.9, 0.99);

      story.style.setProperty(
        "--story-progress",
        progress.toFixed(4),
      );
      story.style.setProperty(
        "--bean-phase",
        pourBeans.toFixed(4),
      );
      story.style.setProperty(
        "--lift-phase",
        lockPortafilter.toFixed(4),
      );
      story.style.setProperty(
        "--pressure-phase",
        pressure.toFixed(4),
      );
      story.style.setProperty(
        "--coffee-phase",
        pourCoffee.toFixed(4),
      );
      story.style.setProperty(
        "--finish-phase",
        finish.toFixed(4),
      );

      story.dataset.step =
        progress < 0.31
          ? "beans"
          : progress < 0.64
            ? "pressure"
            : "crema";

      const machine = story.querySelector("[data-machine]");

      if (machine) {
        machine.style.transform =
          `translate3d(-50%, ${-progress * 5}px, 0)`;
      }

      const fallDistance =
        window.innerWidth <= 700
          ? Math.min(window.innerHeight * 0.18, 112)
          : Math.min(window.innerHeight * 0.25, 220);

      story
        .querySelectorAll("[data-bean]")
        .forEach((bean, index) => {
          const [, drift, delay, rotation] = beanSeeds[index];
          const t = phase(
            pourBeans,
            delay,
            Math.min(1, delay + 0.72),
          );
          const eased = 1 - Math.pow(1 - t, 2.25);
          const sway = Math.sin((t + index) * 4.4) * 6;
          const scale = 0.5 + (index % 4) * 0.07;

          bean.style.transform =
            `translate3d(${drift * t + sway}px, ` +
            `${fallDistance * eased}px, 0) ` +
            `rotate(${rotation + t * 230}deg) ` +
            `scale(${scale})`;

          bean.style.opacity =
            `${phase(t, 0, 0.1) *
            (1 - phase(t, 0.76, 1))}`;
        });

      const coffeeStage =
        story.querySelector(".coffee-stage");

      const brewRing =
        story.querySelector(".brew-group > span");

      let brewCenterX = null;
      let brewContactY = null;
      let stageHeight = null;
      let openPortafilterWidth = null;

      if (coffeeStage && brewRing) {
        const stageRect =
          coffeeStage.getBoundingClientRect();

        const ringRect =
          brewRing.getBoundingClientRect();

        brewCenterX =
          ringRect.left +
          ringRect.width / 2 -
          stageRect.left;

        brewContactY =
          ringRect.bottom - stageRect.top;

        stageHeight = coffeeStage.clientHeight;
      }

      const travel =
        phase(lockPortafilter, 0, 0.38);

      const easedTravel =
        travel * travel * (3 - 2 * travel);

      const portafilterSwap =
        phase(lockPortafilter, 0.48, 0.72);

      const openPortafilter =
        story.querySelector(
          "[data-portafilter-open]",
        );

      if (openPortafilter) {
        openPortafilterWidth =
          openPortafilter.offsetWidth;

        if (brewCenterX !== null) {
          const basketAnchor = 0.243;

          openPortafilter.style.left =
            `${brewCenterX +
            openPortafilter.offsetWidth *
              (0.5 - basketAnchor)}px`;
        }

        if (
          brewContactY !== null &&
          stageHeight !== null
        ) {
          const startTop =
            stageHeight *
            (window.innerWidth <= 700
              ? 0.49
              : 0.54);

          const visibleTopInset =
            openPortafilter.offsetWidth *
            (15 / 1099);

          const dockTop =
            brewContactY - visibleTopInset;

          openPortafilter.style.top =
            `${startTop +
            (dockTop - startTop) *
              easedTravel}px`;
        }

        openPortafilter.style.transform =
          "translate3d(-50%, 0, 0)";

        openPortafilter.style.opacity =
          `${1 - portafilterSwap}`;
      }

      const lockedPortafilter =
        story.querySelector(
          "[data-portafilter-locked]",
        );

      if (lockedPortafilter) {
        if (openPortafilterWidth !== null) {
          lockedPortafilter.style.width =
            `${openPortafilterWidth *
            (1200 / 1099)}px`;
        }

        if (brewCenterX !== null) {
          const outletAnchor = 0.225;

          lockedPortafilter.style.left =
            `${brewCenterX +
            lockedPortafilter.offsetWidth *
              (0.5 - outletAnchor)}px`;
        }

        if (brewContactY !== null) {
          const visibleTopInset =
            lockedPortafilter.offsetWidth *
            (11 / 1200);

          lockedPortafilter.style.top =
            `${brewContactY -
            visibleTopInset}px`;
        }

        lockedPortafilter.style.transform =
          "translate3d(-50%, 0, 0)";

        lockedPortafilter.style.opacity =
          `${portafilterSwap}`;
      }

      const gaugeNeedle =
        story.querySelector(
          "[data-gauge-needle]",
        );

      if (gaugeNeedle) {
        gaugeNeedle.style.transform =
          `translateX(-50%) ` +
          `rotate(${-118 + pressure * 210}deg)`;
      }

      story
        .querySelectorAll("[data-jet]")
        .forEach((jet, index) => {
          const flow = phase(
            pourCoffee,
            index * 0.025,
            0.96,
          );

          jet.style.transform =
            `scaleY(${flow}) ` +
            `scaleX(${1 - finish * 0.45})`;

          jet.style.opacity =
            `${phase(flow, 0.03, 0.16) *
            (1 - finish * 0.88)}`;
        });

      story
        .querySelectorAll("[data-drip]")
        .forEach((drip, index) => {
          const visible =
            phase(
              finish,
              0.04 + index * 0.08,
              0.3 + index * 0.08,
            ) *
            (1 - phase(finish, 0.68, 1));

          drip.style.opacity = `${visible}`;

          drip.style.transform =
            `translateY(${finish *
            (12 + index * 5)}px)`;
        });

      const cup =
        story.querySelector("[data-cup]");

      if (cup) {
        const stage =
          story.querySelector(".coffee-stage");

        const jetTrack =
          story.querySelector(".espresso-jets");

        if (stage && jetTrack) {
          const stageRect =
            stage.getBoundingClientRect();

          const jetRect =
            jetTrack.getBoundingClientRect();

          const cupWidth = cup.offsetWidth;
          const cupHeight = cup.offsetHeight;

          const outletCenter =
            jetRect.left +
            jetRect.width / 2 -
            stageRect.left;

          const cupAnchorCorrection =
            cupWidth * 0.08;

          const targetRim =
            jetRect.top -
            stageRect.top +
            jetRect.height * 0.72;

          const desiredTop =
            targetRim - cupHeight * 0.12;

          const floorClearance =
            Math.max(
              12,
              stageRect.height * 0.025,
            );

          const maxTop =
            stageRect.height -
            cupHeight -
            floorClearance;

          cup.style.left =
            `${outletCenter +
            cupAnchorCorrection}px`;

          cup.style.top =
            `${Math.min(
              desiredTop,
              maxTop,
            )}px`;

          cup.style.bottom = "auto";
        }

        cup.style.transform =
          `translate3d(-50%, ` +
          `${36 * (1 - cupArrive)}px, 0) ` +
          `scale(${0.94 +
          cupArrive * 0.06})`;

        cup.style.opacity = `${cupArrive}`;
      }

      const cupFill =
        story.querySelector(
          "[data-cup-fill]",
        );

      if (cupFill) {
        const fill =
          phase(pourCoffee, 0.08, 0.92);

        cupFill.style.opacity = `${fill}`;
        cupFill.style.height =
          `${fill * 88}%`;
      }
    };

    const onScroll = () => {
      if (!frame) {
        frame =
          window.requestAnimationFrame(render);
      }
    };

    render();

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true },
    );

    window.addEventListener(
      "resize",
      onScroll,
    );
  }

  const targets =
    document.querySelectorAll(
      "[data-reveal]",
    );

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.visible =
              "true";

            observer.unobserve(
              entry.target,
            );
          }
        });
      },
      { threshold: 0.16 },
    );

  targets.forEach((target) =>
    observer.observe(target),
  );
});
