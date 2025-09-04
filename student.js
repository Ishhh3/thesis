document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        username: document.getElementById("username").value,
        oldPassword: document.getElementById("oldPassword").value,
        newPassword: document.getElementById("newPassword").value,
      };

      const response = await fetch("http://localhost:3000/api/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      const messageDiv = document.getElementById("message");
      messageDiv.innerText = result.message;
      messageDiv.className = result.success ? "text-success" : "text-danger";

      if (result.success) {
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"));
          modal.hide();
        }, 1000);
      }
    });