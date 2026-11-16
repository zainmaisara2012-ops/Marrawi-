// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCbi60Z6hJw52c-KhdYOB246MQh1-X71EA",
  authDomain: "marrawi-7fc06.firebaseapp.com",
  projectId: "marrawi-7fc06",
  storageBucket: "marrawi-7fc06.firebasestorage.app",
  messagingSenderId: "552896539624",
  appId: "1:552896539624:web:dece0d5f6f1895c79ad25d"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
