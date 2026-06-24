#!/bin/bash
python manage.py migrate

python manage.py runbot &

gunicorn myproject.wsgi:application --bind 0.0.0.0:$PORT