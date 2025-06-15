from flask import Blueprint, request, jsonify, Response
from together import Together
import requests
import re
import json as pyjson
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
from datetime import datetime
import json
from dateutil.parser import parse as parse_datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


format_reminder_bp = Blueprint('format_reminder', __name__)
# Custom JSON encoder to handle MongoDB ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)
        
# Helper function to convert MongoDB documents to JSON-friendly format
def convert_to_json_friendly(document):
    if document is None:
        return None
    if isinstance(document, list):
        return [convert_to_json_friendly(item) for item in document]
    
    result = {}
    for key, value in document.items():
        if key == '_id' and isinstance(value, ObjectId):
            result['id'] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = convert_to_json_friendly(value)
        elif isinstance(value, list):
            result[key] = [convert_to_json_friendly(item) if isinstance(item, dict) else item for item in value]
        else:
            result[key] = value
    return result

# Initialize MongoDB connection settings
mongo_url = os.environ.get('MONGO_URI')
# Database and collection names from env vars
db_name = os.environ.get('DB_NAME')  # Database name override, default in code below
collection_name = os.environ.get('COLLECTION_NAME')  # Collection name override

# Initialize Together AI client
together_api_key = os.environ.get('TOGETHER_API_KEY', 'tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM')
client = Together(api_key=together_api_key)

# Initialize MongoDB client
if mongo_url:
    mongo_client = MongoClient(mongo_url)
    db = mongo_client[db_name] if db_name else mongo_client['assistant_db']
    reminders_collection = db[collection_name] if collection_name else db['reminders']
else:
    # Fallback to hardcoded values if env vars are not set
    mongo_client = MongoClient('mongodb+srv://tanish-jain-225:tanishjain02022005@cluster0.578qvco.mongodb.net/')
    db = mongo_client['assistant_db']
    reminders_collection = db['reminders']

@format_reminder_bp.route('/format-reminder', methods=['POST', 'OPTIONS'])
def format_reminder():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    print("POST /format-reminder endpoint called")
    print(f"Request data: {request.json}")
    
    user_input = request.json.get('input', '')
    # Ensure we have input to process
    if not user_input:
        return jsonify({"error": "No input provided. Please send JSON with 'input' field."}), 400
        
    # Instruct the LLM to format the input as a reminder with title, date, time
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=[
            {
                "role": "system",
                "content": "Format user input as one or more reminders. Extract title, date, and time for each reminder. Always return a JSON array with each reminder having id, title, date, and time fields. Date should be in YYYY-MM-DD format. Time should be in HH:MM format. If there are multiple reminders in the input, create multiple JSON objects in the array."
            },
            {
                "role": "user",
                "content": f'Parse this into reminders: {user_input}'
            }
        ]
    )
    
    content = response.choices[0].message.content
    print(f"LLM Response: {content}")
    
    # Try to extract an array first - handle markdown code blocks
    try:
        # Look for JSON array in markdown code block or regular text
        array_match = re.search(r'```(?:json)?\s*(\[[\s\S]*?\])\s*```|(\[[\s\S]*?\])', content)
        if array_match:
            # Get the first matching group that's not None
            array_text = next(group for group in array_match.groups() if group is not None)
            reminders_array = pyjson.loads(array_text)
            if isinstance(reminders_array, list) and len(reminders_array) > 0:
                return process_reminders(reminders_array)
    except Exception as e:
        print(f"Error extracting array: {str(e)}")
    
    # If not an array, extract a single JSON object - handle markdown code blocks
    match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*?\})', content)
    if match:
        try:
            # Get the first matching group that's not None
            json_text = next(group for group in match.groups() if group is not None)
            reminder_json = pyjson.loads(json_text)
            # Ensure the JSON matches the backend format with all required fields
            id = reminder_json.get('id') or str(hash(user_input))
            title = reminder_json.get('title')
            date = reminder_json.get('date')
            time = reminder_json.get('time')
            
            # Validate required fields
            if not title:
                return jsonify({"error": "Missing title in parsed reminder"}), 400
            if not date:
                return jsonify({"error": "Missing date in parsed reminder"}), 400
            if not time:
                return jsonify({"error": "Missing time in parsed reminder"}), 400
                
            post_data = {"id": id, "title": title, "date": date, "time": time}
              # Save to MongoDB and get JSON-safe version
            saved_reminder = save_to_mongodb(post_data)
            
            return jsonify({"success": True, "reminder": saved_reminder})
        except Exception as e:
            return jsonify({"error": "Failed to parse or post JSON", "details": str(e), "raw": content}), 400
    return jsonify({"error": "No JSON found in LLM response", "raw": content}), 400



