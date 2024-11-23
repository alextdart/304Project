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

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        //TODO: initialize table
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


async function insertIngredient(id, name, quantity) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (:id, :name, :quantity)`,
            [id, name, quantity],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        return error;
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

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable,
    insertIngredient,
    selectOverallRating,
    getIngredientData,
    getRecipeData,
    getRecipeHasIngredientData,
    updateNameDemotable, 
    countDemotable,
    totalCaloriesPerRecipe,
    findAllergicPeople
};