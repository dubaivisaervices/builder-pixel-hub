/* Report Visa Scam - Minimal JavaScript */
document.addEventListener("DOMContentLoaded", function () {
  console.log("Report Visa Scam website loaded");

  // Basic search functionality
  const searchInput = document.querySelector(
    'input[type="search"], input[placeholder*="search"]',
  );
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      console.log("Searching for:", e.target.value);
    });
  }

  // Basic form handling
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Form submitted");
      alert("Thank you for your report. We will investigate this scam.");
    });
  });

  // Basic button interactions
  const buttons = document.querySelectorAll("button, .btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      if (this.textContent.includes("Report")) {
        console.log("Report button clicked");
      }
    });
  });
});
