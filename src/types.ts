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

export class ExternalError {
    constructor(public status: number, public message: string | object) {
        if (typeof message === 'object') this.message = JSON.stringify(message);
    }
}

export interface DotaNewsNode {
    type: 'img' | 'br' | 'p' | 'b'
    content: string;
}

export const Apps = ['dota', 'clipboard', 'comments'];
