// Function to handle login
function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    if (username === "admin" && password === "1234") {
      window.location.href = "/templates/homepage.html";
    } else {
      alert("Invalid username and/or password. Please, try again.");
    }
  }
  