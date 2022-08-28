import difficulties from "./eldritch-codejam/data/difficulties.js";
import ancientsData from "./eldritch-codejam/data/ancients.js";
import cardsDataBlue from "./eldritch-codejam/data/mythicCards/blue/index.js";
import cardsDataGreen from "./eldritch-codejam/data/mythicCards/green/index.js";
import cardsDataBrown from "./eldritch-codejam/data/mythicCards/brown/index.js";

var VanillaTilt = (function () {
  "use strict";
  class t {
    constructor(e, i = {}) {
      if (!(e instanceof Node))
        throw "Can't initialize VanillaTilt because " + e + " is not a Node.";
      (this.width = null),
        (this.height = null),
        (this.clientWidth = null),
        (this.clientHeight = null),
        (this.left = null),
        (this.top = null),
        (this.gammazero = null),
        (this.betazero = null),
        (this.lastgammazero = null),
        (this.lastbetazero = null),
        (this.transitionTimeout = null),
        (this.updateCall = null),
        (this.event = null),
        (this.updateBind = this.update.bind(this)),
        (this.resetBind = this.reset.bind(this)),
        (this.element = e),
        (this.settings = this.extendSettings(i)),
        (this.reverse = this.settings.reverse ? -1 : 1),
        (this.glare = t.isSettingTrue(this.settings.glare)),
        (this.glarePrerender = t.isSettingTrue(this.settings["glare-prerender"])),
        (this.fullPageListening = t.isSettingTrue(this.settings["full-page-listening"])),
        (this.gyroscope = t.isSettingTrue(this.settings.gyroscope)),
        (this.gyroscopeSamples = this.settings.gyroscopeSamples),
        (this.elementListener = this.getElementListener()),
        this.glare && this.prepareGlare(),
        this.fullPageListening && this.updateClientSize(),
        this.addEventListeners(),
        this.reset(),
        this.updateInitialPosition();
    }
    static isSettingTrue(t) {
      return "" === t || !0 === t || 1 === t;
    }
    getElementListener() {
      if (this.fullPageListening) return window.document;
      if ("string" == typeof this.settings["mouse-event-element"]) {
        const t = document.querySelector(this.settings["mouse-event-element"]);
        if (t) return t;
      }
      return this.settings["mouse-event-element"] instanceof Node
        ? this.settings["mouse-event-element"]
        : this.element;
    }
    addEventListeners() {
      (this.onMouseEnterBind = this.onMouseEnter.bind(this)),
        (this.onMouseMoveBind = this.onMouseMove.bind(this)),
        (this.onMouseLeaveBind = this.onMouseLeave.bind(this)),
        (this.onWindowResizeBind = this.onWindowResize.bind(this)),
        (this.onDeviceOrientationBind = this.onDeviceOrientation.bind(this)),
        this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind),
        this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind),
        this.elementListener.addEventListener("mousemove", this.onMouseMoveBind),
        (this.glare || this.fullPageListening) &&
          window.addEventListener("resize", this.onWindowResizeBind),
        this.gyroscope &&
          window.addEventListener("deviceorientation", this.onDeviceOrientationBind);
    }
    removeEventListeners() {
      this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind),
        this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind),
        this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind),
        this.gyroscope &&
          window.removeEventListener("deviceorientation", this.onDeviceOrientationBind),
        (this.glare || this.fullPageListening) &&
          window.removeEventListener("resize", this.onWindowResizeBind);
    }
    destroy() {
      clearTimeout(this.transitionTimeout),
        null !== this.updateCall && cancelAnimationFrame(this.updateCall),
        this.reset(),
        this.removeEventListeners(),
        (this.element.vanillaTilt = null),
        delete this.element.vanillaTilt,
        (this.element = null);
    }
    onDeviceOrientation(t) {
      if (null === t.gamma || null === t.beta) return;
      this.updateElementPosition(),
        this.gyroscopeSamples > 0 &&
          ((this.lastgammazero = this.gammazero),
          (this.lastbetazero = this.betazero),
          null === this.gammazero
            ? ((this.gammazero = t.gamma), (this.betazero = t.beta))
            : ((this.gammazero = (t.gamma + this.lastgammazero) / 2),
              (this.betazero = (t.beta + this.lastbetazero) / 2)),
          (this.gyroscopeSamples -= 1));
      const e = this.settings.gyroscopeMaxAngleX - this.settings.gyroscopeMinAngleX,
        i = this.settings.gyroscopeMaxAngleY - this.settings.gyroscopeMinAngleY,
        s = e / this.width,
        n = i / this.height,
        l = (t.gamma - (this.settings.gyroscopeMinAngleX + this.gammazero)) / s,
        a = (t.beta - (this.settings.gyroscopeMinAngleY + this.betazero)) / n;
      null !== this.updateCall && cancelAnimationFrame(this.updateCall),
        (this.event = { clientX: l + this.left, clientY: a + this.top }),
        (this.updateCall = requestAnimationFrame(this.updateBind));
    }
    onMouseEnter() {
      this.updateElementPosition(),
        (this.element.style.willChange = "transform"),
        this.setTransition();
    }
    onMouseMove(t) {
      null !== this.updateCall && cancelAnimationFrame(this.updateCall),
        (this.event = t),
        (this.updateCall = requestAnimationFrame(this.updateBind));
    }
    onMouseLeave() {
      this.setTransition(), this.settings.reset && requestAnimationFrame(this.resetBind);
    }
    reset() {
      (this.event = { clientX: this.left + this.width / 2, clientY: this.top + this.height / 2 }),
        this.element &&
          this.element.style &&
          (this.element.style.transform =
            `perspective(${this.settings.perspective}px) ` +
            "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"),
        this.resetGlare();
    }
    resetGlare() {
      this.glare &&
        ((this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)"),
        (this.glareElement.style.opacity = "0"));
    }
    updateInitialPosition() {
      if (0 === this.settings.startX && 0 === this.settings.startY) return;
      this.onMouseEnter(),
        this.fullPageListening
          ? (this.event = {
              clientX:
                ((this.settings.startX + this.settings.max) / (2 * this.settings.max)) *
                this.clientWidth,
              clientY:
                ((this.settings.startY + this.settings.max) / (2 * this.settings.max)) *
                this.clientHeight,
            })
          : (this.event = {
              clientX:
                this.left +
                ((this.settings.startX + this.settings.max) / (2 * this.settings.max)) * this.width,
              clientY:
                this.top +
                ((this.settings.startY + this.settings.max) / (2 * this.settings.max)) *
                  this.height,
            });
      let t = this.settings.scale;
      (this.settings.scale = 1), this.update(), (this.settings.scale = t), this.resetGlare();
    }
    getValues() {
      let t, e;
      return (
        this.fullPageListening
          ? ((t = this.event.clientX / this.clientWidth),
            (e = this.event.clientY / this.clientHeight))
          : ((t = (this.event.clientX - this.left) / this.width),
            (e = (this.event.clientY - this.top) / this.height)),
        (t = Math.min(Math.max(t, 0), 1)),
        (e = Math.min(Math.max(e, 0), 1)),
        {
          tiltX: (this.reverse * (this.settings.max - t * this.settings.max * 2)).toFixed(2),
          tiltY: (this.reverse * (e * this.settings.max * 2 - this.settings.max)).toFixed(2),
          percentageX: 100 * t,
          percentageY: 100 * e,
          angle:
            Math.atan2(
              this.event.clientX - (this.left + this.width / 2),
              -(this.event.clientY - (this.top + this.height / 2))
            ) *
            (180 / Math.PI),
        }
      );
    }
    updateElementPosition() {
      let t = this.element.getBoundingClientRect();
      (this.width = this.element.offsetWidth),
        (this.height = this.element.offsetHeight),
        (this.left = t.left),
        (this.top = t.top);
    }
    update() {
      let t = this.getValues();
      (this.element.style.transform =
        "perspective(" +
        this.settings.perspective +
        "px) rotateX(" +
        ("x" === this.settings.axis ? 0 : t.tiltY) +
        "deg) rotateY(" +
        ("y" === this.settings.axis ? 0 : t.tiltX) +
        "deg) scale3d(" +
        this.settings.scale +
        ", " +
        this.settings.scale +
        ", " +
        this.settings.scale +
        ")"),
        this.glare &&
          ((this.glareElement.style.transform = `rotate(${t.angle}deg) translate(-50%, -50%)`),
          (this.glareElement.style.opacity = `${
            (t.percentageY * this.settings["max-glare"]) / 100
          }`)),
        this.element.dispatchEvent(new CustomEvent("tiltChange", { detail: t })),
        (this.updateCall = null);
    }
    prepareGlare() {
      if (!this.glarePrerender) {
        const t = document.createElement("div");
        t.classList.add("js-tilt-glare");
        const e = document.createElement("div");
        e.classList.add("js-tilt-glare-inner"), t.appendChild(e), this.element.appendChild(t);
      }
      (this.glareElementWrapper = this.element.querySelector(".js-tilt-glare")),
        (this.glareElement = this.element.querySelector(".js-tilt-glare-inner")),
        this.glarePrerender ||
          (Object.assign(this.glareElementWrapper.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            "pointer-events": "none",
          }),
          Object.assign(this.glareElement.style, {
            position: "absolute",
            top: "50%",
            left: "50%",
            "pointer-events": "none",
            "background-image":
              "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
            width: `${2 * this.element.offsetWidth}px`,
            height: `${2 * this.element.offsetWidth}px`,
            transform: "rotate(180deg) translate(-50%, -50%)",
            "transform-origin": "0% 0%",
            opacity: "0",
          }));
    }
    updateGlareSize() {
      this.glare &&
        Object.assign(this.glareElement.style, {
          width: `${2 * this.element.offsetWidth}`,
          height: `${2 * this.element.offsetWidth}`,
        });
    }
    updateClientSize() {
      (this.clientWidth =
        window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
        (this.clientHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight);
    }
    onWindowResize() {
      this.updateGlareSize(), this.updateClientSize();
    }
    setTransition() {
      clearTimeout(this.transitionTimeout),
        (this.element.style.transition = this.settings.speed + "ms " + this.settings.easing),
        this.glare &&
          (this.glareElement.style.transition = `opacity ${this.settings.speed}ms ${this.settings.easing}`),
        (this.transitionTimeout = setTimeout(() => {
          (this.element.style.transition = ""),
            this.glare && (this.glareElement.style.transition = "");
        }, this.settings.speed));
    }
    extendSettings(t) {
      let e = {
          reverse: !1,
          max: 15,
          startX: 0,
          startY: 0,
          perspective: 1e3,
          easing: "cubic-bezier(.03,.98,.52,.99)",
          scale: 1,
          speed: 300,
          transition: !0,
          axis: null,
          glare: !1,
          "max-glare": 1,
          "glare-prerender": !1,
          "full-page-listening": !1,
          "mouse-event-element": null,
          reset: !0,
          gyroscope: !0,
          gyroscopeMinAngleX: -45,
          gyroscopeMaxAngleX: 45,
          gyroscopeMinAngleY: -45,
          gyroscopeMaxAngleY: 45,
          gyroscopeSamples: 10,
        },
        i = {};
      for (var s in e)
        if (s in t) i[s] = t[s];
        else if (this.element.hasAttribute("data-tilt-" + s)) {
          let t = this.element.getAttribute("data-tilt-" + s);
          try {
            i[s] = JSON.parse(t);
          } catch (e) {
            i[s] = t;
          }
        } else i[s] = e[s];
      return i;
    }
    static init(e, i) {
      e instanceof Node && (e = [e]),
        e instanceof NodeList && (e = [].slice.call(e)),
        e instanceof Array &&
          e.forEach((e) => {
            "vanillaTilt" in e || (e.vanillaTilt = new t(e, i));
          });
    }
  }
  return (
    "undefined" != typeof document &&
      ((window.VanillaTilt = t), t.init(document.querySelectorAll("[data-tilt]"))),
    t
  );
})();

