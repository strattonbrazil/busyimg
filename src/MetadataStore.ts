import Metadata from './Metadata';
import VideoGameLegends from './autogenerated/VideoGameLegends';

export default class MetadataStore {
    metadata: Metadata[];

    constructor() {
        this.metadata = [
            VideoGameLegends
        ];
    }
};