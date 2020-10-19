const {
    app,
    BrowserWindow
} = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('./html/index.html');
    win.removeMenu();
    let package = require('./package.json');
    win.webContents.on('did-finish-load', () => {
        win.setTitle(`${package.name} v${package.version} - https://github.com/${package.author}`);
    });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    let { version } = require('./package.json');
    console.log(`Reddit Sniffer v${version} exited.`);
    if (process.platform !== "darwin") app.quit();
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});