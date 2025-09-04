let generatedOtp = null;
  let otpExpiryTime = null;
  let countdownInterval = null;

  // Generate a 6-digit OTP
  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Countdown timer display
  function startCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = otpExpiryTime - now;

      if (distance <= 0) {
        clearInterval(countdownInterval);
        generatedOtp = null;
        document.getElementById("message").innerHTML =
          `<div class="alert alert-danger">❌ OTP expired. Please request a new one.</div>`;
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById("message").innerHTML =
          `<div class="alert alert-info">
            Your OTP is <b>${generatedOtp}</b> (demo only)<br>
            Expires in: ${minutes}m ${seconds}s
          </div>`;
      }
    }, 1000);
  }

  // Send OTP button
  document.getElementById("sendOtpBtn").addEventListener("click", () => {
    generatedOtp = generateOtp();
    otpExpiryTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes
    console.log("Generated OTP:", generatedOtp);
    startCountdown();
  });

  // Handle password change submit
  document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const enteredOtp = document.getElementById("otp").value;
    const messageDiv = document.getElementById("message");

    // Check OTP first
    if (!generatedOtp) {
      messageDiv.innerHTML = `<div class="alert alert-warning">⚠ Please click "Send OTP" first.</div>`;
      return;
    }

    if (new Date().getTime() > otpExpiryTime) {
      messageDiv.innerHTML = `<div class="alert alert-danger">❌ OTP expired. Request a new one.</div>`;
      generatedOtp = null;
      clearInterval(countdownInterval);
      return;
    }

    if (enteredOtp !== generatedOtp) {
      messageDiv.innerHTML = `<div class="alert alert-danger">❌ Invalid OTP.</div>`;
      return;
    }

    // ✅ If OTP is valid, call backend
    const data = {
      username: document.getElementById("username").value,
      oldPassword: document.getElementById("oldPassword").value,
      newPassword: document.getElementById("newPassword").value,
    };

    try {
      const response = await fetch("http://localhost:3000/api/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      messageDiv.innerHTML = result.success
        ? `<div class="alert alert-success">${result.message}</div>`
        : `<div class="alert alert-danger">${result.message}</div>`;

      if (result.success) {
        // Reset OTP + form
        generatedOtp = null;
        clearInterval(countdownInterval);
        document.getElementById("changePasswordForm").reset();

        // Auto close modal
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"));
          modal.hide();
        }, 1000);
      }
    } catch (error) {
      messageDiv.innerHTML = `<div class="alert alert-danger">⚠ Server error</div>`;
    }
  });