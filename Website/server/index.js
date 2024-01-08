const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require('cors');

const { baseUrl } = require('../constants');
const { Posts } = require('./model/Posts');
const { Tags } = require('./model/Tags');
const { Users } = require('./model/Users');


const app = express();
const port = 3080;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

const corsOptions = {
  origin: `${baseUrl.client}`,
  credentials: true,
};

app.get('/', cors(corsOptions), (req, res) => {
  res.send('Welcome to your Wix Enter exam!');
});

app.get('/user', cors(corsOptions), (req, res) => {
  const userId = req.cookies?.userId || uuidv4();
  let user = Users.find(user => user.id === userId);
  if (!user) {
    // Create a new user object with empty liked and disliked arrays
    user = {
      id: userId,
      likedPosts: [],
      dislikedPosts: []
    };
    Users.push(user);
  }
  res.cookie('userId', userId).send({ id: userId });
});

///////////////////////////////////// users /////////////////////////////////////

app.get(`/users`, cors(corsOptions), (req, res) => {
  res.send({ Users }).status(200);
});

///////////////////////////////////// posts /////////////////////////////////////
  //fix it after the test - i send it as filtered Posts and get the response in App as 'filteredPosts', so this response was empty.
  app.get('/posts', cors(corsOptions), (req, res) => {
      res.send({ Posts }).status(200);
  });

  // fix after the test
  app.get('/my-recommended-posts', cors(corsOptions), (req, res) => {
    const userId = req.cookies?.userId;
    if (!userId) {
      res.status(403).end();
      return;
    }
  
    const user = Users.find(user => user.id === userId);
    if (!user) {
      res.status(404).end();
      return;
    }
  
    const likedPostIds = user.likedPosts;
    const dislikedPostIds = user.dislikedPosts;
    const recommendedPostIds = [];
  
    for (const likedPostId of likedPostIds) {
      for (const otherUser of Users) {
        if (otherUser.id !== userId && otherUser.likedPosts.includes(likedPostId)) {
          const otherUserLikedPosts = otherUser.likedPosts.filter(id => id !== likedPostId);
          recommendedPostIds.push(...otherUserLikedPosts);
        }
      }
    }
  
    const uniqueRecommendedPostIds = [...new Set(recommendedPostIds)];
    const recommendedPosts = Posts.filter(post => uniqueRecommendedPostIds.includes(post.id) && !likedPostIds.includes(post.id) && !dislikedPostIds.includes(post.id));
  
    res.send({ Posts: recommendedPosts }).status(200);
  });
  
  

app.post('/posts', cors(corsOptions), (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const id = req.body.id;

  // Create a new post object
  // In the test, i did it as a map it was wrong, cause Posts contain objects.
  const newPost = {
    id: id,
    title: title,
    content: content,
    likes: 0
  };

  // Add the new post to the Posts array
  Posts.push(newPost);
  res.send({Posts: newPost}).status(200);
});

///////////////////////////////////// tags /////////////////////////////////////
// fix after the test - i didnt sent it correct by the url. so all my logic was wrong.
// app.get('/filterTags', cors(corsOptions), (req, res) => {
//   const tag = req.query.tagName;
//   console.log(tag)
//   if (tag) {
//     const filteredPosts = Posts.filter(post => {
//       return  Tags[tag] && Tags[tag][post.id]
//     });
//     res.send({ Posts: filteredPosts });
//   } else {
//     res.send({ Posts });
//   }
// });

app.get('/tagAndPop', cors(corsOptions), (req, res) => {
  const { tag, popularity } = req.query;

  let filteredPosts = Posts;
  if (tag) {
    filteredPosts = Posts.filter(post => {
      return  Tags[tag] && Tags[tag][post.id]
    });
  }

  if (popularity) {
    const popularityValue = Number(popularity);
    filteredPosts = filteredPosts.filter(post => post.likes >= popularityValue);
  }

  res.send({ Posts: filteredPosts });
});


app.get('/tags', cors(corsOptions), (req, res) => {
  res.send({ Tags });
});

// no need to send all tags (not my code)
app.post('/tags/tagName/:tagName', cors(corsOptions), (req, res) => {
  const userId = req.cookies?.userId;
  if (!userId) {
    res.status(403).end();
    return;
  }
  const { tagName } = req.params;
  if (Tags[tagName]) {
    res.status(409).end(); // confilct error
    return;
  }
  Tags[tagName] = {};
  res.send({ Tags }).status(200).end();
});

// add tag to a post
app.post('/addPostTag', cors(corsOptions), (req, res) => {
  const userId = req.cookies?.userId;
  if (!userId) {
    res.status(403).end();
    return;
  }
  const tagName = req.body.tagName;
  const  postID  = req.body.postId
  if (Tags[tagName]) {
    Tags[tagName][postID] = true
  }
  Tags[tagName][postID] = true;

  const updatedTags = { [tagName]: Tags[tagName] }; // send just the updated tag, way less data than all tags.
  res.send({ Tags: updatedTags }).status(200).end();
});

// like changing - it render me in one render late i try to figure out why but didnt understood
// i changed all the logic of this method from the test. 
// in the test the Posts contained array of users whom touched the post, that made me problems with implement the recommended posts.
// i change the logic s.t. i have an array of users which each user element contain arries of the posts that he liked and disliked. 
app.post('/updateLikes', cors(corsOptions), (req, res) => {
  const userId = req.cookies?.userId;
  if (!userId) {
    res.status(403).end();
    return;
  }

  const postId = req.body.postId;
  const liked = req.body.liked;

  let user = Users.find(user => user.id === userId);
  if (!user) {
    // Create a new user object with empty liked and disliked arrays
    user = {
      id: userId,
      likedPosts: [],
      dislikedPosts: []
    };
    Users.push(user);
  }

  const postIndex = Posts.findIndex(post => post.id === postId);
  const post = Posts[postIndex];
    if (!user.likedPosts.includes(postId) && !user.dislikedPosts.includes(postId)) {
      if (liked === "1") { // tool a lot of time to understand that the requesrt body is not an integer
        post.likes++;
        user.likedPosts.push(postId);
      } else {
        post.likes--;
        user.dislikedPosts.push(postId);
      }
    }
     else if (user.likedPosts.includes(postId) && liked==="0") {
      post.likes -= 2;
      user.likedPosts = user.likedPosts.filter(id => id !== postId);
      user.dislikedPosts.push(postId);
    } else if (user.dislikedPosts.includes(postId) && liked==="1") {
      post.likes += 2;
      user.dislikedPosts = user.dislikedPosts.filter(id => id !== postId);
      user.likedPosts.push(postId);
    }
    
    const updatedUser = user
    const updatedPost = post
    // sending just the new user and post to save time.
    res.send({ Posts: updatedPost, Users: updatedUser}).status(200).end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
