import MetadataStore from "./MetadataStore";
import React from 'react';

const ms = new MetadataStore();

const ImageList = () => {
    let tiles = [] as JSX.Element[];

    ms.metadata.forEach((imgMetadata, index) => {
        const imgUrl = `/static/images/${imgMetadata.subpath}_thumbnail.jpg`;
        let imageColumn =
        <div key={index} style={{textAlign: "center", display: "inline-block", padding: "1em" }}>
            <a href={"/i/" + imgMetadata.subpath}><img alt={imgMetadata.title} src={imgUrl} /></a>
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
