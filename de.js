const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Set the path to users.json
const pathToUsersJson = '/Users/daniel.parraguezobe/Documents/Code/NodeJS/Datalagring/users.json';

// Set up views directory and view engine
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use('/public/css', express.static(path.join(__dirname, 'public/css')));

// Middleware for using static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for handling form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for handling image express static files
app.use('/uploads', express.static('public/uploads'));

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Route to display the user update form
app.get('/update/:username', (req, res) => {
  const username = req.params.username;

  // Read existing user data from the specified JSON file path
  const userData = JSON.parse(fs.readFileSync(pathToUsersJson, 'utf8'));

  // Find the user by username
  const userToUpdate = userData.find((user) => user.username === username);

  if (!userToUpdate) {
    res.status(404).send('User not found');
  } else {
    res.render('update', { user: userToUpdate });
  }
});

// Route to display the users page
app.get('/users', (req, res) => {
  // Read existing user data from the specified JSON file path
  const userData = JSON.parse(fs.readFileSync(pathToUsersJson, 'utf8'));
  res.render('users', { users: userData });
});

// Route to display the user creation form
app.get('/create', (req, res) => {
  res.render('create');  // Assuming you want to pass some initial data to the create page
});

// Route to handle form submission and save to JSON file
app.post('/create', upload.single('userImage'), (req, res) => {
  const { firstName, lastName, username, birthday, occupation } = req.body;
  const imagePath = req.file ? req.file.filename : '';

  const newUser = {
    firstName,
    lastName,
    username,
    birthday,
    image: imagePath,
    occupation,
  };

  // Read existing user data from the specified JSON file path
  const userData = JSON.parse(fs.readFileSync(pathToUsersJson, 'utf8'));

  // Add the new user
  userData.push(newUser);

  // Write the updated user data back to the specified JSON file path
  fs.writeFileSync(pathToUsersJson, JSON.stringify(userData));

  res.redirect('/');
});

// Route to handle form submission for updating users
app.post('/update/:username', upload.single('userImage'), (req, res) => {
  const username = req.params.username;
  const { firstName, lastName, birthday, occupation } = req.body;
  const imagePath = req.file ? req.file.filename : '';

  // Read existing user data from the specified JSON file path
  let userData = JSON.parse(fs.readFileSync(pathToUsersJson, 'utf8'));

  // Find the user by username
  const userToUpdateIndex = userData.findIndex((user) => user.username === username);

  if (userToUpdateIndex === -1) {
    res.status(404).send('User not found');
  } else {
    // Update the user data
    userData[userToUpdateIndex] = {
      ...userData[userToUpdateIndex],
      firstName,
      lastName,
      birthday,
      image: imagePath || userData[userToUpdateIndex].image,
      occupation,
    };

    // Write the updated user data back to the specified JSON file path
    fs.writeFileSync(pathToUsersJson, JSON.stringify(userData));

    res.redirect('/');
  }
});


// Route to display the update-info form
app.get('/update-info', (req, res) => {
  res.render('update-info');
});

// Route to handle form submission and redirect to /update/:username
app.get('/update', (req, res) => {
  const username = req.query.username;

  if (username) {
    res.redirect(`/update/${username}`);
  } else {
    res.status(400).send('Username is required.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});