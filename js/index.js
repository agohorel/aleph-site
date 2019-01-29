let emailIcon = document.querySelector(".social__icon--email");
let emailLink = document.querySelector("#email-text-link");
let emailFormDiv = document.querySelector(".section-email");

emailIcon.addEventListener("click", () => {
	emailFormDiv.style.display = "block";
});

emailLink.addEventListener("click", () => {
	emailFormDiv.style.display = "block";
});