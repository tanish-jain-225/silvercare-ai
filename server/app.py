from flask import Flask
from flask_cors import CORS
from routes.format_reminder import format_reminder_bp
from routes.send_emergency import send_emergency_bp
from routes.ask_query import chat_bp

app = Flask(__name__)
# Enable CORS to allow all origins
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Serve empty favicon to avoid 500 errors
@app.route('/favicon.ico')
def favicon():
    return ('', 204)

# Register blueprints under /api prefix
app.register_blueprint(format_reminder_bp, url_prefix='/api')
app.register_blueprint(send_emergency_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def index():
    return "Welcome to the VoiceBuddy AI Assistant API!"

if __name__ == '__main__':
    app.run(port=8000, debug=True)
