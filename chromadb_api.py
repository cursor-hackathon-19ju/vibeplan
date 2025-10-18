#!/usr/bin/env python3
"""
FastAPI bridge for ChromaDB access from Next.js
Runs alongside the Next.js server to provide ChromaDB query capabilities
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import chromadb
from chromadb.utils import embedding_functions
import os
import json

app = FastAPI(title="ChromaDB API Bridge", version="1.0.0")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB client
chroma_db_path = "./data/chroma_db"
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

chroma_client = chromadb.PersistentClient(path=chroma_db_path)
embedding_function = embedding_functions.OpenAIEmbeddingFunction(
    api_key=api_key,
    model_name="text-embedding-3-small"
)

# Get collection
try:
    collection = chroma_client.get_collection(
        name="telegram_activities",
        embedding_function=embedding_function
    )
    print(f"✅ Connected to ChromaDB collection: telegram_activities")
    print(f"📊 Collection size: {collection.count()} activities")
except Exception as e:
    print(f"❌ Error connecting to ChromaDB: {e}")
    raise


# Request/Response models
class SearchRequest(BaseModel):
    query: str
    n_results: int = 20


class Activity(BaseModel):
    title: str
    description: str
    location: Optional[str] = "Singapore"
    venue_name: Optional[str] = ""
    price: Optional[float]
    tags: List[str]
    duration_hours: Optional[float]
    offer_type: Optional[str] = "activity"
    validity_end: Optional[str]
    source_channel: Optional[str] = ""
    source_type: Optional[str] = ""


class SearchResponse(BaseModel):
    activities: List[Activity]
    query: str
    count: int


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ChromaDB API Bridge",
        "collection": "telegram_activities",
        "count": collection.count()
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    try:
        count = collection.count()
        return {
            "status": "healthy",
            "chroma_connected": True,
            "collection_name": "telegram_activities",
            "activity_count": count,
            "embedding_model": "text-embedding-3-small"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.post("/search", response_model=SearchResponse)
async def search_activities(request: SearchRequest):
    """
    Search for activities using semantic similarity

    Args:
        request: SearchRequest with query and n_results

    Returns:
        SearchResponse with list of matching activities
    """
    try:
        print(f"🔍 Searching for: '{request.query}' (top {request.n_results})")

        # Query ChromaDB
        results = collection.query(
            query_texts=[request.query],
            n_results=request.n_results
        )

        # Parse activities from metadata
        activities = []

        for i in range(len(results['ids'][0])):
            try:
                metadata = results['metadatas'][0][i]

                if not metadata or 'full_data' not in metadata:
                    continue

                # Parse full_data JSON string
                full_data = json.loads(metadata['full_data'])

                # Create Activity object
                activity = Activity(
                    title=full_data.get('title', 'Untitled'),
                    description=full_data.get('description', ''),
                    location=full_data.get('location', 'Singapore'),
                    venue_name=full_data.get('venue_name', ''),
                    price=full_data.get('price'),
                    tags=full_data.get('tags', []),
                    duration_hours=full_data.get('duration_hours'),
                    offer_type=full_data.get('offer_type', 'activity'),
                    validity_end=full_data.get('validity_end'),
                    source_channel=full_data.get('source_channel', ''),
                    source_type=full_data.get('source_type', '')
                )

                activities.append(activity)

            except Exception as parse_error:
                print(f"⚠️ Error parsing activity {i}: {parse_error}")
                continue

        print(f"✅ Found {len(activities)} activities")

        return SearchResponse(
            activities=activities,
            query=request.query,
            count=len(activities)
        )

    except Exception as e:
        print(f"❌ Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*60)
    print("🚀 Starting ChromaDB API Bridge")
    print("="*60)
    print(f"📍 ChromaDB path: {chroma_db_path}")
    print(f"🔑 OpenAI API key: {'✓ Set' if api_key else '✗ Not set'}")
    print(f"🌐 Server will run on: http://localhost:8001")
    print("="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
