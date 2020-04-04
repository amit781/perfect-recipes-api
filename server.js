const express = require('express');
const cors = require('cors');
const passport = require('passport');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/auth-routers')
const apiRoutes = require('./routes/api-routers')
const { db } = require('./config/postgresql-setup');

const config = {
    origin: 'http://localhost:3000',
    credentials: true,
};

const app = express();

app.use(cors(config));
app.use(express.json());

app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/' , (req, res) => {
	res.send('it is working');
})

app.listen(process.env.Port || 4000 => {
	console.log(`app is running on port ${process.env.port}`)
})
