import logo from './logo.svg';
import './App.css';

import MetadataStore from './MetadataStore';

function App() {
  const ms = new MetadataStore();
  
  const imageLinks = ms.metadata.map((index) => {
    return (
      <a href="">img ref</a>
    )
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reloadx.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
