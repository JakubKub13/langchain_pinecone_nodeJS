import { PineconeClient } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import { createPineconeIndex } from "./1-createPineconeIndex.js";
import { updatePinecone } from "./2-updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "./3-queryPineconeAndQueryGPT.js";

dotenv.config();

// 1. Set up DirectoryLoader to load documents from the ./documents directory
const loader = new DirectoryLoader("./documents" ,{
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
});
const docs = await loader.load();
// 2. Set up variables for the filename, question, and index settings
const question = "Who is mr. Gatsby?";
const indexName = "your-index-name";
const vectorDimension = 1536;

//3. Initialize Pinecone client with API key and environment
const client = new PineconeClient();
await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
});

(async () => {
    // 4. Check if Pinecone index exists and create if necessary
    await createPineconeIndex(client, indexName, vectorDimension);
    // 5. Update Pinecone vector store with document embeddings
    await updatePinecone(client, indexName, docs);
    // 6. Query Pinecone vector store and GPT model for an answer
    await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
})();

