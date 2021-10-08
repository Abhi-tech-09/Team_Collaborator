const { json } = require('express');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
// const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
// const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server
);
const keys = require("./keys.json");

admin.initializeApp({
    credential: admin.credential.cert(keys),
    databaseURL: "https://teamcollabarator-default-rtdb.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(express.json());


let rooms = {}
let chats = {};
let current_user;

app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
})

app.get('/signUp', (req, res) => {
    res.render("signup");
})
app.get('/logIn', (req, res) => {
    res.render("login");
})

app.get("/profile", function (req, res) {
    const sessionCookie = req.cookies.session || "";

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then(() => {
            res.render("profile");
        })
        .catch((error) => {
            res.redirect("/logIn");
        });
});


app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    if (req.body.user)
        current_user = req.body.user;
    // console.log(current_user)

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    admin
        .auth()
        .createSessionCookie(idToken, { expiresIn })
        .then(
            (sessionCookie) => {
                const options = { maxAge: expiresIn, httpOnly: true };
                res.cookie("session", sessionCookie, options);
                res.end(JSON.stringify({ status: "success" }));
                console.log("Sucess")
            },
            (error) => {
                res.status(401).send("UNAUTHORIZED REQUEST!");
            }
        );
});

app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/logIn");
});

app.get('/dashboard', (req, res) => {
    console.log("in dashboard ", JSON.stringify(current_user));
    res.render("dashboard", { rooms, current_user: JSON.stringify(current_user) });
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
        return res.redirect('/')
    }
    // console.log(chats);
    // console.log(JSON.stringify(chats));
    res.render('rooms', { roomName: req.params.room, chatObj: JSON.stringify(chats) });

})

server.listen(3000);

io.on('connection', socket => {
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
