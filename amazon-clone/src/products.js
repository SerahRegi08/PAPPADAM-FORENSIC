import React from 'react';
import './products.css';

function Products({title, image, price, rating, addToBasket}) {
  return <div className="products">
    <div className="product__info">
        <p>{title}</p>
        <p className="product__price">
            <small>$</small>
            <strong>{price}</strong>
        </p>
        <div className="product__rating" >
          <p>{rating}</p>
        </div>
        

    </div>

    < img src={image} alt={title}/>

    <button onClick={() => addToBasket({ title, image, price, rating })}>Add to basket</button>

    </div>;
  
}

export default Products