VanillaTilt.init(document.querySelectorAll(".demons-list__item "), {
  max: 25,
  speed: 400,
});

// Const

let demon = "";
let level = "";
let length = 0;
let stage = "one";

let greenCardsStageOne = 0;
let greenCardsStageTwo = 0;
let greenCardsStagethree = 0;
let blueCardsStageOne = 0;
let blueCardsStageTwo = 0;
let blueCardsStagethree = 0;
let brownCardsStageOne = 0;
let brownCardsStageTwo = 0;
let brownCardsStagethree = 0;

let greenCardsLevelStageOne = [];
let greenCardsLevelStageTwo = [];
let greenCardsLevelStageThree = [];
let blueCardsLevelStageOne = [];
let blueCardsLevelStageTwo = [];
let blueCardsLevelStageThree = [];
let brownCardsLevelStageOne = [];
let brownCardsLevelStageTwo = [];
let brownCardsLevelStageThree = [];
let stageOne = [];
let stageTwo = [];
let stageThree = [];

const azathoth = document.querySelector(".azathoth");
const cthulhu = document.querySelector(".cthulhu");
const iogSothoth = document.querySelector(".iogsothoth");
const shubNiggurath = document.querySelector(".shubniggurath");
const levelsContainer = document.querySelector(".section__game-btns");
const btnStart = document.querySelector(".section__start-btn");
const startContainer = document.querySelector(".section__start");
const btnSoEasy = document.querySelector(".btn-soeasy");
const btnEasy = document.querySelector(".btn-easy");
const btnMiddle = document.querySelector(".btn-middle");
const btnHard = document.querySelector(".btn-hard");
const btnSohard = document.querySelector(".btn-sohard");
const sectionGamePlace = document.querySelector(".section__game-place");
const backgroundClose = document.querySelector(".background-close");
const backgroundOpen = document.querySelector(".background-open");

