# Use a lightweight Python image
FROM python:3.11-slim

# Avoid Python creating .pyc files and force log output to the console
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install base libraries for the vision script
RUN pip install --no-cache-dir opencv-python numpy flask requests

# Keep the container alive waiting our code
CMD ["tail", "-f", "/dev/null"]