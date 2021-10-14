const uniqid = require("uniqid")
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const jwt = require("jsonwebtoken")
const express = require("express");
const admin = require("firebase-admin");
// const express = require('express');
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
let current_user;
let id;
let obj = {};



app.get('/', (req, res) => {
    id = uniqid();
    if (obj[id] == null) {
        obj[id] = { name: null, email: null };
    }
    // console.log(socket.id);

    res.redirect('/home')
})
app.get('/home', (req, res) => {

    // console.log(obj[id].name, obj[id].email)
    res.render('index', { rooms: rooms })
})

app.get('/signUp', (req, res) => {
    res.render("signup");
})
app.get('/logIn', (req, res) => {
    res.render("login");
})

app.get("/profile", function (req, res) {
    if (current_user)
        res.render("profile")
    else
        res.redirect("/logIn")
});


app.post("/sessionLogin", (req, res) => {
    // console.log(req.body)
    // // console.log("Inside session login", id);
    // obj[id]["name"] = req.body.username;
    // obj[id]["email"] = req.body.email;
    // console.log(obj)
    // res.redirect('/dashboard')


    const user = {
        name: req.body.username,
        email: req.body.email
    }
    console.log(user);
    // const token;
    jwt.sign({ user }, 'secretkey', (err, token) => {
        console.log(token)
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            httpOnly: true
        })
        res.json({ token })

    })
    console.log("Bhai kahan pe ho apap")

});

app.get("/sessionLogout", (req, res) => {
    current_user = null;
    console.log("User logged out")
});

let curr_auth;
app.get('/dashboard', (req, res) => {
    // console.log(obj);
    // if (obj[id]["name"] != null)
    //     res.render("dashboard", { rooms, user: JSON.stringify(obj[id]) });
    // else
    //     res.redirect('/home')    

    jwt.verify(req.cookies.jwt, 'secretkey', (err, authData) => {
        if (err) {
            console.log(err)
            res.sendStatus(403);
        } else {
            console.log("Succes")
            curr_auth = authData;
            console.log("render")

            // res.sendStatus(200);
            res.render("dashboard", { rooms, curr_auth: JSON.stringify(authData) });
        }
    });


})
// app.get("/dashboard", (req, res) => {
//     console.log(req.cookies.jwt);
//     
// })

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
    // console.log(chats);
    // console.log(JSON.stringify(chats));
    console.log(obj[id])
    res.render('rooms', { roomName: req.params.room, chatObj: JSON.stringify(chats), user: JSON.stringify(obj[id]) });

})

// function verifyToken(req, res, next) {
//     // Get auth header value
//     const bearerHeader = req.headers['authorization'];
//     console.log("bearedHeader", bearerHeader)
//     // Check if bearer is undefined
//     if (typeof bearerHeader !== 'undefined') {
//         // Split at the space
//         const bearer = bearerHeader.split(' ');
//         // Get token from array
//         const bearerToken = bearer[1];
//         // Set the token
//         req.token = bearerToken;
//         // Next middleware
//         next();
//     } else {
//         // Forbidden
//         res.sendStatus(403);
//     }

// }

server.listen(3000);

io.on('connection', socket => {
    // id = socket.id;
    // obj[id] = { name: "Abhishek", email: "abhi@gmail.com" }

    socket.on('new-user', (room, name) => {
        socket.join(room)

        rooms[room].users[socket.id] = name
        socket.to(room).emit('user-connected', name);
        // socket.to(room).emit('fileChanges', room);


    })
    socket.on('send-chat-message', (room, message) => {
        socket.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
        chats[room].push({ name: rooms[room].users[socket.id], message: message });

    })
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])

            delete rooms[room].users[socket.id];
        })
    })
    socket.on('text-change', (delta, room) => {
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
