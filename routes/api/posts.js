const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Post = require('../../models/Post')
const User = require('../../models/User')
const Profile = require('../../models/Profile')

// @route   POST api/posts
// @desc    Add Post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')

      const newPost = new Post({
        text: req.body.text,
        avatar: user.avatar,
        name: user.name,
        user: req.user.id,
      })

      const post = await newPost.save()

      res.json(post)
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  }
)

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

// @route   GET api/posts/:id
// @desc    Get post by Id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error(error.message)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' })
    }
    res.status(500).send('Server Error')
  }
})

module.exports = router
