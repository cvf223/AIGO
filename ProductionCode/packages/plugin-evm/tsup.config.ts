import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"], // Ensure you're targeting CommonJS
    external: [
        "@elizaos/core",
        "@elizaos/plugin-tee",
        "dotenv", // Externalize dotenv to prevent bundling
        "fs", // Externalize fs to use Node.js built-in module
        "path", // Externalize other built-ins if necessary
        "@reflink/reflink",
        "@node-llama-cpp",
        "https",
        "http",
        "agentkeepalive",
        "viem",
        "viem/accounts",
        "ethers",
        "web3",
        "@lifi/sdk",
        "events",
        "node-cache",
    ],
    platform: 'node',
    target: 'esnext',
    skipNodeModulesBundle: true,
    outExtension({ format }) {
        return {
            js: `.js`,
        };
    },
});
