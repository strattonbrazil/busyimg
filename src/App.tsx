import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  useParams
} from "react-router-dom";

import MetadataStore from './MetadataStore';
import React from 'react';
import Metadata from './Metadata';

import { Container, Divider, Menu } from 'semantic-ui-react'
import { BusyImage } from './BusyImage';
import { ImageList } from './ImageList';

const ms = new MetadataStore();

const subpathToMetadata: { [key: string]: Metadata } = {};
ms.metadata.forEach(element => {
  subpathToMetadata[element.subpath] = element;
});

interface ImageParam
{
  id: string;
}

const ImagePage = () => {
  let { id } = useParams<ImageParam>();

  const metadata = subpathToMetadata[id];
  
  return (
    <>
      { metadata && (
        <>
          <Container>
            <h1>{ metadata.title }</h1>
            <h3>by <a href={metadata.creatorLink}>{ metadata.creator }</a></h3>
          </Container>
          <BusyImage metadata={ metadata } />
        </>
      )}
      { !metadata && (
        <Container>
          <div>cannot find image</div>
        </Container>
      )}

      <Container>
        <Divider />
        <ImageList ms={ms} imageId={id} />
        <Divider />
      </Container>
      <BottomBar />
    </>
  )
};

const HomePage = () => {
  return (
    <div>
      <Container>
        <h1>Home</h1>
        <ImageList ms={ms} />
      </Container>
      <BottomBar />
    </div>
  );
};

const BottomBar = () => {
  return (
    <Container>
      <Menu>
        <Menu.Item>
          <a href="/">Home</a>
        </Menu.Item>
        <Menu.Item>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScQJKr1wSd1u2riaM_Fpqf65KaFDiviDkw3oG1I1_S9w3Zh4A/viewform?usp=sf_link">Report a Mistake</a>
        </Menu.Item>
        <Menu.Item>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSc78OI5QJ2nB82BRuLxHS_LkOQjHS2WVcDUOd48o51PRYTThQ/viewform?usp=sf_link">Request an Image</a>
        </Menu.Item>
      </Menu>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Route path="/i/:id">
        <ImagePage />
      </Route>
      <Route exact path="/">
        <HomePage />
      </Route>
    </Router>
  )
}

export default App;

