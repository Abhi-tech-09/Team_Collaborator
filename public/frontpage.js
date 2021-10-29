const socket = io('http://localhost:3000');

const roomContainer = document.getElementById('roomContainer');


socket.on('room-created', room => {

    const roomElement = document.createElement('div');
    roomElement.className = "roomList";
    roomElement.innerHTML = `
    <span class="badge bg-warning text-dark">
                    ${room}
                </span>
    <a class="btn btn-sm btn-success" href="/${room}" role="button">Join</a>
    <button class="btn btn-sm btn-danger delete" value = "${room}">Delete</button>
    `;
    roomContainer.append(roomElement);
    console.log("idhar hun")
    let list = document.getElementsByClassName('roomList');
    for (let i = 0; i < list.length; i++) {
        console.log("socket ke andar hun");
        if (list[i].children[2].value == room) {
            console.log("aaya");
            console.log(list[i].children[2])
            list[i].children[2].addEventListener('click', deleteRoom)
        }
    }
})

socket.on('room-deleted', room => {
    let list = document.getElementsByClassName('roomList');
    for (let i = 0; i < list.length; i++) {
        console.log(list[i]);
        if (list[i].children[2].value == room) {
            console.log("aaya");
            roomContainer.removeChild(list[i]);
        }
    }
})

function deleteRoom(e) {
    socket.emit("delete-room", e.target.value);
}



document.querySelector('.google').addEventListener('click', e => {
    e.preventDefault();
    firebase.initializeApp(firebaseConfig);
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            // /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            console.log(user)
            alert('working');
            // ...
        }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });

})