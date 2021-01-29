import Metadata from './Metadata';
import ManyGameCharacters from '../processed/many-game-characters/ManyGameCharacters';

export default class MetadataStore {
    metadata: Metadata[];

    constructor() {
        this.metadata = [
            ManyGameCharacters
        ];
    }
};