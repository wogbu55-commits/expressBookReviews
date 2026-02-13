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
        if (books) callback(null, books);
        else callback("No books found", null);
    }, 100);
}

function getBooks() {
    return new Promise((resolve, reject) => {
        getBooksCallback((err, data) => (err ? reject(err) : resolve(data)));
    });
}

// Get the book list available in the shop
public_users.get('/books', async (req, res) => {
  
    try {
        const allBooks = await getBooks();
        res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

function getBooksByISBNCallback(isbn,callback) {
    setTimeout(() => {
        if (books[isbn]) callback(null, books[isbn]);
        else callback("Book not found", null);
    }, 100);
}

function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        getBooksByISBNCallback(isbn, (err, data) => err ? reject(err) : resolve(data));
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
  
    try {
        const book = await getBookByISBN(req.params.isbn);
        req.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error });
    }
 });

 function getBooksByAuthorCallback(author, callback) {
    setTimeout(() => {
        const results = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].author.toLowerCase() === author)
                results.push(books[isbn]);
        });
        if (results.length > 0) callback(null, results);
        else callback("No books found by this author", null);
    }, 100);
 }

 function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        getBooksByAuthorCallback(author, (err, data) => err ? reject(err) : resolve(data));
    })
 }
  
// Get book details based on author
public_users.get('/author/:author',async (req, res) => {

    try {
        const booksByAuthor = await getBooksByAuthor(req.params.author);
        res.status(200).json(booksByAuthor);
    } catch (error) {
        res.status(404).json({ message: error});
    }
});

function getBooksByTitleCallback(title,callback) {
    setTimeout(() => {
        const results =[];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title) 
                results.push(books[isbn]);
        });
        if (results.length > 0) callback(null, results);
        else callback("No books found with this title", null);
    }, 100);
}

function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        getBooksByTitleCallback(title, (err, data) => err ? reject(err) : resolve(data));
    });
 }

// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
        try {
            const booksByTitle = await getBooksByTitle(req.params.title);
            res.status(200).json(booksByTitle);
        } catch (error) {
            res.status(404).json({ message: error });
        }
});

function getBookReviewCallback(isbn, callback){
    setTimeout(() => {
        if (books[isbn] && books[isbn].reviews)
            callback(null, books.reviews);
        else if (book) callback(null, {});
        else callback("Books not found", null);
    }, 100);
}

function getReviewsByISBN(isbn) {
    return new Promise((resolve, reject) => {
        getBookReviewCallback(isbn, (err, data) => err ? reject(err) : resolve(data));
    });
}

//  Get book review
public_users.get('/review/:isbn',async (req, res)=> {
    try {
        const reviews = await getReviewsByISBN(req.params.isbn);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(404).json({ message: error});
    }
});

module.exports.general = public_users;
