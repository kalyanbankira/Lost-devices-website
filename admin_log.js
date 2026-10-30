
const form = document.getElementById("loginForm");

const aadhaar = document.getElementById("aadhaar");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const password = document.getElementById("password");
const captchaInput = document.getElementById("captchaInput");
const captchaText = document.getElementById("captchaText");
const otp = document.getElementById("otp");

const sendOtpBtn = document.getElementById("sendOtp");
const refreshCaptcha = document.getElementById("refreshCaptcha");

// OTP demo variables
let generatedOTP = "";
let otpExpiry = 0;
let otpAttempts = 0;

// Display messages
function showMessage(id, message, type = "error") {
    const element = document.getElementById(id);

    element.textContent = message;
    element.className = "msg " + type;
}

// Clear messages
function clearMessages() {
    document.querySelectorAll(".msg").forEach(msg => {
        msg.textContent = "";
        msg.className = "msg";
    });
}

// Show / Hide password
function togglePassword() {
    password.type =
        password.type === "password" ? "text" : "password";
}

// Aadhaar formatting: 1234 5678 9012
aadhaar.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "").slice(0, 12);

    this.value = value.match(/.{1,4}/g)?.join(" ") || "";
});

// Mobile: only digits
mobile.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// OTP: only digits
otp.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 6);
});

// Generate CAPTCHA
function generateCaptcha() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let captcha = "";

    for (let i = 0; i < 6; i++) {
        captcha += characters[
            Math.floor(Math.random() * characters.length)
        ];
    }

    captchaText.textContent = captcha;
    captchaInput.value = "";
    showMessage("captchaMsg", "");
}

// Refresh CAPTCHA
refreshCaptcha.addEventListener("click", generateCaptcha);

// Validate Aadhaar
function validateAadhaar() {
    const value = aadhaar.value.replace(/\s/g, "");

    if (!/^\d{12}$/.test(value)) {
        showMessage("aadhaarMsg", "Enter a valid 12-digit Aadhaar number.");
        return false;
    }

    showMessage("aadhaarMsg", "Aadhaar format is valid.", "success");
    return true;
}

// Validate email
function validateEmail() {
    const value = email.value.trim();

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(value)) {
        showMessage("emailMsg", "Enter a valid email address.");
        return false;
    }

    showMessage("emailMsg", "Email format is valid.", "success");
    return true;
}

// Validate mobile
function validateMobile() {
    const value = mobile.value.trim();

    if (!/^[6-9]\d{9}$/.test(value)) {
        showMessage("mobileMsg", "Enter a valid 10-digit mobile number.");
        return false;
    }

    showMessage("mobileMsg", "Mobile number format is valid.", "success");
    return true;
}

// Validate password
function validatePassword() {
    const value = password.value;

    const pattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!pattern.test(value)) {
        showMessage(
            "passMsg",
            "Use 8+ characters with uppercase, lowercase, number and special character."
        );
        return false;
    }

    showMessage("passMsg", "Password format is valid.", "success");
    return true;
}

// Validate CAPTCHA
function validateCaptcha() {
    const entered = captchaInput.value.trim().toUpperCase();
    const actual = captchaText.textContent;

    if (entered !== actual) {
        showMessage("captchaMsg", "Incorrect CAPTCHA. Try again.");
        return false;
    }

    showMessage("captchaMsg", "CAPTCHA verified.", "success");
    return true;
}

// Validate all fields except OTP
function validateBasicFields() {
    clearMessages();

    const a = validateAadhaar();
    const e = validateEmail();
    const m = validateMobile();
    const p = validatePassword();
    const c = validateCaptcha();

    return a && e && m && p && c;
}

// Generate six-digit OTP
function createOTP() {
    const random = new Uint32Array(1);

    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(random);
        return String(random[0] % 1000000).padStart(6, "0");
    }

    return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

// Send OTP (frontend demonstration only)
sendOtpBtn.addEventListener("click", function () {

    if (!validateBasicFields()) {
        return;
    }

    generatedOTP = createOTP();

    // OTP valid for 5 minutes
    otpExpiry = Date.now() + 5 * 60 * 1000;

    otpAttempts = 0;
    otp.value = "";

    showMessage(
        "otpMsg",
        "Demo OTP: " + generatedOTP + " (valid for 5 minutes)",
        "success"
    );
});

// Verify OTP
function verifyOTP() {
    const enteredOTP = otp.value.trim();

    if (!generatedOTP) {
        showMessage("otpMsg", "Please generate an OTP first.");
        return false;
    }

    if (Date.now() > otpExpiry) {
        generatedOTP = "";
        showMessage("otpMsg", "OTP expired. Please request a new OTP.");
        return false;
    }

    if (!/^\d{6}$/.test(enteredOTP)) {
        showMessage("otpMsg", "Enter a valid 6-digit OTP.");
        return false;
    }

    if (otpAttempts >= 5) {
        generatedOTP = "";
        showMessage("otpMsg", "Too many attempts. Request a new OTP.");
        return false;
    }

    if (enteredOTP !== generatedOTP) {
        otpAttempts++;
        showMessage("otpMsg", "Incorrect OTP. Attempts left: " + (5 - otpAttempts));
        return false;
    }

    generatedOTP = "";

    showMessage("otpMsg", "OTP verified successfully!", "success");
    return true;
}

// Login form submission
form.addEventListener("submit", function (event) {

    event.preventDefault();

    const valid = validateBasicFields();

    if (!valid) {
        return;
    }

    if (!verifyOTP()) {
        return;
    }

    alert("Login successful!");

    // Add your backend login request here.
});

// Generate CAPTCHA when page loads
generateCaptcha();
