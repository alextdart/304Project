#!/bin/bash

# Prompt for the remote backend's port
read -p "Enter the backend's remote port number (e.g., 5000): " destination_port

# Define a range for free local ports
START=55001
END=60000

# Check for an available local port
for port in $(seq $START $END); do
    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        chosen_port=$port
        echo "Local port $chosen_port is available."
        break
    fi
done

# Exit if no free port is found
if [[ -z "$chosen_port" ]]; then
    echo "No free port found in range $START-$END."
    exit 1
fi

# Prompt for university username
read -p "Enter your CWL username: " cwl_name

# Build the SSH tunnel
echo "Setting up SSH tunnel from localhost:$chosen_port to $destination_port on remote.students.cs.ubc.ca..."
ssh -f -N -L $chosen_port:localhost:$destination_port $cwl_name@remote.students.cs.ubc.ca

if [ $? -ne 0 ]; then
    echo "Failed to establish SSH tunnel."
    exit 1
fi

echo "SSH tunnel established successfully!"

# Update .env.local for Next.js
ENV_FILE="../../.env.local"

echo "Updating $ENV_FILE with NEXT_PUBLIC_BACKEND_URL..."
echo "PORT=$chosen_port" > $ENV_FILE

# Restart Next.js development server
echo "Restarting Next.js development server..."
npm run dev
