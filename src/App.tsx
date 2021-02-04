import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  Link,
  useParams
} from "react-router-dom";

import MetadataStore from './MetadataStore';
import React, { useCallback, useState } from 'react';
import Metadata from './Metadata';
import Area from './Area';

import { Container } from 'semantic-ui-react'

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
      <li key={index}><Link to={ "/i/" + imgMetadata.subpath }>{ imgMetadata.title }</Link> by <a href={imgMetadata.creatorLink}>{imgMetadata.creator}</a></li>
    );
  });
  return <Container><ul>
    { imageLinks }
    </ul>
    </Container>;
}

interface BusyImageProps
{
  metadata: Metadata;
}

const createPartMapping = (areas: Area[]) => {
  let mapping: Record<string, Area[]> = {};
  areas.forEach((area, index) => {
    if (mapping[area.name] === undefined) {
      mapping[area.name] = [];
    }
    mapping[area.name].push(area);
  });
  return mapping;
};

const BusyImage = (props: BusyImageProps) => {
  const imgUrl = `/static/images/${props.metadata.subpath}.jpg`

  let [partNames, setPartNames] = useState(() => createPartMapping(props.metadata.areas));
  let [hoveredPartName, setHoveredPartName] = useState<string>();
  let [hoveredLabelX, setHoveredLabelX] = useState(0);
  let [hoveredLabelY, setHoveredLabelY] = useState(0);
  
  const mouseMovedCallback = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = ev.currentTarget.getBoundingClientRect();

    // set the label position relative to the BusyImg
    setHoveredLabelX(ev.clientX - rect.x + ev.currentTarget.scrollLeft + 10);
    setHoveredLabelY(ev.clientY - rect.y + 10);
  }, []);

  let svgs: JSX.Element[] = [];
  Object.keys(partNames).forEach((partName, partIndex) => {
    const partAreas: Area[] = partNames[partName];

    const svgChildren = partAreas.map((area, areaPartIndex) => {
      const [ x1, y1, x2, y2 ] = area.coords.split(",");
      const width = Math.abs(parseInt(x2, 10) - parseInt(x1, 10));
      const height = Math.abs(parseInt(y2, 10) - parseInt(y1, 10));
      const left = Math.min(parseInt(x1, 10), parseInt(x2, 10));
      const top = Math.min(parseInt(y1, 10), parseInt(y2, 10))

      let fillColor = "rgb(255,255,0,0.4)";
      if (partName === hoveredPartName) {
        fillColor = "rgb(255,255,0,0.8)";
      }

      const rectStyle = {
        fill: fillColor,
        strokeWidth: "4",
        stroke: "rgb(0,0,0)",
        pointerEvents: "painted"
      } as React.CSSProperties;

      const onHoverCallback = (ev: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        setPartNames(prevState => {
          let newState = {...prevState}; // shallow copy

          setHoveredPartName(partName);

          return newState;
        });
      };

      const onLeaveCallback = () => {
        setPartNames(prevState => {
          let newState = {...prevState}; // shallow copy

          setHoveredPartName("");

          return newState;
        });
      };

      return <rect key={areaPartIndex} x={left} y={top} width={width} height={height} style={rectStyle} onMouseEnter={onHoverCallback} onMouseLeave={onLeaveCallback} />
    });

    const svgStyle = {
      position: "absolute",
      pointerEvents: "none",
      overflowX: "hidden",
      overflowY: "hidden"
    } as React.CSSProperties;

    const svgWidth = 1920;
    const svgHeight = 1080;
    svgs.push(<svg key={partIndex} width={svgWidth} height={svgHeight} style={svgStyle}>
      { svgChildren }
    </svg>);
  });

  const labelStyle = {
    position: "absolute",
    left: hoveredLabelX,
    top: hoveredLabelY,
    color: "white",
    textShadow: "1px 1px black",
    width: "8em"
  } as React.CSSProperties;
  let partLabel = (
    hoveredPartName !== null && (
      <div style={labelStyle}>{ hoveredPartName }</div>
    )
  );

  const imgContainerStyle = {
    position: "relative",
    overflowX: "scroll", 
    overflowY: "hidden"
  } as React.CSSProperties;

  const overlayStyle = {
    position: "absolute",
    left: "0px",
    top: "0px"
  } as React.CSSProperties;

  return <div onMouseMove={ mouseMovedCallback } style={imgContainerStyle}>
    <img alt={props.metadata.title} src={imgUrl} useMap="#partmap" />
    <div style={overlayStyle}>
      { svgs }
      {
        partLabel
      }
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
          <h3>by <a href={metadata.creatorLink}>{ metadata.creator }</a></h3>
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
