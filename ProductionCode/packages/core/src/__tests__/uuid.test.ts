import { describe, it, expect } from "vitest";
import { validateUuid, stringToUuid, generateUuid, isUuid, ensureUuid } from "../uuid";
import type { UUID } from "../types";

describe("UUID utilities", () => {
    it("should validate correct UUID format", () => {
        const validUuid = "123e4567-e89b-12d3-a456-426614174000";
        expect(validateUuid(validUuid)).toBe(validUuid);
    });

    it("should reject invalid UUID format", () => {
        const invalidUuid = "not-a-uuid";
        expect(validateUuid(invalidUuid)).toBeNull();
    });

    it("should generate consistent UUID from string", () => {
        const input = "test-string";
        const uuid1 = stringToUuid(input);
        const uuid2 = stringToUuid(input);
        expect(uuid1).toBe(uuid2);
        expect(isUuid(uuid1)).toBe(true);
    });

    it("should generate different UUIDs for different inputs", () => {
        const uuid1 = stringToUuid("input1");
        const uuid2 = stringToUuid("input2");
        expect(uuid1).not.toBe(uuid2);
    });

    it("should generate random UUIDs", () => {
        const uuid1 = generateUuid();
        const uuid2 = generateUuid();
        expect(uuid1).not.toBe(uuid2);
        expect(isUuid(uuid1)).toBe(true);
        expect(isUuid(uuid2)).toBe(true);
    });

    it("should ensure UUID from various inputs", () => {
        const validUuid = "123e4567-e89b-12d3-a456-426614174000";
        expect(ensureUuid(validUuid)).toBe(validUuid);
        expect(ensureUuid(null)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(ensureUuid(undefined)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(ensureUuid("test-string")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        expect(ensureUuid(123)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("should type guard UUID correctly", () => {
        const validUuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
        const invalidUuid = "not-a-uuid";
        expect(isUuid(validUuid)).toBe(true);
        expect(isUuid(invalidUuid)).toBe(false);
    });
}); 