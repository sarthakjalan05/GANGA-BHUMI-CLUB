const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


    // Function to clear form fields after successful submission
    function clearForm(form) {
        form.reset();
    }

    // Optional: Handle form submission and reset the form fields
    document.addEventListener("DOMContentLoaded", function() {
        // Register form submit event listeners
        const registerForm = document.getElementById("register-form");
        const loginForm = document.getElementById("login-form");

        if (registerForm) {
            registerForm.addEventListener("submit", function(event) {
                event.preventDefault(); // Prevent default form submission
                const formData = new FormData(registerForm);

                fetch('/register', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.text())
                .then(data => {
                    alert(data); // Show success or error message
                    clearForm(registerForm); // Clear fields after successful submit
                })
                .catch(error => console.error("Error:", error));
            });
        }

        if (loginForm) {
            loginForm.addEventListener("submit", function(event) {
                event.preventDefault(); // Prevent default form submission
                const formData = new FormData(loginForm);

                fetch('/login', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.text())
                .then(data => {
                    alert(data); // Show success or error message
                    clearForm(loginForm); // Clear fields after successful submit
                })
                .catch(error => console.error("Error:", error));
            });
        }
    });
