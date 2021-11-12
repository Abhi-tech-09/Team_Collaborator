// const socket = io('http://localhost:3000');

const peers = {}
// document.querySelector('.video').addEventListener('click', e => {
// e.preventDefault();

const myPeer = new Peer();

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




}).catch(err => {
    console.log(err);
})

socket.on('user-video-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})




// });

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

function addVideoStream(video, stream) {
    // const media = new MediaStream(); 
    console.log("Adding new video");
    // console.log(stream);
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => { console.log(err); })
    })
    document.querySelector(".videoContainer").appendChild(video)
    // alert("I think it should display")
}

