const socket = io('https://team-collaborator.herokuapp.com/');

const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const roomContainer = document.getElementById('roomContainer');



const toolbar_options = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "supe" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
];
let userList = [];
let quill = "";
let nameuser = "";

let temp = [];


if (messageForm != null) {
    // var chats = JSON.parse(!(JSON.stringify(chatObj)));
    chats = chatObj.replaceAll('&#34;', '"')
    console.log(JSON.parse(chats));

    if (user !== null && typeof user == 'object') {

        nameuser = user.user.name;
        console.log(nameuser)
    }
    else {
        while (nameuser === "") {
            nameuser = prompt("Enter your name");
        }
    }
    document.querySelector(".leave").addEventListener('click', (e) => {
        e.preventDefault();
        window.location.assign('/')
    })
    appendMessage('You Joined...', "right");
    socket.emit('new-user', roomName, nameuser)
    document.title = roomName


    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = messageInput.value;
        appendformatMessage({ name: "You", message: message }, "right");
        socket.emit('send-chat-message', roomName, message);
        messageInput.value = "";
    })

    getChats(roomName);
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: { toolbar: toolbar_options }
    });

    addquillEvent().then(() => {
        quill.on('text-change', function (delta, oldDelta, source) {
            const message = document.querySelector('.ql-editor').innerText;
            if (source === 'user') {
                socket.emit("text-change", delta, roomName, message);
                // temp.push(delta);
                // localStorage.setItem('filecontent', temp)
            }

        });
    });

}

async function addquillEvent() {
    fileRoom = files.replaceAll("&#34;", '"');
    fileRoom = fileRoom.replaceAll("\n", "\\n");

    console.log(fileRoom)
    fileRoom = JSON.parse(fileRoom);


    change = [];
    if (fileRoom[roomName] != null) {
        for (let i = 0; i < fileRoom[roomName].length; i++) {
            quill.updateContents(fileRoom[roomName][i]);
            // change.push(fileRoom[roomName][i].ops);
        }
        // console.log(change);

    }
    //     document.querySelector('.ql-editor').innerText = fileRoom[roomName];
    return 0;
}



socket.on('receive-changes', (delta) => {
    quill.updateContents(delta);
    socket.off('text-change');

});

socket.on('chat-message', data => {
    if (data.name == nameuser)
        appendformatMessage({ name: data.name, message: data.message }, "right");
    else
        appendformatMessage({ name: data.name, message: data.message }, "left");

});

socket.on('user-connected', (nameuser, allusers) => {
    appendMessage(`${nameuser} connected...`, "left");

})

socket.on("roomUsers", ({ room, users }) => {
    displayUser(users);
})

socket.on('user-disconnected', nameuser => {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('files', JSON.stringify(files));
    appendMessage(`${nameuser} disconnected...`, "right");
})

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

    roomElement.children[2].onclick = deleteRoom(event);
})

socket.on('room-deleted', room => {
    let list = document.getElementsByClassName('roomList');
    for (let i = 0; i < list.length; i++) {
        // console.log(list[i]);
        if (list[i].children[2].value == room) {
            roomContainer.removeChild(list[i]);
        }
    }
})


function appendMessage(message, position) {
    const messageElement = document.createElement('div');
    messageElement.className = position;
    messageElement.style.display = "block";
    messageElement.innerText = message;
    console.log(messageElement);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendformatMessage({ name, message }, position) {
    const messageElement = document.createElement('div');
    messageElement.className = position;
    messageElement.innerHTML = `<div class="name"><span class="badge rounded-pill bg-warning text-dark">${name}</span></div>
    <div class="actualMessage">
        ${message}
    </div>`;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function getChats(roomName) {
    chats = JSON.parse(chatObj.replaceAll('&#34;', '"'));
    for (let i = 0; i < chats[roomName].length; i++) {
        let name = chats[roomName][i].name;
        let message = chats[roomName][i].message;
        if (name == nameuser) {
            appendformatMessage({ name, message }, "right");
        }
        else {
            appendformatMessage({ name, message }, "left");
        }

    }
}

function displayUser(users) {
    document.querySelector(".dropdown-menu").innerHTML = "";
    Object.entries(users).forEach((user) => {
        const ele = document.createElement('li');
        ele.innerHTML = `<a class="dropdown-item">${user[1]}</a>`;
        ele.innerText = user[1];
        document.querySelector(".dropdown-menu").appendChild(ele);
    })
}


function deleteRoom(e) {
    console.log(e.target.value)
    socket.emit("delete-room", e.target.value);
}








