"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectClientInterface = exports.DirectClient = exports.hyperfiHandlerTemplate = exports.messageHandlerTemplate = void 0;
const core_1 = require("@elizaos/core");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const multer_1 = __importDefault(require("multer"));
const openai_1 = __importDefault(require("openai"));
const path = __importStar(require("path"));
const zod_1 = require("zod");
const api_ts_1 = require("./api.ts");
const verifiable_log_api_ts_1 = require("./verifiable-log-api.ts");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), "data", "uploads");
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
// some people have more memory than disk.io
const upload = (0, multer_1.default)({ storage /*: multer.memoryStorage() */ });
exports.messageHandlerTemplate = 
// {{goals}}
// "# Action Examples" is already included
`{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
` + core_1.messageCompletionFooter;
exports.hyperfiHandlerTemplate = `{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.

Response format should be formatted in a JSON block like this:
\`\`\`json
{ "lookAt": "{{nearby}}" or null, "emote": "{{emotes}}" or null, "say": "string" or null, "actions": (array of strings) or null }
\`\`\`
`;
class DirectClient {
    constructor() {
        core_1.console.log("DirectClient constructor");
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.agents = new Map();
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        // Serve both uploads and generated images
        this.app.use("/media/uploads", express_1.default.static(path.join(process.cwd(), "/data/uploads")));
        this.app.use("/media/generated", express_1.default.static(path.join(process.cwd(), "/generatedImages")));
        const apiRouter = (0, api_ts_1.createApiRouter)(this.agents, this);
        this.app.use(apiRouter);
        const apiLogRouter = (0, verifiable_log_api_ts_1.createVerifiableLogApiRouter)(this.agents);
        this.app.use(apiLogRouter);
        // Update the route handler to use CustomRequest instead of express.Request
        this.app.post("/:agentId/whisper", upload.single("file"), async (req, res) => {
            const audioFile = req.file; // Access the uploaded file using req.file
            const agentId = req.params.agentId;
            if (!audioFile) {
                res.status(400).send("No audio file provided");
                return;
            }
            let runtime = this.agents.get(agentId);
            const apiKey = runtime.getSetting("OPENAI_API_KEY");
            // if runtime is null, look for runtime with the same name
            if (!runtime) {
                runtime = Array.from(this.agents.values()).find((a) => a.character.name.toLowerCase() ===
                    agentId.toLowerCase());
            }
            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            const openai = new openai_1.default({
                apiKey,
            });
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(audioFile.path),
                model: "whisper-1",
            });
            res.json(transcription);
        });
        this.app.post("/:agentId/message", upload.single("file"), async (req, res) => {
            const agentId = req.params.agentId;
            const roomId = (0, core_1.stringToUuid)(req.body.roomId ?? "default-room-" + agentId);
            const userId = (0, core_1.stringToUuid)(req.body.userId ?? "user");
            let runtime = this.agents.get(agentId);
            // if runtime is null, look for runtime with the same name
            if (!runtime) {
                runtime = Array.from(this.agents.values()).find((a) => a.character.name.toLowerCase() ===
                    agentId.toLowerCase());
            }
            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            await runtime.ensureConnection(userId, roomId, req.body.userName, req.body.name, "direct");
            const text = req.body.text;
            // if empty text, directly return
            if (!text) {
                res.json([]);
                return;
            }
            const messageId = (0, core_1.stringToUuid)(Date.now().toString());
            const attachments = [];
            if (req.file) {
                const filePath = path.join(process.cwd(), "data", "uploads", req.file.filename);
                attachments.push({
                    id: Date.now().toString(),
                    url: filePath,
                    title: req.file.originalname,
                    source: "direct",
                    description: `Uploaded file: ${req.file.originalname}`,
                    text: "",
                    contentType: req.file.mimetype,
                });
            }
            const content = {
                text,
                attachments,
                source: "direct",
                inReplyTo: undefined,
            };
            const userMessage = {
                content,
                userId,
                roomId,
                agentId: runtime.agentId,
            };
            const memory = {
                id: (0, core_1.stringToUuid)(messageId + "-" + userId),
                ...userMessage,
                agentId: runtime.agentId,
                userId,
                roomId,
                content,
                createdAt: Date.now(),
            };
            await runtime.messageManager.addEmbeddingToMemory(memory);
            await runtime.messageManager.createMemory(memory);
            let state = await runtime.composeState(userMessage, {
                agentName: runtime.character.name,
            });
            const context = (0, core_1.composeContext)({
                state,
                template: exports.messageHandlerTemplate,
            });
            const response = await (0, core_1.generateMessageResponse)({
                runtime: runtime,
                context,
                modelClass: core_1.ModelClass.LARGE,
            });
            if (!response) {
                res.status(500).send("No response from generateMessageResponse");
                return;
            }
            // save response to memory
            const responseMessage = {
                id: (0, core_1.stringToUuid)(messageId + "-" + runtime.agentId),
                ...userMessage,
                userId: runtime.agentId,
                content: response,
                embedding: (0, core_1.getEmbeddingZeroVector)(),
                createdAt: Date.now(),
            };
            await runtime.messageManager.createMemory(responseMessage);
            state = await runtime.updateRecentMessageState(state);
            let message = null;
            await runtime.processActions(memory, [responseMessage], state, async (newMessages) => {
                message = newMessages;
                return [memory];
            });
            await runtime.evaluate(memory, state);
            // Check if we should suppress the initial message
            const action = runtime.actions.find((a) => a.name === response.action);
            const shouldSuppressInitialMessage = action?.suppressInitialMessage;
            if (!shouldSuppressInitialMessage) {
                if (message) {
                    res.json([response, message]);
                }
                else {
                    res.json([response]);
                }
            }
            else {
                if (message) {
                    res.json([message]);
                }
                else {
                    res.json([]);
                }
            }
        });
        this.app.post("/agents/:agentIdOrName/hyperfi/v1", async (req, res) => {
            // get runtime
            const agentId = req.params.agentIdOrName;
            let runtime = this.agents.get(agentId);
            // if runtime is null, look for runtime with the same name
            if (!runtime) {
                runtime = Array.from(this.agents.values()).find((a) => a.character.name.toLowerCase() ===
                    agentId.toLowerCase());
            }
            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            // can we be in more than one hyperfi world at once
            // but you may want the same context is multiple worlds
            // this is more like an instanceId
            const roomId = (0, core_1.stringToUuid)(req.body.roomId ?? "hyperfi");
            const body = req.body;
            // hyperfi specific parameters
            let nearby = [];
            let availableEmotes = [];
            if (body.nearby) {
                nearby = body.nearby;
            }
            if (body.messages) {
                // loop on the messages and record the memories
                // might want to do this in parallel
                for (const msg of body.messages) {
                    const parts = msg.split(/:\s*/);
                    const mUserId = (0, core_1.stringToUuid)(parts[0]);
                    await runtime.ensureConnection(mUserId, roomId, // where
                    parts[0], // username
                    parts[0], // userScreeName?
                    "hyperfi");
                    const content = {
                        text: parts[1] || "",
                        attachments: [],
                        source: "hyperfi",
                        inReplyTo: undefined,
                    };
                    const memory = {
                        id: (0, core_1.stringToUuid)(msg),
                        agentId: runtime.agentId,
                        userId: mUserId,
                        roomId,
                        content,
                    };
                    await runtime.messageManager.createMemory(memory);
                }
            }
            if (body.availableEmotes) {
                availableEmotes = body.availableEmotes;
            }
            const content = {
                // we need to compose who's near and what emotes are available
                text: JSON.stringify(req.body),
                attachments: [],
                source: "hyperfi",
                inReplyTo: undefined,
            };
            const userId = (0, core_1.stringToUuid)("hyperfi");
            const userMessage = {
                content,
                userId,
                roomId,
                agentId: runtime.agentId,
            };
            const state = await runtime.composeState(userMessage, {
                agentName: runtime.character.name,
            });
            let template = exports.hyperfiHandlerTemplate;
            template = template.replace("{{emotes}}", availableEmotes.join("|"));
            template = template.replace("{{nearby}}", nearby.join("|"));
            const context = (0, core_1.composeContext)({
                state,
                template,
            });
            function createHyperfiOutSchema(nearby, availableEmotes) {
                const lookAtSchema = nearby.length > 1
                    ? zod_1.z
                        .union(nearby.map((item) => zod_1.z.literal(item)))
                        .nullable()
                    : nearby.length === 1
                        ? zod_1.z.literal(nearby[0]).nullable()
                        : zod_1.z.null(); // Fallback for empty array
                const emoteSchema = availableEmotes.length > 1
                    ? zod_1.z
                        .union(availableEmotes.map((item) => zod_1.z.literal(item)))
                        .nullable()
                    : availableEmotes.length === 1
                        ? zod_1.z.literal(availableEmotes[0]).nullable()
                        : zod_1.z.null(); // Fallback for empty array
                return zod_1.z.object({
                    lookAt: lookAtSchema,
                    emote: emoteSchema,
                    say: zod_1.z.string().nullable(),
                    actions: zod_1.z.array(zod_1.z.string()).nullable(),
                });
            }
            // Define the schema for the expected output
            const hyperfiOutSchema = createHyperfiOutSchema(nearby, availableEmotes);
            // Call LLM
            const response = await (0, core_1.generateObject)({
                runtime,
                context,
                modelClass: core_1.ModelClass.SMALL, // 1s processing time on openai small
                schema: hyperfiOutSchema,
            });
            if (!response) {
                res.status(500).send("No response from generateMessageResponse");
                return;
            }
            let hfOut;
            try {
                hfOut = hyperfiOutSchema.parse(response.object);
            }
            catch {
                core_1.console.error("cant serialize response", response.object);
                res.status(500).send("Error in LLM response, try again");
                return;
            }
            // do this in the background
            new Promise((resolve) => {
                const contentObj = {
                    text: hfOut.say,
                };
                if (hfOut.lookAt !== null || hfOut.emote !== null) {
                    contentObj.text += ". Then I ";
                    if (hfOut.lookAt !== null) {
                        contentObj.text += "looked at " + hfOut.lookAt;
                        if (hfOut.emote !== null) {
                            contentObj.text += " and ";
                        }
                    }
                    if (hfOut.emote !== null) {
                        contentObj.text = "emoted " + hfOut.emote;
                    }
                }
                if (hfOut.actions !== null) {
                    // content can only do one action
                    contentObj.action = hfOut.actions[0];
                }
                // save response to memory
                const responseMessage = {
                    ...userMessage,
                    userId: runtime.agentId,
                    content: contentObj,
                };
                runtime.messageManager
                    .createMemory(responseMessage)
                    .then(() => {
                    const messageId = (0, core_1.stringToUuid)(Date.now().toString());
                    const memory = {
                        id: messageId,
                        agentId: runtime.agentId,
                        userId,
                        roomId,
                        content,
                        createdAt: Date.now(),
                    };
                    // run evaluators (generally can be done in parallel with processActions)
                    // can an evaluator modify memory? it could but currently doesn't
                    runtime.evaluate(memory, state).then(() => {
                        // only need to call if responseMessage.content.action is set
                        if (contentObj.action) {
                            // pass memory (query) to any actions to call
                            runtime.processActions(memory, [responseMessage], state, async (_newMessages) => {
                                // FIXME: this is supposed override what the LLM said/decided
                                // but the promise doesn't make this possible
                                //message = newMessages;
                                return [memory];
                            }); // 0.674s
                        }
                        resolve(true);
                    });
                });
            });
            res.json({ response: hfOut });
        });
        this.app.post("/:agentId/image", async (req, res) => {
            const agentId = req.params.agentId;
            const agent = this.agents.get(agentId);
            if (!agent) {
                res.status(404).send("Agent not found");
                return;
            }
            const images = await (0, core_1.generateImage)({ ...req.body }, agent);
            const imagesRes = [];
            if (images.data && images.data.length > 0) {
                for (let i = 0; i < images.data.length; i++) {
                    const caption = await (0, core_1.generateCaption)({ imageUrl: images.data[i] }, agent);
                    imagesRes.push({
                        image: images.data[i],
                        caption: caption.title,
                    });
                }
            }
            res.json({ images: imagesRes });
        });
        this.app.post("/fine-tune", async (req, res) => {
            try {
                const response = await fetch("https://api.bageldb.ai/api/v1/asset", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": `${process.env.BAGEL_API_KEY}`,
                    },
                    body: JSON.stringify(req.body),
                });
                const data = await response.json();
                res.json(data);
            }
            catch (error) {
                res.status(500).json({
                    error: "Please create an account at bakery.bagel.net and get an API key. Then set the BAGEL_API_KEY environment variable.",
                    details: error.message,
                });
            }
        });
        this.app.get("/fine-tune/:assetId", async (req, res) => {
            const assetId = req.params.assetId;
            const ROOT_DIR = path.join(process.cwd(), "downloads");
            const downloadDir = path.resolve(ROOT_DIR, assetId);
            if (!downloadDir.startsWith(ROOT_DIR)) {
                res.status(403).json({
                    error: "Invalid assetId. Access denied.",
                });
                return;
            }
            core_1.console.log("Download directory:", downloadDir);
            try {
                core_1.console.log("Creating directory...");
                await fs.promises.mkdir(downloadDir, { recursive: true });
                core_1.console.log("Fetching file...");
                const fileResponse = await fetch(`https://api.bageldb.ai/api/v1/asset/${assetId}/download`, {
                    headers: {
                        "X-API-KEY": `${process.env.BAGEL_API_KEY}`,
                    },
                });
                if (!fileResponse.ok) {
                    throw new Error(`API responded with status ${fileResponse.status}: ${await fileResponse.text()}`);
                }
                core_1.console.log("Response headers:", fileResponse.headers);
                const fileName = fileResponse.headers
                    .get("content-disposition")
                    ?.split("filename=")[1]
                    ?.replace(/"/g, /* " */ "") || "default_name.txt";
                core_1.console.log("Saving as:", fileName);
                const arrayBuffer = await fileResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const filePath = path.join(downloadDir, fileName);
                core_1.console.log("Full file path:", filePath);
                await fs.promises.writeFile(filePath, new Uint8Array(buffer));
                // Verify file was written
                const stats = await fs.promises.stat(filePath);
                core_1.console.log("File written successfully. Size:", stats.size, "bytes");
                res.json({
                    success: true,
                    message: "Single file downloaded successfully",
                    downloadPath: downloadDir,
                    fileCount: 1,
                    fileName: fileName,
                    fileSize: stats.size,
                });
            }
            catch (error) {
                core_1.console.error("Detailed error:", error);
                res.status(500).json({
                    error: "Failed to download files from BagelDB",
                    details: error.message,
                    stack: error.stack,
                });
            }
        });
        this.app.post("/:agentId/speak", async (req, res) => {
            const agentId = req.params.agentId;
            const roomId = (0, core_1.stringToUuid)(req.body.roomId ?? "default-room-" + agentId);
            const userId = (0, core_1.stringToUuid)(req.body.userId ?? "user");
            const text = req.body.text;
            if (!text) {
                res.status(400).send("No text provided");
                return;
            }
            let runtime = this.agents.get(agentId);
            // if runtime is null, look for runtime with the same name
            if (!runtime) {
                runtime = Array.from(this.agents.values()).find((a) => a.character.name.toLowerCase() === agentId.toLowerCase());
            }
            if (!runtime) {
                res.status(404).send("Agent not found");
                return;
            }
            try {
                // Process message through agent (same as /message endpoint)
                await runtime.ensureConnection(userId, roomId, req.body.userName, req.body.name, "direct");
                const messageId = (0, core_1.stringToUuid)(Date.now().toString());
                const content = {
                    text,
                    attachments: [],
                    source: "direct",
                    inReplyTo: undefined,
                };
                const userMessage = {
                    content,
                    userId,
                    roomId,
                    agentId: runtime.agentId,
                };
                const memory = {
                    id: messageId,
                    agentId: runtime.agentId,
                    userId,
                    roomId,
                    content,
                    createdAt: Date.now(),
                };
                await runtime.messageManager.createMemory(memory);
                const state = await runtime.composeState(userMessage, {
                    agentName: runtime.character.name,
                });
                const context = (0, core_1.composeContext)({
                    state,
                    template: exports.messageHandlerTemplate,
                });
                const response = await (0, core_1.generateMessageResponse)({
                    runtime: runtime,
                    context,
                    modelClass: core_1.ModelClass.LARGE,
                });
                // save response to memory
                const responseMessage = {
                    ...userMessage,
                    userId: runtime.agentId,
                    content: response,
                };
                await runtime.messageManager.createMemory(responseMessage);
                if (!response) {
                    res.status(500).send("No response from generateMessageResponse");
                    return;
                }
                await runtime.evaluate(memory, state);
                const _result = await runtime.processActions(memory, [responseMessage], state, async () => {
                    return [memory];
                });
                // Get the text to convert to speech
                const textToSpeak = response.text;
                // Convert to speech using ElevenLabs
                const elevenLabsApiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`;
                const apiKey = process.env.ELEVENLABS_XI_API_KEY;
                if (!apiKey) {
                    throw new Error("ELEVENLABS_XI_API_KEY not configured");
                }
                const speechResponse = await fetch(elevenLabsApiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "xi-api-key": apiKey,
                    },
                    body: JSON.stringify({
                        text: textToSpeak,
                        model_id: process.env.ELEVENLABS_MODEL_ID ||
                            "eleven_multilingual_v2",
                        voice_settings: {
                            stability: Number.parseFloat(process.env.ELEVENLABS_VOICE_STABILITY || "0.5"),
                            similarity_boost: Number.parseFloat(process.env.ELEVENLABS_VOICE_SIMILARITY_BOOST ||
                                "0.9"),
                            style: Number.parseFloat(process.env.ELEVENLABS_VOICE_STYLE || "0.66"),
                            use_speaker_boost: process.env
                                .ELEVENLABS_VOICE_USE_SPEAKER_BOOST ===
                                "true",
                        },
                    }),
                });
                if (!speechResponse.ok) {
                    throw new Error(`ElevenLabs API error: ${speechResponse.statusText}`);
                }
                const audioBuffer = await speechResponse.arrayBuffer();
                // Set appropriate headers for audio streaming
                res.set({
                    "Content-Type": "audio/mpeg",
                    "Transfer-Encoding": "chunked",
                });
                res.send(Buffer.from(audioBuffer));
            }
            catch (error) {
                core_1.console.error("Error processing message or generating speech:", error);
                res.status(500).json({
                    error: "Error processing message or generating speech",
                    details: error.message,
                });
            }
        });
        this.app.post("/:agentId/tts", async (req, res) => {
            const text = req.body.text;
            if (!text) {
                res.status(400).send("No text provided");
                return;
            }
            try {
                // Convert to speech using ElevenLabs
                const elevenLabsApiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`;
                const apiKey = process.env.ELEVENLABS_XI_API_KEY;
                if (!apiKey) {
                    throw new Error("ELEVENLABS_XI_API_KEY not configured");
                }
                const speechResponse = await fetch(elevenLabsApiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "xi-api-key": apiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: process.env.ELEVENLABS_MODEL_ID ||
                            "eleven_multilingual_v2",
                        voice_settings: {
                            stability: Number.parseFloat(process.env.ELEVENLABS_VOICE_STABILITY || "0.5"),
                            similarity_boost: Number.parseFloat(process.env.ELEVENLABS_VOICE_SIMILARITY_BOOST ||
                                "0.9"),
                            style: Number.parseFloat(process.env.ELEVENLABS_VOICE_STYLE || "0.66"),
                            use_speaker_boost: process.env
                                .ELEVENLABS_VOICE_USE_SPEAKER_BOOST ===
                                "true",
                        },
                    }),
                });
                if (!speechResponse.ok) {
                    throw new Error(`ElevenLabs API error: ${speechResponse.statusText}`);
                }
                const audioBuffer = await speechResponse.arrayBuffer();
                res.set({
                    "Content-Type": "audio/mpeg",
                    "Transfer-Encoding": "chunked",
                });
                res.send(Buffer.from(audioBuffer));
            }
            catch (error) {
                core_1.console.error("Error processing message or generating speech:", error);
                res.status(500).json({
                    error: "Error processing message or generating speech",
                    details: error.message,
                });
            }
        });
    }
    // agent/src/index.ts:startAgent calls this
    registerAgent(runtime) {
        // register any plugin endpoints?
        // but once and only once
        this.agents.set(runtime.agentId, runtime);
    }
    unregisterAgent(runtime) {
        this.agents.delete(runtime.agentId);
    }
    start(port) {
        this.server = this.app.listen(port, () => {
            core_1.console.success(`REST API bound to 0.0.0.0:${port}. If running locally, access it at http://localhost:${port}.`);
        });
        // Handle graceful shutdown
        const gracefulShutdown = () => {
            core_1.console.log("Received shutdown signal, closing server...");
            this.server.close(() => {
                core_1.console.success("Server closed successfully");
                process.exit(0);
            });
            // Force close after 5 seconds if server hasn't closed
            setTimeout(() => {
                core_1.console.error("Could not close connections in time, forcefully shutting down");
                process.exit(1);
            }, 5000);
        };
        // Handle different shutdown signals
        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);
    }
    async stop() {
        if (this.server) {
            this.server.close(() => {
                core_1.console.success("Server stopped");
            });
        }
    }
}
exports.DirectClient = DirectClient;
exports.DirectClientInterface = {
    name: 'direct',
    config: {},
    start: async (_runtime) => {
        core_1.console.log("DirectClientInterface start");
        const client = new DirectClient();
        const serverPort = Number.parseInt(core_1.settings.SERVER_PORT || "3000");
        client.start(serverPort);
        return client;
    },
    // stop: async (_runtime: IAgentRuntime, client?: Client) => {
    //     if (client instanceof DirectClient) {
    //         client.stop();
    //     }
    // },
};
const directPlugin = {
    name: "direct",
    description: "Direct client",
    clients: [exports.DirectClientInterface],
};
exports.default = directPlugin;
