var udp = require('datagram-stream');

var stream = udp({
    address     : '0.0.0.0'   //address to bind to
    , multicast : '239.5.5.5' //multicast ip address to send to and listen on
    , port      : 5555        //udp port to send to
    , bindingPort : 5556      //udp port to listen on. Default: port
    , reuseAddr : true        //boolean: allow multiple processes to bind to the
                              //         same address and port. Default: true
    , loopback  : true        //boolean: whether or not to receive sent datagrams
                              //         on the loopback device. Only applies to
                              //         multicast. Default: false
});

//pipe whatever is received to stdout
stream.pipe(process.stdout);

//pipe whatever is received on stdin over udp
process.stdin.pipe(stream);