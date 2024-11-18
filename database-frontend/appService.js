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
        const result = await connection.execute('SELECT * FROM User');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Allergy`);
            await connection.execute(`DROP TABLE UserHasAllergy`);
            await connection.execute(`DROP TABLE User`);
            await connection.execute(`DROP TABLE PremiumUser`);
            await connection.execute(`DROP TABLE StandardUser`);
            await connection.execute(`DROP TABLE BudgetUser`);
            await connection.execute(`DROP TABLE UserCreatesMealPlan`);
            await connection.execute(`DROP TABLE Rating`);
            await connection.execute(`DROP TABLE Equipment`);
            await connection.execute(`DROP TABLE EquipmentLocations`);
            await connection.execute(`DROP TABLE Recipe`);
            await connection.execute(`DROP TABLE RecipeHasIngredient`);
            await connection.execute(`DROP TABLE MealPlanContainsRecipe`);
            await connection.execute(`DROP TABLE Ingredient`);
            await connection.execute(`DROP TABLE IngredientNutritionalInfo`);
            await connection.execute(`DROP TABLE MealPlan`);
            await connection.execute(`DROP TABLE GroceryList`);
            await connection.execute(`DROP TABLE GroceryListContainsIngredient`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Allergy (type VARCHAR PRIMARY KEY),

            CREATE TABLE UserHasAllergy
            (allergyType VARCHAR,
            userID INTEGER,
            severity VARCHAR,
            PRIMARY KEY (allergyType, userID),
            FOREIGN KEY allergyType REFERENCES Allergy(allergyType)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
            FOREIGN KEY userID REFERENCES User(userID)),

            CREATE TABLE User
            (userID INTEGER PRIMARY KEY,
            fullName VARCHAR,
            country VARCHAR,
            userPrefID INTEGER UNIQUE,
            cuisine VARCHAR,
            diet VARCHAR,
            groceryStore VARCHAR),

            CREATE TABLE PremiumUser
            (userID INTEGER PRIMARY KEY,
            nutritionalAdvisorName VARCHAR,
            FOREIGN KEY userID REFERENCES User(userID)),

            CREATE TABLE StandardUser
            (userID INTEGER PRIMARY KEY,
            mealPlanLimit INTEGER,
            FOREIGN KEY userID REFERENCES User(userID))),

            CREATE TABLE BudgetUser
            (userID INTEGER PRIMARY KEY,
            studentDiscount FLOAT,
            FOREIGN KEY userID REFERENCES User(userID))),

            CREATE TABLE UserCreatesMealPlan
            (userID INTEGER,
            mealPlanID INTEGER,
            PRIMARY KEY (userID, mealPlanID),
            FOREIGN KEY userID REFERENCES User(userID),
            FOREIGN KEY mealPlanID REFERENCES MealPlan(mealPlanID)
            ON DELETE SET NULL
            ON UPDATE CASCADE),

            CREATE TABLE Rating
            (ratingID INTEGER PRIMARY KEY,
            overallRating INTEGER,
            difficultlyRating INTEGER,
            userID INTEGER NOT NULL,
            recipeID INTEGER NOT NULL,
            FOREIGN KEY userID REFERENCES User(userID),
            FOREIGN KEY recipeID REFERENCES Recipe(ID)),

            CREATE TABLE Equipment
            (equipmentID INTEGER,
            equipmentType VARCHAR,
            PRIMARY KEY (equipmentID, equipmentType)),

            CREATE TABLE EquipmentLocations
            (equipmentType VARCHAR PRIMARY KEY,
            equipmentLocation VARCHAR),

            CREATE TABLE Recipe
            (ID INTEGER PRIMARY KEY,
            name VARCHAR,
            author VARCHAR),

            CREATE TABLE RecipeHasIngredient
            (recipeID INTEGER,
            ingredientName VARCHAR,
            quantity INTEGER,
            PRIMARY KEY (recipeID, ingredientName),
            FOREIGN KEY recipeID REFERENCES Recipe(ID),
            FOREIGN KEY ingredientName REFERENCES Ingredient(name)
            ON DELETE CASCADE
            ON UPDATE CASCADE),

            CREATE TABLE MealPlanContainsRecipe
            (mealPlanID INTEGER,
            recipeID INTEGER,
            PRIMARY KEY (mealPlanID, recipeID),
            FOREIGN KEY mealPlanID REFERENCES MealPlan(mealPlanID),
            FOREIGN KEY recipeID REFERENCES Recipe(ID)
            ON DELETE CASCADE
            ON UPDATE CASCADE),

            CREATE TABLE Ingredient
            (name VARCHAR PRIMARY KEY,
            foodGroup VARCHAR),

            CREATE TABLE IngredientNutritionalInfo
            (name VARCHAR,
            calories INTEGER,
            fat INTEGER,
            protein INTEGER,
            PRIMARY KEY (name, calories),
            FOREIGN KEY name REFERENCES Ingredient(name)),

            CREATE TABLE MealPlan
            (mealPlanID INTEGER PRIMARY KEY,
            endDate DATE,
            startDate DATE NOT NULL,
            groceryListID INTEGER,
            FOREIGN KEY groceryListID REFERENCES groceryList(groceryListID)),

            CREATE TABLE GroceryList
            (groceryListID INTEGER PRIMARY KEY,
            totalPrice INTEGER),

            CREATE TABLE GroceryListContainsIngredient
            (groceryListID INTEGER,
            ingredientName VARCHAR,
            PRIMARY KEY (groceryListID, ingredientName),
            FOREIGN KEY groceryListID REFERENCES GroceryList(groceryListID),
            FOREIGN KEY ingredientName REFERENCES Ingredient(name)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
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
        const result = await connection.execute('SELECT Count(*) FROM User');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable
};