const peers = {}
let videoFlag = 0 ;

document.querySelector(".video").addEventListener('click', e => {

    if(videoFlag == 1){
        videoFlag = 0 ; 
        return  
    }
    videoFlag = 1 ; 
    const myPeer = new Peer();
    myPeer.on('open', id => {
        console.log("This is my id : ", id);
        socket.emit('join-video-room', roomName, id)
    })

    let myVideo = document.createElement('video');
    myVideo.muted = false;
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
            console.log('Some one is calling ');
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-video-connected', userId => {
            console.log("userId found ", userId);
            setTimeout(connectToNewUser, 3000, userId, stream);
        })

        function connectToNewUser(userId, stream) {
            console.log("Connecting");
            console.log("Calling the other user with id : ", userId)
            const call = myPeer.call(userId, stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                console.log("Ading video after calling");
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove()
            })

            peers[userId] = call
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
    console.log("Adding new video");
    // console.log(stream);
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => { console.log(err); })
    })
    document.querySelector(".videoContainer").appendChild(video)
    const i = document.createElement('i') ; 
    i.className = "fas fa-microphone" ; 
    i.addEventListener('click',e=>{
        e.preventDefault(); 
        video.muted = !video.muted ;
        video.stop();
    })
    document.querySelector(".videoContainer").appendChild(i) ; 
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

document.querySelector(".ss").addEventListener('click', async (e) => {
    e.preventDefault();
    try {

        if (screenShareFlag == 1) {
            screenShareFlag = 0;
            let tracks = document.querySelector(".screenShare").getElementsByTagName('video')[0].srcObject.getTracks();
            tracks.forEach(track => track.stop());
            document.querySelector(".screenShare").innerHTML = "";
            document.querySelector(".screenShare").style.display = "none";
            return;

        }

        let video = document.createElement('video');
        video.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        document.querySelector(".screenShare").append(video);
        document.querySelector(".screenShare").style.display = "block";
        video.addEventListener('loadedmetadata', () => {
            video.play().catch(err => { console.log(err); })
        })
        screenShareFlag = 1;
    }
    catch (err) {
        console.log(err);
    }
})
