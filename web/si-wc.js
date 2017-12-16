const systemInformationLibrary = require('systeminformation');
const os = require('os');
const dockerStatsLibrary = require('dockerstats');

function Package(hostname) {
    this.packageContent = {hostname: hostname, pack:{}};
}

function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function () {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    };
    // start timer using current settings (if it's not already running)
    this.start = function () {
        if (!timerObj) {
            this.stop();
            if (t > 500){
                timerObj = setInterval(fn, t);
            } else {
                console.log("Interval too small, setting 500ms instead");
                timerObj = setInterval(fn, 500);
            }

        }
        return this;
    };
    // start with new interval, stop current interval
    this.reset = function (newT) {
        t = newT;
        return this.stop().start();
    }
}


function emitPackage(socketio) {
    console.log("beginning pkg emit @ " + systemInformationLibrary.time().current);
    var parsedPackage = new Package(os.hostname());
    var getContainersUtilsPromises = [];
    var promise1 = systemInformationLibrary.getDynamicData().then(function (data) {
        delete data.processes;
        delete data.networkConnections;
        delete data.battery;
        delete data.temp;
        delete data.services;
        delete data.users;
        delete data.node;
        parsedPackage.packageContent.host = data;
    }, function (error) {
        console.log(error);
    });
    var promise2 = dockerStatsLibrary.dockerContainers().then(function (data) {
        data.forEach(function (value) {
            getContainers(value, parsedPackage);
        });
        Object.keys(parsedPackage.packageContent.pack).forEach(function (value) {
            getContainersUtilsPromises.push(getContainersUtils(value, parsedPackage));
        });
    }, function (error) {
        console.error("Error happened: ", error);
    })


    Promise.all([promise1, promise2]).then(function () {
        Promise.all(getContainersUtilsPromises)
            .then(function () {
                socketio.emit("message", parsedPackage.packageContent);
                console.log("pkg emitted @ " + systemInformationLibrary.time().current);
            })
            .catch(function (err) { // error handling
                console.error("Error happened ", err)
            });
    })
    .catch(function (err) { // error handling
        console.error("Error happened ", err)
    });
}

function getContainers(dat, parsedPackage) {
    var containerName = dat.name;
    if (containerName) {
        parsedPackage.packageContent.pack[containerName] = {"id": dat.id};
    }
    return parsedPackage
}

function getContainersUtils(containerName, parsedPackage) {
    return dockerStatsLibrary.dockerContainerStats(parsedPackage.packageContent.pack[containerName].id).then(function (detailedData) {
        parsedPackage.packageContent.pack[containerName] = detailedData;
        return parsedPackage;
    });
}

var socket = require('socket.io-client')('https://ws.techbranch.net/');
// var socket = require('socket.io-client')('http://localhost:60808/');
socket.on('connect', function () {
    console.log("connected");
    socket.emit("identification", {'hostname': os.hostname()});
    console.log("identified as " + os.hostname());
    // triggering pkg generation
    var packageEmitter = new Timer(function () {
            emitPackage(socket)
        },
        3000 // interval
    );

    // listening for pkg generation frequency changes
    socket.on("pkg_freq", function (data) {
        console.log("Changing pkg emitting frequency to " + data.interval + "ms");
        packageEmitter.reset(data.interval);
    });
});

socket.on('disconnect', function () {
    console.log("disconnected");
});