function showLevels() {
  levelsContainer.style.display = "flex";
}

function showBtnStartGame() {
  startContainer.style.display = "block";
}

function demonCardLength() {
  ancientsData.forEach((el) => {
    if (el.id === demon) {
      greenCardsStageOne += el.firstStage.greenCards;
      greenCardsStageTwo += el.secondStage.greenCards;
      greenCardsStagethree += el.thirdStage.greenCards;
      blueCardsStageOne += el.firstStage.blueCards;
      blueCardsStageTwo += el.secondStage.blueCards;
      blueCardsStagethree += el.thirdStage.blueCards;
      brownCardsStageOne += el.firstStage.brownCards;
      brownCardsStageTwo += el.secondStage.brownCards;
      brownCardsStagethree += el.thirdStage.brownCards;
    }

    length =
      greenCardsStageOne +
      greenCardsStageTwo +
      greenCardsStagethree +
      blueCardsStageOne +
      blueCardsStageTwo +
      blueCardsStagethree +
      brownCardsStageOne +
      brownCardsStageTwo +
      brownCardsStagethree;
  });
}

let resultOneGreen = cardsDataGreen.filter((el) => el.difficulty === "easy");
let resultOneBlue = cardsDataBlue.filter((el) => el.difficulty === "easy");
let resultOneBrown = cardsDataBrown.filter((el) => el.difficulty === "easy");

