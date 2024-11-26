// Fetches data from the MealPlans and displays them.
async function fetchAndDisplayMealPlans() {
    const userID = document.getElementById('fetchMealPlanUserId').value;
    const messageElement = document.getElementById('fetchMealPlanMsg');

    if (userID === "") {
        console.log("No UserID inputted");
        messageElement.textContent = "No UserID inputted."
        return;
    }

    const tableElement = document.getElementById('mealPlan');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/meal-plan/from-user/${userID}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (responseData.success) {
        messageElement.textContent = `Successfully fetched ${tableContent.length} row(s)`;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        tableContent.forEach((row) => {
            const newRow = tableBody.insertRow();
            row.forEach((field, index) => {
                const cell = newRow.insertCell(index);
                cell.textContent = field;
            });
        });
    } else {
        messageElement.textContent = `Error fetching mealplans for User with ID: ${userID}`;
    }
}

async function deleteMealPlan() {
    const mealPlanID = document.getElementById(`deleteMealPlanID`).value;
    const messageElement = document.getElementById('deleteMealPlanMsg');

    if (mealPlanID === "") {
        console.log("No mealPlanID inputted");
        messageElement.textContent = "No Meal Plan ID inputted."
        return;
    }

    const response = await fetch(`/meal-plan/${mealPlanID}`, {
        method: 'DELETE'
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.textContent = `Successfully deleted Meal Plan ${mealPlanID}`;
    } else {
        messageElement.textContent = `Error deleting Meal Plan ${mealPlanID}`;
    }
}

async function fetchAndDisplayGroceryList() {
    const mealPlanID = document.getElementById(`fetchGroceryListMealPlanID`).value;
    const messageElement = document.getElementById('fetchGroceryListMsg');

    if (mealPlanID === "") {
        console.log("No mealPlanID inputted");
        messageElement.textContent = "No Meal Plan ID inputted."
        return;
    }

    const tableElement = document.getElementById('groceryList');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/grocery-list/from-meal-plan/${mealPlanID}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (responseData.success) {
        messageElement.textContent = `Successfully fetched ${tableContent.length} row(s)`;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        tableContent.forEach((row) => {
            const newRow = tableBody.insertRow();
            row.forEach((field, index) => {
                const cell = newRow.insertCell(index);
                cell.textContent = field;
            });
        });
    } else {
        messageElement.textContent = `Error fetching grocery lists for meal plan with ID: ${mealPlanID}`;
    }
}

async function fetchAndDisplayRecipes() {
    const mealPlanID = document.getElementById(`fetchRecipeMealPlanID`).value;
    const messageElement = document.getElementById('fetchRecipeMsg');

    if (mealPlanID === "") {
        console.log("No mealPlanID inputted");
        messageElement.textContent = "No Meal Plan ID inputted."
        return;
    }

    const tableElement = document.getElementById('recipes');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/recipe/nutritional-info/from-meal-plan/${mealPlanID}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (responseData.success) {
        messageElement.textContent = `Successfully fetched ${tableContent.length} row(s)`;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        tableContent.forEach((row) => {
            const newRow = tableBody.insertRow();
            row.forEach((field, index) => {
                const cell = newRow.insertCell(index);
                cell.textContent = field;
            });
        });
    } else {
        messageElement.textContent = `Error fetching recipes for meal plan with ID: ${mealPlanID}`;
    }
}

window.onload = function() {
    document.getElementById("fetchMealPlanBtn").addEventListener("click", fetchAndDisplayMealPlans);
    document.getElementById("fetchGroceryListBtn").addEventListener("click", fetchAndDisplayGroceryList);
    document.getElementById("fetchRecipesBtn").addEventListener("click", fetchAndDisplayRecipes);
    document.getElementById("deleteMealPlanBtn").addEventListener("click", deleteMealPlan);
};