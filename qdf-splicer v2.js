var fs = require('fs')
var readline = require('readline');

var unitHeight = 400
var maxLevel = 2

fs.readFile(process.argv[2], function(err, data) {
	var lines = data.toString().split("\r\n")
	var filteredlines = []

	var line, tube, roundTube, connector, others, coordinatenString, coordinaten, direction, yCoordinate, length, tubeEnd, bottom, connectors = 0, tubes = 0

	var path = process.argv[2].replace('.qdf', '/')
	if(!fs.existsSync(path))
		fs.mkdirSync(process.argv[2].replace('.qdf', '/'))
	else {
		var files = fs.readdirSync(path)
		for (var i = files.length - 1; i >= 0; i--) {
			fs.unlinkSync(path + files[i])
		};
	}

	var fileName = process.argv[2].split('/')
	fileNameLength = fileName.length - 1
	fileName = fileName[fileNameLength].replace('.qdf', '')


	for (var level = 1; level <= maxLevel; level++) {
		filteredlines = []

		for (var i = lines.length - 1; i >= 0; --i) {
			line = lines[i]
			tube = /tube2/.test(line)
			connector = /connector/.test(line)
			others = /panel|slide|pool|textil/.test(line)

			// roundTube = /round-tube2/.test(line)
			if (tube) {
				// tube of roundtube
				coordinatenString = line.split(/\{.*\{/)[1]
				coordinaten = coordinatenString.split(', ')
				direction = parseFloat(coordinaten[3])
				yCoordinate = parseFloat(coordinaten[5])
				if (direction == 0) length = 0
				else length = 50 + parseFloat(coordinaten[8])

				// filter results
				tubeEnd = yCoordinate + (direction < 0 ? -length : length)
				bottom  = Math.min(yCoordinate, tubeEnd)
				if (level == 1 && maxLevel < bottom / unitHeight && tube) maxLevel = bottom / unitHeight

				if ( bottom < (level  - 1) * unitHeight ) {
					// Rood
					filteredlines.splice(0, 0, line)
					tubes = tubes + 1
				} else if ( bottom < level * unitHeight ) {
					// Geel of blauw
					line = line.replace(/tube2\{[0-9]/, 'tube2{5')
					filteredlines.splice(0, 0, line)
					tubes = tubes + 1
				}
			} else if (connector) {
				coordinatenString = line.split(/\{.*\{/)[1]
				coordinaten = coordinatenString.split(', ')
				yCoordinate = parseFloat(coordinaten[5])

				if ( yCoordinate < (level - 1) * unitHeight ) {
					filteredlines.splice(0, 0, line)
					connectors = connectors + 1
				} else if ( yCoordinate < level * unitHeight ) {
					line = line.replace(/connector3\{[0-9]/, 'connector3{3')
					filteredlines.splice(0, 0, line)
					connectors = connectors + 1
				}

			} else if(others) {
				coordinatenString = line.split(/\{.*\{/)[1]
				coordinaten = coordinatenString.split(', ')
				yCoordinate = parseFloat(coordinaten[5])

				if ( yCoordinate < (level - 1) * unitHeight ) {
					filteredlines.splice(0, 0, line)
				} else if ( yCoordinate < level * unitHeight ) {
					line = (/panel2\{[0-9]/.test(line) ? line.replace(/panel2\{[0-9]/, 'panel2{11') : (/pool2\{[0-9]/.test(line) ? line.replace(/pool2\{[0-9]/, 'pool2{11') : (/textil\{[0-9]/.test(line) ? line.replace(/textil2\{[0-9]/, 'textil2{11') : (/^slide2\{[0-9]/.test(line) ? line.replace(/^slide2\{[0-9]/, 'slide2{11') : (/^curved-slide2\{[0-9]/).test(line) ? line.replace(/curved-slide2\{[0-9]/, 'curved-slide2{11') : line.replace(/^slide-end2\{[0-9]/, 'slide-end2{11')))))
					filteredlines.splice(0, 0, line)
				}
			} else {
				// camera, material,...
				filteredlines.splice(0, 0, line)
			}
		};

		var resultPath = process.argv[2];
		resultPath = resultPath.slice(0, -4) + "/" + fileName + "-sliced0" + level + ".qdf"
		fs.writeFileSync(resultPath, new Buffer(filteredlines.join("\r\n")))
		console.log("laag: " + level + " (" + tubes + " buizen)")
	};

	console.log("" + level - 1 + "files generated")
});