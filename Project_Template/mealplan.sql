DROP TABLE Allergy CASCADE CONSTRAINTS;
DROP TABLE UserHasAllergy cascade constraints;
DROP TABLE Client cascade constraints;
DROP TABLE PremiumUser cascade constraints;
DROP TABLE StandardUser cascade constraints;
DROP TABLE BudgetUser cascade constraints;
DROP TABLE UserCreatesMealPlan cascade constraints;
DROP TABLE Rating cascade constraints;
DROP TABLE Equipment cascade constraints;
DROP TABLE EquipmentLocations cascade constraints;
DROP TABLE Recipe cascade constraints;
DROP TABLE RecipeHasIngredient cascade constraints;
DROP TABLE MealPlanContainsRecipe cascade constraints;
DROP TABLE Ingredient cascade constraints;
DROP TABLE IngredientNutritionalInfo cascade constraints;
DROP TABLE MealPlan cascade constraints;
DROP TABLE GroceryList cascade constraints;
DROP TABLE GroceryListContainsIngredient cascade constraints;

-- Recreate tables
CREATE TABLE Allergy
(
    type VARCHAR(250) PRIMARY KEY
);

CREATE TABLE Ingredient
(
    name      VARCHAR(250) PRIMARY KEY,
    foodGroup VARCHAR(250)
);

CREATE TABLE IngredientNutritionalInfo
(
    name     VARCHAR(250) PRIMARY KEY,
    calories INTEGER,
    fat      INTEGER,
    protein  INTEGER,
    FOREIGN KEY (name) REFERENCES Ingredient (name)
);

CREATE TABLE Recipe
(
    ID     INTEGER PRIMARY KEY,
    name   VARCHAR(250),
    author VARCHAR(250)
);

CREATE TABLE Client
(
    userID       INTEGER PRIMARY KEY,
    fullName     VARCHAR(250),
    country      VARCHAR(250),
    userPrefID   INTEGER UNIQUE,
    cuisine      VARCHAR(250),
    diet         VARCHAR(250),
    groceryStore VARCHAR(250)
);

CREATE TABLE RecipeHasIngredient
(
    recipeID       INTEGER,
    ingredientName VARCHAR(250),
    quantity       INTEGER,
    PRIMARY KEY (recipeID, ingredientName),
    FOREIGN KEY (recipeID) REFERENCES Recipe (ID),
    FOREIGN KEY (ingredientName) REFERENCES Ingredient (name) ON DELETE CASCADE
);

CREATE TABLE Rating
(
    ratingID         INTEGER PRIMARY KEY,
    overallRating    INTEGER,
    difficultyRating INTEGER,
    userID           INTEGER NOT NULL,
    recipeID         INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES Client (userID),
    FOREIGN KEY (recipeID) REFERENCES Recipe (ID)
);

CREATE TABLE Equipment
(
    equipmentID   INTEGER PRIMARY KEY,
    equipmentType VARCHAR(250)
);

CREATE TABLE EquipmentLocations
(
    equipmentType     VARCHAR(250) PRIMARY KEY,
    equipmentLocation VARCHAR(250)
);

CREATE TABLE GroceryList
(
    groceryListID INTEGER PRIMARY KEY,
    totalPrice    INTEGER
);

CREATE TABLE MealPlan
(
    mealPlanID    INTEGER PRIMARY KEY,
    endDate       DATE,
    startDate     DATE NOT NULL,
    groceryListID INTEGER,
    FOREIGN KEY (groceryListID) REFERENCES GroceryList (groceryListID)
);

CREATE TABLE UserHasAllergy
(
    allergyType VARCHAR(250),
    userID      INTEGER,
    severity    VARCHAR(250),
    PRIMARY KEY (allergyType, userID),
    FOREIGN KEY (allergyType) REFERENCES Allergy (type) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Client (userID)
);

CREATE TABLE PremiumUser
(
    userID                 INTEGER PRIMARY KEY,
    nutritionalAdvisorName VARCHAR(250),
    FOREIGN KEY (userID) REFERENCES Client (userID)
);

CREATE TABLE StandardUser
(
    userID        INTEGER PRIMARY KEY,
    mealPlanLimit INTEGER,
    FOREIGN KEY (userID) REFERENCES Client (userID)
);

