// show contact form

let emailIcon = document.querySelector(".social__icon--email");
let emailLink = document.querySelector("#email-text-link");
let emailFormDiv = document.querySelector(".section-email");
let footer = document.querySelector(".footer");

emailIcon.addEventListener("click", () => {
	emailFormDiv.style.display = "block";
	footer.style.marginTop = "-2.5vh";
	fullpage_api.moveTo(7, 1);
});

emailLink.addEventListener("click", () => {
	emailFormDiv.style.display = "block";
	footer.style.marginTop = "-2.5vh";
	fullpage_api.moveTo(7, 1);
});

// detect mobile

let downloadsSection = document.querySelector(".section-downloads");
let getStartedHref = document.querySelector(".btn-text");

let isMobile = navigator.userAgent.toLowerCase().indexOf("mobile") !== -1 || 
  			   navigator.userAgent.toLowerCase().indexOf("iphone") !== -1 || 
  			   navigator.userAgent.toLowerCase().indexOf("android") !== -1 || 
			   navigator.userAgent.toLowerCase().indexOf("windows phone") !== -1;

isMobile ? downloadsSection.style.display = "none" : null; 
isMobile ? getStartedHref.href = "#demonstration" : "#downloads"; 