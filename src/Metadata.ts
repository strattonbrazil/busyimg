import Area from './Area';

type AdType = "Amazon film rental" | "Amazon game purchase" | "Amazon book"

interface Ad
{
    adType: AdType,
    text: string,
    link: string
}
interface Metadata
{
    title: string;
    subpath: string;
    creator: string;
    creatorLink: string | undefined;
    ads: Ad[];
    areas: Area[];
}

export type { Ad, AdType, Metadata };