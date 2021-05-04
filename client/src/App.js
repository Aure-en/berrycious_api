import React, { useState, useEffect } from 'react';

function App() {

  const [apiResponse, setApiResponse] = useState('');

  const callAPI = () => {
    fetch('http://localhost:9000/')
      .then(res => res.json())
      .then(res => setApiResponse(res))
      .catch(err => err);
  }

  useEffect(() => {
    callAPI();
  }, []);

  return (
    <div className="App">
      <p>{apiResponse}</p>
    </div>
  );
}

export default App;
