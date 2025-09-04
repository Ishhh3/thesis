window.addEventListener("load", () => {
  // Redirect if already logged in
  if (localStorage.getItem("loggedInUser")) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser.role === "student") {
      window.location.href = "stud.html";
    } else if (loggedInUser.role === "teacher") {
      window.location.href = "teacher.html";
    }
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value.trim();

      if (!username || !password) {
        alert("Please fill all fields");
        return;
      }

      fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem(
              "loggedInUser",
              JSON.stringify({ username: data.username, role: data.role })
            );
            alert("Login successful!");

            if (data.role === "student") {
              window.location.href = "stud.html";
            } else if (data.role === "teacher") {
              window.location.href = "teacher.html";
            }
          } else {
            alert(data.message || "Login failed");
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
          alert("Server error. Try again later.");
        });
    });
  }
});
