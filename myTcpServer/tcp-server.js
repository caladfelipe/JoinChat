(function(exports) {

  const VERSION_SOCKS = "0x04";
  const CONEXION = "0x01";
  const BINDING = "0x02";
  // const PORT_SOCKS = "0x00 0x50";


  // Define some local variables here.
  var socket = chrome.sockets.tcpServer;

  function TcpServer(addr, port, options) {
    this.addr = addr;
    this.port = port;
    this._onAccept = this._onAccept.bind(this);
    this._onAcceptError = this._onAcceptError.bind(this);

    // Callback functions.
    this.callbacks = {
      listen: null,    // Called when socket is connected.
      connect: null,    // Called when socket is connected.
      disconnect: null, // Called when socket is disconnected.
      recv: null,       // Called when client receives data from server.
      sent: null        // Called when client sends data to server.
    };

    // Sockets open
    this.openSockets=[];

    this.handshankeComplete = false;

    // server socket (one server connection, accepts and opens one socket per client)
    this.serverSocketId = null;

    log('initialized tcp server, not listening yet');
  }


  /**
   * Static method to return available network interfaces.
   *
   * @see https://developer.chrome.com/apps/system_network#method-getNetworkInterfaces
   *
   * @param {Function} callback The function to call with the available network
   * interfaces. The callback parameter is an array of
   * {name(string), address(string)} objects. Use the address property of the
   * preferred network as the addr parameter on TcpServer contructor.
   */
  TcpServer.getNetworkAddresses=function(callback) {
    log('Getting network interfaces');
    chrome.system.network.getNetworkInterfaces(callback);
  }

  /**
   * Connects to the TCP socket, and creates an open socket.
   *
   * @see https://developer.chrome.com/apps/sockets_tcpServer#method-create
   * @param {Function} callback The function to call on connection
   */
  TcpServer.prototype.listen = function(callback) {
    // Register connect callback.
    log('Listen::' + callback.name);
    this.callbacks.connect = callback;
    socket.create({}, this._onCreate.bind(this));
  };

  TcpServer.prototype.disconnect = function() {
    log("Disconnecting tcp server");
    if (this.serverSocketId) {
      socket.onAccept.removeListener(this._onAccept);
      socket.onAcceptError.removeListener(this._onAcceptError);
      socket.close(this.serverSocketId);
    }
    for (var i=0; i<this.openSockets.length; i++) {
      try {
        this.openSockets[i].close();
      } catch (ex) {
        console.log(ex);
      }
    }
    this.openSockets=[];
    this.serverSocketId=0;
    this.port1D = 0;
    this.port2D = 0;
    this.ipFirstD = 0;
    this.ipSecondD = 0;
    this.ipThirdD = 0;
    this.ipFourthD = 0;
    this.userClient = [];
  };

  /**
   * The callback function used for when we attempt to have Chrome
   * create a socket. If the socket is successfully created
   * we go ahead and start listening for incoming connections.
   *
   * @private
   * @see https://developer.chrome.com/apps/sockets_tcpServer#method-listen
   * @param {Object} createInfo The socket details
   */
  TcpServer.prototype._onCreate = function(createInfo) {
    log("onCreate::");
    log(createInfo);
    this.serverSocketId = createInfo.socketId;
    if (this.serverSocketId > 0) {
      socket.onAccept.addListener(this._onAccept);
      socket.onAcceptError.addListener(this._onAcceptError);
      socket.listen(this.serverSocketId, this.addr, this.port, 100,
        this._onListenComplete.bind(this));
      this.isListening = true;
    } else {
      error('Unable to create socket');
    }
  };

  /**
   * The callback function used for when we attempt to have Chrome
   * connect to the remote side. If a successful connection is
   * made then we accept it by opening it in a new socket (accept method)
   *
   * @private
   */
  TcpServer.prototype._onListenComplete = function(resultCode) {
    log("ListenComplete::");
    log(resultCode);
    if (resultCode !==0) {
      error('Unable to listen to socket. Resultcode='+resultCode);
    }
  }

  TcpServer.prototype._onAccept = function (info) {
    log("OnAccept::" + info);
    log("OnAccept::" + this.serverSocketId);
    if (info.socketId != this.serverSocketId)
      return;

    var tcpConnection = new TcpConnection(info.clientSocketId);
    this.openSockets.push(tcpConnection);

    tcpConnection.requestSocketInfo(this._onSocketInfo.bind(this));
    log('Incoming connection handled.');
  }

  TcpServer.prototype._onAcceptError = function(info) {
    if (info.socketId != this.serverSocketId)
      return;
    error('Unable to accept incoming connection. Error code=' + info.resultCode);
  }

  TcpServer.prototype._onSocketInfo = function(tcpConnection, socketInfo) {
    if (this.callbacks.connect) {
      this.callbacks.connect(tcpConnection, socketInfo);
    }
  }




/*---------------------START TCPCONNECTION ----------------------------------------*/
  /**
   * Holds a connection to a client
   *
   * @param {number} socketId The ID of the server<->client socket
   */
  function TcpConnection(socketId) {
    this.socketId = socketId;
    this.socketRequired = 0;
    this.socketInfo = null;
    this.socketRequiredInfo = null;

    // Callback functions.
    this.callbacks = {
      disconnect: null, // Called when socket is disconnected.
      recv: null,       // Called when client receives data from server.
      sent: null        // Called when client sends data to server.
    };

    log('Established client connection. Listening...');

  };

  TcpConnection.prototype.setSocketInfo = function(socketInfo) {
    this.socketInfo = socketInfo;
  };

  TcpConnection.prototype.requestSocketInfo = function(callback) {
    chrome.sockets.tcp.getInfo(this.socketId,
      this._onSocketInfo.bind(this, callback));
  };

  /**
   * Add receive listeners for when a message is received
   *
   * @param {Function} callback The function to call when a message has arrived
   */
  TcpConnection.prototype.startListening = function(callback) {
    log("startListening:: " + callback.name);
    this.callbacks.recv = callback;

    // Add receive listeners.
    this._onReceive = this._onReceive.bind(this);
    this._onReceiveError = this._onReceiveError.bind(this);
    chrome.sockets.tcp.onReceive.addListener(this._onReceive);
    chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError);
    chrome.sockets.tcp.setPaused(this.socketId, false);
  };

  /**
   * Sets the callback for when a message is received
   *
   * @param {Function} callback The function to call when a message has arrived
   */
  // TcpConnection.prototype.addDataReceivedListener = function(callback) {
  //   // If this is the first time a callback is set, start listening for incoming data.
  //   debugger;
  //   if (!this.callbacks.recv) {
  //     this.startListening(callback);
  //   } else {
  //     this.callbacks.recv = callback;
  //   }
  // };

  TcpConnection.prototype.HandShakeListener = function(callback) {
    // If this is the first time a callback is set, start listening for incoming data.
    if (!this.callbacks.recv) {
      this.startListening(callback);
    } else {
      this.callbacks.recv = callback;
    }
  };


  /**
   * Sends a message down the wire to the remote side
   *
   * @see https://developer.chrome.com/apps/sockets_tcp#method-send
   * @param {String} msg The message to send
   * @param {Function} callback The function to call when the message has sent
   */
  TcpConnection.prototype.sendMessage = function(msg, callback) {
    console.info(msg);
    // _stringToArrayBuffer(msg + '\n', function(arrayBuffer) {
      chrome.sockets.tcp.send(this.socketId, msg, this._onWriteComplete.bind(this));
    // }.bind(this));
    
    // Register sent callback.
    this.callbacks.sent = callback;
  };

  TcpConnection.prototype.sendMsg = function(socketId, msg) {
    chrome.sockets.tcp.send(socketId, msg, function callback (sentInfo){
      log('onSendMsg');
      // Call sent callback.
      if (!sentInfo) {
        return;
      }
      if (sentInfo.resultCode >= 0) {
        log('Message sent successfully');
        // chrome.sockets.tcp.setPaused(socketId, false);
      };
    });
  };


  /**
   * Disconnects from the remote side
   *
   * @see https://developer.chrome.com/apps/sockets_tcp#method-close
   */
  TcpConnection.prototype.close = function() {
    if (this.socketId) {
      chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
      chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
      chrome.sockets.tcp.close(this.socketId);
    }
  };


  /**
   * Callback function for when socket details (socketInfo) is received.
   * Stores the socketInfo for future reference and pass it to the
   * callback sent in its parameter.
   *
   * @private
   */
  TcpConnection.prototype._onSocketInfo = function(callback, socketInfo) {
    if (callback && typeof(callback)!='function') {
      throw "Illegal value for callback: "+callback;
    }
    this.socketInfo = socketInfo;
    callback(this, socketInfo);
  }

  TcpConnection.prototype._onSocketRequiredInfo = function(socketInfo) {
    log("_onSocketRequiredInfo::");
    this.socketRequiredInfo = socketInfo;
  }

  TcpConnection.prototype.closeConnectionRequired = function(socketId) {
    if (socketId) {
      chrome.sockets.tcp.onReceive.removeListener(this._onReceivePageRequired);
      chrome.sockets.tcp.onReceiveError.removeListener(this._onReceivePageRequiredError);
      chrome.sockets.tcp.close(socketId);
    }
  };

  TcpConnection.prototype._onReceivePageRequired = function(info) {
    log("_onReceivePageRequired::");
    // if (this.socketRequired != info.socketId)
    //   return;
    if (info.data.length > 0) {
      this.sendMsg(this.socketId,info.data);
    }else{
      log("Data doesn't received");
    }
  }

  TcpConnection.prototype._onReceivePageRequiredError = function(info) {
    log("_onReceivePageRequiredError::");
    if (!info.socketId)
      return;
    if (info.socketId != this.socketRequired)
      return;

    this.closeConnectionRequired(info.socketId);
  }

  TcpConnection.prototype._onCompleteConnection = function(connectionInfo) {
    log("onCompleteConnection::");
    if (connectionInfo >= 0) {
      this._onReceivePageRequired = this._onReceivePageRequired.bind(this);
      this._onReceivePageRequiredError = this._onReceivePageRequiredError.bind(this);
      chrome.sockets.tcp.onReceive.addListener(this._onReceivePageRequired);
      chrome.sockets.tcp.onReceiveError.addListener(this._onReceivePageRequiredError);
      chrome.sockets.tcp.getInfo(this.socketRequired,this._onSocketRequiredInfo.bind(this));
      chrome.sockets.tcp.setPaused(this.socketRequired, false);
    };
  };

  TcpConnection.prototype._onCreateConnection = function(createInfo) {
    log("onCreateConnection::");
    log(createInfo);
    this.socketRequired = createInfo.socketId;
    if (this.socketRequired > 0) {
      var ipAddress = this.ipFirstD + "." + this.ipSecondD + "." + this.ipThirdD + "." + this.ipFourthD;
      // var portCon = (this.port1D * 1000) + this.port2D;
      var portCon = 80;
      chrome.sockets.tcp.connect(this.socketRequired, ipAddress, portCon, this._onCompleteConnection.bind(this));
    } else {
      error('Unable to create socket');
    }
  };

  TcpConnection.prototype.connectionRequired = function(socketId){
    chrome.sockets.tcp.create({}, this._onCreateConnection.bind(this));
  }

  /**
   * Callback function for when data has been read from the socket.
   * Converts the array buffer that is read in to a string
   * and sends it on for further processing by passing it to
   * the previously assigned callback function.
   *
   * @private
   * @see TcpConnection.prototype.addDataReceivedListener
   * @param {Object} readInfo The incoming message
   */
  TcpConnection.prototype._onReceive = function(info) {
    if (this.socketId != info.socketId)
      return;

    //Verificar la petición del cliente y realizar la respuesta si se comunicó correctamente
    if (info.data){
      var dataHandShake = new Uint8Array(info.data);
      if(dataHandShake[0] == 4){
        log("Socks versión 4");
        if(dataHandShake[1] == 1){
          log("Client wants to create a temporal conection");
          chrome.sockets.tcp.setPaused(info.socketId,true);
          this.port1D = dataHandShake[2];
          this.port2D = dataHandShake[3];
          this.ipFirstD = dataHandShake[4];
          this.ipSecondD = dataHandShake[5];
          this.ipThirdD = dataHandShake[6];
          this.ipFourthD = dataHandShake[7];
          this.userClient = dataHandShake.subarray(8,dataHandShake.length-1);
          var lastByte = dataHandShake[dataHandShake.length-1];
          if (lastByte == 0) {
              var buffer = new ArrayBuffer(8);
              var msg = new Uint8Array(buffer);
              msg[0] = 0;
              msg[1] = 90;
              msg[2] = this.port1D;
              msg[3] = this.port2D;
              msg[4] = this.ipFirstD;
              msg[5] = this.ipSecondD;
              msg[6] = this.ipThirdD;
              msg[7] = this.ipFourthD;
              this.connectionRequired(info.socketId);
              this.sendMsg(this.socketId,buffer);
          };
        }
      }
    }
    // Call received callback if there's data in the response.
    if (this.callbacks.recv) {
      log('onReceive::' + info.data);
      // Convert ArrayBuffer to string.
      // _arrayBufferToString(info.data, this.callbacks.recv.bind(this));
    }
  };

  TcpConnection.prototype._onReceiveError = function (info) {
    if (this.socketId != info.socketId)
      return;
    this.close();
  };

  /**
   * Callback for when data has been successfully
   * written to the socket.
   *
   * @private
   * @param {Object} writeInfo The outgoing message
   */
  TcpConnection.prototype._onWriteComplete = function(writeInfo) {
    debugger;
    log('onWriteComplete');
    // Call sent callback.
    if (writeInfo.resultCode >= 0) {
      this.handshankeComplete = true;
      chrome.sockets.tcp.setPaused(false);
    };
    if (this.callbacks.sent) {
      this.callbacks.sent(writeInfo);
    }
  };

  /**
   * Wrapper function for logging
   */
  function log(msg) {
    console.log(msg);
  }

  /**
   * Wrapper function for error logging
   */
  function error(msg) {
    console.error(msg);
  }
/*----END TCPCONNECTION--------------------------------------------------------------*/

  exports.TcpServer = TcpServer;
  exports.TcpConnection = TcpConnection;

/*----OPEN A TCPCONNECTION--------------------------------------------------------------*/




})(window);