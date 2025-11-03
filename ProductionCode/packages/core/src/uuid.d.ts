import type { UUID } from "./types";
import { z } from "zod";
export declare const uuidSchema: z.ZodString;
/**
 * Validates if a value is a valid UUID
 * @param value - The value to validate
 * @returns The UUID if valid, null otherwise
 */
export declare function validateUuid(value: unknown): UUID | null;
/**
 * Generates a UUID from a string or number
 * @param target - The input string or number to generate UUID from
 * @returns A valid UUID string
 * @throws TypeError if input is not a string or number
 */
export declare function stringToUuid(target: string | number): UUID;
/**
 * Generates a random UUID
 * @returns A valid UUID string
 */
export declare function generateUuid(): UUID;
/**
 * Checks if a string is a valid UUID
 * @param uuid - The string to check
 * @returns true if the string is a valid UUID, false otherwise
 */
export declare function isUuid(uuid: string): uuid is UUID;
/**
 * Ensures a value is a valid UUID, generating a new one if needed
 * @param value - The value to ensure is a UUID
 * @returns A valid UUID
 */
export declare function ensureUuid(value: string | number | UUID | undefined | null): UUID;
//# sourceMappingURL=uuid.d.ts.map