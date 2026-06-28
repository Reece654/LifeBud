LifeBud – README

Overview
LifeBud is a lightweight, responsive task management web application built using HTML, CSS, and JavaScript, with Supabase providing authentication and database services. 
Contributors
•	Ben Harrison
•	Reece Wilson

How to Run the Application (Terminal or Command Prompt)
LifeBud is a static web application, but it must be served through a local server. Opening index.html directly in the browser will break Supabase authentication and database calls.
Follow the steps below to run the app locally.

1. Install Python (if not already installed)
Download Python 3 from: https://www.python.org/downloads/
On Windows, make sure you tick “Add python.exe to PATH” during installation. This ensures the terminal can recognise the python command.

2. Open a terminal in the project folder
Navigate to the folder where the project is located:
Code
cd LifeBud

3. Start a local development server
Run the following command:
Code
python -m http.server 8000
You should see a message similar to:
Code
Serving HTTP on :: port 8000
This means the server is running successfully.

4. Open the application in your browser
Visit:
Code
http://localhost:8000/
The application will load and function normally, including Supabase authentication.
To stop the server, press:
Ctrl + C

Deployment
LifeBud is also deployed on Netlify. For the Netlify address, please see the working document.
