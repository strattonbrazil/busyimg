import Area from './Area';

export default interface Metadata
{
    title: string;
    creator: string;
    creatorLink: string | undefined;
    areas: Area[];
}