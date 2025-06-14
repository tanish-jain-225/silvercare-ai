from flask import Flask
from flask_cors import CORS
from routes.format_reminder import format_reminder_bp
from routes.send_emergency import send_emergency_bp
from routes.ask_query import chat_bp

app = Flask(__name__)
# Enable CORS with specific configuration
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"], "supports_credentials": True}})

# Register blueprints
app.register_blueprint(format_reminder_bp)
app.register_blueprint(send_emergency_bp)
app.register_blueprint(chat_bp)

if __name__ == '__main__':
    app.run(port=8000, debug=True)
