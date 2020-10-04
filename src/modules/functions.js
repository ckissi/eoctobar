const electron = require("electron");
const { Tray, Menu, shell, Notification } = require("electron");
const https = require("https");
const path = require("path");
const app = electron.app;
const querystring = require("querystring");
const BrowserWindow = electron.BrowserWindow;
const url = require("url");
const settings = require("electron-settings");
let contextMenu = {};
let menuTemplate = {};

//===================================================================
exports.getListData = (callback) => {
  let subscribers = "";
  let list_id = querystring.stringify(this.getListId()); //"5a175994-f856-11ea-a3d0-06b4694bee2a";

  const api_keys = this.getSettings();
  const parameters = {
    api_key: api_keys.api_key,
  };

  const get_request_args = querystring.stringify(parameters);

  const options = {
    hostname: "emailoctopus.com",
    port: 443,
    path: `/api/1.5/lists/${api_keys.list_id}?` + get_request_args,
    method: "GET",
  };
  console.log(options);
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);    

    res.on("data", (d) => {
      try {
        const data = JSON.parse(d);
        console.log("res:", data);
        console.log(data.counts.subscribed);
        subscribers = data.counts.subscribed;
        callback(subscribers);
      } catch (e) {
        this.notifyMe(
          "Error",
          "Cannot read from the Email Octopus API. Please check API configuration"
        );
      }
    });
  });
  req.end();
};
//===================================================================
exports.showSubscribers = (cnt) => {
  tray.setTitle(cnt.toString());  
  menuTemplate[0].label = "Subscribers: " + cnt.toString();
  contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(contextMenu);
};
//===================================================================
exports.getApiKey = async () => {
  return (await settings.has("api_key")) ? await settings.get("api_key") : "";
};
//===================================================================
exports.getListId = async () => {
  return (await settings.has("list_id")) ? await settings.get("list_id") : "";
};
//===================================================================
exports.initTrayMenu = () => {
  menuTemplate = [
    {
      label: "Subscribbers: ",
      click: () => {
        this.getListData(this.showSubscribers);
      },
    },
    {
      type: "separator",
    },
    {
      label: "Show My List",
      click: () => {
        const api_keys = this.getSettings();
        shell.openExternal(
          `https://emailoctopus.com/lists/${api_keys.list_id}`
        );
      },
    },
    {
      label: "Refresh",
      click: () => {
        this.getListData(this.showSubscribers);
      },
    },
    {
      type: "separator",
    },
    {
      label: "Configure...",
      click: function () {
        let settingsWindow = new BrowserWindow({
          frame: true,
          transparent: false,
          alwaysOnTop: true,
          width: 500,
          height: 240,
          show: true,
          icon: path.join(__dirname, "../assets/img/icon.png"),
          webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
          },
        });
        settingsWindow.loadURL(
          url.format({
            pathname: path.join(__dirname, "../configure.html"),
            protocol: "file:",
            slashes: true,
          })
        );

        //win.loadURL(modalPath);
        //settingsWindow.webContents.openDevTools();
        //win.on('close', function () { win = null });
        settingsWindow.on("close", function () {
          win = null;
        });
        //win.show();
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ];
  contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray = new Tray(path.join(__dirname, "../../assets/img/icon.png"));
  tray.setContextMenu(contextMenu);

  tray.setTitle("");
  tray.setToolTip("");
  return {
    menuTemplate: menuTemplate,
    tray: tray,
  };
};
//===================================================================
exports.notifyMe = (title, message, icon) => {
  if (Notification.isSupported()) {
    console.log("supported");
    const notifycation = new Notification({
      title: title,
      body: message,
      icon: icon,
    });
    notifycation.show();
  }
};
//===================================================================
exports.getSettings = () => {
  const api_keys = settings.getSync("api_keys");
  console.log("API_KEYS", api_keys);
  return api_keys;
};
//===================================================================
exports.setSettings = (api_keys) => {
  console.log("API_KEYS", api_keys);
  settings.setSync("api_keys", api_keys);
};
