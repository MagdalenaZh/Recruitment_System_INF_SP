import type {
  ClubAdminClubInfo,
} from "../../features/clubAdmin/types/clubAdminTypes";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

const RECRUITMENT_INFO_BASE = `${API_BASE}/api/recruitmentInfo/api`;

function buildHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function resolveCurrentClubId(): string {
  const clubId = localStorage.getItem("clubId");

  if (!clubId) {
    throw new Error(
      'No clubId found in localStorage. Expected current club under key "clubId".'
    );
  }

  return clubId;
}

type ClubDto = {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: string;
};

type DepartmentDto = {
  clubId: string;
  departmentId: string;
  departmentName: string;
  description: string;
  numberOfOpenPositions: number;
};

export const clubAdminApi = {
  async getCurrentClubInfo(): Promise<ClubAdminClubInfo> {
    const clubId = resolveCurrentClubId();

    const [clubs, departments] = await Promise.all([
      handleResponse<ClubDto[]>(
        await fetch(`${RECRUITMENT_INFO_BASE}/clubs`, {
          method: "GET",
          headers: buildHeaders(),
        })
      ),
      handleResponse<DepartmentDto[]>(
        await fetch(`${RECRUITMENT_INFO_BASE}/departments-club/${clubId}`, {
          method: "GET",
          headers: buildHeaders(),
        })
      ),
    ]);

    const club = clubs.find((c) => c.clubId === clubId);

    if (!club) {
      throw new Error("Could not find the current club.");
    }

    return {
      clubId: club.clubId,
      clubName: club.clubName,
      description: club.description,
      category: club.category,
      admissionQuestions: club.admissionQuestions ?? [],
      departments: departments.map((d) => ({
        departmentId: d.departmentId,
        departmentName: d.departmentName,
        description: d.description,
        openPositions: d.numberOfOpenPositions,

        // TODO:
        // Backend endpoint for department head assignment is not ready yet.
        // Replace these placeholders when the backend exposes current head data.
        headName: null,
        headUserId: null,
      })),
    };
  },

  async updateAdmissionQuestions(clubId: string, questions: string[]) {
    return handleResponse<{ message: string }>(
      await fetch(
        `${RECRUITMENT_INFO_BASE}/update-admission-questions/${clubId}`,
        {
          method: "PUT",
          headers: buildHeaders(),
          body: JSON.stringify(questions),
        }
      )
    );
  },

  async updateOpenPositions(departmentId: string, openPositions: number) {
    return handleResponse<{ message: string }>(
      await fetch(
        `${RECRUITMENT_INFO_BASE}/update-open-positions/${departmentId}`,
        {
          method: "PUT",
          headers: buildHeaders(),
          body: JSON.stringify(openPositions),
        }
      )
    );
  },

  async assignDepartmentHead(_departmentId: string, _userId: string) {
    // TODO:
    // Backend endpoint not ready yet.
    // Suggested future endpoint:
    // PUT /api/recruitmentInfo/api/update-department-head/{departmentId}
    throw new Error("Department head assignment endpoint not ready yet.");
  },

  async searchUsers(_query: string) {
    // TODO:
    // Backend user search endpoint not ready yet.
    // Suggested future endpoint:
    // GET /api/recruitmentInfo/api/users/search?query=...
    throw new Error("User search endpoint not ready yet.");
  },
};