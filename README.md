# Polify

<sub>please help me find a better name</sub>

## Import Url
```
https://cdn.polymodloader.com/gh/SoupcanUBG/Polify/main/
```
## Tutorial

Basically because of how the mod grabs your spotify status, PML by itself is not going to work so some files from inside the game must be edited to make it work

There are 3 ways to do so

<sub>4 but idrc about compressing the entire of polymodloader including the executable and stuff for each platform so yeah</sub>

### Download Game Code <sub>imo the easiest option</sub>

 1.  Download the app.asar file

 2.  Then go to where the PolyTrack executable is and then enter the folder called "resources" there you should see a file called app.asar

 3.  Rename the app.asar to backup.asar or whatever else but it cant be app.asar

 4.  After that move the app.asar you downloaded to that directory effectly backing up the old file and then replacing it with this one

 5.  Done! But remember to import the Polify Mod

### Update 1 folder from the game code

 1.  Download the electron.zip file

 2.  Extract the zip file to wherever you want I suggest "Desktop"

 3.  If you don't already have it installed, install a tool called asar

 4.  Go to where the PolyTrack executable is and then enter the folder called "resources" there you should see a file called app.asar

 5.  Extract it to a folder called app using the asar tool it can be extracted to whatever folder name you want it doesn't matter

 6.  After you've got the extracted folder enter it and then delete the folder called "electron" and replace it with the extracted zip you downloaded earlier

 7.  Rename the original app.asar to anything else I suggest backup.asar

 8.  Compress the folder you made after extracting the app.asar back into an app.asar

 9.  Done! But remember to import the Polify Mod

### Manual

 1.  Download the spotify.bundle.js

 2.  If you don't already have it installed, install a tool called asar

 3.  Go to where the PolyTrack executable is and then enter the folder called "resources" there you should see a file called app.asar

 4.  Extract it to a folder called app using the asar tool it can be extracted to whatever folder name you want it doesn't matter

 5.  After you've got the extracted folder enter it and then go into electron/ and place the spotify.bundle.js in there it should be in the same folder as preload.js and main.js

 6.  Edit main.js and add these things:

`Add const path = require("path"), { startSpotifyWatcher, stopSpotifyWatcher } = require("./spotify.bundle.js");` on the second line so it should look like this:
```
const { app, BrowserWindow, session, shell, ipcMain } = require("electron"),
const path = require("path"), { startSpotifyWatcher, stopSpotifyWatcher } = require("./spotify.bundle.js");

let browserWindow = null;

const singleInstanceLockSucessful = app.requestSingleInstanceLock();
```
then add `stopSpotifyWatcher();` after in:
```
 ipcMain.on("quit", () => {
    app.quit();
  }),
```
and
```
  app.on("window-all-closed", () => {
    app.quit();
  }),
```
like this:
```
ipcMain.on("get-pml-port", (e) => {
    const portArg = process.argv.find((arg) => arg.startsWith("--pml-port="));
    e.returnValue = portArg ? portArg.split("=")[1] : null;
  }),
  ipcMain.on("log-message", (e, n) => {
    console.log(n);
  }),
  ipcMain.on("quit", () => {
    stopSpotifyWatcher();
    app.quit();
  }),
  app.on("window-all-closed", () => {
    stopSpotifyWatcher();
    app.quit();
  }),
  app.whenReady().then(() => {
```
Now for the preload.js

Simply add:
```
 onSpotifySongChange: (callback) => {
   ipcRenderer.on("spotify-song-change", (_, song) => {
     callback(song);
   });
 },
```
after `getHelperPort: () => ipcRenderer.sendSync("get-pml-port"),`

due to the file being small and few lines you can just replace the file with this
```
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  quit: () => ipcRenderer.send("quit"),

  addFullscreenChangeListener: (callback) =>
    ipcRenderer.on("fullscreen-change", () => callback()),

  isFullscreen: () => ipcRenderer.sendSync("is-fullscreen"),

  setFullscreen: (enabled) => ipcRenderer.send("set-fullscreen", enabled),

  getArgv: () => ipcRenderer.sendSync("get-argv"),

  log: (message) => ipcRenderer.send("log-message", message),

  getHelperPort: () => ipcRenderer.sendSync("get-pml-port"),

  // Spotify
  onSpotifySongChange: (callback) => {
    ipcRenderer.on("spotify-song-change", (_, song) => {
      callback(song);
    });
  },
});
```
Also credits to [Jakob](https://crjakob.com/) for like all of the PML Code xD
He made this but for Apple Music but fully PML Compatible go check it out [here](https://git.polymodloader.com/Jakob/NowPlaying/src/branch/main)
