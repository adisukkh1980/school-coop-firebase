(function () {
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnNg5rL-pq6hR85B5wibql2NKt6HabSJA",
  authDomain: "school-coop-firebase.firebaseapp.com",
  projectId: "school-coop-firebase",
  storageBucket: "school-coop-firebase.firebasestorage.app",
  messagingSenderId: "635530533389",
  appId: "1:635530533389:web:5c4076f80b9122dcfd5344"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

  window.isFirebaseConfigured = function isFirebaseConfigured() {
    return Boolean(
      window.firebaseConfig &&
      window.firebaseConfig.apiKey &&
      !window.firebaseConfig.apiKey.startsWith("YOUR_")
    );
  };

  window.initializeFirebaseApp = function initializeFirebaseApp() {
    if (!window.firebase || !window.isFirebaseConfigured()) {
      return null;
    }

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(window.firebaseConfig);
    }

    return window.firebase.app();
  };
})();
