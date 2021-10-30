// const socket = io('http://localhost:3000');
document.querySelector('.video').addEventListener('click', e => {
    e.preventDefault();
    let myVideo = document.createElement('video');
    myVideo.muted = true;
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream)
        socket.emit('video-on', roomName, stream);
    })
});

socket.on('add-video', stream => {
    let myVideo = document.createElement('video');
    myVideo.muted = true;
    addVideoStream(myVideo, stream);
    alert("Yes this socket is running")
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    document.querySelector(".videoContainer").append(video)
    alert("I think it should display")
}

