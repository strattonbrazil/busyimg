import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  useParams
} from "react-router-dom";

import MetadataStore from './MetadataStore';
import React from 'react';
import Metadata from './Metadata';

import { Container, Divider, Grid } from 'semantic-ui-react'
import { BusyImage } from './BusyImage';

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
  let rowChunks = [[<Grid.Column></Grid.Column>]];
  rowChunks.shift(); // NOTE: this is a hack because I don't know how to type the above array without putting something in it

  ms.metadata.forEach((imgMetadata, index) => {
    const imgUrl = `/static/images/${imgMetadata.subpath}_thumbnail.jpg`;
    const divStyle = {
      height: "168px", 
      backgroundColor: "black", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center"
    } as React.CSSProperties;

    let imageColumn = <Grid.Column key={index}>
      <div style={{textAlign: "center"}}>
        <div style={divStyle}>
          <a href={"/i/" + imgMetadata.subpath}><img alt={imgMetadata.title} src={imgUrl} style={{ lineHeight: "168px" }} /></a>
        </div>
        <div>
          <label>{imgMetadata.title}</label>
        </div>
      </div>
    </Grid.Column>;

    if (index % 3 === 0) {
      rowChunks.push([ imageColumn ]);
    } else {
      rowChunks[rowChunks.length - 1].push(imageColumn);
    }
  });

  let rows = rowChunks.map((rowChunk, rowIndex) => {
    return <Grid.Row key={rowIndex} columns={3}>{ rowChunk }</Grid.Row>;
  });

  return <Grid>
    { rows }
  </Grid>;
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
        <ImageList />
      </Container>
    </>
  )
};

const HomePage = () => {
  return (
    <div>
      <Container>
        <h1>Home</h1>
        <ImageList />
      </Container>
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
