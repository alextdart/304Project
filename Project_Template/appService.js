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

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchClientTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM CLIENT');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

// deletes specified MealPlan
async function deleteMealPlan(mealplanID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            DELETE 
            FROM MEALPLAN 
            WHERE MEALPLANID = ${mealplanID}
        `);
        return true
    }).catch(() => {
        console.log("Failed to delete Meal Plan with ID: ${mealplanID}");
        return false;
    });
}

// gets all recipes with total calories over a given number. Returns list of Recipe Names.
async function getRecipesWithCaloriesOver(calories) {
    return await oracledb(async (connection) => {
        return await connection.execute(`
            SELECT r.NAME, SUM(rhi.QUANTITY * ini.CALORIES) AS TotalCalories
            FROM RECIPE r 
                JOIN RECIPEHASINGREDIENT rhi ON r.ID = rhi.RECIPEID 
                JOIN INGREDIENTNUTRITIONALINFO ini ON rhi.INGREDIENTNAME = ini.NAME
            GROUP BY r.NAME
            HAVING SUM(rhi.QUANTITY * ini.CALORIES) > ${calories};
        `);
    }).catch(() => {
        console.log(`Failed to get recipes with calories over ${calories}`);
        return [];
    });
}

// gets meal plan created by a given user
async function getMealPlansCreatedBy(userID) {
    const userIdAsNumber = Number(userID);
    if (isNaN(userIdAsNumber)) {
        console.error(`Invalid userID: ${userID}`);
        return [];
    }

    return await oracledb(async (connection) => {
        return await connection.execute(`
            SELECT mp.*
            FROM MEALPLAN mp, USERCREATESMEALPLAN ucmp
            WHERE mp.MEALPLANID = ucmp.MEALPLANID AND ucmp.USERID = ${userIdAsNumber}
            `);
    }).catch(() => {
        console.error(`Failed to get Meal Plans Created By User with ID: ${userIdAsNumber}`);
        return [];
    });
}


// gets ingredients in a grocery list assosciated with a mealPlan.
async function getIngredientsInGroceryListAssosciatedWith(mealPlanID) {
    return await oracledb(async (connection) => {
        return await connection.execute(`
            SELECT gci.INGREDIENTNAME 
            FROM GROCERYLISTCONTAINSINGREDIENT gci, MEALPLAN mp
            WHERE mp.MEALPLANID = ${mealPlanID} AND mp.GROCERYLISTID = gci.GROCERYLISTID
        `);
    }).catch(() => {
        console.log(`Failed to get Ingredients in the Grocery List Assosciated with MealPlanID: ${mealPlanID}`);
        return []
    });
}

// gets all the sums of the nutritional info of all of the ingredients in a recipe
async function getTotalNutrionalInfoInRecipe(recipeID) {
    return await oracledb(async (connection) => {
        const result = await connection.execute(`
            SELECT r.NAME, SUM(rhi.QUANTITY * ini.CALORIES) AS TotalCalories, SUM(rhi.QUANTITY * ini.FAT) AS TotalFat, 
                   SUM(rhi.QUANTITY * ini.FAT) AS TotalProtein
            FROM RECIPE r 
                JOIN RECIPEHASINGREDIENT rhi ON r.ID = rhi.RECIPEID 
                JOIN INGREDIENTNUTRITIONALINFO ini ON rhi.INGREDIENTNAME = ini.NAME
            WHERE r.ID = ${recipeID}
            GROUP BY r.NAME;
        `);
        return result;
    }).catch(() => {
        console.log(`Failed to get total nutrional info in recipe with ID: ${recipeID}`);
        return 0;
    })
}

// 2.2.2 Update
async function updateUserInfo(userID, newFullName, newCountry, newCuisine, newDiet, newGroceryStore) {
    return await withOracleDB(async (connection) => {
        // get previous values from userID
        const prev = await connection.execute(
            `SELECT FULLNAME, COUNTRY, CUISINE, DIET, GROCERYSTORE FROM CLIENT WHERE USERID=:userID`,
            [userID],
            { autoCommit: true }
        );

        if (prev.rows.length === 0) {
            throw new Error("user not found");
        }

        const currentData = prev.rows[0];

        // use existing data if not otherwise provided
        newFullName = newFullName || currentData[0];
        newCountry = newCountry || currentData[1];
        newCuisine = newCuisine || currentData[2];
        newDiet = newDiet || currentData[3];
        newGroceryStore = newGroceryStore || currentData[4];

        const result = await connection.execute(
            `UPDATE CLIENT SET FULLNAME=:newFullName, COUNTRY=:newCountry, CUISINE=:newCuisine, DIET=:newDiet, GROCERYSTORE=:newGroceryStore where USERID=:userID`,
            [userID, newFullName, newCountry, newCuisine, newDiet, newGroceryStore],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// 2.2.5 Projection
async function getSelectedFieldsOfNutritionalInfo(calories, fat, protein) {
    return await oracledb(async (connection) => {

        const fields = ["NAME"];
        if (calories) fields.push("CALORIES");
        if (fat) fields.push("FAT");
        if (protein) fields.push("PROTEIN");
        const fieldsString = fields.join(", ");

        return await connection.execute(`
            SELECT ${fieldsString}
            FROM INGREDIENTNUTRITIONALINFO
        `);
    }).catch(() => {
        console.log(`Failed to retrieve selected nutritional info.`);
        return []
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    deleteMealPlan,
    getRecipesWithCaloriesOver,
    getMealPlansCreatedBy,
    getIngredientsInGroceryListAssosciatedWith,
    getTotalNutrionalInfoInRecipe,
    updateUserInfo,
    getSelectedFieldsOfNutritionalInfo
};