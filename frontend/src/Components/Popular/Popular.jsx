import React, { useState, useEffect } from 'react';
import './Popular.css';
import Item from '../Item/Item';

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/popularinwomen')
      .then((response) => response.json())
      .then((data) => setPopularProducts(data));
  }, []);

  return (
    <div className='popular'>
      <h1>Popular in Women</h1>
      <h4>Explore your dream store</h4>
      <hr />
      <div className='popular-item'>
        {popularProducts.map((item, i) => (
          <Item 
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
      <div>
        <a href="/womens"><button className='more'>explore more</button></a>
      </div>
    </div>
  );
};

export default Popular;
