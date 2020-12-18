const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User')


// @route   GET api/auth
// @desc    Auth route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (error) {
        
        console.error(error.message);
        res.status(500).send('Server Error');

    }
});


// @route   POST api/auth
// @desc    Authenticate User & get token
// @access  Public
router.post('/', [
    check('password', 'Password with length 6 or more').exists(),
    check('email', 'Enter a valid email').isEmail()
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email });
        if(!user) {
            return res
            .status(400)
            .json(
                {erros: [ {msg: 'Invalid Credentials'} ]
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
            .status(400)
            .json(
                {erros: [ {msg: 'Invalid Credentials'} ]
            }); 
        }

        const payload = {
            user : {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtToken'),
            {expiresIn: 360000},
            (error, token) => {
                if(error) throw error;
                res.json( { token} );
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;