var socket = require('socket.io-client')('http://localhost:60808/'); // point to server location
socket.on('connect', function(){
	console.log("connected");
	console.log("not identifying due to listener-role connection");
    console.log("changing package emission frequency");
    socket.emit("change_frequency", {'interval': 15000});
    // var nr = 1;
    // console.log("asking who is active");
    // socket.on("package", function (data) {
    //     console.log("received package "+nr+" from "+data.hostname);
    //     nr+=1;
    // });
    // socket.on("active_is", function (data) {
    //     console.log("received active hosts intel");
    //     console.log(data);
    // });
    // socket.emit("who_is_active");
});
