import { MenuItem, Menu } from '@mui/material';
import { useState } from 'react';

function FloatingMenu({ menuOptions, anchorElement, handleMenuClose }) {
  const open = Boolean(anchorElement);
  const [currentOption, setCurrentOption] = useState(null)
  
  const handleClose = (selectedOption, optionId) => {
    setCurrentOption(selectedOption)
    const option = menuOptions.includes(selectedOption) ? selectedOption : '';
    handleMenuClose(option);
  };

  return (
    <Menu
      id='positioned-menu'
      data-testid='positioned-menu'
      aria-labelledby='positioned-button'
      anchorEl={anchorElement}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      {menuOptions.map((option) => {
        const optionId = `positioned-menu-${option}`;
        return (
          <MenuItem
            key={option}
            value={option}
            onClick={() => handleClose(option, optionId)}
            selected={option === currentOption}
            data-testid={optionId}
          >
            {option}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export default FloatingMenu;
