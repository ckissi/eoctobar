const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const settings = require("electron-settings");
const remote = electron.remote;
const functions = require("./modules/functions.js");
const { Notification } = require("electron");

ipcRenderer.on("notify", function (event, data) {
  console.log(data.msg);
  let myNotification = new Notification("Success", {
    body: data.msg,
  });
});

const api_key = document.getElementById("api_key");
const list_id = document.getElementById("list_id");
const test_btn = document.getElementById("test_btn");
const save_btn = document.getElementById("save_btn");

let api_keys = functions.getSettings();
typeof api_keys !== "undefined" ? (api_key.value = api_keys.api_key) : "";
typeof api_keys !== "undefined" ? (list_id.value = api_keys.list_id) : "";

//===================================================================
save_btn.addEventListener("click", async (event) => {
  var api_keys = {
    api_key: api_key.value,
    list_id: list_id.value,
  };
  console.log(api_keys);
  functions.setSettings(api_keys);
  ipcRenderer.send("update-api", api_keys);
  var cur_win = remote.getCurrentWindow();
  cur_win.close();
});
//===================================================================
test_btn.addEventListener("click", function (event) {
  var api_keys = {
    api_key: api_key.value,
    list_id: list_id.value,
  };
  ipcRenderer.send("test", api_keys);
});

//===================================================================
const testData = (data) => {
  if (data.err) {
    let myNotification = new Notification("ERROR", {
      body: "Cannot read from the server. Probably wrong API keys",
    });
  } else {
    var api_keys = {
      api_key: api_key.value,
    };
    let myNotification = new Notification("SUCCESS", {
      body: "Successfully connected to API",
    });
    ipcRenderer.send("update", api_keys);
  }
};
//===================================================================
