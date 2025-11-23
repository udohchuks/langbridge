"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = void 0;
var generative_ai_1 = require("@google/generative-ai");
var apiKey = process.env.GEMINI_API_KEY || "";
var genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
var generateImage = function (prompt) { return __awaiter(void 0, void 0, void 0, function () {
    var keywords, model, result, response, imagePart, keywords, error_1, keywords;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!apiKey) {
                    console.log("No GEMINI_API_KEY. Using Unsplash fallback for prompt:", prompt);
                    keywords = prompt.split(" ").slice(0, 3).join(",");
                    return [2 /*return*/, "https://source.unsplash.com/1600x900/?".concat(encodeURIComponent(keywords))];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
                return [4 /*yield*/, model.generateContent(prompt)];
            case 2:
                result = _c.sent();
                return [4 /*yield*/, result.response];
            case 3:
                response = _c.sent();
                if (response.candidates && ((_b = (_a = response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts)) {
                    imagePart = response.candidates[0].content.parts.find(function (part) { var _a, _b; return (_b = (_a = part.inlineData) === null || _a === void 0 ? void 0 : _a.mimeType) === null || _b === void 0 ? void 0 : _b.startsWith('image/'); });
                    if (imagePart === null || imagePart === void 0 ? void 0 : imagePart.inlineData) {
                        return [2 /*return*/, "data:".concat(imagePart.inlineData.mimeType, ";base64,").concat(imagePart.inlineData.data)];
                    }
                }
                console.warn("No image generated, using fallback");
                keywords = prompt.split(" ").slice(0, 3).join(",");
                return [2 /*return*/, "https://source.unsplash.com/1600x900/?".concat(encodeURIComponent(keywords))];
            case 4:
                error_1 = _c.sent();
                console.error("Error generating image:", error_1);
                keywords = prompt.split(" ").slice(0, 3).join(",");
                return [2 /*return*/, "https://source.unsplash.com/1600x900/?".concat(encodeURIComponent(keywords))];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.generateImage = generateImage;
