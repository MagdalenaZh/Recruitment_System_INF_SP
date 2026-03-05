import type { RouteObject } from "react-router-dom";
import { BoardHomePage } from "../pages/BoardHomePage";
import { BoardDepartmentApplicationsPage } from "../pages/BoardDepartmentApplicationsPage";
import { BoardApplicationDetailPage } from "../pages/BoardApplicationDetailPage";

export const boardRoutes: RouteObject[] = [
  { path: "/board", element: <BoardHomePage /> },
  {
    path: "/board/departments/:departmentId/applications",
    element: <BoardDepartmentApplicationsPage />,
  },
  {
    path: "/board/applications/:applicationId",
    element: <BoardApplicationDetailPage />,
  },
];
