"use strict";

// TODO: learn how to use modules

interface Document {
    mozCancelFullScreen: () => void;
    msExitFullscreen: () => void;
}

interface Element {
    mozRequestFullScreen: () => void;
    msRequestFullscreen: () => void;
}

class TwistyPlayer {
  private readonly viewContainer: HTMLElement;
  private anim: AnimController;
  private controlBar: TwistyControlBar;
  constructor(public element: Element) {
    this.viewContainer = document.createElement("twisty-view-container");
    this.anim = new AnimController(this.draw.bind(this), new SimpleBreakPoints([0, 1000, 1500, 2500]));
    this.controlBar = new TwistyControlBar(this.anim, this.element);

    this.element.appendChild(this.viewContainer);
    this.element.appendChild(this.controlBar.element);

    this.draw(0);
  }

  draw(duration: Duration) {
    this.viewContainer.textContent = String(Math.floor(duration));
  }

  // Initialize a Twisty for the given Element unless the element's
  // `initialization` attribute is set to `custom`.
  private static autoInitialize(elem: Element) {
    const ini = elem.getAttribute("initialization");
    if (ini !== "custom") {
      new TwistyPlayer(elem);
    }
  }

  static autoInitializePage() {
    const elems = document.querySelectorAll("twisty");
    console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`)

    for (let i = 0; i < elems.length; i++) {
      TwistyPlayer.autoInitialize(elems[i]);
    }
  }
}

class TwistyControlBar {
  private isFullscreen: boolean = false;
  private buttonElems: {[key: string]:Element}; // TODO: Use ES6 Map.
  public element;
  constructor(private anim: AnimController, private twistyElement: Element) {
    this.element = document.createElement("twisty-control-bar");

    // TODO: Use SVGs or a web font for element-relative sizing.
    const buttons = [{
        title: "Cycle display mode",
        id: "fullscreen",
        initialClass: "fullscreen",
        fn: this.toggleFullscreen.bind(this)
      }, {
        title: "Skip to start",
        id: "skip-to-start",
        initialClass: "skip-to-start",
        fn: anim.skipToStart.bind(anim)
      }, {
        title: "Step back",
        id: "step-backward",
        initialClass: "step-backward",
        fn: anim.stepBackward.bind(anim)
      }, {
        title: "Play",
        id: "play",
        initialClass: "play",
        fn: anim.togglePausePlayForward.bind(anim) // TODO: Toggle between play and pause icon.
      }, {
        title: "Step forward",
        id: "step-forward",
        initialClass: "step-forward",
        fn: anim.stepForward.bind(anim)
      }, {
        title: "Skip to end",
        id: "skip-to-end",
        initialClass: "skip-to-end",
        fn: anim.skipToEnd.bind(anim)
      }];

    this.buttonElems = {};

    for (let i = 0; i < 6; i++) {
      const button = document.createElement("button");
      button.title = buttons[i].title;
      // TODO: Handle updating image based on anim state.
      button.classList.add(buttons[i].initialClass);
      button.addEventListener("click", buttons[i].fn);

      this.buttonElems[buttons[i].id] = button;
      this.element.appendChild(button);
    }
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      var exitFullscreen = document.exitFullscreen ||
                           // TODO: Figure out how to uncomment without triggerint a Typescript error.
                           document.mozCancelFullScreen ||
                           document.msExitFullscreen ||
                           document.webkitExitFullscreen;
      exitFullscreen.call(document);
    } else {
      var requestFullscreen = this.twistyElement.requestFullscreen ||
                              // TODO: Figure out how to uncomment without triggerint a Typescript error.
                              this.twistyElement.mozRequestFullScreen ||
                              this.twistyElement.msRequestFullscreen ||
                              this.twistyElement.webkitRequestFullscreen;
      requestFullscreen.call(this.twistyElement);
    }
    this.isFullscreen = !this.isFullscreen;
  }
}

window.addEventListener("load", TwistyPlayer.autoInitializePage);
