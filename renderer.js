// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const electron = require('electron')
const desktopCapturer = electron.desktopCapturer
const electronScreen = electron.screen
const resemble = require('node-resemble-js');

const fs = require('fs')
const os = require('os')
const path = require('path')


let lastScreenshot;

const thumbSize = determineScreenShotSize()
let options = { types: ['screen'], thumbnailSize: thumbSize }

isShooting = false;

function shoot() {
    isShooting = true;
    desktopCapturer.getSources(options, function (error, sources) {
    if (error) return console.log(error)

    sources.forEach(function (source) {
      if (source.name === 'Entire screen' || source.name === 'Screen 1') {
        const screenshotPath = path.join(__dirname, './screenshots/' + new Date().valueOf() + '.png')
        const currentScreenshot = source.thumbnail.toPng();
        if (lastScreenshot) {
        resemble(new Buffer(lastScreenshot, 'base64'))
                .compareTo(new Buffer(currentScreenshot, 'base64'))
                .ignoreColors()
                .onComplete(function(data){
                    if (data.misMatchPercentage > 1) {
                        fs.writeFile(screenshotPath, currentScreenshot, function (error) {
                            lastScreenshot = currentScreenshot;
                        });
                    }
                    isShooting = false;
            });
        } else {
            lastScreenshot = currentScreenshot;
            isShooting = false;
        }
      }
    })
})
}

setInterval(() => {
    if (!isShooting) {
        shoot();
    }
}, 1000);


function determineScreenShotSize () {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize
  const maxDimension = Math.max(screenSize.width, screenSize.height)
  return {
    width: screenSize.width * window.devicePixelRatio,
    height: screenSize.height * window.devicePixelRatio
  }
}
