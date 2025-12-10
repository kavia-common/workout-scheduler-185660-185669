#!/bin/bash
cd /home/kavia/workspace/code-generation/workout-scheduler-185660-185669/workout_scheduler_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

