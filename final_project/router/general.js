const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({ message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({ message: "User already exits!"});
    }
  }
    return res.status(404).json({ message: "Unable to register user"});
});

//Function simulating async retrieval with callback
function getBooksCallback(callback) {
    setTimeout(() => {
        if (books) {
            callback(null, books);
        } else {
            callback("No books found", null);
        }
    }, 100);
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
  getBooksCallback((err,data) => {
    if (err) {
        return res.status(404).json({ message: err});
    }
    res.status(200).json(data);
  });
});

function getBooksByISBN(isbn,callback) {
    setTimeout(() => {
        if (books[isbn]) {
            callback(null, books[isbn]);
        } else {
            callback("Book not found", null);
        }
    }, 100);
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  
    const isbn = req.params.isbn;
    getBooksByISBN(isbn, (err,book) => {
        if (err) {
            return res.status(404).json({ message: err});
        }
        res.status(200).json(book);
    });
 });

 function getBooksByAuthor(author, callback) {
    setTimeout(() => {
        const results = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].author.toLowerCase() === author) {
                results.push(books[isbn]);
            }
        });
        if (results.length > 0) {
            callback(null, results);
        } else {
            callback("No books found by this author", null);
        }
    }, 100);
 }
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
    const author = req.params.author;

    getBooksByAuthor(author, (err,books) => {
        if (err) {
            return res.status(404).json({ message: err});
        }
        res.status(200).json(books);
    })
});

function getBooksByTitle(title,callback) {
    setTimeout(() => {
        const results =[];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title) {
                results.push(books[isbn]);
            }
        });
        if (results.length > 0) {
            callback(null, results);
        } else {
            callback("No books found with this title", null);
        }
    }, 100);
}
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  
    const title = req.params.title;
    getBooksByTitle(title, (err,books) => {
        if (err) {
            return res.status(404).json({ message: err});
        }
        res.status(200).json(books);
    })
});

function getBookReview(isbn, callback){
    setTimeout(() => {
        const book = books[isbn];
        if (book && book.reviews) {
            callback(null, books.reviews);
        } else if (book) {
            callback(null, {});
        } else {
            callback("Books not found", null);
        }
    }, 100);
}

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    getBookReview(isbn, (err,reviews) => {
        if (err) {
            return res.status(404).json({ message: err});
        }
        res.status(200).json(reviews);
    });
});

module.exports.general = public_users;
