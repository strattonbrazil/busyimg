import { Grid } from "semantic-ui-react";
import MetadataStore from "./MetadataStore";

const ms = new MetadataStore();

const ImageList = () => {
    let rowChunks = [[<Grid.Column></Grid.Column>]];
    rowChunks.shift(); // NOTE: this is a hack because I don't know how to type the above array without putting something in it

    ms.metadata.forEach((imgMetadata, index) => {
        const imgUrl = `/static/images/${imgMetadata.subpath}_thumbnail.jpg`;
        const divStyle = {
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center"
        } as React.CSSProperties;

        let imageColumn = <Grid.Column key={index}>
        <div style={{textAlign: "center"}}>
            <div style={divStyle}>
                <a href={"/i/" + imgMetadata.subpath}><img alt={imgMetadata.title} src={imgUrl} /></a>
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

export { ImageList };
