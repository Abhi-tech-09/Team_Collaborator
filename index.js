const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const express = require("express");
const admin = require("firebase-admin");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const keys = require("./keys.json");

admin.initializeApp({
    credential: admin.credential.cert(keys),
    databaseURL: "https://teamcollabarator-default-rtdb.firebaseio.com",
});


app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser());
app.use(express.json());


let rooms = {}
let chats = {};
let files = {};




app.get('/', (req, res) => {
    res.redirect('/home')
})
app.get('/home', (req, res) => {

    jwt.verify(req.cookies.jwt, 'secretkey', (err, authData) => {
        if (err) {
            res.render('index', { rooms: rooms })
        } else {
            curr_auth = authData;

            res.redirect('/dashboard')
        }
    });

})

app.get('/signUp', (req, res) => {
    res.render("signup");
})
app.get('/logIn', (req, res) => {
    res.render("login");
})

app.get("/profile", function (req, res) {
    jwt.verify(req.cookies.jwt, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect("/logIn")
        } else {
            curr_auth = authData;
            res.render("profile", { curr_auth: JSON.stringify(authData) });
        }
    });
});


app.post("/sessionLogin", (req, res) => {

    const user = {
        name: req.body.username,
        email: req.body.email
    }
    jwt.sign({ user }, 'secretkey', (err, token) => {
        console.log(token)
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            path: "/"
        })
        res.json({ token })

    })


});

app.get("/sessionLogout", (req, res) => {
    res.clearCookie("jwt", {
        path: "/",
        domain: "localhost"
    });
    res.sendStatus(200);
    console.log("User logged out")
});


let curr_auth;
app.get('/dashboard', (req, res) => {

    jwt.verify(req.cookies.jwt, 'secretkey', (err, authData) => {
        if (err) {
            res.redirect("/logIn")
        } else {
            curr_auth = authData;

            res.render("dashboard", { rooms, curr_auth: JSON.stringify(authData) });
        }
    });


})

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        console.log("Room already exists already");
        return res.redirect('/');
    }
    rooms[req.body.room] = { users: {} };
    chats[req.body.room] = [];
    res.redirect(req.body.room);
    io.emit('room-created', req.body.room);

})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/home')
    }


    jwt.verify(req.cookies.jwt, 'secretkey', (err, authData) => {
        if (err) {
            res.render("rooms", { roomName: req.params.room, chatObj: JSON.stringify(chats), curr_auth: null, roomslist: rooms, files: JSON.stringify(files) });
        } else {
            curr_auth = authData;
            res.render('rooms', { roomName: req.params.room, chatObj: JSON.stringify(chats), curr_auth: JSON.stringify(authData), roomslist: rooms, files: JSON.stringify(files) });
        }
    });

})


server.listen(3000);

io.on('connection', socket => {

    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).emit('user-connected', name, rooms[room].users);
        console.log(rooms);

        io.to(room).emit('roomUsers', {
            room: room,
            users: rooms[room].users
        })
    })

    socket.on('send-chat-message', (room, message) => {
        socket.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
        chats[room].push({ name: rooms[room].users[socket.id], message: message });

    })

    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id];
            io.to(room).emit('roomUsers', {
                room: room,
                users: rooms[room].users
            })
            console.log(files)
        })
    })

    socket.on('delete-room', room => {
        delete rooms[room];
        // console.log(rooms);
        io.emit('room-deleted', room);
    })

    socket.on('text-change', (delta, room, message) => {
        if (files[room] != null) files[room].push(delta)
        else { files[room] = []; files[room].push(delta) }
        console.log(delta);
        socket.to(room).emit('receive-changes', delta);
    })

})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}