let resultOneGreenHard = cardsDataGreen.filter((el) => el.difficulty === "hard");
let resultOneBlueHard = cardsDataBlue.filter((el) => el.difficulty === "hard");
let resultOneBrownHard = cardsDataBrown.filter((el) => el.difficulty === "hard");

let greenCardsNormal = cardsDataGreen.filter((el) => el.difficulty === "normal");
let blueCardsNormal = cardsDataBlue.filter((el) => el.difficulty === "normal");
let brownCardsNormal = cardsDataBrown.filter((el) => el.difficulty === "normal");
let normalCards = [...greenCardsNormal, ...blueCardsNormal, ...brownCardsNormal];

function cardsInside() {
  if (level === "soEasy") {
    /* Greens */
    greenCardsLevelStageOne = resultOneGreen.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards
    );
    resultOneGreen.slice(0, greenCardsLevelStageOne.length);

    if (
      greenCardsLevelStageOne.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards
    ) {
      greenCardsLevelStageOne.push(
        ...greenCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards -
            greenCardsLevelStageOne.length
        )
      );
    }

    greenCardsLevelStageTwo = resultOneGreen.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards
    );

    if (
      greenCardsLevelStageTwo.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards
    ) {
      greenCardsLevelStageTwo.push(
        ...greenCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards -
            greenCardsLevelStageTwo.length
        )
      );
    }

    resultOneGreen.slice(0, greenCardsLevelStageTwo);

    greenCardsLevelStageThree = resultOneGreen.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards
    );

    if (
      greenCardsLevelStageThree.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards
    ) {
      greenCardsLevelStageThree.push(
        ...greenCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards -
            greenCardsLevelStageThree.length
        )
      );
    }

    /* Blues */
    blueCardsLevelStageOne = resultOneBlue.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards
    );

    if (
      blueCardsLevelStageOne.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards
    ) {
      blueCardsLevelStageOne.push(
        ...blueCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards -
            blueCardsLevelStageOne.length
        )
      );
    }
    resultOneBlue.slice(0, blueCardsLevelStageOne.length);
    blueCardsLevelStageTwo = resultOneBlue.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards
    );
    if (
      blueCardsLevelStageTwo.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards
    ) {
      blueCardsLevelStageTwo.push(
        ...blueCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards -
            blueCardsLevelStageTwo.length
        )
      );
    }
    resultOneBlue.slice(0, blueCardsLevelStageTwo.length);
    blueCardsLevelStageThree = resultOneBlue.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards
    );
    if (
      blueCardsLevelStageThree.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards
    ) {
      blueCardsLevelStageThree.push(
        ...blueCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards -
            blueCardsLevelStageThree.length
        )
      );
    }

    /* Browns */
    brownCardsLevelStageOne = resultOneBrown.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards
    );

    if (
      brownCardsLevelStageOne.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards
    ) {
      brownCardsLevelStageOne.push(
        ...brownCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards -
            brownCardsLevelStageOne.length
        )
      );
    }
    resultOneBrown.slice(0, brownCardsLevelStageOne.length);

    brownCardsLevelStageTwo = resultOneBrown.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards
    );

    if (
      brownCardsLevelStageTwo.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards
    ) {
      brownCardsLevelStageTwo.push(
        ...brownCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards -
            brownCardsLevelStageTwo.length
        )
      );
    }
    resultOneBrown.slice(0, brownCardsLevelStageTwo.length);

    brownCardsLevelStageThree = resultOneBrown.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards
    );

    if (
      brownCardsLevelStageThree.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards
    ) {
      brownCardsLevelStageThree.push(
        ...brownCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards -
            brownCardsLevelStageThree.length
        )
      );
    }

    // console.log(brownCardsLevelStageOne);
    // console.log(brownCardsLevelStageTwo);
    // console.log(brownCardsLevelStageThree);
  } else if (level === "easy") {
    /* Greens */
    greenCardsLevelStageOne = cardsDataGreen
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards);
    greenCardsLevelStageTwo = cardsDataGreen
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards);
    greenCardsLevelStageThree = cardsDataGreen
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards);
    /* Blues */
    blueCardsLevelStageOne = cardsDataBlue
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards);
    blueCardsLevelStageTwo = cardsDataBlue
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards);
    blueCardsLevelStageThree = cardsDataBlue
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards);
    /* Browns */
    brownCardsLevelStageOne = cardsDataBrown
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards);
    brownCardsLevelStageTwo = cardsDataBrown
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards);
    brownCardsLevelStageThree = cardsDataBrown
      .filter((el) => el.difficulty !== "hard")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards);
  } else if (level === "normal") {
    /* Greens */
    greenCardsLevelStageOne = cardsDataGreen
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards);
    greenCardsLevelStageTwo = cardsDataGreen
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards);
    greenCardsLevelStageThree = cardsDataGreen
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards);
    /* Blues */
    blueCardsLevelStageOne = cardsDataBlue
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards);
    blueCardsLevelStageTwo = cardsDataBlue
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards);
    blueCardsLevelStageThree = cardsDataBlue
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards);
    /* Browns */
    brownCardsLevelStageOne = cardsDataBrown
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards);
    brownCardsLevelStageTwo = cardsDataBrown
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards);
    brownCardsLevelStageThree = cardsDataBrown
      .filter((el) => el.difficulty)
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards);
  } else if (level === "hard") {
    /* Greens */
    greenCardsLevelStageOne = cardsDataGreen
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards);
    greenCardsLevelStageTwo = cardsDataGreen
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards);
    greenCardsLevelStageThree = cardsDataGreen
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards);
    /* Blues */
    blueCardsLevelStageOne = cardsDataBlue
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards);
    blueCardsLevelStageTwo = cardsDataBlue
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards);
    blueCardsLevelStageThree = cardsDataBlue
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards);
    /* Browns */
    brownCardsLevelStageOne = cardsDataBrown
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards);
    brownCardsLevelStageTwo = cardsDataBrown
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards);
    brownCardsLevelStageThree = cardsDataBrown
      .filter((el) => el.difficulty !== "easy")
      .splice(0, ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards);
  } else if ((level = "soHard")) {
    /* Greens */
    greenCardsLevelStageOne = resultOneGreenHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards
    );
    resultOneGreenHard.slice(0, greenCardsLevelStageOne.length);

    if (
      greenCardsLevelStageOne.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards
    ) {
      greenCardsLevelStageOne.push(
        ...greenCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.greenCards -
            greenCardsLevelStageOne.length
        )
      );
    }

    greenCardsLevelStageTwo = resultOneGreenHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards
    );

    if (
      greenCardsLevelStageTwo.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards
    ) {
      greenCardsLevelStageTwo.push(
        ...greenCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.greenCards -
            greenCardsLevelStageTwo.length
        )
      );
    }

    resultOneGreenHard.slice(0, greenCardsLevelStageTwo);

    greenCardsLevelStageThree = resultOneGreenHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards
    );

    if (
      greenCardsLevelStageThree.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards
    ) {
      greenCardsLevelStageThree.push(
        ...greenCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.greenCards -
            greenCardsLevelStageThree.length
        )
      );
    }

    /* Blues */
    blueCardsLevelStageOne = resultOneBlueHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards
    );

    if (
      blueCardsLevelStageOne.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards
    ) {
      blueCardsLevelStageOne.push(
        ...blueCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.blueCards -
            blueCardsLevelStageOne.length
        )
      );
    }
    resultOneBlueHard.slice(0, blueCardsLevelStageOne.length);
    blueCardsLevelStageTwo = resultOneBlueHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards
    );
    if (
      blueCardsLevelStageTwo.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards
    ) {
      blueCardsLevelStageTwo.push(
        ...blueCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.blueCards -
            blueCardsLevelStageTwo.length
        )
      );
    }
    resultOneBlueHard.slice(0, blueCardsLevelStageTwo.length);
    blueCardsLevelStageThree = resultOneBlueHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards
    );
    if (
      blueCardsLevelStageThree.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards
    ) {
      blueCardsLevelStageThree.push(
        ...blueCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.blueCards -
            blueCardsLevelStageThree.length
        )
      );
    }

    /* Browns */
    brownCardsLevelStageOne = resultOneBrownHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards
    );

    if (
      brownCardsLevelStageOne.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards
    ) {
      brownCardsLevelStageOne.push(
        ...brownCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].firstStage.brownCards -
            brownCardsLevelStageOne.length
        )
      );
    }
    resultOneBrownHard.slice(0, brownCardsLevelStageOne.length);

    brownCardsLevelStageTwo = resultOneBrownHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards
    );

    if (
      brownCardsLevelStageTwo.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards
    ) {
      brownCardsLevelStageTwo.push(
        ...brownCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].secondStage.brownCards -
            brownCardsLevelStageTwo.length
        )
      );
    }
    resultOneBrownHard.slice(0, brownCardsLevelStageTwo.length);

    brownCardsLevelStageThree = resultOneBrownHard.splice(
      0,
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards
    );

    if (
      brownCardsLevelStageThree.length <
      ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards
    ) {
      brownCardsLevelStageThree.push(
        ...brownCardsNormal.slice(
          0,
          ancientsData.filter((el) => el.id === `${demon}`)[0].thirdStage.brownCards -
            brownCardsLevelStageThree.length
        )
      );
    }
  }

  stageOne = [...greenCardsLevelStageOne, ...blueCardsLevelStageOne, ...brownCardsLevelStageOne];
  stageTwo = [...greenCardsLevelStageTwo, ...blueCardsLevelStageTwo, ...brownCardsLevelStageTwo];
  stageThree = [
    ...greenCardsLevelStageThree,
    ...blueCardsLevelStageThree,
    ...brownCardsLevelStageThree,
  ];
}

