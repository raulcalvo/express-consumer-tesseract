'use strict';
global.__basedir = __dirname;

const requirer = require("../extended-requirer/index.js");
const r = new requirer(__dirname,{"currentConfig" : "DEV"});

const expressFileConsumer = r.require("express-file-consumer");
const logger = r.require("logger-to-memory");

const { createWorker } = require('tesseract.js');
const path = r.require("path");
const fs = r.require("fs");

var loggerConfig = {
    "logger-to-memory" :{
        "logsEnabled": true,
        "maxLogLines": 20,
        "logToConsole": true,
        "lineSeparator": "<br>"
    }
};
var log = new logger(loggerConfig);

function writeResult(file, outputFolder, text){
    const outputFile = path.join(outputFolder, path.basename(file, path.extname(file)) + ".txt");
    fs.writeFileSync( outputFile, text );
    return Promise.resolve("File " + file + " processed and result saved to " + outputFile);
}

function processFile(file, outputFolder) {
    const worker = createWorker();
    return (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(file);

      await worker.terminate();
      return await writeResult(file, outputFolder, text);
    })();
}
var config = {
    "file-consumer": {
        "inputFolder": "./data/input",
        "outputFolder": "./data/output",
        "watch": true,
        "afterProcessPolicy": 2,
        "processFunction": processFile
    }
};
var _expressFileConsumer = new expressFileConsumer(config);
_expressFileConsumer.setLogger(log);
_expressFileConsumer.startListening();