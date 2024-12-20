#!/bin/fish

# backend
cd backend/
uv sync
uv run fastapi run &
cd ..

# frontend
cd frontend/ttr-dashboard/
bun install
CI=1 bunx expo start &

# open web page
sleep 2
open http://localhost:8081 &

echo
echo "Started servers."
echo

# capture Ctrl+C with an event handler to stop both fastapi and expo servers
function on_sigint --on-signal INT
    echo "Caught Ctrl+C, stopping servers..."
    kill %1
    kill %2
end

wait

# avoid fastapi messages messing up with the next prompt
# (one could redirect output the right way but I'm lazy)
sleep 1
echo "Stopped."