function setCount() {
  if (length === 1) {
    backgroundClose.style.display = "none";
  }
}

function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function soEasyGame() {
  if (length) {
    console.log(length);
    if (stage === "one") {
      if (stageOne.length) {
        let random = getRandomNum(0, stageOne.length);
        backgroundOpen.style.backgroundImage = `url(./eldritch-codejam/assets/MythicCards/${stageOne[random].color}/${stageOne[random].cardFace})`;
        stageOne.splice(random, 1);
      } else {
        stage = "two";
      }
    }
    if (stage === "two") {
      if (stageTwo.length) {
        let random = getRandomNum(0, stageTwo.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageTwo[random].color}/${stageTwo[random].cardFace})`;
        stageTwo.splice(random, 1);
      } else {
        stage = "three";
      }
    }
    if (stage === "three") {
      if (stageThree.length) {
        let random = getRandomNum(0, stageThree.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageThree[random].color}/${stageThree[random].cardFace})`;
        stageThree.splice(random, 1);
      } else {
        let random = getRandomNum(0, normalCards.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${normalCards[random].color}/${normalCards[random].cardFace})`;
        normalCards.splice(random, 1);
      }
    }
  }
}

function easyGame() {
  if (length) {
    if (stage === "one") {
      if (stageOne.length) {
        let random = getRandomNum(0, stageOne.length);
        backgroundOpen.style.backgroundImage = `url(./eldritch-codejam/assets/MythicCards/${stageOne[random].color}/${stageOne[random].cardFace})`;
        stageOne.splice(random, 1);
      } else {
        stage = "two";
      }
    }
    if (stage === "two") {
      if (stageTwo.length) {
        let random = getRandomNum(0, stageTwo.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageTwo[random].color}/${stageTwo[random].cardFace})`;
        stageTwo.splice(random, 1);
      } else {
        stage = "three";
      }
    }
    if (stage === "three") {
      if (stageThree.length) {
        let random = getRandomNum(0, stageThree.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageThree[random].color}/${stageThree[random].cardFace})`;
        stageThree.splice(random, 1);
      } else {
        let random = getRandomNum(0, normalCards.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${normalCards[random].color}/${normalCards[random].cardFace})`;
        normalCards.splice(random, 1);
      }
    }
  }
}

