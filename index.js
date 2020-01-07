'use strict';

const expressFileConsumer = require("express-file-consumer");
const logger = require("logger-to-memory");
const { createWorker } = require('tesseract.js');
const path = require("path");
const fs = require("fs");

var loggerConfig = {
    "logsEnabled": true,
    "maxLogLines": 20,
    "logToConsole": true,
    "lineSeparator": "<br>"
};
var log = new logger(loggerConfig);

var config = {
    consumer: {
        "inputFolder": "./data/input",
        "outputFolder": "./data/output",
        "watch": true,
        "afterProcessPolicy": 2,
        "processFunction": processFile
    },
    "logger": log
};

function getOutputFileWithNoExtension(file) {
    const fileName = path.basename(file, path.extname(file));
    const outFile = config.consumer.outputFolder + "/" + fileName;
    return outFile;
}

function writeResult(file, text){
    log.log(text);
    const outputFile =getOutputFileWithNoExtension(file) + ".txt";
    fs.writeFileSync( outputFile, text );
    return Promise.resolve("File " + file + " processed and result saved to " + outputFile);
}

function processFile(file) {
    const worker = createWorker();
    return (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(file);

      await worker.terminate();
      return await writeResult(file, text);
    })();
}

var _expressFileConsumer = new expressFileConsumer(config);
_expressFileConsumer.startListening();