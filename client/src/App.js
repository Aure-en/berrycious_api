import React, { useState, useEffect } from 'react';

function App() {

  const [apiResponse, setApiResponse] = useState('');

  const callAPI = () => {
    fetch('http://localhost:9000/testAPI')
      .then(res => res.text())
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
