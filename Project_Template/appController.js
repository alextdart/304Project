const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.post("/insert-recipehasingredient", async (req, res) => {
    const { recipeID, ingredientName, quantity } = req.body;
    const insertResult = await appService.insertIngredient(recipeID, ingredientName, quantity);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/recipeHasIngredient', async (req, res) => {
    try {
        const data = await appService.getRecipeHasIngredientData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching RecipeHasIngredient data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/recipe', async (req, res) => {
    try {
        const data = await appService.getRecipeData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching Recipe data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/ingredient', async (req, res) => {
    try {
        const data = await appService.getIngredientData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching Ingredient data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/client', async (req, res) => {
    try {
        const data = await appService.getClientData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching Client data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post("/select-overallRating", async (req, res) => {
    const { overallRating } = req.body;
    const recipes = await appService.selectOverallRating(overallRating);

    if (recipes) {
        res.json({ success: true, data: recipes });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/aggregate-Calories', async (req, res) => {
    const aggregatedData = await appService.totalCaloriesPerRecipe();
    if (aggregatedData) {
        res.json({
            success: true,
            data: aggregatedData
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.get('/division-AllergicPeople', async (req, res) => {
    const allergicPeople = await appService.findAllergicPeople();
    if (allergicPeople) {
        res.json({
            success: true,
            users: allergicPeople
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.delete('/meal-plan/:mealPlanID', async (req, res) => {
    const {mealPlanID} = req.params;
    const result = await appService.deleteMealPlan(mealPlanID);
    if (result) {
        res.json({
            success: true
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.get('/recipe/:calories', async (req, res) => {
    const {calories} = req.params;
    const data = await appService.getRecipesWithCaloriesOver(calories);

    if (data) {
        res.json({
            success: true,
            data: data
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.get('/meal-plan/from-user/:userID', async (req, res) => {
    const {userID} = req.params;
    const data = await appService.getMealPlansCreatedBy(userID);

    if (data) {
        res.json({
            success: true,
            data: data
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.get('/grocery-list/from-meal-plan/:mealplanID', async (req, res) => {
    const {mealplanID} = req.params;

    const data = await appService.getIngredientsInGroceryListAssosciatedWith(mealplanID);

    if (data) {
        res.json({
            success: true,
            data: data
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.get('/recipe/nutritional-info/from-meal-plan/:mealPlanID', async (req, res) => {
    const {mealPlanID} = req.params;
    const data = await appService.getTotalNutrionalInfoInRecipesFromMealPlan(mealPlanID);

    if (data) {
        res.json({
            success: true,
            data: data
        });
    } else {
        res.status(500).json({
            success: false
        });
    }
});

router.post('/user/update', async (req, res) => {
    const { userID, fullName, country, cuisine, diet, groceryStore } = req.body;
    try {
        const result = await appService.updateUserInfo(userID, fullName, country, cuisine, diet, groceryStore);
        res.json({ success: true});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/nutritional-info', async (req, res) => {
    const { calories, fat, protein } = req.query;
    try {
        const result = await appService.getSelectedFieldsOfNutritionalInfo(calories, fat, protein);
        res.json({data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users/meal-plans', async (req, res) => {
    const { minMealPlans } = req.query;

    // ensure minMealPlans is a valid number
    if (!minMealPlans || isNaN(minMealPlans)) {
        return res.status(400).json({ success: false }); // 400 = bad request
    }

    try {
        const result = await appService.getUsersWithMinMealPlans(Number(minMealPlans));
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;