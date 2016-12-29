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

/*
THis function takes an array of data, like "1235,0.00014" and returns
the first and last wavelength values.
These are then verified across all the files.  If there is a discrepency,
the program exits with an error.
*/
var verifyData = function(data) {
    var first = data[0].split(','), last = data[data.length-1].split(',');
    return first[0] + ':' + last[0];
};

var allWaveLengthData = null;
var verificationKey = null;
var dataVerificationFailed = false;

dataFileNames.forEach(function(fileName) {
    console.log("Processing: " + fileName);
    var lines = fs.readFileSync(fileName, 'utf-8');
    lines = lines.split('\r\n').filter(Boolean);

    var beginPoint = lines.findIndex(function(d) {
        return d.indexOf("Wavelength nm.") !== -1;
    });

    lines = lines.splice(beginPoint+1);

    //Removes any data points that are missing results data, ie, lines that look like "123.0,"
    lines = lines.filter(function(d) {
        var value = d.split(',')[1] || '';
        return value.replace(/\s/g,'');
    });

    if(!allWaveLengthData) {
        allWaveLengthData = lines;
        verificationKey = verifyData(lines);
    }
    else {
        /*
        Gets the verification key of the current file, and if it doesn't
        match the verification key of the first file, mark as failed.
        Program will exit shortly after.
        */
        var newVerifyKey = verifyData(lines);
        if (newVerifyKey !== verificationKey) {
            dataVerificationFailed = fileName;
        }

        var dataPointsOnly = lines.map(function(d) {
            return d.split(',')[1];
        });

        allWaveLengthData = allWaveLengthData.map(function (d, i) {
            d += ',' + dataPointsOnly[i];
            return d;
        });
    }
});

if (dataVerificationFailed) {
    console.log("Mismatching wavelength found in file: " + dataVerificationFailed);
    console.error("Program terminating.");
    process.exit(2);
}

allWaveLengthData.unshift([
    "Wavelength (nm)"
].concat(dataFileNames));

var fullPath = process.cwd();
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