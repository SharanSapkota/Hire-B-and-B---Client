export interface IResponse {
    success: boolean;
    error?: string;
    data: Array<AnyObject>;
}

export type AnyObject = { [key: string]: any };

