export interface CommonResult {
    success: boolean;
    data?: any;
    message?: string;
}

export interface Page {
    page: number;
    size: number;
    total: number;
    data: any[];
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
