const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertIngredient(id, name, quantity) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (:id, :name, :quantity)`,
            [id, name, quantity],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function selectOverallRating(overallRating) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT ra.overallRating, ra.userID, re.name, re.author
             FROM rating ra, recipe re
             WHERE ra.recipeID = re.ID AND overallRating >= :overallRating`,
            [overallRating]
        );

        // Map rows to objects for better readability
        return result.rows.map(row => ({
            ID: row[0],
            USERID: row[1],
            NAME: row[2],
            AUTHOR: row[3],
        }));
    }).catch((error) => {
        console.error(error);
        return false;
    });
}

async function getRecipeHasIngredientData() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT recipeID, ingredientName, quantity FROM RecipeHasIngredient`
        );
        return result.rows;
    });
}

async function getRecipeData() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT ID, name, author FROM Recipe`
        );
        return result.rows;
    });
}

async function getIngredientData() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT name, foodGroup FROM Ingredient`
        );
        return result.rows;
    });
}

async function getClientData() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Client`
        );
        return result.rows;
    });
}

async function totalCaloriesPerRecipe() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT r.name AS recipeName, SUM(ini.calories) AS totalCalories
             FROM recipe r
             JOIN recipeHasIngredient ri ON r.ID = ri.recipeID
             JOIN ingredient i ON ri.ingredientName = i.name
             JOIN ingredientNutritionalInfo ini ON i.name = ini.name
             GROUP BY r.name`
        );
        return result.rows; // Return rows directly
    }).catch((error) => {
        console.error("Database Error:", error); // Debugging
        return null;
    });
}

async function findAllergicPeople() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT c.fullName as "Full Name"
             FROM client c
             WHERE NOT EXISTS (
                 (SELECT a.type
                  FROM allergy a)
                 MINUS
                 (SELECT uha.allergyType
                 FROM userHasAllergy uha
                 WHERE uha.userID = c.userID)
                       )`
        );
        return result.rows.map((row) => ({
            fullName: row[0],
        }));
    }).catch((error) => {
        console.error("Database Error:", error);
        return null;
    });
}

// deletes specified MealPlan
async function deleteMealPlan(mealplanID) {

    const IDAsNumber = Number(mealplanID);
    if (isNaN(IDAsNumber)) {
        console.error(`Invalid calories: ${mealplanID}`);
        return null;
    }

    return await withOracleDB(async (connection) => {
        const primaryCheck = await connection.execute(`
            SELECT *
            FROM MEALPLAN
        `);
        console.log("Primary Check");
        console.log(primaryCheck.rows);
        const result = await connection.execute(`
            DELETE 
            FROM MEALPLAN 
            WHERE MEALPLANID = ${IDAsNumber}
        `);
        console.log("DELETE result");
        console.log(result);

        await connection.commit();

        const secondaryCheck = await connection.execute(`
            SELECT *
            FROM MEALPLAN
        `);
        console.log("Secondary Check");
        console.log(secondaryCheck.rows);
        return true;
    }).catch(() => {
        console.log(`Failed to delete Meal Plan with ID: ${mealplanID}`);
        return false;
    });
}

// gets all recipes with total calories over a given number. Returns list of Recipe Names.
async function getRecipesWithCaloriesOver(calories) {
    const caloriesAsNumber = Number(calories);
    if (isNaN(caloriesAsNumber)) {
        console.error(`Invalid calories: ${calories}`);
        return null;
    }

    return await withOracleDB(async (connection) => {
        result = await connection.execute(`
            SELECT r.NAME, SUM(rhi.QUANTITY * ini.CALORIES) AS TotalCalories
            FROM RECIPE r 
                JOIN RECIPEHASINGREDIENT rhi ON r.ID = rhi.RECIPEID 
                JOIN INGREDIENTNUTRITIONALINFO ini ON rhi.INGREDIENTNAME = ini.NAME
            GROUP BY r.NAME
            HAVING SUM(rhi.QUANTITY * ini.CALORIES) > ${caloriesAsNumber}
        `);
        return result.rows;
    }).catch(() => {
        console.log(`Failed to get recipes with calories over ${caloriesAsNumber}`);
        return null;
    });
}

// gets meal plan created by a given user
async function getMealPlansCreatedBy(userID) {
    const userIdAsNumber = Number(userID);
    if (isNaN(userIdAsNumber)) {
        console.error(`Invalid userID: ${userID}`);
        return null;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT mp.*
            FROM MEALPLAN mp, USERCREATESMEALPLAN ucmp
            WHERE mp.MEALPLANID = ucmp.MEALPLANID AND ucmp.USERID = ${userIdAsNumber}
            `);
        return result.rows;
    }).catch(() => {
        console.error(`Failed to get Meal Plans Created By User with ID: ${userIdAsNumber}`);
        return null;
    });
}


// gets ingredients in a grocery list assosciated with a mealPlan.
async function getIngredientsInGroceryListAssosciatedWith(mealPlanID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT gci.INGREDIENTNAME 
            FROM GROCERYLISTCONTAINSINGREDIENT gci, MEALPLAN mp
            WHERE mp.MEALPLANID = ${mealPlanID} AND mp.GROCERYLISTID = gci.GROCERYLISTID
        `);
        return result.rows;
    }).catch(() => {
        console.log(`Failed to get Ingredients in the Grocery List Assosciated with MealPlanID: ${mealPlanID}`);
        return null;
    });
}

