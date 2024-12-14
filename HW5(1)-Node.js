//import required libraries
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

//initialise the app and port
const app = express();
const PORT = 5001;

//middleware to parse JSON request bodies
app.use(bodyParser.json());

//file to store user profiles
const usersFile = "user_profiles.txt";

//ensuring the file exists
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "");
}

//helper functions to load, save and update user data
function loadUsers() {
    const users = {};
    const data = fs.readFileSync(usersFile, "utf8");
    if (data) {
        data.split("\n").forEach((line) => {
            if (line) {
                const [email, age] = line.split(",");
                users[email] = { email, age };
            }
        });
    }
    return users;
}

function saveUser(email, age) {
    fs.appendFileSync(usersFile, `${email},${age}\n`);
}

function updateUsers(users) {
    const data = Object.values(users)
        .map((user) => `${user.email},${user.age}`)
        .join("\n");
    fs.writeFileSync(usersFile, data);
}

//root route
app.get("/", (req, res) => {
    res.send("Welcome to the User Profile App");
});

//routes for user management
app.post("/add_user", (req, res) => {
    const { email, age } = req.body;
    if (!email || !age) {
        return res.status(400).json({ error: "Email and age are required." });
    }
    const users = loadUsers();
    if (users[email]) {
        return res.status(400).json({ error: "User already exists." });
    }
    saveUser(email, age);
    res.status(201).json({ message: "User added successfully." });
});

app.get("/get_user/:email", (req, res) => {
    const email = req.params.email;
    const users = loadUsers();
    if (!users[email]) {
        return res.status(404).json({ error: "User not found." });
    }
    res.json(users[email]);
});

app.put("/update_user/:email", (req, res) => {
    const email = req.params.email;
    const { age } = req.body;
    const users = loadUsers();
    if (!users[email]) {
        return res.status(404).json({ error: "User not found." });
    }
    if (age) {
        users[email].age = age;
    }
    updateUsers(users);
    res.json({ message: "User updated successfully." });
});

app.delete("/delete_user/:email", (req, res) => {
    const email = req.params.email;
    const users = loadUsers();
    if (!users[email]) {
        return res.status(404).json({ error: "User not found." });
    }
    delete users[email];
    updateUsers(users);
    res.json({ message: "User deleted successfully." });
});

//starting the app
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
