// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqUZa4MLJ9bEoIaIL329m9FJV_3Nsay8M",
  authDomain: "book-manager-c9a69.firebaseapp.com",
  projectId: "book-manager-c9a69",
  storageBucket: "book-manager-c9a69.appspot.com",
  messagingSenderId: "586762415991",
  appId: "1:586762415991:web:47fc88970797feb6c83b72",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const booksCollection = collection(db, "books");

// Get UI elements
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
updateBtn.disabled = true; // Initially disable the update button

// Utility function: Show feedback
function showFeedback(message, elementId = "feedback") {
  const feedbackEl = document.getElementById(elementId);
  if (feedbackEl) {
    feedbackEl.textContent = message;
    feedbackEl.classList.add("show"); // Make sure it's visible

    // Hide the feedback container after 3 seconds
    setTimeout(() => {
      feedbackEl.classList.remove("show");
      feedbackEl.textContent = ""; // Clear message
    }, 3000);
  }
}

// Load books
async function loadBooks() {
  const genreFilter = document.getElementById("genreFilter")?.value || "";
  let querySnapshot;

  if (genreFilter) {
    querySnapshot = await getDocs(
      query(booksCollection, where("genre", "==", genreFilter))
    );
  } else {
    querySnapshot = await getDocs(booksCollection);
  }

  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  querySnapshot.forEach((docSnapshot) => {
    const book = docSnapshot.data();
    book.id = docSnapshot.id;
    const li = document.createElement("li");
    li.innerHTML = `<strong>${book.title}</strong> by ${book.author} (Genre: ${book.genre}, Rating: ${book.rating})
      <span>
        <button onclick="editBook('${book.id}')">Edit</button>
        <button onclick="deleteBook('${book.id}')">Delete</button>
      </span>`;
    bookList.appendChild(li);
  });
}

// Add a new book
document.getElementById("bookForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const bookId = document.getElementById("bookId").value;

  const bookData = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    genre: document.getElementById("genre").value,
    rating: document.getElementById("rating").value,
  };

  try {
    if (!bookId) {
      await addDoc(booksCollection, bookData);
      showFeedback("Book added successfully!");
    }
    document.getElementById("bookForm").reset();
    loadBooks();
  } catch (error) {
    console.error("Error writing document: ", error);
    showFeedback("Error saving book.");
  }
});

// Update existing book
updateBtn.addEventListener("click", async () => {
  const bookId = document.getElementById("bookId").value;

  if (!bookId) return;

  const bookData = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    genre: document.getElementById("genre").value,
    rating: document.getElementById("rating").value,
  };

  try {
    const bookDoc = doc(db, "books", bookId);
    await updateDoc(bookDoc, bookData);
    showFeedback("Book updated successfully!");

    // Reset form and buttons
    document.getElementById("bookForm").reset();
    document.getElementById("bookId").value = "";
    submitBtn.disabled = false;
    updateBtn.disabled = true;

    loadBooks();
  } catch (error) {
    console.error("Error updating document: ", error);
    showFeedback("Error updating book.");
  }
});

// Edit book (populate form)
window.editBook = async function (id) {
  const bookDoc = doc(db, "books", id);
  const querySnapshot = await getDocs(booksCollection);

  querySnapshot.forEach((docSnapshot) => {
    if (docSnapshot.id === id) {
      const book = docSnapshot.data();
      document.getElementById("bookId").value = id;
      document.getElementById("title").value = book.title;
      document.getElementById("author").value = book.author;
      document.getElementById("genre").value = book.genre;
      document.getElementById("rating").value = book.rating;

      // Enable Update button and disable Add button
      updateBtn.disabled = false;
      submitBtn.disabled = true;
    }
  });
};

// Delete book with confirmation
window.deleteBook = async function (id) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this book?"
  );
  if (isConfirmed) {
    try {
      await deleteDoc(doc(db, "books", id));
      showFeedback("Book deleted successfully!");
      loadBooks();
    } catch (error) {
      console.error("Error deleting document: ", error);
      showFeedback("Error deleting book.");
    }
  }
};

// Filter books by genre
document.getElementById("genreFilter")?.addEventListener("change", loadBooks);

// Load books on page load
document.addEventListener("DOMContentLoaded", loadBooks);
