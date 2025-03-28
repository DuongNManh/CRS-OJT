export interface ApiResponse<T> {
  status_code: number;
  message: string;
  reason?: string;
  is_success: boolean;
  data?: T;
}
export interface PaginationMeta {
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}

export interface PagingResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
