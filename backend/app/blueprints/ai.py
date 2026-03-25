from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from openai import OpenAI
import google.generativeai as genai

ai_bp = Blueprint('ai', __name__)

# AI Client Initializer
def get_ai_client():
    """
    Returns the appropriate AI client based on environment configuration.
    Priority: Gemini > OpenAI > Mock
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if gemini_key:
        genai.configure(api_key=gemini_key)
        return {"type": "gemini", "model": genai.GenerativeModel('gemini-pro')}
    elif openai_key:
        return {"type": "openai", "client": OpenAI(api_key=openai_key)}
    else:
        return {"type": "mock"}

# Mock AI service if API keys are not provided
class MockAI:
    def chat(self, prompt):
        return "```javascript\n// AI Suggested Fix\nconsole.log('Hello world corrected');\n```"

def call_ai(system_prompt, user_prompt):
    ai = get_ai_client()
    full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt
    
    if ai["type"] == "gemini":
        try:
            response = ai["model"].generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {str(e)}")
            return f"Error using Gemini AI: {str(e)}"
    elif ai["type"] == "openai":
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": user_prompt})
            
            response = ai["client"].chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Error: {str(e)}")
            return f"Error using OpenAI: {str(e)}"
    else:
        return MockAI().chat(full_prompt)

@ai_bp.route('/analyze-error', methods=['POST'])
@jwt_required()
def analyze_error():
    data = request.get_json()
    error = data.get('error')
    code = data.get('code')
    language = data.get('language')
    
    system_prompt = "You are a senior debugger. Analyze the code and error, then provide a fix."
    user_prompt = f"Language: {language}\nCode:\n{code}\n\nError:\n{error}\n\nProvide the fixed code in a markdown block."
    
    analysis = call_ai(system_prompt, user_prompt)
    return jsonify({"analysis": analysis}), 200

@ai_bp.route('/natural-language-compiler', methods=['POST'])
@jwt_required()
def nl_compiler():
    data = request.get_json()
    prompt = data.get('prompt')
    language = data.get('language', 'javascript')
    
    system_prompt = f"You are a natural language compiler. Turn the user prompt into executable {language} code. Provide only the code in a markdown block."
    
    code = call_ai(system_prompt, prompt)
    return jsonify({"code": code}), 200

@ai_bp.route('/visualize-flow', methods=['POST'])
@jwt_required()
def visualize_flow():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    
    system_prompt = "You are a code architecture visualizer. Convert the user's code into a Mermaid.js flowchart. Show the logical steps, loops, and conditions. Return ONLY the mermaid code block."
    user_prompt = f"Language: {language}\nCode:\n{code}"
    
    flow = call_ai(system_prompt, user_prompt)
    return jsonify({"flow": flow}), 200

@ai_bp.route('/predict-failure', methods=['POST'])
@jwt_required()
def predict_failure():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    
    system_prompt = f"You are a code failure predictor. Analyze the provided {language} code for potential bugs, logical errors, or security vulnerabilities that might cause it to fail in production. If you find issues, explain them briefly and provide a fixed version of the code in a markdown block. If no issues are found, return 'No issues detected'."
    
    analysis = call_ai(system_prompt, code)
    return jsonify({"prediction": analysis}), 200

@ai_bp.route('/smart-mentor', methods=['POST'])
@jwt_required()
def smart_mentor():
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    error = data.get('error')
    
    system_prompt = f"You are an AI Smart Mentor for coding students. Instead of giving the direct answer, explain the {language} logic/error in simple terms, provide step-by-step hints, and identify potential weak areas for the student to practice. Encourage the student to think."
    user_prompt = f"Code:\n{code}\n\nError/Context:\n{error if error else 'The student is asking for guidance on this code.'}"
    
    analysis = call_ai(system_prompt, user_prompt)
    return jsonify({"mentor_guidance": analysis}), 200

@ai_bp.route('/voice-to-code', methods=['POST'])
@jwt_required()
def voice_to_code():
    data = request.get_json()
    transcript = data.get('transcript')
    language = data.get('language', 'javascript')
    
    system_prompt = f"You are a Voice-to-Code assistant. Convert the student's spoken logic into starter {language} code. Provide the code in a markdown block with comments explaining the logic."
    
    code = call_ai(system_prompt, transcript)
    return jsonify({"code": code}), 200
