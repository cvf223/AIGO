"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerifiableLogApiRouter = createVerifiableLogApiRouter;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const core_1 = require("@elizaos/core");
function createVerifiableLogApiRouter(agents) {
    const router = express_1.default.Router();
    router.use((0, cors_1.default)());
    router.use(body_parser_1.default.json());
    router.use(body_parser_1.default.urlencoded({ extended: true }));
    router.get("/verifiable/agents", async (req, res) => {
        try {
            // call the listAgent method
            const agentRuntime = agents.values().next().value;
            const pageQuery = await agentRuntime
                .getService(core_1.ServiceType.VERIFIABLE_LOGGING)
                .listAgent();
            res.json({
                success: true,
                message: "Successfully get Agents",
                data: pageQuery,
            });
        }
        catch (error) {
            core_1.console.error("Detailed error:", error);
            res.status(500).json({
                error: "failed to get agents registered ",
                details: error.message,
                stack: error.stack,
            });
        }
    });
    router.post("/verifiable/attestation", async (req, res) => {
        try {
            const query = req.body || {};
            const verifiableLogQuery = {
                agentId: query.agentId || "",
                publicKey: query.publicKey || "",
            };
            const agentRuntime = agents.values().next().value;
            const pageQuery = await agentRuntime
                .getService(core_1.ServiceType.VERIFIABLE_LOGGING)
                .generateAttestation(verifiableLogQuery);
            res.json({
                success: true,
                message: "Successfully get Attestation",
                data: pageQuery,
            });
        }
        catch (error) {
            core_1.console.error("Detailed error:", error);
            res.status(500).json({
                error: "Failed to Get Attestation",
                details: error.message,
                stack: error.stack,
            });
        }
    });
    router.post("/verifiable/logs", async (req, res) => {
        try {
            const query = req.body.query || {};
            const page = Number.parseInt(req.body.page) || 1;
            const pageSize = Number.parseInt(req.body.pageSize) || 10;
            const verifiableLogQuery = {
                idEq: query.idEq || "",
                agentIdEq: query.agentIdEq || "",
                roomIdEq: query.roomIdEq || "",
                userIdEq: query.userIdEq || "",
                typeEq: query.typeEq || "",
                contLike: query.contLike || "",
                signatureEq: query.signatureEq || "",
            };
            const agentRuntime = agents.values().next().value;
            const pageQuery = await agentRuntime
                .getService(core_1.ServiceType.VERIFIABLE_LOGGING)
                .pageQueryLogs(verifiableLogQuery, page, pageSize);
            res.json({
                success: true,
                message: "Successfully retrieved logs",
                data: pageQuery,
            });
        }
        catch (error) {
            core_1.console.error("Detailed error:", error);
            res.status(500).json({
                error: "Failed to Get Verifiable Logs",
                details: error.message,
                stack: error.stack,
            });
        }
    });
    return router;
}
