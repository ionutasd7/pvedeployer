
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from app import app

if __name__ == "__main__":
    debug_mode = os.environ.get("DEBUG", "False").lower() == "true"
    app.run(host="0.0.0.0", port=5000, debug=debug_mode)
