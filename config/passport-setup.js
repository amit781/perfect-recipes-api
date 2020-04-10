const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const { db } = require('./postgresql-setup');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	db.select('*').from('users').where({id})
	.then(user => {
		done(null, user);
	})
});

passport.use(
	new GoogleStrategy({
		callbackURL: '/auth/google/redirect',
		clientID: process.env.googleClientID,
		clientSecret: process.env.googleClientSecret,
	}, async (accessToken, refreshToke, profile, done) => {
		const googleId = profile.id
		const name = profile.displayName
		const email = profile.emails[0].value
		db.select('*').from('users').where({google_id: googleId})
		.then(user => {
			//already have the user
			if (user.length) {
				done(null, user[0]);
			} else {
				db.select('*').from('users').where({email})
				.then(user => {
					//user already signed up with local strategy
					if (user.length){
						db('users')
							.returning('*')
							.update({google_id: googleId})
							.where('email', email)
							.then(user => done(null, user[0]))
					} else {
						db('users')
							.returning('*')
							.insert({name: name ,
						 			 email: email,
						 			 google_id: googleId,
						 			 joined: new Date()
							})
							.then(user => {
								done(null, user[0]);
							});
					}
				})
				
			}
		})

	})
)


const getUserByEmail = async (email) => {
	const user = await db.select('*').from('users').where({email}).then(user => {return user[0]});
	return await user;
}

const getPasswordByEmail = async (email) => {
	const password = db.select('hash').from('login').where({email}).then(pass => {
		if (pass.length) {
			   return pass[0].hash
		} return null 
	});
	return await password;
}

const authenticateUser = async (email, password, done) => {
	const user = await getUserByEmail(email);
	const dbPassword = await getPasswordByEmail(email);
	if (user == null) {
		return done(null, false, {message: 'No user with that email'})
	}
	else try {
		if (await bcrypt.compare(password, dbPassword)) {
			return done(null, user)
		} else {
			return done(null, false, {message: 'Passowrd incorrect'})
		}
	} catch (e) {
		console.log(e)
		return done(e)
	}
}
passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
