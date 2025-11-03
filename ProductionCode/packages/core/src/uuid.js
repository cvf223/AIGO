import { sha1 } from "js-sha1";
import { z } from "zod";
// UUID regex pattern that matches the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Zod schema for UUID validation
export const uuidSchema = z.string().regex(UUID_PATTERN);
/**
 * Validates if a value is a valid UUID
 * @param value - The value to validate
 * @returns The UUID if valid, null otherwise
 */
export function validateUuid(value) {
    const result = uuidSchema.safeParse(value);
    return result.success ? result.data : null;
}
/**
 * Generates a UUID from a string or number
 * @param target - The input string or number to generate UUID from
 * @returns A valid UUID string
 * @throws TypeError if input is not a string or number
 */
export function stringToUuid(target) {
    if (typeof target === "number") {
        target = target.toString();
    }
    if (typeof target !== "string") {
        throw new TypeError("Value must be string");
    }
    const _uint8ToHex = (ubyte) => {
        const first = ubyte >> 4;
        const second = ubyte - (first << 4);
        const HEX_DIGITS = "0123456789abcdef".split("");
        return HEX_DIGITS[first] + HEX_DIGITS[second];
    };
    const _uint8ArrayToHex = (buf) => {
        let out = "";
        for (let i = 0; i < buf.length; i++) {
            out += _uint8ToHex(buf[i]);
        }
        return out;
    };
    const escapedStr = encodeURIComponent(target);
    const buffer = new Uint8Array(escapedStr.length);
    for (let i = 0; i < escapedStr.length; i++) {
        buffer[i] = escapedStr[i].charCodeAt(0);
    }
    const hash = sha1(buffer);
    const hashBuffer = new Uint8Array(hash.length / 2);
    for (let i = 0; i < hash.length; i += 2) {
        hashBuffer[i / 2] = Number.parseInt(hash.slice(i, i + 2), 16);
    }
    return (_uint8ArrayToHex(hashBuffer.slice(0, 4)) +
        "-" +
        _uint8ArrayToHex(hashBuffer.slice(4, 6)) +
        "-" +
        _uint8ToHex(hashBuffer[6] & 0x0f) +
        _uint8ToHex(hashBuffer[7]) +
        "-" +
        _uint8ToHex((hashBuffer[8] & 0x3f) | 0x80) +
        _uint8ToHex(hashBuffer[9]) +
        "-" +
        _uint8ArrayToHex(hashBuffer.slice(10, 16)));
}
/**
 * Generates a random UUID
 * @returns A valid UUID string
 */
export function generateUuid() {
    return stringToUuid(Math.random().toString());
}
/**
 * Checks if a string is a valid UUID
 * @param uuid - The string to check
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isUuid(uuid) {
    return UUID_PATTERN.test(uuid);
}
/**
 * Ensures a value is a valid UUID, generating a new one if needed
 * @param value - The value to ensure is a UUID
 * @returns A valid UUID
 */
export function ensureUuid(value) {
    if (value === undefined || value === null) {
        return generateUuid();
    }
    if (typeof value === "string" && isUuid(value)) {
        return value;
    }
    return stringToUuid(value);
}
