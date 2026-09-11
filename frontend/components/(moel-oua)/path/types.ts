export interface CategoryItem { id: string; name: string; }
export interface DiplomaItem { id: string; name: string; }
export interface JobTitleItem { id: string; title: string; salary: number; }

export interface GraphData {
  baseNodes: import("reactflow").Node[];
  baseEdges: import("reactflow").Edge[];
  paths: string[][];
}

export interface PathFinderProps {
  categories_id: string;
  user_diploma_id: string;
  local_lang: string;
  categories?: CategoryItem[];
  diplomas?: DiplomaItem[];
  onCategoryChange?: (id: string) => void;
  onDiplomaChange?: (id: string) => void;
}

export interface PathGraphProps {
  graphData: GraphData | null;
  loading: boolean;
  error: string | null;
  categories?: CategoryItem[];
  diplomas?: DiplomaItem[];
  jobTitles?: JobTitleItem[];
  categories_id: string;
  user_diploma_id: string;
  selectedJobId: string;
  selectedProgram: import("@/components/(moel-oua)/ProgramDetailsSidebar").ProgramDetails | null;
  onCategoryChange?: (id: string) => void;
  onDiplomaChange?: (id: string) => void;
  onJobChange?: (id: string) => void;
  onCloseSidebar: () => void;
}
