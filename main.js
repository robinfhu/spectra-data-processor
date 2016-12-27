var fs = require('fs');
var readline = require('readline');

var dataDirectory = process.argv[2] + "/";
console.log("Starting program: ", process.argv[2]);

var dataFileNames = fs.readdirSync(dataDirectory);

var allWaveLengthData = null;

dataFileNames.forEach(function(fileName) {
    fileName = dataDirectory + fileName;

    if (!fileName.match(/\.txt/)) {
        return;
    }
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

fs.unlinkSync("output/data.csv");
allWaveLengthData.forEach(function(line) {
    fs.appendFileSync("output/data.csv", line.toString() + "\n");
});
