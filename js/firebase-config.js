(function () {
  window.firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

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
