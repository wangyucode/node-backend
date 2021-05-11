export interface CommonResult {
    success: boolean;
    payload?: any;
    message?: string;
}

export interface Page {
    page: number;
    size: number;
    total: number;
    items: any[];
}

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
