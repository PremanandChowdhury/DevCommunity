const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');



// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('password', 'Password with length 6 or more').isLength({min: 6}),
        check('email', 'Enter a valid email ').isEmail()
    ], 
    async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {    
    // See if user exists
    let user = await User.findOne({ email });
    if (user) {
        return res
        .status(400)
        .json( {
            errors: [ {msg: 'User Already exists!'}] 
        } );
    }


    // Get users gravatar
    const avatar = gravatar.url(email, {
        size: '200',
        rating: 'pg',
        default: 'mm'
    });


    // Create an user Instance
    user = new User({
        name,
        email,
        avatar,
        password
    });


    // Encrypt password (bcrypt)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();


    // Return jsonwebtoken (to distinguish user)
    const payload = {
        user: {
            id: user.id
        }
    };


    jwt.sign(
        payload, 
        config.get('jwtToken'),
        {expiresIn: 360000},
        (err, token) => {
            if(err) throw err;
            res.json({ token });
        }
    );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

module.exports = router;