const router = require('express').Router();
const passport = require('passport');
const passportSetup = require('../config/passport-setup');
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";
const bcrypt = require('bcrypt');
const { db } = require('../config/postgresql-setup');
const cors = require('cors');

//auth with google
router.get('/google', passport.authenticate('google', {
	scope: ['profile', 'email'],
	prompt : "select_account"
}));

// callback route for google to redirect to 
router.get('/google/redirect', passport.authenticate("google"), (req, res) => {
	res.redirect(CLIENT_HOME_PAGE_URL);
	}
);

router.get('/login/success', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
  }
});

router.get('/logout', (req, res) => {
	req.logout();
	res.send(req.isAuthenticated());
})

router.post('/signin', (req, res, next) => {
 	passport.authenticate('local', (err, user, info) => {
 		if (err) { return next(err); }
 		if(!user) {
 			res.status(400).json('wrong credentials');
 		} else {
 			req.logIn(user, () => {
 				res.json(user);
 			})
 		}
 	})(req, res, next)
});


checkEmail = (email) => {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// at least one number, one lowercase and one uppercase letter
// at least six characters
checkPassword = (password) => {
	const re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return re.test(password);
}

const config = {
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type','application/json']
};
router.options('/register', cors(config))
router.post('/register', async (req, res) => {
	const { email, name, password } = req.body;
	console.log(email, name, password);
	if (!email || !name || !password) {
		return res.status(400).json('incorrect form submission');
	}
	if (!checkEmail(email)){
		return res.status(400).json('Invalid email address');
	}
	if (!checkPassword(password)) {
		return res.status(400).json('Password must contain at least six characters, including uppercase, lowercase letters and numbers.');
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	//check if user already signed in with google
	db.select('*').from('users').where({email})
	.then(user => {
		if (user.length) {
			db.select('*').from('login').where({email})
			.then(user => {
				// user already registered with this email
				if(user.length) {
					return res.json('This e-mail address has already been registered');
				} 
				// user registered with google but not with local strategy
				else {
					db.insert({
								hash: hashedPassword,
								email: email
							})
					.into('login')
					.returning('*')
					.then(user => res.json(user[0]));	
				}
			})
		} 
		// user is registering for the first time
		else {
			db.transaction(trx => {
				trx.insert({
					hash: hashedPassword,
					email: email
				})
				.into('login')
				.returning('email')
				.then(loginEmail => {
					return trx('users')
						.returning('*')
						.insert({
							email: loginEmail[0],
							name: name,
							joined: new Date()
						})
						.then(user => {
							res.json(user[0]);
						})
				})
				.then(trx.commit)
				.catch(trx.rollback)
				})
			.catch(err => {
				if (err.code === '23505') {
					return res.json('This email address has already been registered')
				}
				res.json('unable to register')
				console.log(err)})	
		}
	})


})

module.exports = router;