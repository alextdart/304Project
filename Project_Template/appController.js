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

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
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


router.post("/select-overallRating", async (req, res) => {
    const { overallRating } = req.body;
    const recipes = await appService.selectOverallRating(overallRating);

    if (recipes) {
        res.json({ success: true, data: recipes });
    } else {
        res.status(500).json({ success: false });
    }
});


router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
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

router.get('/recipe/with-calories-over/:calories', async (req, res) => {
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
})

module.exports = router;