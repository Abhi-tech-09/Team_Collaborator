const socket = io('https://team-collaborator.herokuapp.com/');

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