CREATE TABLE BudgetUser
(
    userID          INTEGER PRIMARY KEY,
    studentDiscount FLOAT,
    FOREIGN KEY (userID) REFERENCES Client (userID)
);

CREATE TABLE UserCreatesMealPlan
(
    userID     INTEGER,
    mealPlanID INTEGER,
    PRIMARY KEY (userID, mealPlanID),
    FOREIGN KEY (userID) REFERENCES Client (userID),
    FOREIGN KEY (mealPlanID) REFERENCES MealPlan (mealPlanID) ON DELETE SET NULL
);

CREATE TABLE MealPlanContainsRecipe
(
    mealPlanID INTEGER,
    recipeID   INTEGER,
    PRIMARY KEY (mealPlanID, recipeID),
    FOREIGN KEY (mealPlanID) REFERENCES MealPlan (mealPlanID),
    FOREIGN KEY (recipeID) REFERENCES Recipe (ID) ON DELETE CASCADE
);

CREATE TABLE GroceryListContainsIngredient
(
    groceryListID  INTEGER,
    ingredientName VARCHAR(250),
    PRIMARY KEY (groceryListID, ingredientName),
    FOREIGN KEY (groceryListID) REFERENCES GroceryList (groceryListID),
    FOREIGN KEY (ingredientName) REFERENCES Ingredient (name) ON DELETE CASCADE
);

-- Insert statements
INSERT INTO Allergy (type) VALUES ('Strawberry');
INSERT INTO Allergy (type) VALUES ('Tree Nuts');
INSERT INTO Allergy (type) VALUES ('Dairy');
INSERT INTO Allergy (type) VALUES ('Shellfish');
INSERT INTO Allergy (type) VALUES ('Eggs');

INSERT INTO Client (userID, fullName, country, userPrefID, cuisine, diet, groceryStore) VALUES (1, 'Alex Dart', 'Canada', 1, 'Standard', NULL, 'Save-On Kerrisdale');
INSERT INTO Client (userID, fullName, country, userPrefID, cuisine, diet, groceryStore) VALUES (2, 'Griffin Velichko', 'Canada', 2, 'Standard', NULL, 'Save-On Dunbar');
INSERT INTO Client (userID, fullName, country, userPrefID, cuisine, diet, groceryStore) VALUES (3, 'Anna Friesen', 'Canada', 3, 'Standard', NULL, 'Save-On Wesbrook');
INSERT INTO Client (userID, fullName, country, userPrefID, cuisine, diet, groceryStore) VALUES (4, 'LeBron James', 'USA', 4, 'Standard', 'Vegan', 'Save-On Kerrisdale');
INSERT INTO Client (userID, fullName, country, userPrefID, cuisine, diet, groceryStore) VALUES (5, 'Grant Sanderson', 'USA', 5, 'Standard', NULL, 'Save-On Dunbar');


INSERT INTO UserHasAllergy (allergyType, userID, severity) VALUES ('Dairy', 4, 'Severe');
INSERT INTO UserHasAllergy (allergyType, userID, severity) VALUES ('Strawberry', 5, 'Mild');
INSERT INTO UserHasAllergy (allergyType, userID, severity) VALUES ('Eggs', 4, 'Mild');
INSERT INTO UserHasAllergy (allergyType, userID, severity) VALUES ('Dairy', 3, 'Severe');
INSERT INTO UserHasAllergy (allergyType, userID, severity) VALUES ('Shellfish', 1, 'Mild');


INSERT INTO PremiumUser (userID, nutritionalAdvisorName) VALUES (1, 'Gordon Ramsay');
INSERT INTO PremiumUser (userID, nutritionalAdvisorName) VALUES (2, 'Gordon Ramsay');
INSERT INTO PremiumUser (userID, nutritionalAdvisorName) VALUES (3, 'Gordon Ramsay');


INSERT INTO StandardUser (userID, mealPlanLimit) VALUES (5, 10);


INSERT INTO BudgetUser (userID, studentDiscount) VALUES  (4, 0.15);

INSERT INTO Recipe (ID, name, author) VALUES (1, 'Fried Chicken', 'Anthony Bourdain');
INSERT INTO Recipe (ID, name, author) VALUES (2, 'Pancakes', 'Aunt Jemimah');
INSERT INTO Recipe (ID, name, author) VALUES (3, 'Ratatouille', 'Remy from Ratatouille');
INSERT INTO Recipe (ID, name, author) VALUES (4, 'Shrimp Fried Rice', 'A Shrimp');
INSERT INTO Recipe (ID, name, author) VALUES (5, 'Chili', 'Alex Dart');

