export type ClubCategory = string | number;

export type ClubListItem = {
    clubId: string;
    clubName: string;
    admissionQuestions: string[];
    description: string;
    category: ClubCategory;
};

export type ClubDepartment = {
    departmentId: string;
    clubId: string;
    departmentName: string;
    numberOfOpenPositions: number;
    description: string;
};

export type ClubDetails = {
    clubId: string;
    clubName: string;
    description: string;
    admissionQuestions: string[];
    departments: ClubDepartment[];
    category: ClubCategory;
};