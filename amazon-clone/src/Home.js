import React from 'react';
import './Home.css';
import Products from './products';

function Home({ addToBasket }) {
  return (
    <div className="home">
      <div className="home__container">
        <img
          className="home__image"
          src="https://images-eu.ssl-images-amazon.com/images/G/31/INSLGW/AugART26/74_1._CB756593360_.jpg"
          alt="Amazon banner"
        />

        <div className="home__row">
          <Products title="Ceramic Jars" price="29.99" image="https://m.media-amazon.com/images/I/71Xy2McQtWL._AC_SY200_.jpg" rating="⭐⭐⭐⭐" addToBasket={addToBasket} />
          <Products title="Lunch Box" price="19.99" image="https://m.media-amazon.com/images/I/51WmCssta3L._AC_SY200_.jpg" rating="⭐⭐⭐⭐" addToBasket={addToBasket} />
          <Products title="Stainless Steel Water Bottle" price="24.99" image="https://m.media-amazon.com/images/I/61hT6rn4dwL._AC_SY200_.jpg" rating="⭐⭐⭐" addToBasket={addToBasket} />
        </div>

        <div className="home__row">
          <Products  title="Headphones" price="49.99" image="https://m.media-amazon.com/images/I/512jrg8-68L._AC_SY170_.jpg" rating="⭐⭐⭐⭐" addToBasket={addToBasket} />
          <Products title="Cotton Bedsheets" price="29.00" image="https://m.media-amazon.com/images/I/81CFUYVw4JL._AC_SY200_.jpg" rating="⭐⭐⭐⭐" addToBasket={addToBasket} />
          <Products  title="Smart Watch" price="199.8" image="https://m.media-amazon.com/images/I/71Tq7xIA2xL._AC_SY200_.jpg" rating="⭐⭐" addToBasket={addToBasket} />
          
        </div>

        <div className="home__row">
          <Products title="Facial hair remover" price="100.0" image="https://m.media-amazon.com/images/I/61RfPOJ+8sL._AC_SY170_.jpg"rating="⭐⭐⭐⭐" addToBasket={addToBasket} />
                                                            
        </div>
      </div>
    </div>
  );
}

export default Home