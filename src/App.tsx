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
import React, { CSSProperties, useMemo, useState } from 'react';
import Metadata from './Metadata';
import Area from './Area';

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

const createAreaMapping = (areas: Area[]) => {
  const indexToArea: { [name: string]: boolean } = {};
  areas.forEach((area, index) => {
    indexToArea[index] = false;
  });
  return indexToArea;
}

const BusyImage = (props: BusyImageProps) => {
  const imgUrl = `/static/images/${props.metadata.subpath}.jpg`

  const areas = props.metadata.areas.map((area, index) => {
    return <area key={index} shape={area.shape} coords={area.coords} alt={area.name} href="#"></area>
  });

  //let [areasVisible, setAreasVisible] = useState(createAreaMapping(props.metadata.areas));

  const partNames: Record<string, Area[]> = useMemo(() => {
    let mapping: Record<string, Area[]> = {};
    props.metadata.areas.forEach((area, index) => {
      if (mapping[area.name] === undefined) {
        mapping[area.name] = [];
      }
      mapping[area.name].push(area);
    });
    return mapping;
  }, [props.metadata.areas]);

  let svgs: JSX.Element[] = [];
  Object.keys(partNames).map((partName, partIndex) => {
    const partAreas: Area[] = partNames[partName];

    const svgChildren = partAreas.map((area, areaPartIndex) => {
      const [ x1, y1, x2, y2 ] = area.coords.split(",");
      const width = Math.abs(parseInt(x2, 10) - parseInt(x1, 10));
      const height = Math.abs(parseInt(y2, 10) - parseInt(y1, 10));
      const left = Math.min(parseInt(x1, 10), parseInt(x2, 10));
      const top = Math.min(parseInt(y1, 10), parseInt(y2, 10))

      const rectStyle = {
        fill: "rgb(255,255,0,0.4)",
        strokeWidth: "4",
        stroke: "rgb(0,0,0)"
      };

      return <rect key={areaPartIndex} x={left} y={top} width={width} height={height} style={rectStyle} onMouseEnter={() => console.log("enter") } />
    });

    const svgStyle = {
      position: "absolute",
    } as React.CSSProperties;

    const svgWidth = 1920;
    const svgHeight = 1080;
    svgs.push(<svg key={partIndex} width={svgWidth} height={svgHeight} style={svgStyle}>
      { svgChildren }
    </svg>);
  });

  return <div>
    <img src={imgUrl} useMap="#partmap" style={{ position: "absolute" }}/>
    <map name="partmap">
      { areas }
    </map>
    <div style={{ position: "absolute" }}>
      { svgs }
    </div>
  </div>
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
