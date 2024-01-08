import { List, Typography } from '@mui/material';
import FloatingMenu from '../components/FloatingMenu';
import Post from '../components/Post';
import TagsCloud from '../components/TagsCloud';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function Home({
  Posts,
  Tags,
  tagsList,
  handleAddNewTag,
  selectedTagId,
  selectedPopularityQuery,
  selectedTagQuery,
  userId,
  addPostTags,
  updateLikes, 
  getFilteredTags,
  Users}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);

  const [currentPost, setCurrentPost] = useState()

  ///////////////////////////////////// handle query param /////////////////////////////////////

  // changed after the test, it insert the tag param to the url.
  useEffect(() => {
    const newSearchParams = {};

    if (selectedTagQuery !== '') {
      newSearchParams.tag = selectedTagQuery;
    }
  
    if (selectedPopularityQuery !== '') {
      newSearchParams.popularity = selectedPopularityQuery;
    }
  
    setSearchParams(newSearchParams);
  }, [selectedPopularityQuery, selectedTagQuery, setSearchParams]);

  ///////////////////////////////////// handle tag on post /////////////////////////////////////
  const handleAddTagClick = (event, selectedPostId) => {
    setCurrentPost(selectedPostId)
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (selectedOption) => {
    console.log("handleMenuClose")
    addPostTags(currentPost, selectedOption)
    setAnchorEl(null);
  };

  ///////////////////////////////////// handle filter tag /////////////////////////////////////
  const handleTagClick = (tagName, tagId) => {
      getFilteredTags(tagName)
  };

  ///////////////////////////////////// render components /////////////////////////////////////
  return (
    <div className='container'>
      <List sx={{ width: '650px' }}>
        {Posts && Posts.length !== 0 &&
          Posts.map((post) => {
            return (
              <Post
                key={`home-${post.id}`}
                postId={post.id}
                postTitle={post.title}
                postContent={post.content}
                isAddTagBtn={true}
                handleAddTagClick={handleAddTagClick}
                handleTagClick={handleTagClick}
                selectedTagId={selectedTagId}
                isTagDisabled={false}
                Tags={Tags}
                userId={userId}
                Posts={Posts}
                updateLikes={updateLikes}
                Users={Users}
              />
            );
          })}
        {Posts.length === 0 && (
          <Typography variant='h5' component='div' data-testid='emptyPostList'>
            No Posts Were Found
          </Typography>
        )}
      </List>
      <TagsCloud
        tagsList={tagsList}
        handleAddNewTag={handleAddNewTag}
        selectedTagId={selectedTagId}
        handleTagClick={handleTagClick}
      />
      <FloatingMenu
        menuOptions={tagsList}
        anchorElement={anchorEl}
        handleMenuClose={handleMenuClose}
      />
    </div>
  );
}

export default Home;
