// Fetches data from the MealPlans and displays them.
async function fetchAndDisplayMealPlans(userID) {
    const tableElement = document.getElementById('mealPlan');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/meal-plan/${userID}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const mealPlanContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    mealPlanContent.forEach(mp => {
        const row = tableBody.insertRow();
        mp.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// window.onload = function() {
// };