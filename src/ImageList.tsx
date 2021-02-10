import MetadataStore from "./MetadataStore";
import React, { useState } from 'react';
import "./ImageList.scss";

interface ImageListProps
{
    ms: MetadataStore,
    imageId?: string
}

const ImageList = (props: ImageListProps) => {
    let [hoveredImageId, setHoveredImageId] =  useState("");

    let tiles = [] as JSX.Element[];

    props.ms.metadata.forEach((imgMetadata, index) => {
        const imgUrl = `/static/images/${imgMetadata.subpath}_thumbnail.jpg`;
        const isActiveImage = props.imageId === imgMetadata.subpath;

        const href = isActiveImage ? "#" : "/i/" + imgMetadata.subpath;

        const onMouseEnter = () => {
            setHoveredImageId(imgMetadata.subpath);
        };
    
        const onMouseLeave = () => {
            setHoveredImageId("");
        };

        let imgClasses = ["thumbnail"];
        if (isActiveImage) {
            imgClasses.push("selected");
        } else if (imgMetadata.subpath === hoveredImageId) {
            imgClasses.push("hovered");
        }

        let imageColumn =
        <div key={index} style={{textAlign: "center", display: "inline-block", padding: "1em" }}>
            <a href={href}><img className={imgClasses.join(" ")} alt={imgMetadata.title} src={imgUrl} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} /></a>
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
