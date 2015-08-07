var fs = require('fs')
var readline = require('readline');

var unitHeight = 400

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("clippingLevel = ", function(answer) {
  clippingLevel = parseInt(answer)
  rl.close();

  fs.readFile(process.argv[2], function(err, data) {
        var lines = data.toString().split("\r\n")
        var filteredlines = []
        var keptCount = 0

        var line, components, coordinatenString, coordinaten, direction, yCoordinate, length, tubeEnd
        var clipHeight = clippingLevel * unitHeight

        for (var i = lines.length - 1; i >= 0; --i) {
                line = lines[i]
                components = /tube2|round-tube2/
                if (components.test(line)) {
                    // tube of roundtube
                    coordinatenString = line.split(/\{.*\{/)[1]
                    coordinaten = coordinatenString.split(', ')
                    
                    direction = parseFloat(coordinaten[3])
                    yCoordinate = parseFloat(coordinaten[5])
                    if (direction == 0) length = 0
                    else length = 50 + parseFloat(coordinaten[8])

                    // filter results
                    tubeEnd = yCoordinate + (direction < 0 ? -length : length)


                    if ( Math.min(yCoordinate, tubeEnd) < clipHeight ) {
                            filteredlines.splice(0, 0, line)
                            keptCount++
                    }

                } else {
                    // connector
                    filteredlines.splice(0, 0, line)
                }
        };

        var resultPath = process.argv[2];
        resultPath = resultPath.slice(0, -4) + "-sliced0" + clippingLevel + ".qdf"
        fs.writeFileSync(resultPath, new Buffer(filteredlines.join("\r\n")))

        console.log("kept", keptCount, "elements")
  })
});