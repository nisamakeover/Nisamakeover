/* ============================================================
   NISA MAKEOVER — script.js
   Simple WhatsApp Booking — No Calendly, No Backend
   ============================================================ */

const WA_NUMBER = "917993323149"; // +91 79933 23149

document.addEventListener("DOMContentLoaded", () => {

  /* ── 1. NAVBAR SCROLL ── */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  /* ── 2. HAMBURGER ── */
  const hamburger  = document.getElementById("hamburger");
  const mobileNav  = document.getElementById("mobileNav");
  const mobileClose = document.getElementById("mobileClose");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileNav.classList.toggle("open");
    document.body.style.overflow = mobileNav.classList.contains("open") ? "hidden" : "";
  });

  mobileClose.addEventListener("click", closeMobileNav);
  document.querySelectorAll(".mobile-link").forEach(l => l.addEventListener("click", closeMobileNav));

  function closeMobileNav() {
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ── 3. SCROLL REVEAL ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll(".reveal")];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add("visible"), idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  /* ── 4. SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      }
    });
  });

  /* ── 5. ACTIVE NAV ── */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  window.addEventListener("scroll", () => {
    let cur = "";
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navLinks.forEach(l => { l.style.color = l.getAttribute("href") === `#${cur}` ? "var(--gold)" : ""; });
  });

  /* ── 6. MIN DATE ── */
  const dateInput = document.getElementById("pdate");
  if (dateInput) dateInput.setAttribute("min", new Date().toISOString().split("T")[0]);

  /* ══════════════════════════════════════════════
     3-STEP BOOKING FORM
  ══════════════════════════════════════════════ */

  let currentStep = 1;

  /* Mode Toggle (Home / Studio) */
  const modeBtns = document.querySelectorAll(".mode-btn");
  const serviceModeInput = document.getElementById("serviceMode");
  const addressField = document.getElementById("address-field");

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      serviceModeInput.value = btn.dataset.mode;
      addressField.style.display = btn.dataset.mode === "Home Service" ? "flex" : "none";
    });
  });

  /* Service Pills */
  const pills = document.querySelectorAll(".pill");
  const serviceInput = document.getElementById("service");

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("selected"));
      pill.classList.add("selected");
      serviceInput.value = pill.dataset.service;
    });
  });

  /* Step Navigation */
  document.querySelectorAll(".next-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const nextStep = parseInt(btn.dataset.next);
      if (validateStep(currentStep)) goToStep(nextStep);
    });
  });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      goToStep(parseInt(btn.dataset.back));
    });
  });

  function goToStep(n) {
    document.querySelectorAll(".form-step").forEach(s => s.classList.add("hidden"));
    document.getElementById(`step${n}`).classList.remove("hidden");

    // Update step indicators
    document.querySelectorAll(".step").forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.remove("active", "done");
      if (sn === n) s.classList.add("active");
      else if (sn < n) s.classList.add("done");
    });

    currentStep = n;

    // Build summary on step 3
    if (n === 3) buildSummary();

    // Scroll to booking form top
    const bookingCard = document.querySelector(".booking-card") || document.getElementById("booking");
    window.scrollTo({ top: bookingCard.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  }

  /* Validation */
  function validateStep(step) {
    if (step === 1) {
      const name   = document.getElementById("fname").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
      const mode   = serviceModeInput.value;
      const addr   = document.getElementById("address").value.trim();

      if (!name) { showToast("⚠️ Please enter your name."); return false; }
      if (!mobile || mobile.replace(/\D/g,'').length < 10) { showToast("⚠️ Please enter a valid 10-digit mobile number."); return false; }
      if (mode === "Home Service" && !addr) { showToast("⚠️ Please enter your address for home service."); return false; }
      return true;
    }
    if (step === 2) {
      const service = serviceInput.value;
      const date    = document.getElementById("pdate").value;
      const time    = document.getElementById("ptime").value;

      if (!service) { showToast("⚠️ Please select a service."); return false; }
      if (!date)    { showToast("⚠️ Please select a preferred date."); return false; }
      if (!time)    { showToast("⚠️ Please select a preferred time slot."); return false; }
      return true;
    }
    return true;
  }

  /* Build Summary */
  function buildSummary() {
    const name    = document.getElementById("fname").value.trim();
    const mobile  = document.getElementById("mobile").value.trim();
    const service = serviceInput.value;
    const mode    = serviceModeInput.value;
    const date    = document.getElementById("pdate").value;
    const time    = document.getElementById("ptime").value;
    const address = document.getElementById("address").value.trim();
    const notes   = document.getElementById("notes").value.trim();

    const formattedDate = new Date(date).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

    const items = [
      { label: "Name",         value: name },
      { label: "Mobile",       value: mobile },
      { label: "Service",      value: service },
      { label: "Mode",         value: mode },
      { label: "Date",         value: formattedDate },
      { label: "Time",         value: time },
    ];
    if (mode === "Home Service" && address) items.push({ label: "Address", value: address });
    if (notes) items.push({ label: "Notes", value: notes });

    const grid = document.getElementById("summaryGrid");
    grid.innerHTML = items.map(i => `
      <div class="summary-item">
        <label>${i.label}</label>
        <p>${i.value}</p>
      </div>
    `).join("");
  }

  /* WhatsApp Submit */
  document.getElementById("bookingSubmit").addEventListener("click", () => {
    const name    = document.getElementById("fname").value.trim();
    const mobile  = document.getElementById("mobile").value.trim();
    const service = serviceInput.value;
    const mode    = serviceModeInput.value;
    const date    = document.getElementById("pdate").value;
    const time    = document.getElementById("ptime").value;
    const address = document.getElementById("address").value.trim();
    const notes   = document.getElementById("notes").value.trim();

    const formattedDate = new Date(date).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

    let msg = `Hello NISA MAKEOVER 💄\n\n`;
    msg += `I would like to book an appointment.\n\n`;
    msg += `*Name:* ${name}\n`;
    msg += `*Mobile:* ${mobile}\n`;
    msg += `*Service:* ${service}\n`;
    msg += `*Mode:* ${mode}\n`;
    msg += `*Date:* ${formattedDate}\n`;
    msg += `*Time:* ${time}\n`;
    if (mode === "Home Service" && address) msg += `*Address:* ${address}\n`;
    if (notes) msg += `*Notes:* ${notes}\n`;
    msg += `\nPlease confirm my slot. Thank you! ✨`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  });

});

/* Toast */
function showToast(msg) {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--black-light);border:1px solid rgba(201,168,76,0.4);color:var(--ivory);padding:14px 28px;border-radius:4px;font-family:var(--font-body);font-size:14px;z-index:9999;opacity:0;transition:all 0.3s ease;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.4);`;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity="1"; t.style.transform="translateX(-50%) translateY(0)"; });
  setTimeout(() => { t.style.opacity="0"; setTimeout(()=>t.remove(),300); }, 3500);
}
