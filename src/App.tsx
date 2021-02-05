import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  useParams
} from "react-router-dom";

import MetadataStore from './MetadataStore';
import React, { useCallback, useState } from 'react';
import Metadata from './Metadata';
import Area from './Area';

import { Container, Divider, Grid } from 'semantic-ui-react'

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

const areaToSVGShapeElement = (area: Area, 
    areaPartKey: string, 
    isHovered: boolean, 
    onHoverCallback: (ev: React.MouseEvent<SVGRectElement, MouseEvent>) => void, 
    onLeaveCallback: (ev: React.MouseEvent<SVGRectElement, MouseEvent>) => void): JSX.Element => {

  const [ x1, y1, x2, y2 ] = area.coords.split(",");
  const width = Math.abs(parseInt(x2, 10) - parseInt(x1, 10));
  const height = Math.abs(parseInt(y2, 10) - parseInt(y1, 10));
  const left = Math.min(parseInt(x1, 10), parseInt(x2, 10));
  const top = Math.min(parseInt(y1, 10), parseInt(y2, 10))

  let fillColor = "rgb(255,255,0,0.4)";
  if (isHovered) {
    fillColor = "rgb(255,255,0,0.8)";
  }

  const rectStyle = {
    fill: fillColor,
    strokeWidth: "4",
    stroke: "rgb(0,0,0)",
    pointerEvents: "painted"
  } as React.CSSProperties;

  return <rect key={areaPartKey} x={left} y={top} width={width} height={height} style={rectStyle} onMouseEnter={onHoverCallback} onMouseLeave={onLeaveCallback} />
};

const BusyImage = (props: BusyImageProps) => {
  const imgUrl = `/static/images/${props.metadata.subpath}.jpg`

  let [partNames] = useState(() => createPartMapping(props.metadata.areas));
  let [hoveredPartName, setHoveredPartName] = useState<string>();
  let [hoveredLabelX, setHoveredLabelX] = useState(0);
  let [hoveredLabelY, setHoveredLabelY] = useState(0);
  
  const mouseMovedCallback = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = ev.currentTarget.getBoundingClientRect();

    // set the label position relative to the BusyImg
    setHoveredLabelX(ev.clientX - rect.x + ev.currentTarget.scrollLeft + 10);
    setHoveredLabelY(ev.clientY - rect.y + 10);
  }, []);

  const allSVGShapes: JSX.Element[] = Object.keys(partNames).map((partName, partIndex) => {
    const partAreas: Area[] = partNames[partName];

    const svgChildren = partAreas.map((area, areaPartIndex) => {
      const areaKey = partIndex + "::" + areaPartIndex;
      const onHoverCallback = (ev: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        setHoveredPartName(partName);
      };

      const onLeaveCallback = () => {
        setHoveredPartName("");
      };

      const isHovered = (partName === hoveredPartName);
    
      return areaToSVGShapeElement(area, areaKey, isHovered, onHoverCallback, onLeaveCallback);
    });

    return svgChildren;
  }).flat(); // change array of array of SVG shapes to array of SVG shapes

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

  const svgStyle = {
    position: "absolute",
    width: "1920px",
    height: "1080px",
    pointerEvents: "none",
    overflowX: "hidden",
    overflowY: "hidden"
  } as React.CSSProperties;

  return <div onMouseMove={ mouseMovedCallback } style={imgContainerStyle}>
    <img alt={props.metadata.title} src={imgUrl} useMap="#partmap" />
    <div style={overlayStyle}>
    <svg style={svgStyle}>
      { allSVGShapes }
    </svg>
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
