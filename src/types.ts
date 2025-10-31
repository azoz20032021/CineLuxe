export interface Movie {
  id: number;
  title: string;
  year?: number;
  genre?: string[];
  overview?: string;
  poster: string;
  backdrop: string;
}
