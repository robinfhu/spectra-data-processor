var fs = require('fs');
var readline = require('readline');

var dataDirectory = process.argv[2] || ".";

console.log("Begining Program. Moving to directory: ", dataDirectory);

process.chdir(dataDirectory);

var dataFileNames = fs.readdirSync('.').filter(function(name) {
    return name.match(/\.txt$/);
});

if (dataFileNames.length === 0) {
    console.error("No txt files found. Exiting.");
    process.exit(1);
}

var allWaveLengthData = null;

dataFileNames.forEach(function(fileName) {
    console.log("Processing: " + fileName);
    var lines = fs.readFileSync(fileName, 'utf-8');
    lines = lines.split('\r\n').filter(Boolean);
    var beginPoint = lines.indexOf('"Wavelength nm.","Intensity"');

    lines = lines.splice(beginPoint+1);

    if(!allWaveLengthData) {
        allWaveLengthData = lines;
    }
    else {
        var dataPointsOnly = lines.map(function(d) {
            return d.split(',')[1];
        });

        allWaveLengthData = allWaveLengthData.map(function (d, i) {
            d += ',' + dataPointsOnly[i];
            return d;
        });
    }
});

allWaveLengthData.unshift([
    "Wavelength (nm)"
].concat(dataFileNames));

var fullPath = __dirname;
var pathParts = fullPath.split("\\");
var currentDir = pathParts[pathParts.length-1];

var outputFileName = currentDir + '.csv';

try {
    fs.unlinkSync(outputFileName);
}
catch (e) {
    console.error("Warning: Unable to delete output file.");
}

allWaveLengthData.forEach(function(line) {
    fs.appendFileSync(outputFileName, line.toString() + "\n");
});

console.log("Finished processing. Output is in: " + outputFileName);