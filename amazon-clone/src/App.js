import React, { useState } from "react";
import './App.css';
import Header from "./Header";
import Home from "./Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from "./checkout";

function App() {
  const [basket, setBasket] = useState([]);

  const addToBasket = (product) => {
    setBasket((currentBasket) => [...currentBasket, product]);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<><Header basketCount={basket.length} /><Home addToBasket={addToBasket} /></>} />
          <Route path="/home" element={<><Header basketCount={basket.length} /><Home addToBasket={addToBasket} /></>} />
          <Route path="/checkout" element={<><Header basketCount={basket.length} /><Checkout /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
