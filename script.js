// dom items
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".user-info-container");
const loadingScreen = document.querySelector(".loading-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const errorScreen = document.querySelector(".error");

// variables
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
let oldTab = userTab;
oldTab.classList.add("current-tab");
getFromSessionStorage();

// functions
function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // if search form container is invisible then making it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            // switching from search to weather tab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // now i am in wetaher tab so lets check local storage for weather coordinates
            getFromSessionStorage(); 
        }
    }
};

// check if coordinates are already present in session storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (localCoordinates) {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    } else {
        grantAccessContainer.classList.add("active");
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grant container invisible
    grantAccessContainer.classList.remove("active");
    errorScreen.classList.remove("active");
    // loader visible
    loadingScreen.classList.add("active");
    // API CALL
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);

    } catch (err) {
        loadingScreen.classList.remove("active");
        // userInfoContainer.classList.remove("active");
        errorScreen.classList.add("active");
    }
};

function renderWeatherInfo(weatherInfo) {
    // firstly we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]")
    const desc = document.querySelector("[data-weatherDesc]")
    const weatherIcon= document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");   

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("No Geolocation Detected");
    }
};

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("uder-cordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
};

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active")
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorScreen.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
        const data = await response.json();

        loadingScreen.classList.remove("active");
        renderWeatherInfo(data);
        userInfoContainer.classList.add("active");
    } catch (error) {
        console.error("Error fetching weather data:", error);
        userInfoContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        errorScreen.classList.add("active");
    }   
};


// events
userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

grantAccessButton.addEventListener("click", getLocation);

let searchInput = document.querySelector("[data-searchInput]")
searchForm.addEventListener("submit", (event) => {

    const searchInputValue = searchInput.value.trim();

    event.preventDefault();
    if (searchInputValue === "") {
        return;
    }
    fetchSearchWeatherInfo(searchInputValue);
    searchForm.reset();
});
