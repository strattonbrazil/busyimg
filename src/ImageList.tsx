import MetadataStore from "./MetadataStore";
import React from 'react';

interface ImageListProps
{
    ms: MetadataStore,
    imageId?: string
}

const ImageList = (props: ImageListProps) => {
    let tiles = [] as JSX.Element[];

    props.ms.metadata.forEach((imgMetadata, index) => {
        const imgUrl = `/static/images/${imgMetadata.subpath}_thumbnail.jpg`;
        const isActiveImage = props.imageId === imgMetadata.subpath;

        const href = isActiveImage ? "#" : "/i/" + imgMetadata.subpath;

        const imgStyle = {
            //"opacity" : isActiveImage ? 0.6 : 1,
            "background" : "rgba(255,255,255,0.6)",
            "border" : isActiveImage ? "4px solid #1A0A37" : "4px solid white",
            "borderRadius": "25px",
            "cursor": isActiveImage ? "default" : "",
        } as React.CSSProperties;

        let imageColumn =
        <div key={index} style={{textAlign: "center", display: "inline-block", padding: "1em" }}>
            <a href={href}><img style={imgStyle} alt={imgMetadata.title} src={imgUrl} /></a>
            <div>
                <label>{imgMetadata.title}</label>
            </div>
        </div>;
        tiles.push(imageColumn);
    });

    return <>
        {tiles}
    </>;
}

export { ImageList };
