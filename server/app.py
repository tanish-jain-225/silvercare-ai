from flask import Flask
from flask_cors import CORS
from routes.format_reminder import format_reminder_bp
from routes.send_emergency import send_emergency_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(format_reminder_bp)
app.register_blueprint(send_emergency_bp)

if __name__ == '__main__':
    app.run(port=8000, debug=True)
