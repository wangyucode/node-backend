import {CommonResult} from "./types";

export function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getDataResult(data: any): CommonResult {
    return {data, success: true};
}

export function getErrorResult(message?: string): CommonResult {
    return {message, success: false};
}
