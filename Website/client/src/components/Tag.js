import { Fab } from '@mui/material';

function Tag({
  tagName,
  postId = '',
  handleOnClick,
  selectedTagId = '',
  isDisabled,
}) {
  const dataTestId = postId ? `tag-${tagName}-${postId}` : `tag-${tagName}`;
  return (
    <Fab
      key={tagName}
      variant='extended'
      size='small'
      disableRipple
      className='Badge'
      disabled={isDisabled}
      onClick={() => handleOnClick(tagName, dataTestId)}
      color='default'
      data-testid={dataTestId}
    >
      {tagName}
    </Fab>
  );
}

export default Tag;
