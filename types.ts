export interface DotaNews {
    href: string;
    img: string;
    title: string;
    content: string;
    date: string;
}

export interface DotaNewsNode{
    type: 'img' | 'br' | 'p' | 'b'
    content: string;
}
