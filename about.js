document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("caseForm");
const steps = [...form.querySelectorAll("fieldset")];
const pills = [...document.querySelectorAll("#progress li")];
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const errorBox = document.getElementById("formError");
const done = document.getElementById("done");
let current = 0;
let signed = false;
const otpSent = { phone: false, email: false };

document.getElementById("signDate").textContent = new Date().toLocaleString();

function show(i) {
  current = i;
  steps.forEach((s, n) => (s.hidden = n !== i));
  pills.forEach((p, n) => {
    p.classList.toggle("on", n === i);
    p.classList.toggle("ok", n < i);
  });
  backBtn.hidden = i === 0;
  nextBtn.textContent = i === steps.length - 1 ? "Sign and submit" : "Continue";
  errorBox.hidden = true;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fail(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
  return false;
}

// Demo only: a real service must send and check these codes on the server.
form.querySelectorAll("[data-send]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const kind = btn.dataset.send;
    const field = form.elements[kind];
    if (!field.value.trim()) return fail("Enter your " + kind + " first.");
    otpSent[kind] = true;
    form.elements[kind + "Otp"].disabled = false;
    form.elements[kind + "Otp"].focus();
    btn.textContent = "Resend code";
    errorBox.hidden = true;
  });
});

function validate(i) {
  const f = form.elements;
  const need = [...steps[i].querySelectorAll("[required]")];
  for (const el of need) {
    if (el.type === "checkbox" ? !el.checked : !el.value.trim()) {
      return fail("Complete every required field in this step.");
    }
  }
  if (i === 0) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) return fail("Enter a valid email address.");
    if (f.phone.value.replace(/\D/g, "").length < 8) return fail("Enter a valid phone number.");
    if (!otpSent.phone || !otpSent.email) return fail("Send and enter the codes for your phone and email.");
    if (!/^\d{6}$/.test(f.phoneOtp.value) || !/^\d{6}$/.test(f.emailOtp.value)) return fail("Enter the 6-digit codes.");
  }
  if (i === 2) {
    if (f.sigName.value.trim().toLowerCase() !== f.name.value.trim().toLowerCase()) {
      return fail("Your typed signature must match the name you gave in step 1.");
    }
    if (!signed) return fail("Draw your signature in the box.");
  }
  return true;
}

function caseNumber() {
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  return "FB-" + stamp + "-" + Math.floor(1000 + Math.random() * 9000);
}

nextBtn.addEventListener("click", () => {
  if (!validate(current)) return;
  if (current < steps.length - 1) return show(current + 1);

  // TODO: send the form data and signature image to your server here
  // (fetch POST). Verification, e-signature records, and storage of
  // documents must be handled securely server-side.
  const signature = document.getElementById("sigPad").toDataURL("image/png");
  void signature;
  document.getElementById("caseNo").textContent = caseNumber();
  form.hidden = true;
  document.getElementById("progress").hidden = true;
  done.hidden = false;
  done.focus();
});
backBtn.addEventListener("click", () => show(current - 1));

// signature pad
const pad = document.getElementById("sigPad");
const ctx = pad.getContext("2d");
ctx.lineWidth = 2.5;
ctx.lineCap = "round";
ctx.strokeStyle = "#0f2b33";
let drawing = false;

function pos(e) {
  const r = pad.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (pad.width / r.width), y: (e.clientY - r.top) * (pad.height / r.height) };
}
pad.addEventListener("pointerdown", (e) => {
  drawing = true;
  pad.setPointerCapture(e.pointerId);
  const p = pos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});
pad.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  const p = pos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  signed = true;
});
["pointerup", "pointercancel"].forEach((t) => pad.addEventListener(t, () => (drawing = false)));
document.getElementById("sigClear").addEventListener("click", () => {
  ctx.clearRect(0, 0, pad.width, pad.height);
  signed = false;
});