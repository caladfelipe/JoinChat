/**
    The MIT License (MIT)

    Copyright (c) 2015 

    John Congote <jcongote@gmail.com>
    Felipe Calad
    Isabel Lozano
    Juan Diego Perez
    Joinner Ovalle

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

var videoId = false;
$(document).ready(function() {
    $('#video-btn').click(function(event) {
        if (!$(this).hasClass('active')) {
            if (videoId === false) {
                var generateNewVideo = confirm('¿Desea invitar a su contacto a una video llamada?');
                if (generateNewVideo) {
                    videoId = randomString();
                } else {
                    videoId = prompt("Ingrese el identificador de la video llamada a la que se quiere unir");
                }
            }

            if (videoId) {
                $("#video-id").html("Código del video: <b>" + videoId + "</b>");
            
                var ws = new WebSocket('ws://negly14.koding.io:7000/ws/' + videoId);
                var configuration = {iceServers: [{ url: 'stun:negly14.koding.io:3478' }]};
                var initiator;
                var pc = new webkitRTCPeerConnection(configuration, {optional: [{RtpDataChannels: true}]});
                var channel;

                $(window).bind('beforeunload', function(){
                    if (pc && pc.close) {
                        pc.close();
                    }
                });

                function initiatorCtrl(event) {
                    console.log(event.data);
                    if (event.data == "fullhouse") {
                        alert("full house");
                    }
                    if (event.data == "initiator") {
                        initiator = false;
                        init();
                    }
                    if (event.data == "not initiator") {
                        initiator = true;
                        init();
                    }
                }

                ws.onmessage = initiatorCtrl;

                function init() {
                    var constraints = {
                        audio: true,
                        video: true
                    };
                    if (initiator) {
                        var channelOptions = 
                        {
                            reliable: false
                        }
                        channel = pc.createDataChannel("chat"+videoId, channelOptions);
                        channel.onmessage = function (evt) {
                            console.info(evt);
                            createMsg(false, evt.data);
                        };

                        channel.onopen = function (evt) {
                            console.log("Channel " + channel.label + " is open");
                            enableChatFields();
                        };
                        
                        channel.onclose = function (evt) {
                            console.log('RTCDataChannel closed.');
                        };
                    } else {
                        pc.ondatachannel = function(evt){
                            channel = evt.channel;
                            channel.onopen = function () {
                                console.log("Channel " + channel.label + " is open");
                                enableChatFields();
                            };
                            channel.onmessage = function (evt) {
                                console.info(evt);
                                createMsg(false, evt.data);
                            };
                        };
                    }
                    getUserMedia(constraints, connect, fail);
                }

                function connect(stream) {
                    if (stream) {
                        pc.addStream(stream);
                        $('#local').attachStream(stream);
                    }

                    pc.onaddstream = function(event) {
                        $('#remote').attachStream(event.stream);
                        logStreaming(true);
                    };
                    pc.onicecandidate = function(event) {
                        if (event.candidate) {
                            ws.send(JSON.stringify(event.candidate));
                        }
                    };
                    ws.onmessage = function (event) {
                        var signal = JSON.parse(event.data);
                        if (signal.sdp) {
                            if (initiator) {
                                receiveAnswer(signal);
                            } else {
                                receiveOffer(signal);
                            }
                        } else if (signal.candidate) {
                            pc.addIceCandidate(new RTCIceCandidate(signal));
                        }
                    };

                    if (initiator) {
                        createOffer();
                    } else {
                        log('waiting for offer...');
                    }
                    logStreaming(false);
                }


                function createOffer() {
                    log('creating offer...');
                    pc.createOffer(function(offer) {
                        log('created offer...');
                        pc.setLocalDescription(offer, function() {
                            log('sending to remote...');
                            ws.send(JSON.stringify(offer));
                        }, fail);
                    }, fail);
                }


                function receiveOffer(offer) {
                    log('received offer...');
                    pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
                        log('creating answer...');
                        pc.createAnswer(function(answer) {
                            log('created answer...');
                            pc.setLocalDescription(answer, function() {
                                log('sent answer');
                                ws.send(JSON.stringify(answer));
                            }, fail);
                        }, fail);
                    }, fail);
                }


                function receiveAnswer(answer) {
                    log('received answer');
                    pc.setRemoteDescription(new RTCSessionDescription(answer));
                    pc.Datachannel
                }


                function log() {
                    $('#status').text(Array.prototype.join.call(arguments, ' '));
                    console.log.apply(console, arguments);
                }


                function logStreaming(streaming) {
                    $('#streaming').text(streaming ? '[streaming]' : '[..]');
                }


                function fail() {
                    $('#status').text(Array.prototype.join.call(arguments, ' '));
                    $('#status').addClass('error');
                    console.error.apply(console, arguments);
                }

                function sendChatMessage() {
                    channel.send($("#msg").val());
                    createMsg(true, $("#msg").val());
                    $("#msg").val("");
                }

                $("#sendChatBtn").on('click', function() {
                    sendChatMessage();
                });

                jQuery.fn.attachStream = function(stream) {
                    this.each(function() {
                        this.src = URL.createObjectURL(stream);
                        this.play();
                    });
                };
            } else {
                videoId = false;
            }
        }

        $('#videochat').slideToggle();
        $(this).toggleClass('active');
    });
});

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
    var string_length = 8;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

function createMsg(localUser, msg) {
    var containerClass;
    if (localUser) {
        containerClass = 'bubble-left';
    } else {
        containerClass = 'bubble-right';
    }

    $msgContainer = $("<div>").addClass('bubble').addClass(containerClass).html("<div class='pointer'></div>" + msg);
    
    $("#textchat").append($msgContainer);
}

function enableChatFields() {
    $("#msg").prop('disabled', false);
    $("#sendChatBtn").prop('disabled', false);
}