function normalGame() {
  if (length) {
    if (stage === "one") {
      if (stageOne.length) {
        let random = getRandomNum(0, stageOne.length);
        backgroundOpen.style.backgroundImage = `url(./eldritch-codejam/assets/MythicCards/${stageOne[random].color}/${stageOne[random].cardFace})`;
        stageOne.splice(random, 1);
      } else {
        stage = "two";
      }
    }
    if (stage === "two") {
      if (stageTwo.length) {
        let random = getRandomNum(0, stageTwo.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageTwo[random].color}/${stageTwo[random].cardFace})`;
        stageTwo.splice(random, 1);
      } else {
        stage = "three";
      }
    }
    if (stage === "three") {
      if (stageThree.length) {
        let random = getRandomNum(0, stageThree.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageThree[random].color}/${stageThree[random].cardFace})`;
        stageThree.splice(random, 1);
      } else {
        let random = getRandomNum(0, normalCards.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${normalCards[random].color}/${normalCards[random].cardFace})`;
        normalCards.splice(random, 1);
      }
    }
  }
}

function hardGame() {
  if (length) {
    if (stage === "one") {
      if (stageOne.length) {
        let random = getRandomNum(0, stageOne.length);
        backgroundOpen.style.backgroundImage = `url(./eldritch-codejam/assets/MythicCards/${stageOne[random].color}/${stageOne[random].cardFace})`;
        stageOne.splice(random, 1);
      } else {
        stage = "two";
      }
    }
    if (stage === "two") {
      if (stageTwo.length) {
        let random = getRandomNum(0, stageTwo.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageTwo[random].color}/${stageTwo[random].cardFace})`;
        stageTwo.splice(random, 1);
      } else {
        stage = "three";
      }
    }
    if (stage === "three") {
      if (stageThree.length) {
        let random = getRandomNum(0, stageThree.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageThree[random].color}/${stageThree[random].cardFace})`;
        stageThree.splice(random, 1);
      } else {
        let random = getRandomNum(0, normalCards.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${normalCards[random].color}/${normalCards[random].cardFace})`;
        normalCards.splice(random, 1);
      }
    }
  }
}

