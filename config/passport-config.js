const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');


const initialize = (passport, getUserByEmail, getUserById, getPasswordByEmail) => {
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
	// passport.serializeUser((user, done) => {
	// 	done(null, user.id)})
 //  	passport.deserializeUser((id, done) => {
 //  	  return done(null, getUserById(id))
 //  	})
}

module.exports = initialize;