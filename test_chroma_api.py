#!/usr/bin/env python3
"""
Test ChromaDB API bridge with different user queries
Shows how semantic keywords improve search results
"""

import requests
import json
from typing import Dict, List

CHROMADB_API_URL = 'http://localhost:8001'

def build_semantic_keywords(params: Dict) -> str:
    """Build semantic keywords from user preferences (matches keywords.ts)"""
    keywords = []

    # Add user query
    if params.get('query'):
        keywords.append(params['query'])

    # Add activity types
    if params.get('activities'):
        keywords.extend([a.lower() for a in params['activities']])

    # Budget mapping
    budget_keywords = {
        0: ['free', 'cheap', 'budget-friendly', 'under $30'],
        1: ['affordable', 'budget', 'economical', '$30-50'],
        2: ['moderate', 'mid-range', '$50-75'],
        3: ['comfortable', 'premium', 'upscale', '$75-100'],
        4: ['luxury', 'high-end', 'expensive', '$100+']
    }
    budget = params.get('budget', 2)
    if budget in budget_keywords:
        keywords.extend(budget_keywords[budget][:2])  # Take first 2

    # Group size mapping
    pax_keywords = {
        'solo': ['solo', 'alone', 'individual', 'self'],
        'date': ['romantic', 'couple', 'date', 'intimate'],
        'friends': ['group', 'friends', 'social', 'gathering'],
        'family': ['family', 'kids', 'children', 'all-ages']
    }
    num_pax = params.get('numPax', '').lower()
    if num_pax in pax_keywords:
        keywords.extend(pax_keywords[num_pax][:2])

    # MBTI personality traits
    mbti_keywords = {
        'INTJ': ['strategic', 'independent', 'intellectual'],
        'INTP': ['analytical', 'curious', 'theoretical'],
        'ENTJ': ['leadership', 'ambitious', 'organized'],
        'ENTP': ['innovative', 'debate', 'entrepreneurial'],
        'INFJ': ['meaningful', 'creative', 'idealistic'],
        'INFP': ['authentic', 'artistic', 'introspective'],
        'ENFJ': ['inspiring', 'empathetic', 'community'],
        'ENFP': ['creative', 'spontaneous', 'social', 'adventurous', 'enthusiastic'],
        'ISTJ': ['traditional', 'reliable', 'structured'],
        'ISFJ': ['caring', 'detail-oriented', 'supportive'],
        'ESTJ': ['organized', 'practical', 'efficient'],
        'ESFJ': ['social', 'warm', 'cooperative'],
        'ISTP': ['hands-on', 'practical', 'flexible'],
        'ISFP': ['artistic', 'gentle', 'present-moment'],
        'ESTP': ['energetic', 'action-oriented', 'bold'],
        'ESFP': ['entertaining', 'spontaneous', 'fun-loving']
    }
    mbti = params.get('mbti', '').upper()
    if mbti in mbti_keywords:
        keywords.extend(mbti_keywords[mbti])

    # Spicy mode (nightlife)
    if params.get('spicy'):
        keywords.extend(['nightlife', 'drinks', 'bars', 'clubs', 'evening'])

    return ' '.join(keywords)


def query_chromadb_api(semantic_query: str, n_results: int = 10) -> Dict:
    """Query the ChromaDB FastAPI bridge"""
    try:
        response = requests.post(
            f'{CHROMADB_API_URL}/search',
            json={
                'query': semantic_query,
                'n_results': n_results
            },
            timeout=30
        )

        if not response.ok:
            print(f"❌ API Error: {response.status_code}")
            return None

        return response.json()

    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {CHROMADB_API_URL}")
        print("   Make sure the FastAPI bridge is running:")
        print("   python3 chromadb_api.py")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def display_results(user_params: Dict, n_results: int = 10):
    """Query and display results"""

    # Build semantic query
    semantic_query = build_semantic_keywords(user_params)

    print("\n" + "="*80)
    print("🔍 USER QUERY")
    print("="*80)
    print(f"Original query: {user_params.get('query', 'N/A')}")
    print(f"Activities: {user_params.get('activities', [])}")
    print(f"Budget: {user_params.get('budget', 2)} (0=Broke, 2=Moderate, 4=Baller)")
    print(f"Group: {user_params.get('numPax', 'N/A')}")
    print(f"MBTI: {user_params.get('mbti', 'N/A')}")
    print(f"Spicy: {user_params.get('spicy', False)}")

    print("\n" + "-"*80)
    print("🔑 SEMANTIC KEYWORDS GENERATED:")
    print("-"*80)
    print(f"{semantic_query}")

    # Query via API
    print("\n" + "-"*80)
    print(f"🌐 Querying API: {CHROMADB_API_URL}/search")
    print("-"*80)

    data = query_chromadb_api(semantic_query, n_results)

    if not data:
        return

    activities = data.get('activities', [])

    print(f"\n📊 RESULTS: Found {data.get('count', 0)} activities")
    print("-"*80)

    # Display results
    for i, activity in enumerate(activities):
        print(f"\n{i+1}. {activity.get('title', 'Untitled')}")
        print(f"   Description: {activity.get('description', 'N/A')[:150]}...")
        print(f"   Location: {activity.get('location', 'N/A')}")
        print(f"   Venue: {activity.get('venue_name', 'N/A')}")
        price = activity.get('price')
        print(f"   Price: ${price}" if price else "   Price: N/A")
        print(f"   Tags: {', '.join(activity.get('tags', [])[:5])}")
        print(f"   Source: {activity.get('source_channel', 'N/A')}")

    print("\n" + "="*80 + "\n")


