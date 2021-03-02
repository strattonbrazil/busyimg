import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  useParams
} from "react-router-dom";

import MetadataStore from './MetadataStore';
import React from 'react';
import { Ad, Metadata } from './Metadata';

import { Container, Divider, Grid, List, Menu } from 'semantic-ui-react'
import { BusyImage } from './BusyImage';
import { ImageList } from './ImageList';

import ReactGA from 'react-ga';
import { ArrowBar } from './ArrowBar';

ReactGA.initialize('UA-189463968-1', {
  testMode: process.env.NODE_ENV === 'test'
});

const ms = new MetadataStore();

const subpathToMetadata: { [key: string]: Metadata } = {};
const subpathToMetadataIndex: { [key: string]: number} = {}
const indexToSubpath: { [key: number]: string} = {}
ms.metadata.forEach((element, index) => {
  subpathToMetadata[element.subpath] = element;
  subpathToMetadataIndex[element.subpath] = index;
  indexToSubpath[index] = element.subpath;
});


interface ImageParam
{
  id: string;
}

interface FundingBlurbProps
{
  ads: Ad[]
}

const FundingBlurb = (props: FundingBlurbProps) => {
  const listItems = props.ads.map((ad: Ad, index) => {
    // TODO: choose appropriate icon type based on ad
    return <List.Item key={index}>
      <List.Icon name='users' />
      <List.Content><a href={ad.link}>{ad.text}</a></List.Content>
    </List.Item>;
  });
  return <div style={{display: "inline-block", padding: "1em"}}>
    <b>Humble Request</b> - This site requires a bit of money to keep online. Please consider supporting us by using one of our affliate links below:
    <List>
      { listItems }
    </List>
  </div>;
};

const ThumbnailBar = () => {
  let { id } = useParams<ImageParam>();

  return (
    <Container>
      <ImageList ms={ms} imageId={id} />
    </Container>
  )
}

const ContactBar = () => {
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

const ImagePage = () => {
  let { id } = useParams<ImageParam>();
  const metadata = subpathToMetadata[id];
  const imgIndex = subpathToMetadataIndex[id];

  const numImages = ms.metadata.length;
  const prevImageIndex = (imgIndex + numImages - 1) % numImages;
  const prevHref = "/i/" + indexToSubpath[prevImageIndex];
  
  const nextImageIndex = (imgIndex + 1) % numImages;
  const nextHref = "/i/" + indexToSubpath[nextImageIndex];

  return (
    <>
      { metadata && (
        <>
          <Container>
            <h1>{ metadata.title }</h1>
            <h3>by <a href={metadata.creatorLink}>{ metadata.creator }</a></h3>
          </Container>
          <BusyImage metadata={ metadata } />
          <Container>
            <Grid stackable>
              <Grid.Row>
                <Grid.Column width={8}>
                  <ArrowBar imageIndex={imgIndex} numImages={numImages} prevHref={prevHref} nextHref={nextHref} />
                </Grid.Column>
                { metadata.ads.length > 0 && 
                  <Grid.Column width={8}>
                      <FundingBlurb ads={metadata.ads}></FundingBlurb>
                  </Grid.Column>
                }
              </Grid.Row>
            </Grid>
          </Container>
        </>
      )}
      { !metadata && (
        <Container>
          <div>cannot find image</div>
        </Container>
      )}

      <Divider />
      <ThumbnailBar />
      <Divider />
      <ContactBar />
    </>
  )
};

const HomePage = () => {
  return (
    <div>
      <Container>
        <h1>Home</h1>
        <ThumbnailBar />
      </Container>
      <ContactBar />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Route path="/" render={({location}) => {
        ReactGA.pageview(location.pathname + location.search);
        return null;
      }} />
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

