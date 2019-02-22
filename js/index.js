// detect mobile
let downloadsSection = document.querySelector(".section-downloads");
let getStartedHref = document.querySelector(".btn-text");

let isMobile = navigator.userAgent.toLowerCase().indexOf("mobile") !== -1 || 
  			   navigator.userAgent.toLowerCase().indexOf("iphone") !== -1 || 
  			   navigator.userAgent.toLowerCase().indexOf("android") !== -1 || 
			   navigator.userAgent.toLowerCase().indexOf("windows phone") !== -1;

isMobile ? downloadsSection.style.display = "none" : null; 
isMobile ? getStartedHref.href = "#demonstration" : "#downloads"; 

// fullpage.js

window.onload = () => {
	if (isMobile){
		let myFullpage = new fullpage('#fullpage', {
			paddingTop: "0vh"
		});
	} else {
		let myFullpage = new fullpage('#fullpage', {
			paddingTop: "2.5vh"
		});
	}
}



// show contact form
let emailIcon = document.querySelector(".social__icon--email");
let emailLink = document.querySelector("#email-text-link");
let emailFormDiv = document.querySelector(".section-email");
let footer = document.querySelector(".footer");

emailIcon.addEventListener("click", () => {
	emailFormDiv.style.display = "flex";
	emailFormDiv.style.justifyContent = "center";
	emailFormDiv.style.alignItems = "center";
	footer.style.marginTop = "-2.5vh";
	fullpage_api.moveTo(7, 1);
});

emailLink.addEventListener("click", () => {
	emailFormDiv.style.display = "flex";
	emailFormDiv.style.justifyContent = "center";
	emailFormDiv.style.alignItems = "center";
	footer.style.marginTop = "-2.5vh";
	fullpage_api.moveTo(7, 1);
});

// @TODO account for mobile version which has downloads section hidden additionally
// scroll past email section when hidden
window.onwheel = function(event){
	let index = fullpage_api.getActiveSection().index;

	// if scrolling down, currently on section before hidden one, and hidden section is...well, hidden, do the following
	if (event.deltaY > 0 && index === 6 && getComputedStyle(emailFormDiv).display === "none"){
		fullpage_api.moveSectionDown();
	}
	// same logic as before but scrolling up instead of down
	else if (event.deltaY < 0 && index === 6 && getComputedStyle(emailFormDiv).display === "none"){
		fullpage_api.moveSectionUp();
	}
}