def main():
    # Check API health
    print("🔍 Checking ChromaDB API health...")
    try:
        response = requests.get(f'{CHROMADB_API_URL}/health', timeout=5)
        if response.ok:
            health = response.json()
            print(f"✅ API is healthy")
            print(f"   Collection: {health.get('collection_name')}")
            print(f"   Activities: {health.get('activity_count')}")
            print(f"   Embedding model: {health.get('embedding_model')}")
        else:
            print(f"⚠️ API returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Could not connect to API at {CHROMADB_API_URL}")
        print("   Make sure to start the FastAPI bridge:")
        print("   python3 chromadb_api.py")
        return

    # Test Case 1: Romantic Date
    print("\n" + "🌹" * 40)
    print("TEST CASE 1: Romantic Date")
    print("🌹" * 40)

    test_1 = {
        'query': 'romantic dinner date with creative twist',
        'activities': ['Cafes', 'Museums'],
        'budget': 2,  # Moderate
        'numPax': 'date',
        'mbti': 'ENFP',
        'spicy': False
    }
    display_results(test_1, n_results=8)

    # Test Case 2: Budget Solo
    print("\n" + "🧘" * 40)
    print("TEST CASE 2: Budget-Friendly Solo Activity")
    print("🧘" * 40)

    test_2 = {
        'query': 'Chill activities for introverts under $30',
        'activities': ['Parks', 'Cafes'],
        'budget': 0,  # Broke
        'numPax': 'solo',
        'mbti': 'INFP',
        'spicy': False
    }
    display_results(test_2, n_results=8)

    # Test Case 3: Luxury Group
    print("\n" + "💎" * 40)
    print("TEST CASE 3: Luxury Group Experience")
    print("💎" * 40)

    test_3 = {
        'query': 'Luxury dining and entertainment for special celebration',
        'activities': ['Fine Dining', 'Bars'],
        'budget': 4,  # Baller
        'numPax': 'friends',
        'mbti': 'ENTJ',
        'spicy': True
    }
    display_results(test_3, n_results=8)

    # Test Case 4: Family Day
    print("\n" + "👨‍👩‍👧‍👦" * 20)
    print("TEST CASE 4: Family-Friendly Day Out")
    print("👨‍👩‍👧‍👦" * 20)

    test_4 = {
        'query': 'Fun family day out with activities for kids',
        'activities': ['Parks', 'Museums', 'Attractions'],
        'budget': 2,  # Moderate
        'numPax': 'family',
        'mbti': 'ESFJ',
        'spicy': False
    }
    display_results(test_4, n_results=8)

    # Test Case 5: Adventure
    print("\n" + "🏃" * 40)
    print("TEST CASE 5: Adventure Seeker")
    print("🏃" * 40)

    test_5 = {
        'query': 'Unique outdoor adventures and thrilling experiences',
        'activities': ['Sports', 'Outdoors'],
        'budget': 3,  # Comfortable
        'numPax': 'friends',
        'mbti': 'ESTP',
        'spicy': False
    }
    display_results(test_5, n_results=8)

    # Test Case 6: Cultural
    print("\n" + "🎨" * 40)
    print("TEST CASE 6: Cultural Experience")
    print("🎨" * 40)

    test_6 = {
        'query': 'Art galleries, cultural sites, and intellectual cafes',
        'activities': ['Museums', 'Art', 'Cafes'],
        'budget': 2,  # Moderate
        'numPax': 'solo',
        'mbti': 'INTJ',
        'spicy': False
    }
    display_results(test_6, n_results=8)

    # Comparison: Raw vs Enriched
    print("\n" + "🔬" * 40)
    print("ANALYSIS: Raw Query vs Semantic Enrichment")
    print("🔬" * 40)

    raw_query = "romantic dinner date with creative twist"
    enriched_query = build_semantic_keywords(test_1)

    print("\n" + "="*80)
    print("📌 RAW QUERY (No Semantic Enrichment)")
    print("="*80)
    print(f"Query: {raw_query}\n")

    raw_data = query_chromadb_api(raw_query, n_results=5)
    if raw_data:
        print("Top 5 Results:")
        for i, activity in enumerate(raw_data.get('activities', [])):
            print(f"{i+1}. {activity.get('title', 'Untitled')}")

    print("\n" + "="*80)
    print("🔑 ENRICHED QUERY (With Semantic Keywords)")
    print("="*80)
    print(f"Query: {enriched_query}\n")

    enriched_data = query_chromadb_api(enriched_query, n_results=5)
    if enriched_data:
        print("Top 5 Results:")
        for i, activity in enumerate(enriched_data.get('activities', [])):
            print(f"{i+1}. {activity.get('title', 'Untitled')}")

    print("\n" + "="*80)
    print("✅ Testing complete!")
    print("="*80)


if __name__ == "__main__":
    main()
