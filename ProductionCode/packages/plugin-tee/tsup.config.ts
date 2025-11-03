import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"], // Ensure you're targeting CommonJS
    external: [
        "@elizaos/core",
        "dotenv", // Externalize dotenv to prevent bundling
        "fs", // Externalize fs to use Node.js built-in module
        "path", // Externalize other built-ins if necessary
        "@reflink/reflink",
        "@node-llama-cpp",
        "https",
        "http",
        "agentkeepalive",
        // Add other modules you want to externalize
        "@phala/dstack-sdk",
        "safe-buffer",
        "base-x",
        "bs58",
        "borsh",
        "@solana/buffer-layout",
        "stream",
        "buffer",
        "undici",
        "zod",
        "viem",
        "viem/accounts",
        "@noble/hashes/sha256",
        "@noble/hashes/utils",
        "@noble/curves/ed25519",
        "@solana/web3.js",
        "tweetnacl",
        "node-forge",
    ],
    platform: "node",
    target: "node16",
    skipNodeModulesBundle: true,
    outExtension({ format }) {
        return {
            js: `.js`,
        };
    },
});
