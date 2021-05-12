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

// @route   DELETE api/posts/:id
// @desc    Delete post by Id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' })
    }

    // Check for Valid user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User is unauthorized' })
    }

    await post.remove()

    res.json({ msg: 'Post Removed' })
  } catch (error) {
    console.error(error.message)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' })
    }
    res.status(500).send('Server Error')
  }
})

// @route   PUT api/posts/like/:id
// @desc    Update likes of a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // Check if the post is already liked by the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already Liked 😋' })
    }

    // Add the like
    post.likes.unshift({ user: req.user.id })

    await post.save()

    res.json(post.likes)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // Check if the post is already liked by the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post not Liked yet 😉' })
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id)

    post.likes.splice(removeIndex, 1)

    await post.save()

    res.json(post.likes)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

// @route   PUT api/posts/comments/:id
// @desc    Comment on a post
// @access  Private
router.put(
  '/comments/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')
      const post = await Post.findById(req.params.id)

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: req.body.avatar,
        user: req.user.id,
      }

      post.comments.unshift(newComment)

      await post.save()

      res.json(post.comments)
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server Error')
    }
  }
)

module.exports = router
