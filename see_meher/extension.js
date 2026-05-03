const vscode = require('vscode');
const express = require('express');
const path = require('path');

let server = null;
let serverPort = 3579;
let statusBarItem = null;

function activate(context) {

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'viewport.start';
	statusBarItem.text = '$(device-mobile) Go ViewPort';
	statusBarItem.tooltip = 'Open with ViewPort';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	const startDisposable = vscode.commands.registerCommand('viewport.start', function () {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('Open Any HTML File First.');
			return;
		}

		const filePath = editor.document.fileName;

		if (!filePath.endsWith('.html')) {
			vscode.window.showErrorMessage('Only HTML Files Can Be Opened In The ViewPort!');
			return;
		}

		const folderPath = path.dirname(filePath);
		const fileName = path.basename(filePath);

		if (server) {
			server.close();
			server = null;
		}

		const app = express();

		app.get('/viewport-ui', (req, res) => {
			res.send(getViewportUI(fileName, serverPort));
		});

		app.use(express.static(folderPath));

		function startServer(port) {
			const s = app.listen(port, () => {
				serverPort = port;
				server = s;
				console.log('ViewPort running on port ' + port);
				statusBarItem.text = '$(device-mobile) ViewPort: ' + fileName;
				statusBarItem.command = 'viewport.stop';
				statusBarItem.tooltip = 'Stop ViewPort';
				vscode.env.openExternal(vscode.Uri.parse('http://localhost:' + port + '/viewport-ui'));
			});
			s.on('error', (err) => {
				if (err.code === 'EADDRINUSE') {
					vscode.window.showInformationMessage('Port ' + port + 'Was Busy , ' + (port + 1) + ' Trying To Solve...');
					startServer(port + 1);
				}
			});
		}
		startServer(serverPort);

		// SSE clients list
		const clients = [];

		// SSE endpoint — browser yahan connect karega
		app.get('/viewport-reload', (req, res) => {
			res.setHeader('Content-Type', 'text/event-stream');
			res.setHeader('Cache-Control', 'no-cache');
			res.setHeader('Connection', 'keep-alive');
			res.flushHeaders();
			clients.push(res);
			req.on('close', () => {
				const index = clients.indexOf(res);
				if (index !== -1) clients.splice(index, 1);
			});
		});

		const watcher = vscode.workspace.onDidSaveTextDocument((doc) => {
			if (path.dirname(doc.fileName) === folderPath) {
				// Send a reload signal to all connected browsers
				clients.forEach((res) => {
					res.write('data: reload\n\n');
				});
			}
		});

		context.subscriptions.push(watcher);
	});

	const stopDisposable = vscode.commands.registerCommand('viewport.stop', function () {
		if (server) {
			server.close();
			server = null;
			statusBarItem.text = '$(device-mobile) Go ViewPort';
			statusBarItem.command = 'viewport.start';
			statusBarItem.tooltip = 'Open with ViewPort';
			vscode.window.showInformationMessage('ViewPort band ho gaya!');
		}
	});

	context.subscriptions.push(startDisposable);
	context.subscriptions.push(stopDisposable);
}

