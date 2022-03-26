import axios, { AxiosResponse } from 'axios';

import { CommonResult } from "./types";

export function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getDataResult(payload: any): CommonResult {
    return { payload, success: true };
}

export function getErrorResult(message?: string): CommonResult {
    return { message, success: false };
}

export function isProd(): boolean {
    return process.env.ENV === 'prod';
}

export function randomString(length = 16): string {
    // Declare all characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Pick characers randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};

export function requestByProxy(url: string, method: 'GET' | 'POST' = 'GET', payload?: object): Promise<AxiosResponse> {
    return axios.post('http://wycode.cn:8081/proxy', { method, url, payload, token: process.env.JWT_SECRET })
}
