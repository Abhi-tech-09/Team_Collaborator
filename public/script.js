const socket = io('http://localhost:3000');

const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const roomContainer = document.getElementById('roomContainer');

if (typeof user == 'object') {
    const ele = document.createElement('h5');
    ele.innerHTML = `Hi ${user.user.name} !!`;
    ele.className = "username"
    document.querySelector(".collapse").appendChild(ele);
}

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
let files = {};
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

    quill.on('text-change', function (delta, oldDelta, source) {
        // files[roomName] = JSON.stringify(document.querySelector('.ql-editor').innerText);
        if (source === 'user') {
            socket.emit("text-change", delta, roomName);
        }
    });

}



socket.on('receive-changes', (delta) => {
    // alert("Haan pahucha hai")
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

    files[roomName] = document.querySelector('.ql-editor').innerText;
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
    <a class="btn btn-sm btn-primary" href="/${room}" role="button">Join</a>
    
    `;
    roomContainer.append(roomElement);



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



