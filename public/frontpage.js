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

if(document.querySelector('.calendar') != null){
    const calendarbtn = document.querySelector('.calendar'); 
    const calContainer = document.querySelector('#calendar-container')
    let click = 0 ; 
    calendarbtn.addEventListener('click' , e =>{
        e.preventDefault() ; 
        let cal = new Calendar({
            id: "#calendar-container",
            calendarSize: "large",
            theme : "glass",
            primaryColor : '#1a237e',
            headerBackgroundColor : "#fd7e14",
            weekdaysColor : "#0d6efd",
            eventsData : [
                {
                    start: '2021-10-30T09:24:48',
                    end: '2021-10-31T09:25:48',
                    name: 'Blockchain 101'
                }
               
            ]
          });

          if(click == 0){
            calContainer.style.display = "block" ; 
            calContainer.classList.add("cal");
            click = 1 ; 
            calendarbtn.classList.remove("btn-info");
            calendarbtn.classList.add("btn-danger");
            calendarbtn.innerHTML = "Close" ; 
        }
        else{
            click = 0 ; 
            calContainer.classList.remove("cal"); 
            calContainer.style.display = "none"; 
            calendarbtn.classList.remove("btn-danger");
            calendarbtn.classList.add("btn-info");
            calendarbtn.innerHTML = "Go to calendar" ;

        }
        
    })
}