def process_reminders(reminders_list):
    """Process multiple reminders and save them to MongoDB"""
    results = []
    errors = []
    
    for reminder in reminders_list:
        try:
            # Extract and validate fields
            id = reminder.get('id') or str(hash(str(reminder)))
            title = reminder.get('title')
            date = reminder.get('date') 
            time = reminder.get('time')
            
            if not all([title, date, time]):
                errors.append(f"Invalid reminder: {reminder}")
                continue
                
            reminder_data = {"id": id, "title": title, "date": date, "time": time}
            
            # Save to MongoDB and get JSON-safe version
            saved_reminder = save_to_mongodb(reminder_data)
            
            results.append(saved_reminder)
        except Exception as e:
            error_msg = f"Error processing reminder: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
    
    if not results:
        return jsonify({"error": "No valid reminders found", "details": errors}), 400
        
    return jsonify({
        "success": True,
        "reminders": results,
        "count": len(results),
        "errors": errors if errors else None
    })

def save_to_mongodb(reminder):
    """Save a reminder to MongoDB"""
    # Create a copy to avoid modifying the original
    reminder_to_save = reminder.copy()
    
    # Add metadata
    now = datetime.now()
    reminder_to_save['created_at'] = now
    reminder_to_save['updated_at'] = now
    
    # Insert into MongoDB
    result = reminders_collection.insert_one(reminder_to_save)
    inserted_id = result.inserted_id
    print(f"Saved reminder to MongoDB with _id: {inserted_id}")
    
    # Add the string version of ObjectId to the reminder for the return value
    reminder['mongo_id'] = str(inserted_id)
    
    # Convert to JSON-safe format for posting to Node.js backend
    json_safe_reminder = convert_to_json_friendly(reminder_to_save)
    json_safe_reminder['id'] = json_safe_reminder.get('id') or str(inserted_id)
    
    return json_safe_reminder

@format_reminder_bp.route('/reminders', methods=['GET'])
def get_reminders():
    """Get all reminders from MongoDB"""
    print("GET /reminders endpoint called")
    try:
        # Fetch all reminders from the collection
        cursor = reminders_collection.find({})
        reminders_list = list(cursor)
        print(f"Found {len(reminders_list)} reminders")
        reminders = convert_to_json_friendly(reminders_list)
        response = jsonify({"success": True, "reminders": reminders, "count": len(reminders)})
        # Explicitly set CORS headers to ensure they're applied
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    except Exception as e:
        print(f"Error in get_reminders: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
@format_reminder_bp.route('/reminders/<reminder_id>', methods=['GET'])
def get_reminder_by_id(reminder_id):
    """Get a specific reminder by ID"""
    try:
        # Try to find by string ID first
        reminder = reminders_collection.find_one({"id": reminder_id})
        
        # If not found, try ObjectId if it looks like a valid ObjectId
        if not reminder and ObjectId.is_valid(reminder_id):
            reminder = reminders_collection.find_one({"_id": ObjectId(reminder_id)})
        
        if not reminder:
            return jsonify({"error": f"Reminder with ID {reminder_id} not found"}), 404
            
        # Convert to JSON-friendly format        reminder = convert_to_json_friendly(reminder)
        return jsonify({"success": True, "reminder": reminder})
    
    except Exception as e:
        print(f"Error in get_reminder_by_id: {str(e)}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Error in get_reminder_by_id: {str(e)}")
        return jsonify({"error": str(e)}), 500

@format_reminder_bp.route('/reminder-data', methods=['POST', 'OPTIONS'])
def save_reminder_data():
    """Endpoint to directly save reminder data to MongoDB without LLM processing"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    print("POST /reminder-data endpoint called")
    reminder_data = request.json
    if not reminder_data:
        return jsonify({"error": "No reminder data provided"}), 400
        
    try:
        print(f"Processing reminder data: {reminder_data}")
        # This will handle both single reminder objects and arrays of reminders
        if isinstance(reminder_data, list):
            results = []
            for reminder in reminder_data:
                saved = save_to_mongodb(reminder)
                results.append(saved)
            response = jsonify({"success": True, "reminders": results, "count": len(results)})
        else:
            saved_reminder = save_to_mongodb(reminder_data)
            response = jsonify({"success": True, "reminder": saved_reminder})
        
        # Explicitly set CORS headers
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        print(f"Error in save_reminder_data: {str(e)}")
        return jsonify({"error": f"Failed to save reminder data: {str(e)}"}), 500

@format_reminder_bp.route('/reminders/<created_at>', methods=['DELETE'])
def delete_reminder(created_at):
    """Delete a reminder by its created_at timestamp (string match)"""
    try:
        # Parse the string to a datetime object
        dt = parse_datetime(created_at)
        result = reminders_collection.delete_one({'created_at': dt})
        if result.deleted_count == 0:
            return jsonify({'error': 'Reminder not found'}), 404
        return jsonify({'success': True, 'message': 'Reminder deleted'})
    except Exception as e:
        print(f"Error deleting reminder: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    from flask import Flask
    from flask_cors import CORS
    
    app = Flask(__name__)
    # Enable CORS with specific configuration
    CORS(app, resources={r"/*": {"origins": ["*"], "supports_credentials": True}})
    # Register the blueprint
    app.register_blueprint(format_reminder_bp)
    app.run(port=8000, debug=True)

