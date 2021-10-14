const socket = io('http://localhost:3000');

const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const roomContainer = document.getElementById('roomContainer');
if (user !== null) {
    console.log(user)
    user = user.replaceAll("&#34;", '"');
    user = JSON.parse(user)
    alert(`Hello ${user.user.name}`);
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
let quill = "";
let nameuser = "";
let files = {};
if (messageForm != null) {
    // var chats = JSON.parse(!(JSON.stringify(chatObj)));
    chats = chatObj.replaceAll('&#34;', '"')
    console.log(JSON.parse(chats));

    if (user !== null) {
        nameuser = user['name'];
        console.log(nameuser)
    }
    else {
        while (nameuser === "") {
            nameuser = prompt("Enter your name");
        }
    }

    appendMessage('You Joined...', "right");
    socket.emit('new-user', roomName, nameuser)

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
    // document.querySelector('.ql-editor').innerText = JSON.parse(files[roomName]);

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

socket.on('user-connected', nameuser => {
    appendMessage(`${nameuser} connected...`, "left");


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



