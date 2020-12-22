const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile');



// @route   GET api/profile/me
// @desc    Get the current users profile
// @access  Private
router.get('/me', auth, async(req, res) => {
try {
    const profile = await Profile.findOne({
        user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if(!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user'});
    }
    
    res.json(profile);

} catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
}
});



// @route   POST api/profile
// @desc    Create and Update user profile
// @access  Private
router.post('/', [auth, [
    check('status', 'Status is required')
    .not()
    .isEmpty(),
    check('skills', 'Skills is required')
    .not()
    .isEmpty()
]] ,async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    // Get all the fields from req body
    const {
        company,
        website, 
        location,
        bio,
        status,
        githubusername,
        skills,
        facebook,
        instagram,
        linkedin,
        twitter,
        youtube,
    } = req.body;

    // Create Profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) 
    {
        profileFields.skills = skills.split(',').map(skill => {
            skill.trim();
        });
    }

    console.log(profileFields.skills);

    // Create social object
    let social = profileFields.social;
    social = {};

    if(facebook) social.facebook = facebook;
    if(instagram) social.instagram = instagram;
    if(linkedin) social.linkedin = linkedin;
    if(twitter) social.twitter = twitter;
    if(youtube) social.youtube = youtube;

    // Update the profile
    try {
        let profile = await Profile.findByIdAndUpdate(
            {user: req.user.id},
            {$set: profileFields},
            {new: true}
        );

        profile = new Profile(profileFields);
        await profile.save();
        
        return res.json(profile);

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
});


module.exports = router;