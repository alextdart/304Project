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

async function fetchAndDisplayGroceryList() {
    const mealPlanID = document.getElementById(`fetchGroceryListMealPlanID`);
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

window.onload = function() {
    document.getElementById("fetchMealPlanBtn").addEventListener("click", fetchAndDisplayMealPlans);
    document.getElementById("fetchGroceryListBtn").addEventListener("click", fetchAndDisplayGroceryList);
};