// gets all the sums of the nutritional info of all of the ingredients in a recipe
async function getTotalNutrionalInfoInRecipesFromMealPlan(mealPlanID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT r.NAME, SUM(rhi.QUANTITY * ini.CALORIES) AS TotalCalories, SUM(rhi.QUANTITY * ini.FAT) AS TotalFat,
                   SUM(rhi.QUANTITY * ini.PROTEIN) AS TotalProtein
            FROM MEALPLANCONTAINSRECIPE mp
                     JOIN RECIPE r on mp.RECIPEID = r.ID
                     JOIN RECIPEHASINGREDIENT rhi ON r.ID = rhi.RECIPEID
                     JOIN INGREDIENTNUTRITIONALINFO ini ON rhi.INGREDIENTNAME = ini.NAME
            WHERE mp.MEALPLANID = ${mealPlanID}
            GROUP BY r.NAME
        `);
        return result.rows;
    }).catch(() => {
        console.log(`Failed to get total nutrional info in recipe with ID: ${recipeID}`);
        return null;
    })
}

async function getRecipesWithAtleastOneIngredientInNumberOfRecipes(numRecipes) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT DISTINCT r.NAME
            FROM RECIPE r
                JOIN RECIPEHASINGREDIENT rhi ON r.ID = rhi.RECIPEID
            WHERE rhi.INGREDIENTNAME IN (
                SELECT INGREDIENTNAME
                FROM RECIPEHASINGREDIENT
                GROUP BY INGREDIENTNAME
                HAVING COUNT(DISTINCT RECIPEID) >= ${numRecipes}
            )
        `);
        return result.rows;
    }).catch(() => {
        console.log(`Failed to get all recipes with ingredients in at least ${numRecipes} total recipes.`);
        return null;
    })
}

// 2.2.2 Update
async function updateUserInfo(existingUserID, newFullName, newCountry, newCuisine, newDiet, newGroceryStore) {
    const existingUserIDNum = Number(existingUserID);
    return await withOracleDB(async (connection) => {
        // get previous values from existingUserID
        const pastInfo = await connection.execute(
            `SELECT FULLNAME, COUNTRY, CUISINE, DIET, GROCERYSTORE FROM CLIENT WHERE USERID=:existingUserIDNum`,
            [existingUserIDNum],
            { autoCommit: true }
        );

        if (pastInfo.rows.length === 0) {
            throw new Error("user not found");
        }

        const currentData = pastInfo.rows[0];
        // use existing data if not otherwise provided
        newFullName = newFullName || currentData[0];
        newCountry = newCountry || currentData[1];
        newCuisine = newCuisine || currentData[2];
        newDiet = newDiet || currentData[3];
        newGroceryStore = newGroceryStore || currentData[4];
        const result = await connection.execute(
            `UPDATE CLIENT SET FULLNAME=:newFullName, COUNTRY=:newCountry, CUISINE=:newCuisine, DIET=:newDiet, GROCERYSTORE=:newGroceryStore where USERID=:existingUserIDNum`,
            [newFullName, newCountry, newCuisine, newDiet, newGroceryStore, existingUserIDNum],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// 2.2.5 Projection
async function getSelectedFieldsOfNutritionalInfo(calories, fat, protein) {
    return await withOracleDB(async (connection) => {

        const fields = ["NAME"];
        if (calories === "true") fields.push("CALORIES");
        if (fat === "true") fields.push("FAT");
        if (protein === "true") fields.push("PROTEIN");
        const fieldsString = fields.join(", ");

        return await connection.execute(`
            SELECT ${fieldsString}
            FROM INGREDIENTNUTRITIONALINFO
        `);
    }).catch(() => {
        console.log(`Failed to retrieve selected nutritional info.`);
        return [];
    });
}

// 2.2.8 Aggregation with HAVING
async function getUsersWithMinMealPlans(minMealPlans) {
    return await withOracleDB(async (connection) => {
            const result = await connection.execute(`
                SELECT userID, COUNT(mealPlanID) as mealPlanCount FROM UserCreatesMealPlan GROUP BY userID
                HAVING COUNT(mealPlanID) > :minMealPlans`, [Number(minMealPlans)],
                { autoCommit: true });
            return result.rows;
        }).catch((err) => {
            console.error(`Failed to find users with more than ${minMealPlans} meal plans:`, err);
            return [];
        });
}

module.exports = {
    testOracleConnection,
    insertIngredient,
    selectOverallRating,
    getIngredientData,
    getRecipeData,
    getRecipeHasIngredientData,
    getClientData,
    totalCaloriesPerRecipe,
    findAllergicPeople,
    deleteMealPlan,
    getRecipesWithCaloriesOver,
    getMealPlansCreatedBy,
    getIngredientsInGroceryListAssosciatedWith,
    getTotalNutrionalInfoInRecipesFromMealPlan,
    getRecipesWithAtleastOneIngredientInNumberOfRecipes,
    updateUserInfo,
    getSelectedFieldsOfNutritionalInfo,
    getUsersWithMinMealPlans
};