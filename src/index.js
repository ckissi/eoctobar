const {
  app,
  BrowserWindows,
  Menu,
  MenuItem,
  Tray,
  clipboard,
  ipcMain,
  Notification,
} = require("electron");
const {
  initTrayMenu,
  getListData,
  showSubscribers,
  getApiKey,
} = require("./modules/functions");
require("dotenv").config();
const path = require("path");
const AutoLaunch = require("auto-launch");

// If development environment
if ((process.env.NODE_ENV || "").trim() == "development") {
  console.log(process.env.NODE_ENV);
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

let tray = null;
let api_key = "";

var autoLauncher = new AutoLaunch({
  name: "EOctoBar",
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  //Create the browser window.
  // const mainWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  // });

  // // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, "index.html"));

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  if (process.platform === "darwin") app.dock.hide();
  initTrayMenu();
  getListData(showSubscribers);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("update", function (event, data) {
  getListData(showSubscribers);
});

ipcMain.on("test", function (event, data) {
  getListData(showSubscribers);
});

setInterval(() => getListData(showSubscribers), 1000 * 60 * 15);
