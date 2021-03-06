import { SyntheticEvent, useCallback, useRef, useState } from "react";
import Area from "./Area";
import { Metadata } from "./Metadata";

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

interface PartLabels {
  name: String;
  origin: String | null;
  year: String | null;
}

const regexSplitter = new RegExp("\\(|\\)");
const parseNameOrigin = (partName: string): PartLabels => {
  const parts = partName.split(regexSplitter,3);
  parts.forEach((val:String, index) => {
    parts[index] = val.trim();
  })
  return {
    "name" : parts[0],
    "origin" : parts.length > 1 ? parts[1] : null,
    "year" : parts.length === 3 ? parts[2] : null
  }
}

const areaToSVGShapeElement = (area: Area, 
    areaPartKey: string, 
    isHovered: boolean, 
    onHoverCallback: () => void, 
    onLeaveCallback: () => void): JSX.Element | null => {

  let shapeStyle = {
    fill: "rgba(0,0,0,0)",
    pointerEvents: "painted"
  } as React.CSSProperties;
  if (isHovered) {
    shapeStyle = {
        fill: "rgba(255,255,0,0.4)",
        strokeWidth: "4",
        stroke: "rgb(0,0,0)",
        pointerEvents: "painted"
    } as React.CSSProperties;
  }

  if (area.shape === "rect") {  
    const [ x1, y1, x2, y2 ] = area.coords.split(",");
    const width = Math.abs(parseInt(x2, 10) - parseInt(x1, 10));
    const height = Math.abs(parseInt(y2, 10) - parseInt(y1, 10));
    const left = Math.min(parseInt(x1, 10), parseInt(x2, 10));
    const top = Math.min(parseInt(y1, 10), parseInt(y2, 10))

    return <rect key={areaPartKey} x={left} y={top} width={width} height={height} style={shapeStyle} onMouseEnter={onHoverCallback} onMouseLeave={onLeaveCallback} />
  } else if (area.shape === "poly") {
      const coords = area.coords.split(",");
      let coordPairs = [];
      for (let index = 0; index < coords.length; index += 2) {
          coordPairs.push(coords[index] + "," + coords[index+1]);
      }
      const points = coordPairs.join(" ");
      
      return <polygon key={areaPartKey} points={points} style={shapeStyle} onMouseEnter={onHoverCallback} onMouseLeave={onLeaveCallback} />
  } else {
      console.log(`unsupported SVG shape: ${area.shape}`);
      return null;
  }
};

const BusyImage = (props: BusyImageProps) => {
  const imgUrl = `/static/images/${props.metadata.subpath}.jpg`

  let [partNames] = useState(() => createPartMapping(props.metadata.areas));
  let [hoveredPartName, setHoveredPartName] = useState<string>("");
  let [hoveredLabelX, setHoveredLabelX] = useState(0);
  let [hoveredLabelY, setHoveredLabelY] = useState(0);
  let [svgWidth, setSVGWidth] = useState("1920px");
  let [svgHeight, setSVGHeight] = useState("1080px");
  let labelRef= useRef<HTMLDivElement>(null);
  let [imageLoaded, setImageLoaded] = useState(false);

  const mouseMovedCallback = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = ev.currentTarget.getBoundingClientRect();

    // set the label position relative to the BusyImg
    const maxLabelWidth = labelRef.current !== null ? labelRef.current.offsetWidth : 0;
    const labelHeight = labelRef.current !== null ? labelRef.current.offsetHeight : 0;

    if (ev.clientX + ev.currentTarget.scrollLeft > ev.currentTarget.scrollWidth/2){
      setHoveredLabelX(ev.clientX - rect.x + ev.currentTarget.scrollLeft - maxLabelWidth);
    } else {
      setHoveredLabelX(ev.clientX - rect.x + ev.currentTarget.scrollLeft + 10);
    };
    if (ev.clientY - rect.y > ev.currentTarget.scrollHeight/2){
      setHoveredLabelY(ev.clientY - rect.y - labelHeight);
    } else {
      setHoveredLabelY(ev.clientY - rect.y);
    };
  }, []);

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement,Event>) => {
    setSVGWidth(event.currentTarget.width + "px");
    setSVGHeight(event.currentTarget.height + "px");
    setImageLoaded(true);
  };

  const allSVGShapes: (JSX.Element | null)[] = Object.keys(partNames).map((partName, partIndex) => {
    const partAreas: Area[] = partNames[partName];

    const svgChildren = partAreas.map((area, areaPartIndex) => {
      const areaKey = partIndex + "::" + areaPartIndex;
      const onHoverCallback = () => {
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
    textShadow: "2px 2px black",
    background: "rgba(0,0,0,0.5)",
    padding: "5px",
    whiteSpace: "nowrap",
    float: "right",
    pointerEvents: "none",
    borderRadius: "6px",
  } as React.CSSProperties;
  
  const firstLineStyle = {
    fontSize: "2em",
    lineHeight: "1em",
  } as React.CSSProperties;  

  const secondLineStyle = {
    fontSize: "1.4em",
    lineHeight: "0.8em",
  } as React.CSSProperties;

  const partLabels = parseNameOrigin(hoveredPartName);
  let partLabel = (
    hoveredPartName !== "" && (
      <div style={labelStyle} ref={labelRef}>
        <div style={firstLineStyle}>{partLabels.name}</div>
        <div style={secondLineStyle}>
          { partLabels.origin && <i> {partLabels.origin} </i> }
          { partLabels.year && "(" + partLabels.year + ")" }
        </div>
      </div>
    )
  );


  const imgContainerStyle = {
    position: "relative",
    overflowX: "scroll", 
    overflowY: "hidden",
    marginBottom: ".8em"
  } as React.CSSProperties;

  const overlayStyle = {
    position: "absolute",
    left: "0px",
    top: "0px"
  } as React.CSSProperties;

  const svgStyle = {
    position: "absolute",
    width: svgWidth,
    height: svgHeight,
    pointerEvents: "none",
    overflowX: "hidden",
    overflowY: "hidden"
  } as React.CSSProperties;

  return <div onMouseMove={ mouseMovedCallback } style={imgContainerStyle}>
    <img alt={props.metadata.title} src={imgUrl} onLoad={onImageLoad} />
    <div style={overlayStyle}>
      {imageLoaded && 
        <svg style={svgStyle}>
          { allSVGShapes }
        </svg>
      }
      {
        partLabel
      }
    </div>
  </div>
}

export { BusyImage, parseNameOrigin };
export type { BusyImageProps };
