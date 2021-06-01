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
