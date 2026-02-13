const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    }  else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    })
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
    return res.status(404).json({ message: "Error logging in"});
    }

    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data:password
        }, 'access', { expiresIn: 60 * 60});

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ message: "Login successful"});
    } else{
        return res.status(404).json({ message: "Invalid login. Please check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
    
    const review = req.query.review;

    if(!username) {
        return res.status(401).json({ message: "User not logged in"});
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required"});
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found"});
    }
    // Initialize reviews object if not present
    if(!book.reviews) {
        book.reviews = {};
    }

    //Add or update review for this user
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews:book.reviews});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
    
    if (!username) {
        return res.status(401).json({ message: "User not logged in"});
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found"});
    }

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review by this user not found"});
    }

    //Delete the review of the logged-in user
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
