import { vi, describe, it, expect, beforeEach } from "vitest";

//  Mock the shared API client 

vi.mock("../../services/api", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock("../../features/public/utils/clubCategory", () => ({
  mapClubCategory: vi.fn((v: unknown) => String(v)),
  toClubCategoryApiValue: vi.fn((v: unknown) => (v === "Sports" ? 2 : 1)),
}));

import { apiGet, apiPost, apiPut } from "../../services/api";
import {
  getSystemAdminClubs,
  createClub,
  updateClubInformation,
  getDepartmentsForClub,
  createDepartment,
  updateDepartmentInformation,
  promoteUserToClubAdmin,
  assignClubAdmin,
  updateUserRole,
} from "../../features/sysAdmin/api/sysAdminApi";

//  Fixtures 

const clubDto = {
  clubId: "club-1",
  clubName: "Chess Club",
  admissionQuestions: ["Why join?"],
  description: "We play chess.",
  category: 1,
};

const departmentDto = {
  departmentId: "dept-1",
  clubId: "club-1",
  departmentName: "Beginners",
  numberOfOpenPositions: 5,
  description: "For new members",
};

//  getSystemAdminClubs 

describe("getSystemAdminClubs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches from the correct endpoint", async () => {
    vi.mocked(apiGet).mockResolvedValue([clubDto]);

    await getSystemAdminClubs();

    expect(apiGet).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/clubs",
      true,
    );
  });

  it("maps each club DTO to a SysAdminClub", async () => {
    vi.mocked(apiGet).mockResolvedValue([clubDto]);

    const clubs = await getSystemAdminClubs();

    expect(clubs).toHaveLength(1);
    expect(clubs[0]).toMatchObject({
      clubId: "club-1",
      clubName: "Chess Club",
      admissionQuestions: ["Why join?"],
      description: "We play chess.",
    });
  });

  it("returns an empty array when the API returns an empty list", async () => {
    vi.mocked(apiGet).mockResolvedValue([]);

    const clubs = await getSystemAdminClubs();

    expect(clubs).toEqual([]);
  });
});

//  createClub 

describe("createClub", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts to the correct endpoint", async () => {
    vi.mocked(apiPost).mockResolvedValue({ message: "Club created" });

    await createClub({ clubName: "  New Club  ", category: "Sports", description: "" });

    expect(apiPost).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/create-club",
      expect.objectContaining({ clubName: "New Club" }),
      true,
    );
  });

  it("trims whitespace from the club name before posting", async () => {
    vi.mocked(apiPost).mockResolvedValue({ message: "OK" });

    await createClub({ clubName: "   Padded Name   ", category: "Sports", description: "" });

    const [, body] = vi.mocked(apiPost).mock.calls[0];
    expect((body as { clubName: string }).clubName).toBe("Padded Name");
  });

  it("returns the API response message", async () => {
    vi.mocked(apiPost).mockResolvedValue({ message: "Club created" });

    const result = await createClub({ clubName: "Chess", category: "Sports", description: "" });

    expect(result.message).toBe("Club created");
  });
});

//  updateClubInformation 

describe("updateClubInformation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("puts to the correct endpoint with the club ID in the URL", async () => {
    vi.mocked(apiPut).mockResolvedValue({ message: "Updated" });

    await updateClubInformation("club-1", {
      clubName: "Updated Club",
      applicationQuestions: ["Q1"],
      requiredApprovals: 2,
      description: "New description",
      category: "Sports",
    });

    expect(apiPut).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/update-club-information/club-1",
      expect.objectContaining({ clubName: "Updated Club" }),
      true,
    );
  });

  it("trims whitespace from club name and description", async () => {
    vi.mocked(apiPut).mockResolvedValue({ message: "OK" });

    await updateClubInformation("club-1", {
      clubName: "  Club  ",
      applicationQuestions: ["  Q1  "],
      requiredApprovals: 1,
      description: "  Desc  ",
      category: "Sports",
    });

    const [, body] = vi.mocked(apiPut).mock.calls[0];
    const b = body as { clubName: string; description: string; applicationQuestions: string[] };
    expect(b.clubName).toBe("Club");
    expect(b.description).toBe("Desc");
    expect(b.applicationQuestions).toEqual(["Q1"]);
  });
});

//  getDepartmentsForClub 

describe("getDepartmentsForClub", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches departments from the correct endpoint", async () => {
    vi.mocked(apiGet).mockResolvedValue([departmentDto]);

    await getDepartmentsForClub("club-1");

    expect(apiGet).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/departments-club/club-1",
      true,
    );
  });

  it("maps DTOs to SysAdminDepartment objects", async () => {
    vi.mocked(apiGet).mockResolvedValue([departmentDto]);

    const departments = await getDepartmentsForClub("club-1");

    expect(departments[0]).toEqual({
      departmentId: "dept-1",
      clubId: "club-1",
      departmentName: "Beginners",
      numberOfOpenPositions: 5,
      description: "For new members",
    });
  });
});

//  createDepartment 

describe("createDepartment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts to the correct endpoint with trimmed fields", async () => {
    vi.mocked(apiPost).mockResolvedValue({ message: "Created" });

    await createDepartment({
      clubId: "club-1",
      departmentName: "  Marketing  ",
      numberOfOpenPositions: 3,
      description: "  Handles marketing  ",
    });

    const [endpoint, body] = vi.mocked(apiPost).mock.calls[0];
    const b = body as { departmentName: string; description: string };
    expect(endpoint).toBe("/api/recruitmentInfo/api/create-department");
    expect(b.departmentName).toBe("Marketing");
    expect(b.description).toBe("Handles marketing");
  });
});

//  updateDepartmentInformation 

describe("updateDepartmentInformation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("puts to the URL containing the department ID", async () => {
    vi.mocked(apiPut).mockResolvedValue({ message: "Updated" });

    await updateDepartmentInformation("dept-1", {
      departmentName: "Advanced",
      numberOfOpenPositions: 10,
      description: "For experienced members",
    });

    expect(apiPut).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/update-department-information/dept-1",
      expect.objectContaining({ departmentName: "Advanced" }),
      true,
    );
  });
});

//  promoteUserToClubAdmin 

describe("promoteUserToClubAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("puts to the correct endpoint with the club ID as the body", async () => {
    vi.mocked(apiPut).mockResolvedValue({ message: "Promoted" });

    await promoteUserToClubAdmin("user-42", "club-1");

    expect(apiPut).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/update-user-promote-club-admin/user-42",
      "club-1",
      true,
    );
  });
});

//  assignClubAdmin 

describe("assignClubAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("puts the clubId and roleId to the correct endpoint", async () => {
    vi.mocked(apiPut).mockResolvedValue({ message: "Assigned" });

    await assignClubAdmin("user-1", "club-1", "role-1");

    expect(apiPut).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/assign-club-admin/user-1",
      { clubId: "club-1", roleId: "role-1" },
      true,
    );
  });
});

//  updateUserRole 

describe("updateUserRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("puts to the correct endpoint with the role ID as the body", async () => {
    vi.mocked(apiPut).mockResolvedValue({ message: "Role updated" });

    await updateUserRole("user-5", "role-admin");

    expect(apiPut).toHaveBeenCalledWith(
      "/api/recruitmentInfo/api/update-user-role/user-5",
      "role-admin",
      true,
    );
  });
});
