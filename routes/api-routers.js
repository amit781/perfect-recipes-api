const router = require('express').Router();
const keys = require('../config/keys');
const axios = require('axios');
const unirest = require("unirest");

router.post('/searchRecipes', async (req, res) => {
	const query = req.body.query;

	const config = {
		url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search',
		method: 'get',
		params: {
			query: query
		},
		headers: {
        	"x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
        	"x-rapidapi-key": keys.rapidapi.key	
        }
	};
	axios.request(config)
	.then(result =>{
		res.status(200).json(result.data);
	})
	.catch(err => res.status(404).json('failed to find recipes'))
});

router.post('/getInformation', async (req, res) => {
	const id = req.body.id;
	const config = {
		url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${id}/information`,
		method: 'get',
		headers: {
        	"x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
        	"x-rapidapi-key": keys.rapidapi.key	
        }
	};
	axios.request(config)
	.then(result =>{
		res.status(200).json(result.data);
	})
	.catch(err => res.status(404).json('failed to find recipe information'))
});

module.exports = router;