function getViewportUI(fileName, port) {
	const html = [
		'<!DOCTYPE html>',
		'<html lang="en">',
		'<head>',
		'<meta charset="UTF-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
		'<title>ViewPort</title>',
		'<style>',
		'  * { margin: 0; padding: 0; box-sizing: border-box; }',
		'  body {',
		'    background: #1e1e1e;',
		'    color: #fff;',
		'    font-family: sans-serif;',
		'    display: flex;',
		'    flex-direction: column;',
		'    height: 100vh;',
		'    overflow: hidden;',
		'  }',
		'  #topbar {',
		'    height: 40px;',
		'    background: #252526;',
		'    border-bottom: 1px solid #333;',
		'    display: flex;',
		'    align-items: center;',
		'    padding: 0 16px;',
		'    font-size: 12px;',
		'    color: #888;',
		'    flex-shrink: 0;',
		'  }',
		'  #topbar span { color: #4fc3f7; margin-left: 8px; }',
		'  #main {',
		'    display: flex;',
		'    flex: 1;',
		'    overflow: hidden;',
		'  }',
		'  #preview-area {',
		'    flex: 1;',
		'    display: flex;',
		'    align-items: center;',
		'    justify-content: center;',
		'    background: #2d2d2d;',
		'    overflow: auto;',
		'    padding: 24px;',
		'  }',
		'  #device-frame {',
		'    background: #111;',
		'    border-radius: 36px;',
		'    padding: 12px;',
		'    box-shadow: 0 0 0 2px #555, 0 20px 60px rgba(0,0,0,0.8);',
		'    flex-shrink: 0;',
		'    transition: transform 0.3s ease;',
		'  }',
		'  #device-frame.desktop-frame {',
		'    border-radius: 12px;',
		'    padding: 28px 16px 40px 16px;',
		'    background: #222;',
		'  }',
		'  #device-screen {',
		'    border-radius: 20px;',
		'    overflow: hidden;',
		'    background: #fff;',
		'  }',
		'  #device-frame.desktop-frame #device-screen {',
		'    border-radius: 4px;',
		'  }',
		'  #device-screen iframe {',
		'    border: none;',
		'    display: block;',
		'  }',
		'  #sidebar {',
		'    width: 240px;',
		'    background: #1e1e1e;',
		'    border-left: 1px solid #333;',
		'    overflow-y: auto;',
		'    padding: 16px;',
		'    flex-shrink: 0;',
		'  }',
		'  #sidebar h3 {',
		'    font-size: 11px;',
		'    text-transform: uppercase;',
		'    color: #888;',
		'    letter-spacing: 1px;',
		'    margin-bottom: 8px;',
		'    margin-top: 16px;',
		'  }',
		'  #sidebar h3:first-child { margin-top: 0; }',
		'  .device-btn {',
		'    width: 100%;',
		'    padding: 9px 12px;',
		'    background: #2d2d2d;',
		'    border: 1px solid #3d3d3d;',
		'    color: #ccc;',
		'    border-radius: 6px;',
		'    cursor: pointer;',
		'    margin-bottom: 5px;',
		'    text-align: left;',
		'    font-size: 13px;',
		'    transition: all 0.15s;',
		'  }',
		'  .device-btn:hover { background: #3d3d3d; color: #fff; }',
		'  .device-btn.active { background: #0e639c; border-color: #0e639c; color: #fff; }',
		'  .device-btn small {',
		'    display: block;',
		'    color: #666;',
		'    font-size: 11px;',
		'    margin-top: 2px;',
		'  }',
		'  .device-btn.active small { color: #aad4f5; }',
		'</style>',
		'</head>',
		'<body>',
		'<div id="topbar">',
		'  ViewPort &mdash; <span>' + fileName + '</span>',
		'</div>',
		'<div id="main">',
		'  <div id="preview-area">',
		'    <div id="device-frame">',
		'      <div id="device-screen">',
		'        <iframe id="preview-iframe" src="http://localhost:' + port + '/' + fileName + '"></iframe>',
		'      </div>',
		'    </div>',
		'  </div>',
		'  <div id="sidebar">',
		'    <h3>Android — Samsung</h3>',
		'    <button class="device-btn active" onclick="setDevice(360, 780, \'mobile\', this)">',
		'      Samsung Galaxy S25',
		'      <small>360x780 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(360, 800, \'mobile\', this)">',
		'      Samsung Galaxy S20',
		'      <small>360x800 @4.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(412, 915, \'mobile\', this)">',
		'      Samsung Galaxy A54',
		'      <small>412x915 @2.625</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(412, 883, \'mobile\', this)">',
		'      Samsung Galaxy Note 20 Ultra',
		'      <small>412x883 @3.5</small>',
		'    </button>',
		'    <h3>Android — Google Pixel</h3>',
		'    <button class="device-btn" onclick="setDevice(412, 915, \'mobile\', this)">',
		'      Google Pixel 9 Pro',
		'      <small>412x915 @2.625</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(412, 915, \'mobile\', this)">',
		'      Google Pixel 8',
		'      <small>412x915 @2.625</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(412, 915, \'mobile\', this)">',
		'      Google Pixel 6a',
		'      <small>412x915 @2.625</small>',
		'    </button>',
		'    <h3>Android — Others</h3>',
		'    <button class="device-btn" onclick="setDevice(412, 919, \'mobile\', this)">',
		'      OnePlus 8 Pro',
		'      <small>412x919 @3.5</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(384, 854, \'mobile\', this)">',
		'      Sony Xperia 1 II',
		'      <small>384x854 @3.5</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(360, 640, \'mobile\', this)">',
		'      Nexus 5',
		'      <small>360x640 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(412, 732, \'mobile\', this)">',
		'      Nexus 6P',
		'      <small>412x732 @3.5</small>',
		'    </button>',
		'    <h3>iPhone</h3>',
		'    <button class="device-btn" onclick="setDevice(402, 874, \'mobile\', this)">',
		'      iPhone 16 Pro',
		'      <small>402x874 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(440, 956, \'mobile\', this)">',
		'      iPhone 16 Pro Max',
		'      <small>440x956 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(393, 852, \'mobile\', this)">',
		'      iPhone 14 Pro',
		'      <small>393x852 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(360, 780, \'mobile\', this)">',
		'      iPhone 13 Mini',
		'      <small>360x780 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(414, 896, \'mobile\', this)">',
		'      iPhone 11 Pro Max',
		'      <small>414x896 @3.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(375, 667, \'mobile\', this)">',
		'      iPhone SE (3rd gen)',
		'      <small>375x667 @2.0</small>',
		'    </button>',
		'    <h3>iPad</h3>',
		'    <button class="device-btn" onclick="setDevice(820, 1180, \'tablet\', this)">',
		'      iPad Air 11" (M2)',
		'      <small>820x1180 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(1024, 1366, \'tablet\', this)">',
		'      iPad Air 13" (M2)',
		'      <small>1024x1366 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(834, 1194, \'tablet\', this)">',
		'      iPad Pro 11" (M4)',
		'      <small>834x1194 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(1024, 1366, \'tablet\', this)">',
		'      iPad Pro 13" (M4)',
		'      <small>1024x1366 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(820, 1180, \'tablet\', this)">',
		'      iPad 10th Gen',
		'      <small>820x1180 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(820, 1180, \'tablet\', this)">',
		'      iPad 11th Gen / Air 5',
		'      <small>820x1180 @2.0</small>',
		'    </button>',
		'    <h3>MacBook</h3>',
		'    <button class="device-btn" onclick="setDevice(1280, 800, \'desktop\', this)">',
		'      MacBook Air 13"',
		'      <small>1280x800 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(1440, 900, \'desktop\', this)">',
		'      MacBook Pro 15"',
		'      <small>1440x900 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(1512, 982, \'desktop\', this)">',
		'      MacBook Pro 14" M3',
		'      <small>1512x982 @2.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(1728, 1117, \'desktop\', this)">',
		'      MacBook Pro 16" M3',
		'      <small>1728x1117 @2.0</small>',
		'    </button>',
		'    <h3>Desktop</h3>',
		'    <button class="device-btn" onclick="setDevice(1280, 720, \'desktop\', this)">',
		'      Laptop HD',
		'      <small>1280x720 @1.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(1920, 1080, \'desktop\', this)">',
		'      Desktop FHD',
		'      <small>1920x1080 @1.0</small>',
		'    </button>',
		'    <button class="device-btn" onclick="setDevice(2560, 1440, \'desktop\', this)">',
		'      Desktop QHD',
		'      <small>2560x1440 @1.0</small>',
		'    </button>',
		'  </div>',
		'</div>',
		'<script>',
		'  function setDevice(width, height, type, btn) {',
		'    document.querySelectorAll(".device-btn").forEach(function(b) { b.classList.remove("active"); });',
		'    btn.classList.add("active");',
		'    var iframe = document.getElementById("preview-iframe");',
		'    var screen = document.getElementById("device-screen");',
		'    var frame = document.getElementById("device-frame");',
		'    var previewArea = document.getElementById("preview-area");',
		'    if (type === "desktop") {',
		'      frame.classList.add("desktop-frame");',
		'    } else {',
		'      frame.classList.remove("desktop-frame");',
		'    }',
		'    iframe.style.width = width + "px";',
		'    iframe.style.height = height + "px";',
		'    screen.style.width = width + "px";',
		'    screen.style.height = height + "px";',
		'    var areaWidth = previewArea.clientWidth - 80;',
		'    var areaHeight = previewArea.clientHeight - 80;',
		'    var scaleX = areaWidth / width;',
		'    var scaleY = areaHeight / height;',
		'    var scale = Math.min(scaleX, scaleY, 1);',
		'    frame.style.transform = "scale(" + scale + ")";',
		'    frame.style.transformOrigin = "center center";',
		'  }',
		'  setDevice(360, 780, "mobile", document.querySelector(".device-btn.active"));',
		'  var evtSource = new EventSource("http://localhost:' + port + '/viewport-reload");',
		'  evtSource.onmessage = function(e) {',
		'    if (e.data === "reload") {',
		'      var iframe = document.getElementById("preview-iframe");',
		'      var src = iframe.src.split("?")[0];',
		'      iframe.src = src + "?t=" + Date.now();',
		'    }',
		'  };',
		'  window.addEventListener("resize", function() {',
		'    var activeBtn = document.querySelector(".device-btn.active");',
		'    if (activeBtn) activeBtn.click();',
		'  });',
		'</script>',
		'</body>',
		'</html>'
	].join('\n');

	return html;
}

function deactivate() {
	if (server) {
		server.close();
		server = null;
	}
}

module.exports = { activate, deactivate };
