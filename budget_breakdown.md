(# App Budget Breakdown & Service Usage



## Detailed Breakdown

### 1. Hosting: Netlify
Used to host the app and API functions.
 **Paid Plan:** 
    *   **Cost:** **$19 USD** 
    *   **Benefits:** Increased limits (1TB bandwidth, 25k build minutes, 2M function invocations), email support, and background functions.
  

### 2. AI Text Generation: Cohere
Used for generating lesson plans, chat responses, curriculum, and goal refinement.
*   **Model Used:** `c4ai-aya-expanse-32b` (Multilingual model)

*   **Paid Plan:** **Production (Pay-As-You-Go)**
    *   **Cost:** Usage-based, However, budget cost is $10
        *   **Input:** **$0.50** / 1M tokens
        *   **Output:** **$1.50** / 1M tokens
    *   **Estimate:** For a typical lesson (approx. 1k input tokens, 1k output tokens):
        *   Input: $0.0005
        *   Output: $0.0015
        *   **Total per lesson:** ~$0.002 (0.2 cents)

### 3. Text-to-Speech: Azure AI Speech
Used for generating audio pronunciations for lessons and chat.


*   **Paid Plan:** **Standard (S0) - Pay-As-You-Go**
    *   **Cost:** Usage-based, But budget cost is $10
    *   **Estimate:**
        *   1 Lesson (approx. 2000 characters of audio): ~$0.032 (3.2 cents)

### 4. Image Generation: Pollinations.ai
Used for generating lesson headers and character images.


*   **Alternative (Inactive in code): Google Imagen**
    *   If you switch to the `Imagen` provider in `lib/ai/agents/imageAgent.ts`:
    *   **Cost:** Approx. **$0.04** per image (Imagen 3 on Vertex AI). Budget cost is $10
    *   **Estimate:** 2 images per lesson = $0.08 per lesson.

Total Budget: $39 (436 cedis)