import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, updateDoc,deleteDoc, getDocs, doc } from 'firebase/firestore';
import { firebaseApp } from "../Firebase/firebaseConfig";
import Swal from 'sweetalert2';

interface IBookContext {
  books: any[];
  fetchBooks: () => void;
  addBook: (formData: any) => void;
  editBook: (id: string, updatedData: any) => void;
  submitBook: (id: string) => void;
  submitReport: (reportData: any) => void;
}

const BookContext = createContext<IBookContext | undefined>(undefined);

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('');
  }
  return context;
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const db = getFirestore(firebaseApp); 
    const booksCollection = collection(db, 'Books Borrowed');
    const querySnapshot = await getDocs(booksCollection);
    const bookData: any[] = [];
    querySnapshot.forEach((doc) => {
      bookData.push({ id: doc.id, ...doc.data() });
    });
    setBooks(bookData);
  };

  const addBook = async (formData: any) => {
    const db = getFirestore(firebaseApp);
    try {
      await addDoc(collection(db, 'Books Borrowed'), formData);
      fetchBooks();
    } catch (error) {
      console.error('Error adding book to Firestore: ', error);
    }
  };

  const editBook = async (id: string, updatedData: any) => {
    const db = getFirestore(firebaseApp);
    try {
      await updateDoc(doc(db, 'Books Borrowed', id), updatedData);
      Swal.fire("Book updated successfully!", "", "success");
      fetchBooks(); 
    } catch (error) {
      console.error('Error updating book:', error);
      Swal.fire("Error updating book", (error as Error).message, "error");
    }
  };

  const submitBook = async (id: string) => {
    const db = getFirestore(firebaseApp);
    try {
      const bookToSubmit = books.find(book => book.id === id);
      if (bookToSubmit) {
        await deleteDoc(doc(db, 'Books Borrowed', id));
        await addDoc(collection(db, 'Books Submitted'), bookToSubmit);
        Swal.fire('Submitted!', 'Your submission has been recorded successfully.', 'success');
        fetchBooks();
      } else {
        Swal.fire('Error', 'Book not found.', 'error');
      }
    } catch (error) {
      console.error('Error submitting book:', error);
      Swal.fire('Error', 'An error occurred while submitting the book.', 'error');
    }
  };

  const submitReport = async (reportData: any) => {
    const db = getFirestore(firebaseApp);
    try {
      await addDoc(collection(db, 'Users Report'), reportData);
      Swal.fire('Report Submitted!', 'Our team will review your report and take necessary actions to address the problem.', 'success');
    } catch (error) {
      console.error('Error submitting report:', error);
      Swal.fire('Error', 'An error occurred while submitting the report.', 'error');
    }
  };

  return (
    <BookContext.Provider value={{ books, fetchBooks, addBook, editBook, submitBook, submitReport }}>
      {children}
    </BookContext.Provider>
  );
};