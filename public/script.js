const socket = io('http://localhost:3000');

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
let quill = "";
let nameuser = "";
if (messageForm != null) {

    while (nameuser === "") {
        nameuser = prompt("Enter your name");
    }
    appendMessage('You Joined...', "right");
    socket.emit('new-user', roomName, nameuser);

    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = messageInput.value;
        appendformatMessage({ name: "You", message: message }, "right");
        socket.emit('send-chat-message', roomName, message);
        messageInput.value = "";
    })
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: { toolbar: toolbar_options }
    });
    quill.on('text-change', function (delta, oldDelta, source) {
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
    appendMessage(`${nameuser} disconnected...`, "right");
})



socket.on('room-created', room => {

    const roomElement = document.createElement('div');
    roomElement.innerText = room;
    const roomLink = document.createElement('a');
    roomLink.href = `/${room}`;
    roomLink.innerText = 'Join';

    roomContainer.append(roomElement);

    roomContainer.append(roomLink);

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

