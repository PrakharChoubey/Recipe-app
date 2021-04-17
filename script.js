const mealsEl = document.getElementById("meals");
const SavedContainer = document.getElementById("SavedMeals");
const mealPopup = document.getElementById("meal-popup");
const mealPopupBtn = document.getElementById("close-popup");
const mealInfoContentEl = document.getElementById("meal-info-content");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];
  console.log("Current Random Meal", randomMeal);
  addMeal(randomMeal, true);
}
async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );
  const respData = await resp.json();
  const meal = respData.meals[0];
  // console.log(meal);
  return meal;
}
async function getMealBySearch(name) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + name
  );
  const respData = await resp.json();
  const meals = respData.meals;
  return meals;
}

searchBtn.addEventListener("click", async () => {
  mealsEl.innerHTML = ``;
  const search = searchTerm.value;
  const meals = await getMealBySearch(search);
  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  } else {
    mealsEl.innerHTML = `<div class="No-Result ">
    <img src="./NotFound.png" alt="Not-Found">
       <h3>Result_Not_Found!!</h3>
        </div>`;
  }
});

function addMeal(mealData, bool = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
          <div class="meal-header">
            ${bool ? `<span class="random"> Random recipe </span>` : ``}
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
          </div>
          <div class="meal-body">
            <h4> ${mealData.strMeal}</h4>
            <button id="heart" ><i class="far fa-heart" id="heartb"></i></button>
          </div>`;

  const btn = meal.querySelector(".meal-body #heart i");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("fas");
      btn.classList.add("far");
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("fas");
      btn.classList.remove("far");
      btn.classList.add("active");
    }
    fetchFavMeals();
  });
  meal.addEventListener("click", function (e) {
    if (e.target.id === "heartb") {
    } else showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}
function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}
function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds;
}
async function fetchFavMeals() {
  SavedContainer.innerHTML = ``;

  const mealIds = getMealsFromLS();
  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    saveTheMeal(meal);
    console.log(meal);
  }
}
function saveTheMeal(mealData) {
  const SavedMeal = document.createElement("li");

  SavedMeal.innerHTML = `
  <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
  <span>${mealData.strMeal}</span>
   <button class="clear" ><i class="fas fa-window-close" id="closeb"></i></button>
            `;
  const btn = SavedMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);
    fetchFavMeals();
  });
  SavedContainer.appendChild(SavedMeal);
  SavedMeal.addEventListener("click", (e) => {
    if (e.target.id === "closeb") {
    } else showMealInfo(mealData);
  });
}
mealPopupBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
function showMealInfo(mealData) {
  mealInfoContentEl.innerHTML = ``;
  const mealEl = document.createElement("div");

  const Ingredients = [];
  // Get Ingredients and measures
  for (let i = 1; i < 20; i++) {
    if (mealData["strIngredient" + i]) {
      Ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }
  mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
          src="${mealData.strMealThumb}"
          alt="${mealData.strMeal}"
        />
        <p>
          ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
        ${Ingredients.map(
          (ing) => `
        <li>${ing}</li>`
        ).join("")}
        </ul>
        `;
  mealInfoContentEl.appendChild(mealEl);
  mealPopup.classList.remove("hidden");
}
