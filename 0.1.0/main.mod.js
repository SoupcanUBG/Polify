import { PolyMod, SettingType } from 'https://cdn.polymodloader.com/cb/polytrackmods/PolyModLoader/0.6.2/PolyTypes.js';

let spotifyTimeout;

class PolifyMod extends PolyMod {
    constructor() {
        super();

        this.init = async (pml) => {
            // Register Settings
            pml.registerSettingCategory("Polify");

            pml.registerSetting(
                "Enable Notification",
                "polifytoggle",
                SettingType.BOOL,
                true
            );

            pml.registerSetting(
                "Enable popup transition",
                "polifyenabletransition",
                SettingType.BOOL,
                true
            );

            pml.registerSetting(
                "Transition type",
                "polifytransitiontype",
                SettingType.CUSTOM,
                "fade",
                [
                    { title: "Fade", value: "fade" },
                    { title: "Slide", value: "slide" }
                ]
            );

            pml.registerSetting(
                "Opacity",
                "polifyopacity",
                SettingType.SLIDER,
                1
            );

            pml.registerSetting(
                "Size",
                "polifysize",
                SettingType.SLIDER,
                1
            );

            this.polifytogglevalue = () => {
                return pml.getSetting("polifytoggle") === "true";
            };

            this.pml = pml;

            this.initSpotifyPopup();
        };
    }

    initSpotifyPopup() {
        const spotifyStyle = document.createElement("style");

        spotifyStyle.textContent = `
:root {
  --spotify-width: 230px;
  --spotify-min-height: 55px;

  --spotify-border: #28346A;
  --spotify-inner: #192042;

  --spotify-enter-distance: 50px;
  --spotify-exit-distance: 50px;

  --spotify-enter-speed: 0.45s;
  --spotify-exit-speed: 0.35s;

  --spotify-enter-scale: 0.96;
  --spotify-exit-scale: 0.96;
}

#spotify-popup {
  position: fixed;
  right: 15px;
  top: 15px;

  color: #fff;
  font-family: Arial, sans-serif;

  width: var(--spotify-width);
  min-height: var(--spotify-min-height);

  padding: 8px 14px;

  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  z-index: 99999;

  background: var(--spotify-border);
  text-align: center;

  opacity: 0;
}

#spotify-popup::before {
  content: "";
  position: absolute;
  inset: 8px;
  background: var(--spotify-inner);
  z-index: -1;
}

#spotify-popup > * {
  position: relative;
  z-index: 1;

  width: 100%;
  max-width: 100%;

  transform: skewX(-8deg);

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

#spotify-title {
  font-size: 28px;
  font-weight: bold;
  line-height: 30px;
  padding-top: 4px;
}

#spotify-artist {
  margin-top: 4px;
  font-size: 18px;
  opacity: 0.75;
  line-height: 22px;
}

`;

        document.head.appendChild(spotifyStyle);

        const spotifyPopup = document.createElement("div");

        spotifyPopup.id = "spotify-popup";

        spotifyPopup.innerHTML = `
            <div id="spotify-title"></div>
            <div id="spotify-artist"></div>
        `;

        document.body.appendChild(spotifyPopup);

        let spotifyAnimation = null;

        const ENTER_DISTANCE = 50;
        const EXIT_DISTANCE = 50;
        const ENTER_SCALE = 0.96;
        const EXIT_SCALE = 0.96;
        const ENTER_SPEED = 450;
        const EXIT_SPEED = 350;
        const ENTER_EASING = "cubic-bezier(0.22,1,0.36,1)";
        const EXIT_EASING = "cubic-bezier(0.22,1,0.36,1)";

        window.electron.onSpotifySongChange((song) => {

            if (!this.polifytogglevalue()) {
                return;
            }

            const pml = this.pml;

            const popup = document.getElementById("spotify-popup");
            const title = document.getElementById("spotify-title");
            const artist = document.getElementById("spotify-artist");

            title.textContent = song.title;
            artist.textContent = song.artist;

            const transitionType = pml.getSetting("polifytransitiontype") ?? "fade";
            const enableTransition = pml.getSetting("polifyenabletransition") === "true";
            const rawOpacity = parseFloat(pml.getSetting("polifyopacity"));
            const rawSize = parseFloat(pml.getSetting("polifysize"));
            const opacity = Math.max(0, Math.min(1, isNaN(rawOpacity) ? 1 : rawOpacity));
            const size = Math.max(0, Math.min(1, isNaN(rawSize) ? 1 : rawSize));

            clearTimeout(spotifyTimeout);
            if (spotifyAnimation) {
                spotifyAnimation.cancel();
            }

            popup.style.transformOrigin = "top right";
            popup.style.display = "flex";

            const enterKeyframes = [
                { opacity: 0, transform: `translateX(${ENTER_DISTANCE}px) scale(${ENTER_SCALE})` },
                { opacity: opacity, transform: `translateX(0) scale(${size})` }
            ];

            if (enableTransition) {
                spotifyAnimation = popup.animate(enterKeyframes, {
                    duration: ENTER_SPEED,
                    easing: ENTER_EASING,
                    fill: "forwards"
                });
            } else {
                popup.style.opacity = opacity.toString();
                popup.style.transform = `translateX(0) scale(${size})`;
            }

            spotifyTimeout = setTimeout(() => {

                if (spotifyAnimation) {
                    spotifyAnimation.cancel();
                }

                let exitKeyframes;
                if (transitionType === "slide") {
                    exitKeyframes = [
                        { opacity: opacity, transform: `translateX(0) scale(${size})` },
                        { opacity: 0, transform: `translateX(${EXIT_DISTANCE}px) scale(${EXIT_SCALE})` }
                    ];
                } else {
                    exitKeyframes = [
                        { opacity: opacity },
                        { opacity: 0 }
                    ];
                }

                if (enableTransition) {
                    spotifyAnimation = popup.animate(exitKeyframes, {
                        duration: EXIT_SPEED,
                        easing: EXIT_EASING,
                        fill: "forwards"
                    });
                    spotifyAnimation.onfinish = () => {
                        popup.style.display = "none";
                        popup.style.opacity = "";
                        popup.style.transform = "";
                    };
                } else {
                    popup.style.display = "none";
                    popup.style.opacity = "";
                    popup.style.transform = "";
                }

            }, 2000);
        });
    }
}

export const polyMod = new PolifyMod();