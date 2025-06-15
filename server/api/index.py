from app import app # Import the main Flask app

def handler(request):
    return app(request.environ, lambda status, headers: None)
