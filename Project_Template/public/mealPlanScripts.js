// Fetches data from the MealPlans and displays them.
async function fetchAndDisplayMealPlans() {
    const userID = document.getElementById('fetchMealPlanUserId').value;

    if (userID === "") {
        console.log("No UserID inputted");
        return;
    }

    const tableElement = document.getElementById('mealPlan');
    const messageElement = document.getElementById('fetchMealPlanMsg');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/meal-plan/${userID}`, {
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

window.onload = function() {
    document.getElementById("fetchMealPlanBtn").addEventListener("click", fetchAndDisplayMealPlans);
};