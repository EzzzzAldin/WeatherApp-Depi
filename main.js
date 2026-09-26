async function getCoordinates(city) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`,
  );

  const data = await response.json();
  // Validation
  if (!data.results || data.results.length === 0) {
    throw new Error("City not Found");
  }

  const place = data.results[0];

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    country: place.country,
  };
}

async function getWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`,
  );

  const data = await response.json();

  return {
    temp: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day,
  };
}

function getWeatherState(isDay, weatherCode, temp) {
  const time = isDay === 1 ? "day" : "night";

  let condition;

  // rain | hot | normal
  if (weatherCode >= 51) {
    condition = "rain";
  } else if (temp >= 30) {
    condition = "hot";
  } else {
    condition = "normal";
  }

  return `${time}-${condition}`;
}

async function test() {
  const data = await getCoordinates("tokyo");
  const weather = await getWeather(data.latitude, data.longitude);

  const state = getWeatherState(
    weather.isDay,
    weather.weatherCode,
    weather.temp,
  );
  console.log(data);
  console.log(weather);
  console.log(state.replace("-", " "));
}

test();

// Part 2 (Dom)
const bgLayer = document.querySelector("#bgLayer");
const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const resultCard = document.querySelector("#resultCard");
const resultCity = document.querySelector("#resultCity");
const resultTemp = document.querySelector("#resultTemp");
const resultCondition = document.querySelector("#resultCondition");
const statusText = document.querySelector("#statusText");

// Render
function render(state, place, weather) {
  bgLayer.className = "bg-layer " + state;

  resultCity.textContent = `${place.name} , ${place.country}`;
  resultTemp.textContent = `${Math.round(weather.temp)}`;
  resultCondition.textContent = state.replace("-", " ");

  resultCard.hidden = false;
}

// Events
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value;
  statusText.innerHTML = "Loading....";
  resultCard.hidden = true;

  try {
    const data = await getCoordinates(city);
    const weather = await getWeather(data.latitude, data.longitude);

    const state = getWeatherState(
      weather.isDay,
      weather.weatherCode,
      weather.temp,
    );

    render(state, data, weather);
    statusText.innerHTML = "";
  } catch (error) {
    statusText.innerHTML = error.message;
  }
});
