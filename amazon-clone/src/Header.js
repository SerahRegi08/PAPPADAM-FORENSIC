import React from 'react';
import './Header.css';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { Link } from 'react-router-dom';

function Header({ basketCount }) {
  return (
    <div className="header">
        <img className="header__logo" 
        alt="Amazon"
        src="http://pngimg.com/uploads/amazon/amazon_PNG11.png"
        />

        <div
        className="header__search">
            <input
            className="header__searchInput" type="text"/>
            <SearchIcon
            className="header__searchIcon"/>
        </div>

        <div className="header__nav">
            <div className="header__option">
                <span className="header__optionLineOne">Hello</span>
                <span className="header__optionLineTwo">Sign In</span>
                
            </div>

            <div className="header__option">
                <span className="header__optionLineOne">Returns</span>
                <span className="header__optionLineTwo">& Orders</span>
                
            </div>

            <div className="header__option">
                <span className="header__optionLineOne">Your</span>
                <span className="header__optionLineTwo">Prime</span>
                
            </div>

            <Link to="/checkout" className="header__optionBasket">
                <ShoppingBasketIcon />
                <span className="header__optionLineOne"></span>
                <span className="header__optionLineTwo">{basketCount}</span>
            </Link>
        </div>
    </div>
  )
}

export default Header