INSERT INTO Ingredient (name, foodGroup) VALUES ('Chicken', 'Meat');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Pancake Mix', 'Assorted');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Onion', 'Vegetable');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Shrimp', 'Seafood');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Ground Beef', 'Meat');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Oil', 'Liquids');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Water', 'Liquids');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Tomato', 'Vegetable');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Rice', 'Starches');
INSERT INTO Ingredient (name, foodGroup) VALUES ('Diced Tomato', 'Vegetable');

INSERT INTO GroceryList (groceryListID, totalPrice) VALUES (1, 21);
INSERT INTO GroceryList (groceryListID, totalPrice) VALUES (2, 33);
INSERT INTO GroceryList (groceryListID, totalPrice) VALUES (3, 24);
INSERT INTO GroceryList (groceryListID, totalPrice) VALUES (4, 56);
INSERT INTO GroceryList (groceryListID, totalPrice) VALUES (5, 13);

INSERT INTO MealPlan (mealPlanID, endDate, startDate, groceryListID) VALUES (1, TO_DATE('2024-10-14', 'YYYY-MM-DD'), TO_DATE('2024-10-21', 'YYYY-MM-DD'), 1);
INSERT INTO MealPlan (mealPlanID, endDate, startDate, groceryListID) VALUES (2, TO_DATE('2024-10-14', 'YYYY-MM-DD'), TO_DATE('2024-10-21', 'YYYY-MM-DD'), 2);
INSERT INTO MealPlan (mealPlanID, endDate, startDate, groceryListID) VALUES (3, TO_DATE('2024-10-14', 'YYYY-MM-DD'), TO_DATE('2024-10-21', 'YYYY-MM-DD'), 3);
INSERT INTO MealPlan (mealPlanID, endDate, startDate, groceryListID) VALUES (4, TO_DATE('2024-10-17', 'YYYY-MM-DD'), TO_DATE('2024-10-24', 'YYYY-MM-DD'), 4);
INSERT INTO MealPlan (mealPlanID, endDate, startDate, groceryListID) VALUES (5, TO_DATE('2024-10-19', 'YYYY-MM-DD'), TO_DATE('2024-10-26', 'YYYY-MM-DD'), 5);

INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (1, 'Chicken', 5);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (2, 'Pancake Mix', 3);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (3, 'Onion', 2);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (4, 'Shrimp', 3);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (5, 'Ground Beef', 5);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (1, 'Oil', 10);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (2, 'Water', 3);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (3, 'Tomato', 2);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (4, 'Rice', 5);
INSERT INTO RecipeHasIngredient (recipeID, ingredientName, quantity) VALUES (5, 'Diced Tomato', 7);

INSERT INTO MealPlanContainsRecipe (mealPlanID, recipeID) VALUES (1, 1);
INSERT INTO MealPlanContainsRecipe (mealPlanID, recipeID) VALUES (1, 2);
INSERT INTO MealPlanContainsRecipe (mealPlanID, recipeID) VALUES (2, 3);
INSERT INTO MealPlanContainsRecipe (mealPlanID, recipeID) VALUES (2, 2);
INSERT INTO MealPlanContainsRecipe (mealPlanID, recipeID) VALUES (3, 5);

INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Chicken', 100, 12, 15);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Pancake Mix', 150, 22, 2);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Onion', 75, 0, 1);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Shrimp', 125, 17, 13);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Ground Beef', 135, 10, 22);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Oil', 430, 26, 1);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Water', 0, 0, 0);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Tomato', 55, 1, 0);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Rice', 175, 13, 2);
INSERT INTO IngredientNutritionalInfo (name, calories, fat, protein) VALUES ('Diced Tomato', 55, 1, 0);

INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (1, 'Chicken');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (1, 'Oil');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (2, 'Pancake Mix');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (2, 'Water');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (3, 'Onion');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (3, 'Tomato');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (4, 'Shrimp');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (4, 'Rice');
INSERT INTO GroceryListContainsIngredient (groceryListID, ingredientName) VALUES (5, 'Ground Beef');