function soHardGame() {
  if (length) {
    if (stage === "one") {
      if (stageOne.length) {
        let random = getRandomNum(0, stageOne.length);
        backgroundOpen.style.backgroundImage = `url(./eldritch-codejam/assets/MythicCards/${stageOne[random].color}/${stageOne[random].cardFace})`;
        stageOne.splice(random, 1);
      } else {
        stage = "two";
      }
    }
    if (stage === "two") {
      if (stageTwo.length) {
        let random = getRandomNum(0, stageTwo.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageTwo[random].color}/${stageTwo[random].cardFace})`;
        stageTwo.splice(random, 1);
      } else {
        stage = "three";
      }
    }
    if (stage === "three") {
      if (stageThree.length) {
        let random = getRandomNum(0, stageThree.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${stageThree[random].color}/${stageThree[random].cardFace})`;
        stageThree.splice(random, 1);
      } else {
        let random = getRandomNum(0, normalCards.length);
        backgroundOpen.style.background = `url(./eldritch-codejam/assets/MythicCards/${normalCards[random].color}/${normalCards[random].cardFace})`;
        normalCards.splice(random, 1);
      }
    }
  }
}

// Events

azathoth.addEventListener("click", () => {
  demon = "azathoth";
  demonCardLength();
  showLevels();
});

