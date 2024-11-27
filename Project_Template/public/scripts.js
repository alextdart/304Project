/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const nameValue = document.getElementById('insertName').value;

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

// Inserts new ingredient into a recipe in RecipeHasIngredient table.
async function insertRecipeHasIngredient(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertRecipeID').value;
    const nameValue = document.getElementById('insertIngredientName').value;
    const quantityValue = document.getElementById('insertQuantity').value;

    const response = await fetch('/insert-recipehasingredient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipeID: idValue,
            ingredientName: nameValue,
            quantity: quantityValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertIngredientResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Ingredient inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "RecipeID and Ingredient Name must exist prior to insert, and cannot be paired already.";
    }
}

// Fetches data from the RecipeHasIngredient table and displays it.
async function fetchAndDisplayRecipeHasIngredient() {
    const tableElement = document.getElementById('recipeHasIngredientTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/recipeHasIngredient', {
        method: 'GET',
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = ''; // Clear old data
    }

    tableContent.forEach((row) => {
        const newRow = tableBody.insertRow();
        row.forEach((field, index) => {
            const cell = newRow.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetches data from the Recipe table and displays it.
async function fetchAndDisplayRecipe() {
    const tableElement = document.getElementById('recipeTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/recipe', {
        method: 'GET',
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = ''; // Clear old data
    }

    tableContent.forEach((row) => {
        const newRow = tableBody.insertRow();
        row.forEach((field, index) => {
            const cell = newRow.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetches data from the Ingredient table and displays it.
async function fetchAndDisplayIngredient() {
    const tableElement = document.getElementById('ingredientTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/ingredient', {
        method: 'GET',
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = ''; // Clear old data
    }

    tableContent.forEach((row) => {
        const newRow = tableBody.insertRow();
        row.forEach((field, index) => {
            const cell = newRow.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetches data from the Client table and displays it.
async function fetchAndDisplayClient() {
    const tableElement = document.getElementById('clientTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/client', {
        method: 'GET',
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = ''; // Clear old data
    }

    tableContent.forEach((row) => {
        const newRow = tableBody.insertRow();
        row.forEach((field, index) => {
            const cell = newRow.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Finds all recipes with a rating equal or greater than the specified amount
async function selectRating(event) {
    event.preventDefault();

    const overallRatingValue = document.getElementById('selectOverallRating').value;

    const response = await fetch('/select-overallRating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            overallRating: overallRatingValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('selectRatingMsg');
    const tableBody = document.querySelector("#recipesWithRating tbody");

    if (responseData.success) {
        messageElement.textContent = "Recipes found!";
        tableBody.innerHTML = ""; // Clear existing rows

        responseData.data.forEach((recipe) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${recipe.ID}</td>
                <td>${recipe.USERID}</td>
                <td>${recipe.NAME}</td>
                <td>${recipe.AUTHOR}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        messageElement.textContent = "Error finding recipes!";
    }
}

// Updates names in the demotable.
async function updateNameDemotable(event) {
    event.preventDefault();

    const oldNameValue = document.getElementById('updateOldName').value;
    const newNameValue = document.getElementById('updateNewName').value;

    const response = await fetch('/update-name-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldName: oldNameValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}

// Finds the total calories for each recipe, group by recipe
async function aggregateCalories() {
    const response = await fetch("/aggregate-Calories", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('aggregateCaloriesMsg');
    const tableBody = document.querySelector("#totalCaloriesPerRecipe tbody");

    if (responseData.success) {
        messageElement.textContent = "Calories per recipe calculated!";
        tableBody.innerHTML = ""; // Clear existing rows

        responseData.data.forEach((row) => {
            const totalCalories = row[0];
            const recipeName = row[1];

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${totalCalories}</td>
                <td>${recipeName}</td>
            `;
            tableBody.appendChild(newRow);
        });
    } else {
        messageElement.textContent = "Error calculating total calories!";
    }
}

// Finds the total calories for each recipe, group by recipe
async function findAllergicPeople() {
    const response = await fetch("/division-AllergicPeople", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('findAllergicPeopleMsg');
    const tableBody = document.querySelector("#allergicPeople tbody");

    if (responseData.success) {
        messageElement.textContent = "Users with all allergies found!";
        tableBody.innerHTML = "";

        responseData.users.forEach((user) => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${user.fullName}</td>
            `;
            tableBody.appendChild(newRow);
        });
    } else {
        messageElement.textContent = "Error calculating users with every allergy!";
    }
}

async function updateUserInfo(event) {
    event.preventDefault();

    const existingUserID = parseInt(document.getElementById('existingUserID').value, 10);
    const fullName = document.getElementById('fullName').value;
    const country = document.getElementById('country').value;
    const cuisine = document.getElementById('cuisine').value;
    const diet = document.getElementById('diet').value;
    const groceryStore = document.getElementById('groceryStore').value;
    const response = await fetch('/user/updateInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            existingUserID: existingUserID,
            newFullName: fullName,
            newCountry: country,
            newCuisine: cuisine,
            newDiet: diet,
            newGroceryStore: groceryStore
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateUserInfoResultMsg');
    if (responseData.success) {
        messageElement.textContent = "User information updated";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating user information";
    }
}

async function fetchSelectedNutritionalInfo(event) {
    event.preventDefault();

    const calories = document.getElementById('calories').checked;
    const fat = document.getElementById('fat').checked;
    const protein = document.getElementById('protein').checked;

    const queryParams = new URLSearchParams({
        calories: calories ? 'true' : 'false',
        fat: fat ? 'true' : 'false',
        protein: protein ? 'true' : 'false'
    });

    const response = await fetch(`/nutritional-info?${queryParams.toString()}`);
    const responseData = await response.json();
    const messageElement = document.getElementById('nutritionalInfoResultMsg');
    const table = document.getElementById('nutritionalInfoTable');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');

    if (responseData.data) {
        messageElement.textContent = "Information retrieved";

        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        // headers
        const selectedFields = responseData.data.metaData.map((column) => column.name);
        const headerRow = document.createElement('tr');

        selectedFields.forEach((field) => {
            const headerCell = document.createElement('th');
            headerCell.textContent = field.charAt(0).toUpperCase() + field.slice(1).toLowerCase();
            headerRow.appendChild(headerCell);
        });
        tableHead.appendChild(headerRow);

        // rows
        responseData.data.rows.forEach((row) => {
            const newRow = document.createElement('tr');
            row.forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value ?? '';
                newRow.appendChild(cell);
            });
            tableBody.appendChild(newRow);
        });
    } else {
        messageElement.textContent = "Error fetching nutritional information";
    }
}

async function fetchUsersWithMinMealPlans(event) {
    event.preventDefault();

    const minMealPlans = document.getElementById('minMealPlans').value;

    const response = await fetch(`/users/meal-plans?minMealPlans=${minMealPlans}`);
    const responseData = await response.json();
    const messageElement = document.getElementById('usersWithMinMealPlansResultMsg');
    const tableBody = document.querySelector("#usersWithMinMealPlansTable tbody");

    if (responseData.success) {
        messageElement.textContent = "Users found";
        tableBody.innerHTML = '';
        console.log(responseData)
        responseData.data.forEach((user) => {
            const newRow = tableBody.insertRow();
            newRow.innerHTML = `
                <td>${user.userID}</td>
                <td>${user.mealPlanCount}</td>
            `;
        });
    } else {
        messageElement.textContent = "Error fetching users";
    }
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    document.getElementById("insertIngredient").addEventListener("submit", insertRecipeHasIngredient);
    document.getElementById("selectRatingForm").addEventListener("submit", selectRating);
    //document.getElementById("updateNameDemotable").addEventListener("submit", updateNameDemotable);
    document.getElementById("countDemotable").addEventListener("click", countDemotable);
    document.getElementById("aggregateCalories").addEventListener("click", aggregateCalories);
    document.getElementById("findAllergicPeople").addEventListener("click", findAllergicPeople);
    document.getElementById("updateUserInfoForm").addEventListener("submit", updateUserInfo);
    document.getElementById("nutritionalInfoForm").addEventListener("submit", fetchSelectedNutritionalInfo);
    //document.getElementById("fetchUsersWithMinMealPlansForm").addEventListener("submit", fetchUsersWithMinMealPlans);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
    fetchAndDisplayRecipeHasIngredient();
    fetchAndDisplayIngredient();
    fetchAndDisplayRecipe();
    fetchAndDisplayClient();
}
