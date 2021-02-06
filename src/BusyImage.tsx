import { SyntheticEvent, useCallback, useState } from "react";
import Area from "./Area";
import Metadata from "./Metadata";

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
  let [svgWidth, setSVGWidth] = useState("1920px");
  let [svgHeight, setSVGHeight] = useState("1080px");
  
  const mouseMovedCallback = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = ev.currentTarget.getBoundingClientRect();

    // set the label position relative to the BusyImg
    setHoveredLabelX(ev.clientX - rect.x + ev.currentTarget.scrollLeft + 10);
    setHoveredLabelY(ev.clientY - rect.y + 10);
  }, []);

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement,Event>) => {
    setSVGWidth(event.currentTarget.width + "px");
    setSVGHeight(event.currentTarget.height + "px");
  };

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
    width: svgWidth,
    height: svgHeight,
    pointerEvents: "none",
    overflowX: "hidden",
    overflowY: "hidden"
  } as React.CSSProperties;

  return <div onMouseMove={ mouseMovedCallback } style={imgContainerStyle}>
    <img alt={props.metadata.title} src={imgUrl} useMap="#partmap" onLoad={onImageLoad} />
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

export { BusyImage };
export type { BusyImageProps };