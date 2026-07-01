import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBOomrfISQ0WO6sdbqbGWuDJpHwmHH5h9U",
  authDomain: "dananggo-7360c.firebaseapp.com",
  projectId: "dananggo-7360c",
  storageBucket: "dananggo-7360c.firebasestorage.app",
  messagingSenderId: "893720223281",
  appId: "1:893720223281:web:702e8d2bc3a0db06db3f10",
  measurementId: "G-LFPL9F9Y4Q"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  app, db, auth, storage, googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  firebaseUpdateProfile,
};