cthulhu.addEventListener("click", () => {
  demon = "cthulhu";
  demonCardLength();
  showLevels();
});

iogSothoth.addEventListener("click", () => {
  demon = "iogSothoth";
  demonCardLength();
  showLevels();
});

shubNiggurath.addEventListener("click", () => {
  demon = "shubNiggurath";
  demonCardLength();
  showLevels();
});

btnSoEasy.addEventListener("click", () => {
  level = "soEasy";
  cardsInside();
  showBtnStartGame();
});

btnEasy.addEventListener("click", () => {
  level = "easy";
  cardsInside();
  showBtnStartGame();
});

btnMiddle.addEventListener("click", () => {
  level = "normal";
  cardsInside();
  showBtnStartGame();
});

btnHard.addEventListener("click", () => {
  level = "hard";
  cardsInside();
  showBtnStartGame();
});

btnSohard.addEventListener("click", () => {
  level = "soHard";
  cardsInside();
  showBtnStartGame();
});

btnStart.addEventListener("click", () => {
  sectionGamePlace.style.display = "flex";
});

backgroundClose.addEventListener("click", () => {
  if (level === "soEasy") {
    soEasyGame();
    setCount();
    length -= 1;
  } else if (level === "easy") {
    easyGame();
    setCount();
    length -= 1;
  } else if (level === "normal") {
    normalGame();
    setCount();
    length -= 1;
  } else if (level === "hard") {
    soHardGame();
    setCount();
    length -= 1;
  } else if (level === "soHard") {
    hardGame();
    setCount();
    length -= 1;
  }
});
