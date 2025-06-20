export interface PortfolioMedia {
  type: "image" | "video";
  url: string;
  tag?: string;
  impact: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  role: string;
  boxart: string;
  media: PortfolioMedia[];
} 