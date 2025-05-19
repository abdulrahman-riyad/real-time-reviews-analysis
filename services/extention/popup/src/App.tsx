import './App.css'
import GenerateButton from './components/Buttons';
import Header from './components/Header';
import Footer from './components/Footer';
import GithubIcon from './components/Icons';

function App() {
  return (
    <div id="root-div">
      <GithubIcon />
      <Header />
      <GenerateButton />
      <Footer />
    </div>
  )
}

export default App
