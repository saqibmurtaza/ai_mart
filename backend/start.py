import os
import uvicorn
from main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # default to 8000 if PORT is not set
    uvicorn.run(app, host="0.0.0.0", port=port)
