import axios from 'axios';
import './App.css';
import { useState, useEffect, useCallback, useMemo} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddNewPost from './pages/AddNewPost';
import MyRecommendedPosts from './pages/MyRecommendedPosts';
import FloatingMenu from './components/FloatingMenu';
import {
  Typography,
  AppBar,
  Toolbar,
  Button,
  ButtonGroup,
  Alert,
  Snackbar,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RecommendIcon from '@mui/icons-material/Recommend';
import HomeIcon from '@mui/icons-material/Home';

function App() {
  const baseURL = 'http://localhost:3080';
  const popularityOptions = [1, 2, 4, 10, 20];

  const [userId, setUserId] = useState('');

  const [selectedPopularityQuery, setSelectedPopularityQuery] = useState('');
  const [selectedTagQuery, setSelectedTagQuery] = useState('');

  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const [tags, setTags] = useState({});
  const [tagsList, setTagsList] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  const [usersList, setUsersList] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);

  const [alertMsg, setAlertMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');

  const [recommendedPosts, setRecommendedPosts] = useState([]);

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        handleAlert('', false, '');
      }, 1500);
    }
  }, [showAlert]);

  const handleAlert = (message, isShow, type) => {
    setAlertMsg(message);
    setShowAlert(isShow);
    setAlertType(type);
  };

  ///////////////////////////////////// data req /////////////////////////////////////
  axios.defaults.withCredentials = true;
  ///////////////////// get req /////////////////////

  // sets a userId cookie
  const getUser = useCallback(() => {
    axios
      .get(`${baseURL}/user`)
      .then((response) => {
        setUserId(response.data.id);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

  const getPosts = useCallback(() => {
    axios
      .get(`${baseURL}/posts`)
      .then((response) => {
        setAllPosts([...response.data['Posts']]);
        setFilteredPosts([...response.data['Posts']]);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

  // added after the test
  const getUsers = useCallback(() => {
    axios
      .get(`${baseURL}/users`)
      .then((response) => {
        setUsersList([...response.data['Users']]);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);
  

  const getTags = useCallback(() => {
    axios
      .get(`${baseURL}/tags`)
      .then((response) => {
        setTags({ ...response.data['Tags'] });
        const tagsList = [];
        for (const tagName in response.data['Tags']) {
          tagsList.push(tagName);
        }
        setTagsList(tagsList);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  }, []);

    // recommended request from express
    const getRecommendedPosts = () => {
      axios.get(`${baseURL}/my-recommended-posts`)
     .then((response) => setRecommendedPosts(response.data.Posts))
     .catch(error =>{
       handleAlert(error.message, true, 'error');
   })
   };
   
    useEffect(() => {
      getRecommendedPosts();
    }, []);
    

  // add problem with the order of use effect took a lot of time to understand this.
  useEffect(() => {
    getUser();
    getUsers();
    getPosts();
    getTags();
  }, [getPosts, getTags, getUser, getUsers]);


  // filter by popularity and tags - i did two different method in the start, but i combined them.
  // it happened after the test.
  const getFilteredPosts = (popularity, tag) => {
    let url = ''
    if (popularity && tag) {
      url = `tag=${tag}&popularity=${popularity}`;
    } else if (tag) {
      url = `tag=${tag}`;
    } else if (popularity) {
      url = `popularity=${popularity}`;
    }
    
    axios
      .get(`${baseURL}/tagAndPop?${url}`)
      .then((response) => {
        setFilteredPosts([...response.data['Posts']]);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };

  ///////////////////// post req /////////////////////
  const addPost = (id, title, content, selectedTag) => {
    axios
      .post(
        `${baseURL}/posts`,
        {
          id: id,
          title: title,
          content: content
        },
        {
          headers: {
            // to send a request with a body as json you need to use this 'content-type'
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then((response) => {
        addPostTags(id, selectedTag) // to add the chosen tag with the post.
        const updatedPost = response.data['Posts'];

        setAllPosts((prevAllPosts) => [...prevAllPosts, updatedPost]);
        setFilteredPosts((prevFilteredPosts) => [...prevFilteredPosts, updatedPost]);        
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };

  // no need to replace all tags. (not my code)
  const addNewTag = (tagName) => {
    axios
      .post(`${baseURL}/tags/tagName/${tagName}`)
      .then((response) => {
        setTags({ ...response.data['Tags'] });
        const tagsList = [];
        for (const tagName in response.data['Tags']) {
          tagsList.push(tagName);
        }
        setTagsList(tagsList);
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };

  const addPostTags = (postId, tagName) => {
    axios
    .post(
      `${baseURL}/addPostTag`,
      {
        postId : postId,
        tagName : tagName
      },
      {
        headers: {
          // to send a request with a body as json you need to use this 'content-type'
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    )
      .then((response) => {
        setTags({ ...tags, ...response.data['Tags'] }); // change just the updated post tag - avoiding unnecessary renders.
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });   
  }

  // change just the neseccery components. to not rerender all
  const updateLikes = (postId, liked) => {
    axios
      .post(
        `${baseURL}/updateLikes`,
        {
          postId: postId,
          liked: liked
        },
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then((response) => {
        const updatedUser = response.data['Users'];
        const updatedPost = response.data['Posts'];
  
        // Update the user in the user list
        setUsersList((prevUsersList) => {
          const updatedUsers = prevUsersList.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          );
          return updatedUsers;
        });
  
        // Update the post in the all posts and filtered posts list
        setAllPosts((prevAllPosts) => {
          const updatedPosts = prevAllPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          );
          return updatedPosts;
        });
        setFilteredPosts((prevFilteredPosts) => {
          const updatedPosts = prevFilteredPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          );
          return updatedPosts;
        });
      })
      .catch((error) => {
        handleAlert(error.message, true, 'error');
      });
  };
  

  ///////////////////////////////////// handle click events /////////////////////////////////////
  const handlePopularityClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopularityMenuClose = (selectedOption) => {
    setAnchorEl(null);
    filterPostsByPopularity(selectedOption);
  };

  const handleHomeClick = () => {
    setFilteredPosts(allPosts);
    setSelectedPopularityQuery('');
    setSelectedTagId('');
  };


  ///////////////////////////////////// filters /////////////////////////////////////
  const filterPostsByPopularity = (minLikeNum = 1) => {
    setSelectedPopularityQuery(`${minLikeNum}`);
    getFilteredPosts(minLikeNum, selectedTagQuery);
  };

  const filterPostsByTag = (tagName) => {
    setSelectedTagQuery(`${tagName}`);
    getFilteredPosts(selectedPopularityQuery, tagName);
  };

  ///////////////////////////////////// render components /////////////////////////////////////
  const renderToolBar = () => {
    return (
      <AppBar position='sticky' color='inherit'>
        <Toolbar>
          <ButtonGroup variant='text' aria-label='text button group'>
            <Button
              onClick={handleHomeClick}
              href='/'
              size='large'
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            <Button
              href='/add-new-post'
              size='large'
              startIcon={<AddCircleIcon />}
              data-testid='addNewPostBtn'
            >
              Add a New Post
            </Button>
            <Button
              href= '/my-recommended-posts'
              size='large'
              startIcon={<AddCircleIcon />}
              data-testid='addNewPostBtn'
            >
              Explore more posts
            </Button>
          </ButtonGroup>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Enter 2023 Blog Exam
          </Typography>
          <Button
            className={
              window.location.href !==
                'http://localhost:3000/my-recommended-posts' &&
              window.location.href !== 'http://localhost:3000/add-new-post'
                ? ''
                : 'visibilityHidden'
            }
            size='large'
            startIcon={<FilterAltIcon />}
            onClick={(e) => handlePopularityClick(e)}
            data-testid='popularityBtn'
          >
            Filter by Popularity
          </Button>
          <FloatingMenu
            menuOptions={popularityOptions}
            anchorElement={anchorEl}
            handleMenuClose={handlePopularityMenuClose}
          />
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <div className='App'>
      {renderToolBar()}
      {showAlert && (
        <Snackbar>
          <Alert severity={alertType} data-testid='alert'>
            {alertMsg}
          </Alert>
        </Snackbar>
      )}
      <Router>
        <Routes>
          <Route
            path='/my-recommended-posts'
            element={
              <MyRecommendedPosts
                Posts={recommendedPosts}
                Tags={tags}
                userId={userId}
                Users={usersList}
                handleAddNewTag={addNewTag}
                updateLikes={updateLikes}
                getFilteredTags={filterPostsByTag}
              />
            }
          />
          <Route
            path='/add-new-post'
            element={<AddNewPost handleAddPost={addPost} />}
          />
          <Route
            path='/'
            element={
              <Home
                Posts={filteredPosts}
                Tags={tags}
                tagsList={tagsList}
                handleAddNewTag={addNewTag}
                selectedTagId={selectedTagId}
                selectedPopularityQuery={selectedPopularityQuery}
                selectedTagQuery={selectedTagQuery}
                userId={userId}
                addPostTags = {addPostTags}
                updateLikes={updateLikes}
                getFilteredTags = {filterPostsByTag}
                Users={usersList}
              />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
