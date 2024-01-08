import { List, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Post from '../components/Post';
import axios from 'axios';

function MyRecommendedPosts({ Posts, Tags, userId, Users, selectedTagId, updateLikes, getFilteredTags }) {

  const handleTagClick = (tagName, tagId) => {
    getFilteredTags(tagName)
};

  return (
    <div className='container'>
      <List sx={{ width: '650px' }}>
        {Posts.length !== 0 &&
          Posts.map((post) => {
            return (
              <Post
                key={`myRecommendedPosts-${post.id}`}
                postId={post.id}
                postTitle={post.title}
                postContent={post.content}
                isAddTagBtn={true}
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
            No Recommended Post For You
          </Typography>
        )}
      </List>
    </div>
  );
}

export default MyRecommendedPosts;
