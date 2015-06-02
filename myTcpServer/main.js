var tcpServer;
var commandWindow;

chrome.app.runtime.onLaunched.addListener(function() {
  if (commandWindow && !commandWindow.contentWindow.closed) {
    commandWindow.focus();
  } else {
    chrome.app.window.create('index.html',
      {id: "mainwin", innerBounds: {width: 500, height: 309, left: 0}},
      function(w) {
        commandWindow = w;
      });
  }
});


// event logger
var log = (function(){
  var logLines = [];
  var logListener = null;

  var output=function(str) {
    if (str.length>0 && str.charAt(str.length-1)!='\n') {
      str+='\n'
    }
    logLines.push(str);
    if (logListener) {
      logListener(str);
    }
  };

  var addListener=function(listener) {
    logListener=listener;
    // let's call the new listener with all the old log lines
    for (var i=0; i<logLines.length; i++) {
      logListener(logLines[i]);
    }
  };

  return {output: output, addListener: addListener};
})();



function onAcceptCallback(tcpConnection, socketInfo) {
  var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
  log.output("OnAcceptCallback:: " + info);
  // tcpConnection.addDataReceivedListener(function(data) {
  //   console.info(data);
  //   var lines = data.split(/[\n\r]+/);
  //   for (var i=0; i<lines.length; i++) {
  //     var line=lines[i];
  //     if (line.length>0) {
  //       var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] "+line;
  //       log.output(info);
  //       var cmd=line.split(/\s+/);
  //       try {
  //         tcpConnection.sendMessage(Commands.run(cmd[0], cmd.slice(1)));
  //       } catch (ex) {
  //         tcpConnection.sendMessage(ex);
  //       }
  //     }
  //   }
  // });
  tcpConnection.HandShakeListener(function(dataHandShake) {
    // var msg = new ArrayBuffer(8);
    // tcpConnection.sendMessage("0x00 | 0x5a | 0x00 0x50 | 0x42 0x66 0x07 0x63");
  });
}

function startServer(addr, port) {
  if (tcpServer) {
    tcpServer.disconnect();
  }
  tcpServer = new TcpServer(addr, port);
  tcpServer.listen(onAcceptCallback);
}


function stopServer() {
  if (tcpServer) {
    tcpServer.disconnect();
    tcpServer=null;
  }
}

function getServerState() {
  if (tcpServer) {
    return {isConnected: tcpServer.isConnected(),
      addr: tcpServer.addr,
      port: tcpServer.port};
  } else {
    return {isConnected: false};
  }
}