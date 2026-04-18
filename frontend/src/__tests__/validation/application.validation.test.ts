import { describe, it, expect } from "vitest";
import {
  validatePersonal,
  validateAnswers,
  isFormValid,
} from "../../features/applications/pages/validation/application.validation";
import type { ApplicationQuestion } from "../../types/application/application";

//  Fixtures 

const validPersonal = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
};

const requiredQuestion: ApplicationQuestion = {
  id: "q1",
  label: "Why do you want to join?",
  required: true,
  type: "textarea",
};

const optionalQuestion: ApplicationQuestion = {
  id: "q2",
  label: "Any extra notes?",
  required: false,
  type: "text",
};

//  validatePersonal 

describe("validatePersonal", () => {
  it("returns no errors for valid personal info", () => {
    expect(validatePersonal(validPersonal)).toEqual({});
  });

  it("requires firstName", () => {
    const errors = validatePersonal({ ...validPersonal, firstName: "" });
    expect(errors.firstName).toBeDefined();
  });

  it("trims whitespace before checking firstName", () => {
    const errors = validatePersonal({ ...validPersonal, firstName: "   " });
    expect(errors.firstName).toBeDefined();
  });

  it("requires lastName", () => {
    const errors = validatePersonal({ ...validPersonal, lastName: "" });
    expect(errors.lastName).toBeDefined();
  });

  it("requires email", () => {
    const errors = validatePersonal({ ...validPersonal, email: "" });
    expect(errors.email).toBeDefined();
  });

  it("rejects email without @ symbol", () => {
    const errors = validatePersonal({ ...validPersonal, email: "notanemail" });
    expect(errors.email).toBeDefined();
  });

  it("accepts email containing @", () => {
    const errors = validatePersonal({ ...validPersonal, email: "a@b" });
    expect(errors.email).toBeUndefined();
  });

  it("reports all fields missing at once", () => {
    const errors = validatePersonal({ firstName: "", lastName: "", email: "" });
    expect(Object.keys(errors)).toHaveLength(3);
  });
});

//  validateAnswers 

describe("validateAnswers", () => {
  it("returns no errors when all required questions are answered", () => {
    const answers = { q1: "Because I am passionate." };
    expect(validateAnswers([requiredQuestion], answers)).toEqual({});
  });

  it("returns an error for an unanswered required question", () => {
    const errors = validateAnswers([requiredQuestion], {});
    expect(errors["q1"]).toBeDefined();
  });

  it("returns an error for a required question answered with only whitespace", () => {
    const errors = validateAnswers([requiredQuestion], { q1: "   " });
    expect(errors["q1"]).toBeDefined();
  });

  it("ignores unanswered optional questions", () => {
    const errors = validateAnswers([optionalQuestion], {});
    expect(errors).toEqual({});
  });

  it("validates multiple required questions independently", () => {
    const q2: ApplicationQuestion = {
      id: "q2",
      label: "Second question",
      required: true,
      type: "text",
    };

    const errors = validateAnswers([requiredQuestion, q2], { q1: "answered" });
    expect(errors["q1"]).toBeUndefined();
    expect(errors["q2"]).toBeDefined();
  });
});

//  isFormValid 

describe("isFormValid", () => {
  it("returns true when personal info and all answers are valid", () => {
    const result = isFormValid(validPersonal, [requiredQuestion], {
      q1: "My answer",
    });
    expect(result).toBe(true);
  });

  it("returns false when personal info is invalid", () => {
    const result = isFormValid(
      { ...validPersonal, email: "bad-email" },
      [requiredQuestion],
      { q1: "My answer" },
    );
    expect(result).toBe(false);
  });

  it("returns false when a required answer is missing", () => {
    const result = isFormValid(validPersonal, [requiredQuestion], {});
    expect(result).toBe(false);
  });

  it("returns true with no questions", () => {
    const result = isFormValid(validPersonal, [], {});
    expect(result).toBe(true);
  });
});
