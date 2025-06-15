# devops-assistant
cat << 'EOF' > README.md
# 🛠️ DevOps Auto-Deployment Assistant

This project is a smart Node.js-based tool to **auto-deploy full-stack applications** from any public or private GitHub repository directly to an AWS EC2 instance via SSH. It supports detection and deployment of popular tech stacks like React, Angular, Express, Flask, Django, PHP, Spring Boot, and more.

## ✨ Features

- ✅ Auto-detects tech stack from GitHub repo
- 📦 Installs required dependencies (Node.js, Java, Python, etc.)
- 🌐 Deploys project on a dynamic port and returns a live URL
- 🧠 Uses AI to recommend ideal EC2 system requirements
- 📡 Real-time Server-Sent Events (SSE) deployment logs
- 🔐 SSH-based secure connection to EC2
- ⚙️ Supports public and private GitHub repositories

## 🧰 Tech Stack

- Backend: Node.js + Express
- SSH: \`ssh2\` npm package
- AI Integration: OpenRouter API (DeepSeek model)
- Real-time Logs: Server-Sent Events (SSE)
- Cloud: AWS EC2 (Ubuntu)
- Script Detection: Custom bash logic + Node.js

## 🚀 Supported Tech Stacks

- React (Vite or CRA)
- Angular
- Node.js with Express
- Flask (Python)
- Django (Python)
- PHP (Apache2)
- Spring Boot (Java Maven)

---

## ⚙️ Prerequisites

- Node.js and npm installed
- An AWS EC2 instance (Ubuntu) with:
  - Port 22 (SSH) open
  - Your \`.pem\` key
- GitHub repo with one of the supported tech stacks

---

## 🔧 Setup

1. **Clone the Repository**

\`\`\`bash
git clone https://github.com/your-username/devops-assistant.git
cd devops-assistant
\`\`\`

2. **Install Dependencies**

\`\`\`bash
npm install
\`\`\`

3. **Configure Environment Variables**

Create a \`.env\` file in the root directory:

\`\`\`env
EC2_IP=your-ec2-ip
PRIVATE_KEY_PATH=C:\\Users\\your-name\\Downloads\\KeyFile.pem
OPENROUTER_API_KEY=Bearer your_openrouter_api_key
\`\`\`

---

## 🖥️ Run the App

\`\`\`bash
node index.js
\`\`\`

Now visit: [http://localhost:5000](http://localhost:5000)

---

## 📤 How to Deploy a Project

1. Enter a **GitHub repository link** (e.g., \`https://github.com/username/myapp\`)
2. Click **Deploy**
3. Watch live progress logs from:
   - SSH connection
   - Tech stack detection
   - Dependency installation
   - Build & run logs
4. ✅ You’ll get a **Live EC2 URL** like:
   \`\`\`
   http://<your-ec2-ip>:3000
   \`\`\`

---

## 📄 Folder Structure

\`\`\`
.
├── index.js             // Main server and deployment logic
├── Algo.js              // (Optional) Custom logic or utilities
├── index.html           // Frontend input page
├── public/              // Static files if needed
├── .env                 // Environment variables
├── README.md            // You're here
\`\`\`

---

## 🧠 AI Recommendation Example

\`\`\`
🤖 AI Recommendation:
- CPU: 2 cores
- RAM: 2 GB
- Disk: 10 GB
- Recommended Instance: t2.medium
\`\`\`

---

## ❗ Notes

- **Port Range** used: \`3000–3010\`
- Spring Boot JARs are built using Maven automatically
- PHP projects are hosted via Apache2
- Flask/Django use \`venv\` and are auto-started with \`nohup\`
- Logs are streamed using SSE to the browser

---

## 📜 License

MIT License — free to use and modify!

---

## 🤝 Contribution

Feel free to fork and contribute via pull requests!

---

## 📬 Contact

For queries or support, email: \`your.email@example.com\`
EOF
