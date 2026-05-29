import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBn5rL-p6hR85B5wibq12NKt6HaDJA",
  authDomain: "school-coop-firebase.firebaseapp.com",
  projectId: "school-coop-firebase",
  storageBucket: "school-coop-firebase.firebasestorage.app",
  messagingSenderId: "63550533389",
  appId: "1:63550533389:web:5c4076f80b9122dcfd5344"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("YOUR_")
  );
}
