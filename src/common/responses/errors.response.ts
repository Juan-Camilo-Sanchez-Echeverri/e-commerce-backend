export class ErrorsResponse {
  message: string;
  code: number | null = null;
  errors?: Array<{ property: string; errors: string[] }> = [];
}
