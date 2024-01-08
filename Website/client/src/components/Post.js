import {
  ListItem,
  ListItemButton,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Typography,
} from '@mui/material';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import AddTagButton from './AddTagButton';
import Tag from './Tag';
import { useState, useEffect, useCallback } from 'react';

function Post({
  postId,
  postTitle,
  postContent,
  isAddTagBtn,
  handleAddTagClick,
  handleTagClick,
  selectedTagId,
  isTagDisabled,
  Tags,
  userId,
  Posts,
  updateLikes,
  Users
}) {
  const getTagsByPostId = (postID) => {
    const tagsArr = [];
    for (const tagName in Tags) {
      if (Tags[tagName][postID]) {
        tagsArr.push(tagName);
      }
    }
    return tagsArr;
  };

  const tagsNameArr = getTagsByPostId(postId);
  const isTag = tagsNameArr.length > 0 ? true : false;

  const [didUserLikePost, setDidUserLikePost] = useState(false);
  const [didUserDislikePost, setDidUserDislikePost] = useState(false);
  const [postLike, setPostLike] = useState(0)

  // needeed to change the dependencies to make it work in the right render. 
  // i did it with didUserLikePost
  useEffect(() => {
    // like count
    const like = Posts.find((post) => post.id === postId).likes 
  
    // user like or dislike 
    let user = Users.find((user) => user.id === userId);
  
    // Check if the post is liked or disliked by the user - had problem with that, cause in the first render the user still not exist.
    const userLikedPosts = (user && user.likedPosts) || [];
    const userDislikedPosts = (user && user.dislikedPosts) || [];
    const didUserLike = userLikedPosts.includes(postId);
    const didUserDislike = userDislikedPosts.includes(postId);
  
    setDidUserLikePost(didUserLike);
    setDidUserDislikePost(didUserDislike);
    setPostLike(like);
  }, [updateLikes]);

  // after the test - change the number to be in the same color of the button 
  const getTypographyColor = () => {
    if (postLike < 0) return 'red';
    if (postLike > 0) return 'green';
    return 'grey';
  };

  return (
    <ListItem
      alignItems='flex-start'
      key={`post-${postId}`}
      className='post'
      data-testid={`post-${postId}`}
    >
      <Card className='post'>
        <ListItemButton disableGutters>
          <CardContent>
            <Typography
              variant='h5'
              gutterBottom
              data-testid={`postTitle-${postId}`}
            >
              {postTitle}
            </Typography>
            <Typography
              variant='body1'
              gutterBottom
              data-testid={`postContent-${postId}`}
            >
              {postContent}
            </Typography>
          </CardContent>
        </ListItemButton>
        <CardActions>
          {isAddTagBtn && (
            <AddTagButton
              dataTestId={`postAddTagBtn-${postId}`}
              onClick={(e) => handleAddTagClick(e, postId)}
            />
          )}
          {isTag &&
            tagsNameArr.map((tagName, index) => (
              <Tag
                key={`post-${index}-${tagName}`}
                tagName={tagName}
                postId={postId}
                handleOnClick={handleTagClick}
                selectedTagId={selectedTagId}
                isDisabled={isTagDisabled}
              />
            ))}
          <IconButton
            aria-label='dislike'
            size='small'
            data-testid={`postDislikeBtn-${postId}`}
            onClick={()=>{
              updateLikes(postId, 0)}}
          >
            {didUserDislikePost ? (
              <ThumbDownAltIcon
                color='error'
                data-testid={`fullDislikeIcon-${postId}`}
              />
            ) : (
              <ThumbDownOffAltIcon
                color='error'
                data-testid={`hollowDislikeIcon-${postId}`}
              />
            )}
          </IconButton>
          <Typography
            variant='string'
            data-testid={`postDislikeNum-${postId}`}
            color='red'
          >
          </Typography>
          <IconButton
            aria-label='like'
            size='small'
            data-testid={`postLikeBtn-${postId}`}
            onClick={()=>{
              updateLikes(postId, 1)}}
          >
            {didUserLikePost ? (
              <ThumbUpAltIcon
                color='success'
                data-testid={`fullLikeIcon-${postId}`}
              />
            ) : (
              <ThumbUpOffAltIcon
                color='success'
                data-testid={`hollowLikeIcon-${postId}`}
              />
            )}
          </IconButton>
          <Typography
            variant='string'
            data-testid={`postLikeNum-${postId}`}
            color={getTypographyColor()}
          >
            {postLike}
          </Typography>
        </CardActions>
      </Card>
    </ListItem>
  );
}

export default Post;
