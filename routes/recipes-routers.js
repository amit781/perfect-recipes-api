const router = require('express').Router();
const { db } = require('../config/postgresql-setup');
const upload = require('../services/upload-image');

// const uploadPath =  __dirname + '\uploads\images'
// var storage = multer.memoryStorage();
// var upload = multer({ storage: storage });

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'uploads/images')
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, file.originalname)
// 	}
// });

const singleUpload = upload.single('recipeImage');

router.post('/image-upload', (req, res) => {
	singleUpload(req, res, (err) => {
		if (err) {
			return res.status(422).json('error uploading image');
		}
		if (req.file) {
			console.log(`File uploaded successfully. ${req.file.Location}`);
			return res.json({fileName: req.file.originalname});
		} else {
			return res.status(422).json('no file uploaded')
		}
	});
})

router.get('/koko', (req, res) => {
	res.json('*******');
})
//upload an image
// router.post('/uploadImage', upload.single('recipeImage'), (req, res) => {
//     if(req.file) {
//         res.json(req.file.filename);
//     }
//     else {
//     	res.json('no file uploaded')
//     };
// });

//insert a recipe to the db
router.post('/addRecipe', (req, res) => {
	const { email, title, image, instructions, ingredients } = req.body;
	if (!title || !instructions || !ingredients) {
		return res.status(400).json('incorrect form submission');	
	}
	db.insert({
				title: title,
				email: email,
				image: image,
				instructions: instructions,
				ingredients: ingredients
	    })
		.into('recipes')
		.returning('*')
		.then(recipe =>{
			res.json(recipe);
		} );	
});

router.get('/:email', (req, res) => {
	const email  = req.params.email;
	db('recipes').where('email', email).then(recipes => res.json(recipes));
});

router.get('/getRecipe/:id', (req, res) => {
	const id  = req.params.id;
	db('recipes').where('id', id).then(recipe => {
		res.json(recipe[0])});
});

module.exports = router;
