import os
import requests

def mask_key(key: str) -> str:
    if not key:
        return "Not Set"
    if len(key) <= 8:
        return "***"
    return f"{key[:5]}...{key[-4:]}"

def test_openai(ai_key, openai_model):
    print("\nTesting connection to OpenAI API...")
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ai_key}",
            },
            json={
                "model": openai_model,
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 5,
            },
            timeout=10
        )
        
        print(f"OpenAI HTTP Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: The OpenAI API key is valid and working!")
            print(f"Response snippet: {response.json()['choices'][0]['message']['content'].strip()}")
            return True
        else:
            print("FAILURE: OpenAI returned an error.")
            try:
                err_json = response.json()
                print(f"Error details: {err_json.get('error', {}).get('message', 'No details')}")
            except Exception:
                print(f"Raw error response: {response.text[:300]}")
            return False
    except Exception as e:
        print(f"An unexpected error occurred while making the OpenAI request: {e}")
        return False

def test_gemini(gemini_key):
    print("\nTesting connection to Gemini API (List Models)...")
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
        response = requests.get(url, timeout=10)
        
        print(f"Gemini HTTP Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: The Gemini API key is valid and working!")
            try:
                models_data = response.json()
                models = [m['name'] for m in models_data.get('models', [])]
                print(f"Available Gemini models (first 5): {models[:5]}")
            except Exception as e:
                print(f"Could not parse models, but authentication succeeded! Error: {e}")
            return True
        else:
            print("FAILURE: Gemini returned an error.")
            try:
                err_json = response.json()
                print(f"Error details: {err_json}")
            except Exception:
                print(f"Raw error response: {response.text[:300]}")
            return False
    except Exception as e:
        print(f"An unexpected error occurred while making the Gemini request: {e}")
        return False

def main():
    env_path = "../.env"
    if not os.path.exists(env_path):
        env_path = ".env"
    
    if not os.path.exists(env_path):
        print("ERROR: .env file not found!")
        return

    print(f"Reading configuration from {env_path}...")
    ai_key = None
    gemini_key = None
    openai_model = "gpt-4o-mini"
    
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip("'\"")
                if key == "AI_API_KEY":
                    ai_key = val
                elif key == "GEMINI_API_KEY":
                    gemini_key = val
                elif key == "OPENAI_MODEL":
                    openai_model = val

    found_any = False
    if ai_key:
        print(f"AI_API_KEY found: {mask_key(ai_key)}")
        test_openai(ai_key, openai_model)
        found_any = True
        
    if gemini_key:
        print(f"GEMINI_API_KEY found: {mask_key(gemini_key)}")
        test_gemini(gemini_key)
        found_any = True

    if not found_any:
        print("ERROR: Neither AI_API_KEY nor GEMINI_API_KEY was found in .env!")

if __name__ == "__main__":
    main()
