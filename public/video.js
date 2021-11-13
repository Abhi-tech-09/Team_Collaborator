const peers = {}
let videoFlag = 0;

let myPeer;
let currPeer;
let str;


document.querySelector(".video").addEventListener('click', e => {
    myPeer = new Peer();
    if (videoFlag == 1) {
        videoFlag = 0;
        return
    }
    videoFlag = 1;

    myPeer.on('open', id => {
        console.log("This is my id : ", id);
        socket.emit('join-video-room', roomName, id)
    })

   

    let myVideo = document.createElement('video');
    myVideo.muted = true;
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        str = stream;
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
            console.log('Some one is calling ');
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
            currPeer = call;
        })

        socket.on('user-video-connected', userId => {
            console.log("userId found ", userId);
            if (userId == myPeer.id) return;
            setTimeout(connectToNewUser, 3000, userId, stream);
        })

        function connectToNewUser(userId, stream) {
            console.log("Connecting");
            console.log("Calling the other user with id : ", userId)
            const call = myPeer.call(userId, stream)
            currPeer = call;
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                console.log("Ading video after calling");
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove()
            })

            peers[userId] = call
            currPeer = call ; 
        }


    }).catch(err => {
        console.log(err);
    })
});

socket.on('user-video-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})



function addVideoStream(video, stream) {
    // const media = new MediaStream(); 
    video.controls = true ;
    console.log("Adding new video");
    // console.log(stream);
    str = stream ; 
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => { console.log(err); })
    })
    document.querySelector(".videoContainer").appendChild(video)
}


// Make the DIV element draggable:
dragElement(document.getElementById("draggable"));
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt)) {
        document.getElementById(elmnt).onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

var displayMediaOptions = {
    video: {
        cursor: "always"
    },
    audio: true
};


let screenShareFlag = 0;
let screenStream ; 
document.querySelector(".ss").addEventListener('click', async (e) => {
    e.preventDefault();
    try {

        if (screenShareFlag == 1) {
            screenShareFlag = 0;
            let tracks = document.querySelector(".screenShare").getElementsByTagName('video')[0].srcObject.getTracks();
            tracks.forEach(track => track.stop());
            document.querySelector(".screenShare").innerHTML = "";
            document.querySelector(".screenShare").style.display = "none";
           stopScreenSharing();
            return;

        }

        let video = document.createElement('video');
        video.controls = true ; 
        navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(stream => {
            addScreenShare(video,stream);
            if(myPeer == null)return ; 

            let videoTrack = stream.getVideoTracks()[0];
            videoTrack.onended = () => {
                stopScreenSharing()
            }
            let sender = currPeer.peerConnection.getSenders().find(function(s){
                return s.track.kind == videoTrack.kind;
            })

            sender.replaceTrack(videoTrack);

            
        });

    }
    catch (err) {
        console.log(err);
    }
})

function addScreenShare(video,stream){
    video.srcObject = stream
    screenStream = stream ; 
    document.querySelector(".screenShare").append(video);
    document.querySelector(".screenShare").style.display = "block";
    video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => { console.log(err); })
    })
    screenShareFlag = 1;
}

function stopScreenSharing() {  
    alert("hello")
    let videoTrack = str.getVideoTracks()[0] ; 
    if(myPeer){
        let sender = currPeer.peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    });


    
}


