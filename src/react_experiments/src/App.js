import logo from './logo.svg';
import './App.css';

let huh = false;
let bruh = "to-rot"
let nom8 = ""

function App() {
  return (
    <div className={"App " + nom8} onClick={swap()}>
      <header className="App-header">
        <img src={logo} className={bruh} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
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

const swap = () => {
  if (huh) {
    nom8 = "to-rot";
    bruh = "no-rot";
  } else {
    nom8 = "no-rot";
    bruh = "to-rot";
  }
  huh = !huh
}

export default App;
