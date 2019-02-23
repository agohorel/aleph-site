// selectors
let emailIcon = document.querySelector(".social__icon--email");
let emailLink = document.querySelector("#email-text-link");
let emailFormDiv = document.querySelector(".section-email");
let footer = document.querySelector(".footer");
let downloadsSection = document.querySelector(".section-downloads");
let getStartedHref = document.querySelector(".btn-text");

// detect mobile
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

		// @TODO make this apply to touch events instead of mousewheel
		window.onwheel = function(event){
			let index = fullpage_api.getActiveSection().index;

			// skip hidden downloads and/or email sections on mobile when scrolling down
			if (event.deltaY > 0 && index === 3 || event.deltaY > 0 && index === 5 && getComputedStyle(emailFormDiv).display === "none"){
				fullpage_api.moveSectionDown();
			}
			// skip hidden downloads and/or email sections section on mobile when scrolling down
			else if (event.deltaY < 0 && index === 4 || event.deltaY < 0 && index === 6 && getComputedStyle(emailFormDiv).display === "none"){
				fullpage_api.moveSectionUp();
			}
		}

	} else {
		let myFullpage = new fullpage('#fullpage', {
			paddingTop: "2.5vh"
		});

		window.onwheel = function(event){
			let index = fullpage_api.getActiveSection().index;

			if (event.deltaY > 0 && index === 6 && getComputedStyle(emailFormDiv).display === "none"){
				fullpage_api.moveSectionDown();
			}

			else if (event.deltaY < 0 && index === 6 && getComputedStyle(emailFormDiv).display === "none"){
				fullpage_api.moveSectionUp();
			}
		}
	}
}

// show contact form
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