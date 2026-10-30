
// Get HTML Elements

const form = document.getElementById("registerForm");

const fullName = document.getElementById("fullName");
const aadhaar = document.getElementById("aadhaar");
const email = document.getElementById("email");
const dob = document.getElementById("dob");
const mobile = document.getElementById("mobile");
const otp = document.getElementById("otp");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const sendOtpBtn = document.getElementById("sendOtp");
const showPassword = document.getElementById("showPassword");

// OTP Variables

let generatedOTP = "";
let otpExpiry = 0;
let otpAttempts = 0;

// Set maximum DOB to today

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dob.max = localToday;


// Display Messages

function showMessage(id, message, type = "error") {

    const element = document.getElementById(id);

    element.textContent = message;
    element.className = "msg " + type;
}


// Clear Messages

function clearMessages() {

    document.querySelectorAll(".msg").forEach(msg => {

        msg.textContent = "";
        msg.className = "msg";

    });
}


// Aadhaar Formatting

aadhaar.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "").slice(0, 12);

    this.value = value.match(/.{1,4}/g)?.join(" ") || "";

});


// Mobile Formatting

mobile.addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "").slice(0, 10);

});


// OTP Formatting

otp.addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "").slice(0, 6);

});


// Show / Hide Password

showPassword.addEventListener("change", function () {

    const type = this.checked ? "text" : "password";

    password.type = type;
    confirmPassword.type = type;

});


// Full Name Validation

function validateName() {

    const value = fullName.value.trim();

    if (
        value.length < 3 ||
        !/^[\p{L} .'-]+$/u.test(value)
    ) {

        showMessage(
            "nameMsg",
            "Enter a valid full name (minimum 3 characters)."
        );

        return false;

    }

    showMessage("nameMsg", "Name is valid.", "success");

    return true;
}


// Aadhaar Validation

function validateAadhaar() {

    const value = aadhaar.value.replace(/\s/g, "");

    if (!/^\d{12}$/.test(value)) {

        showMessage(
            "aadhaarMsg",
            "Enter a valid 12-digit Aadhaar number."
        );

        return false;

    }

    showMessage(
        "aadhaarMsg",
        "Aadhaar format is valid.",
        "success"
    );

    return true;
}


// Email Validation

function validateEmail() {

    const value = email.value.trim();

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(value)) {

        showMessage(
            "emailMsg",
            "Enter a valid email address."
        );

        return false;

    }

    showMessage("emailMsg", "Email is valid.", "success");

    return true;
}


// Date of Birth Validation

function validateDOB() {

    const value = dob.value;

    if (!value) {

        showMessage(
            "dobMsg",
            "Please select your date of birth."
        );

        return false;

    }

    const selectedDate = new Date(value + "T00:00:00");
    const currentDate = new Date(localToday + "T00:00:00");

    if (
        isNaN(selectedDate.getTime()) ||
        selectedDate > currentDate
    ) {

        showMessage(
            "dobMsg",
            "Future dates are not allowed."
        );

        return false;

    }

    showMessage("dobMsg", "Date of birth is valid.", "success");

    return true;
}


// Mobile Validation

function validateMobile() {

    const value = mobile.value.trim();

    if (!/^[6-9]\d{9}$/.test(value)) {

        showMessage(
            "mobileMsg",
            "Enter a valid 10-digit Indian mobile number."
        );

        return false;

    }

    showMessage("mobileMsg", "Mobile number is valid.", "success");

    return true;
}


// Password Validation

function validatePassword() {

    const value = password.value;

    const pattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!pattern.test(value)) {

        showMessage(
            "passMsg",
            "Use 8+ characters with uppercase, lowercase, number and symbol."
        );

        return false;

    }

    showMessage("passMsg", "Strong password.", "success");

    return true;
}


// Confirm Password Validation

function validateConfirmPassword() {

    if (!confirmPassword.value) {

        showMessage(
            "confirmMsg",
            "Please confirm your password."
        );

        return false;

    }

    if (password.value !== confirmPassword.value) {

        showMessage(
            "confirmMsg",
            "Passwords do not match."
        );

        return false;

    }

    showMessage(
        "confirmMsg",
        "Passwords match.",
        "success"
    );

    return true;
}


// Validate All Fields

function validateBasicFields() {

    clearMessages();

    const n = validateName();
    const a = validateAadhaar();
    const e = validateEmail();
    const d = validateDOB();
    const m = validateMobile();
    const p = validatePassword();
    const c = validateConfirmPassword();

    return n && a && e && d && m && p && c;
}


// Generate Six Digit OTP

function createOTP() {

    const random = new Uint32Array(1);

    if (window.crypto && window.crypto.getRandomValues) {

        window.crypto.getRandomValues(random);

        return String(random[0] % 1000000).padStart(6, "0");

    }

    return String(
        Math.floor(Math.random() * 1000000)
    ).padStart(6, "0");

}


// Send OTP - Frontend Demo

sendOtpBtn.addEventListener("click", function () {

    if (!validateBasicFields()) {

        return;

    }

    generatedOTP = createOTP();

    otpExpiry = Date.now() + 5 * 60 * 1000;

    otpAttempts = 0;

    otp.value = "";

    showMessage(
        "otpMsg",
        "Demo OTP: " + generatedOTP +
        " (Valid for 5 minutes)",
        "success"
    );

});


// Verify OTP

function verifyOTP() {

    const enteredOTP = otp.value.trim();

    if (!generatedOTP) {

        showMessage(
            "otpMsg",
            "Please generate OTP first."
        );

        return false;

    }

    if (Date.now() > otpExpiry) {

        generatedOTP = "";

        showMessage(
            "otpMsg",
            "OTP expired. Please request a new OTP."
        );

        return false;

    }

    if (!/^\d{6}$/.test(enteredOTP)) {

        showMessage(
            "otpMsg",
            "Enter a valid 6-digit OTP."
        );

        return false;

    }

    if (otpAttempts >= 5) {

        generatedOTP = "";

        showMessage(
            "otpMsg",
            "Too many attempts. Request a new OTP."
        );

        return false;

    }

    if (enteredOTP !== generatedOTP) {

        otpAttempts++;

        showMessage(
            "otpMsg",
            "Incorrect OTP. Attempts left: " +
            (5 - otpAttempts)
        );

        return false;

    }

    generatedOTP = "";

    showMessage(
        "otpMsg",
        "Email OTP verified successfully!",
        "success"
    );

    return true;

}


// Revalidate Confirm Password

confirmPassword.addEventListener("input", function () {

    if (this.value.length > 0) {

        validateConfirmPassword();

    }

});


// Registration Form Submission

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const valid = validateBasicFields();

    if (!valid) {

        return;

    }

    if (!verifyOTP()) {

        return;

    }

    alert("Registration successful!");

    form.reset();

    generatedOTP = "";
    otpExpiry = 0;
    otpAttempts = 0;

    clearMessages();

    password.type = "password";
    confirmPassword.type = "password";

});
