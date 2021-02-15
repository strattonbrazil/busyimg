import Metadata from './Metadata';
import VideoGameLegends from './autogenerated/VideoGameLegends';
import WheresWalle from './autogenerated/WheresWalle';
import WarpCoreCafe from './autogenerated/WarpCoreCafe';

export default class MetadataStore {
    metadata: Metadata[];

    constructor() {
        this.metadata = [
            VideoGameLegends,
            WheresWalle,
            WarpCoreCafe
        ];
    }
};