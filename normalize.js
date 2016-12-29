var fs = require('fs');

var dataDirectory = process.argv[2] || ".";
console.log("Begining Normalize Program. Moving to directory: ", dataDirectory);

process.chdir(dataDirectory);

var dataFileNames = fs.readdirSync('.').filter(function(name) {
    return name.match(/\.csv$/);
});

if (dataFileNames.length === 0) {
    console.error("No CSV files found. Exiting.");
    process.exit(1);
}

//Begins reading the CSV file
var inputCsvFile = dataFileNames[0];
console.log("Processing: " + inputCsvFile);
var lines = fs.readFileSync(inputCsvFile, 'utf-8');
lines = lines.split('\n').filter(Boolean);

var getMinimumValForColumn = function(_lines, columnIndex) {
    var values = _lines.map(function(d) {
        return parseFloat(d.split(',')[columnIndex]);
    });

    return Math.min.apply(null, values);
};

var numberOfColumns = lines[0].split(',').length;

var minValueMap = {};

//Figure out the minimum value for each column.
for(var i = 1; i < numberOfColumns; i++) {
    minValueMap[i] = getMinimumValForColumn(lines.slice(1), i);
}

//Normalize each value
lines = lines.map(function(d,i) {
    if (i === 0) {
        return d;
    }

    var columns = d.split(',');
    var newLine = columns[0] + ',' + columns.slice(1).map(function(v, colIndex) {
        var newVal = parseFloat(v) - minValueMap[colIndex + 1];
        return newVal.toFixed(6);
    }).join(',');

    return newLine;
});

var outputFileName = inputCsvFile.replace('.csv','') + '-Normalized.csv';

try {
    fs.unlinkSync(outputFileName);
}
catch (e) {
    console.error("Warning: Unable to delete output file.");
}

lines.forEach(function(line) {
    fs.appendFileSync(outputFileName, line.toString() + "\n");
});

console.log("Finished processing. Output is in: " + outputFileName);