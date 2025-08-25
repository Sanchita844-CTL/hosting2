document.addEventListener('DOMContentLoaded', function() {
  // Password toggle
  const togglePassword = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');

  togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
  });

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCWBjXWzeZp--SSZwYjhRY8eTBf1E2qdo0",
    authDomain: "login-b0146.firebaseapp.com",
    projectId: "login-b0146",
    storageBucket: "login-b0146.firebasestorage.app",
    messagingSenderId: "238001252324",
    appId: "1:238001252324:web:61a2ed15d313875fcf89f1",
    measurementId: "G-0DK7BWBQRK"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Login button functionality
  document.querySelector('.login-btn').addEventListener('click', function() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    // Attempt Firebase authentication
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        // Only redirect if login succeeds
        alert(`Welcome, ${userCredential.user.displayName || 'User'}!`);
        window.location.href = 'dashboard.html';
      })
      .catch(error => {
        // Do NOT redirect, show error
        alert(`Login failed: ${error.message}`);
      });
  });
});
