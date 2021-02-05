import Metadata from './Metadata';
import VideoGameLegends from './autogenerated/VideoGameLegends';
import WheresWalle from './autogenerated/WheresWalle';

export default class MetadataStore {
    metadata: Metadata[];

    constructor() {
        this.metadata = [
            VideoGameLegends,
            WheresWalle
        ];
    }
};