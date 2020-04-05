const express = require('express');
const cors = require('cors');
const passport = require('passport');
// const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/auth-routers')
const apiRoutes = require('./routes/api-routers')
const { db } = require('./config/postgresql-setup');

const config = {
    origin: 'https://frontend-recipes.herokuapp.com',
    credentials: true,
    allowedHeaders: ['Content-Type', 'application/json']
};

const app = express();

app.use(cors(config));
app.options('/auth/login/sucess', cors(config));
app.options('/auth/register', cors(config));
app.use(express.json());

app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [process.env.sessionCookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/' , (req, res) => {
	res.send('it is working');
})

app.listen(process.env.PORT || 4000, () => {
	console.log(`app is running on port ${process.env.PORT}`)
})