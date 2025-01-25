export interface JsonResult {
    result: Boolean;
    message: string;
    data: any;
    errors: { [key: string]: string };
}
