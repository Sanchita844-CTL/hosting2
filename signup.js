document.addEventListener('DOMContentLoaded', function() {
  // Password toggle functionality
  const togglePasswords = document.querySelectorAll('.toggle-password');
  
  togglePasswords.forEach(icon => {
    icon.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
      this.classList.toggle('fa-eye');
    });
  });

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCWBjXWzeZp--SSZwYjhRY8eTBf1E2qdo0",
    authDomain: "login-b0146.firebaseapp.com",
    projectId: "login-b0146",
    storageBucket: "login-b0146.appspot.com",
    messagingSenderId: "238001252324",
    appId: "1:238001252324:web:61a2ed15d313875fcf89f1",
    measurementId: "G-0DK7BWBQRK"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Signup button functionality
  document.getElementById('signupBtn').addEventListener('click', function() {
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!fullname || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Create new user in Firebase
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        // Optional: save full name
        return userCredential.user.updateProfile({ displayName: fullname });
      })
      .then(() => {
        alert('Account created successfully!');
        window.location.href = 'index.html'; // Redirect to login page
      })
      .catch(error => {
        alert(`Signup failed: ${error.message}`);
      });
  });
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker Registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}



