import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

import MetadataStore from './MetadataStore';
import React from 'react';
import Metadata from './Metadata';

const ms = new MetadataStore();

const subpathToMetadata: { [key: string]: Metadata } = {};
ms.metadata.forEach(element => {
  subpathToMetadata[element.subpath] = element;
});

interface ImageParam
{
  id: string;
}

const ImageList = () => {
  const imageLinks = ms.metadata.map((imgMetadata, index) => {
    return (
      <Link key={index} to={ "/i/" + imgMetadata.subpath }>{ imgMetadata.title }</Link>
    )
  });
  return (
    <>{ imageLinks }</>
  )
}

interface BusyImageProps
{
  metadata: Metadata;
}

const BusyImage = (props: BusyImageProps) => {
  const imgUrl = `/static/images/${props.metadata.subpath}.jpg`

  const areas = props.metadata.areas.map((area, index) => {
    return <area key={index} shape={area.shape} coords={area.coords} alt={area.name} href="#"></area>
  })

  return <>
    <img src={imgUrl} useMap="#partmap" />
    <map name="partmap">
      { areas }
    </map>
  </>
}

const ImagePage = () => {
  let { id } = useParams<ImageParam>();

  const metadata = subpathToMetadata[id];
  
  return (
    <>
      { metadata && (
        <>
          <h1>{ metadata.title }</h1>
          <BusyImage metadata={ metadata } />
        </>
      )}
      { !metadata && (
        <div>cannot find image</div>
      )}

      <ImageList />
    </>
  )
};

const HomePage = () => {
  return (
    <div>
      <h1>Home</h1>
      <ImageList />
    </div>
  );
};

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
