from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

interests_bp = Blueprint('interests', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client["assistant_db"]  # Using assistant_db as the database name
interests_collection = db["interests"]  # Using interests as the collection name

@interests_bp.route('/api/interests/<user_id>', methods=['GET'])
def get_user_interests(user_id):
    """Get user interests by user ID"""
    try:
        user_interests = interests_collection.find_one({'userId': user_id})
        if user_interests:
            return jsonify({
                'success': True,
                'interests': user_interests.get('interests', []),
                'createdAt': user_interests.get('createdAt'),
                'updatedAt': user_interests.get('updatedAt')
            })
        else:
            return jsonify({
                'success': True,
                'interests': [],
                'message': 'No interests found for this user'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interests_bp.route('/api/interests', methods=['POST'])
def create_user_interests():
    """Create new user interests"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        interests = data.get('interests', [])
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'userId is required'
            }), 400
        
        if not interests:
            return jsonify({
                'success': False,
                'error': 'interests array is required'
            }), 400
        
        # Check if user already exists
        existing_user = interests_collection.find_one({'userId': user_id})
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'User interests already exist. Use PUT to update.'
            }), 409
        
        # Create new user interests
        user_interests = {
            'userId': user_id,
            'interests': interests,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = interests_collection.insert_one(user_interests)
        
        return jsonify({
            'success': True,
            'message': 'User interests created successfully',
            'id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interests_bp.route('/api/interests/<user_id>', methods=['PUT'])
def update_user_interests(user_id):
    """Update existing user interests"""
    try:
        data = request.get_json()
        interests = data.get('interests', [])
        
        if not interests:
            return jsonify({
                'success': False,
                'error': 'interests array is required'
            }), 400
        
        # Update user interests
        result = interests_collection.update_one(
            {'userId': user_id},
            {
                '$set': {
                    'interests': interests,
                    'updatedAt': datetime.utcnow()
                }
            },
            upsert=True  # Create if doesn't exist
        )
        
        if result.matched_count > 0:
            message = 'User interests updated successfully'
        else:
            message = 'User interests created successfully'
        
        return jsonify({
            'success': True,
            'message': message,
            'modified_count': result.modified_count
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interests_bp.route('/api/interests/<user_id>', methods=['DELETE'])
def delete_user_interests(user_id):
    """Delete user interests"""
    try:
        result = interests_collection.delete_one({'userId': user_id})
        
        if result.deleted_count > 0:
            return jsonify({
                'success': True,
                'message': 'User interests deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'User interests not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 