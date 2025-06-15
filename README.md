
# 🛠️ DevOps Auto-Deployment Assistant

A smart Node.js-based tool by **Shon Gaikwad** to **auto-deploy full-stack apps** from any GitHub repo to an AWS EC2 instance via SSH. Supports detection and deployment of React, Angular, Express, Flask, Django, PHP, Spring Boot projects and more.

GitHub Repo: [https://github.com/hackersnake/devops-assistant](https://github.com/hackersnake/devops-assistant)

---

## ✨ Features

- ✅ Auto-detects tech stack from GitHub repo
- 📦 Installs required dependencies (Node.js, Java, Python, etc.)
- 🌐 Deploys project on dynamic ports and returns live URL
- 🧠 AI suggests system requirements (RAM, CPU, EC2 type)
- 📡 Real-time deployment logs using SSE
- 🔐 Secure SSH-based deployment
- ⚙️ Works with both public and private GitHub links

---

## 🧰 Tech Stack

- Backend: Node.js + Express
- SSH Handling: ssh2
- Logs: Server-Sent Events (SSE)
- AI: OpenRouter DeepSeek model
- Cloud: AWS EC2 (Ubuntu)
- Bash Scripts: Auto detect & deploy logic

---

## 🚀 Supported Tech Stacks

- React (Vite / CRA)
- Angular
- Node.js + Express
- Flask
- Django
- PHP (Apache)
- Spring Boot (Java + Maven)

---

## ⚙️ Prerequisites

- Node.js and npm
- An AWS EC2 Ubuntu instance with:
  - Port 22 (SSH) open
  - `.pem` key downloaded
- GitHub repo link (public or private)

---

## 🔧 Setup Instructions

1. **Clone the Repository**

\`\`\`bash
git clone https://github.com/hackersnake/devops-assistant.git
cd devops-assistant
\`\`\`

2. **Install Node Modules**

\`\`\`bash
npm install
\`\`\`

3. **Create `.env` File**

\`\`\`env
EC2_IP=your-ec2-ip
PRIVATE_KEY_PATH=C:\\Users\\shong\\Downloads\\KeyFile.pem
OPENROUTER_API_KEY=Bearer your_openrouter_api_key
\`\`\`

4. **Start the Server**

\`\`\`bash
node index.js
\`\`\`

Then open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📤 How to Deploy

1. Enter your GitHub repo link (e.g., https://github.com/user/project)
2. Click **Deploy**
3. Watch live logs in browser
4. ✅ Final output shows your deployed app link like:
   \`\`\`
   http://<your-ec2-ip>:3000
   \`\`\`

---

## 📄 Project Structure

\`\`\`
.
├── index.js         # Main backend + deployment logic
├── Algo.js          # Extra algorithms/utilities
├── index.html       # UI for input
├── public/          # Static files (optional)
├── .env             # Environment config
└── README.md        # This file
\`\`\`

---

## 🧠 Sample AI Recommendation

\`\`\`
🤖 AI Recommendation:
- CPU: 2 cores
- RAM: 2 GB
- Disk: 10 GB
- Suggested Instance: t2.medium
\`\`\`

---

## 📝 Notes

- Uses dynamic ports (3000–3010)
- Java Spring Boot auto builds `.jar` with Maven
- Flask/Django apps run via `venv + nohup`
- Logs streamed using Server-Sent Events (SSE)
- PHP apps served via Apache2

---

## 📜 License

MIT License — free for use and modification

---

## 🤝 Author & Contact

Created by **Shon Gaikwad**

📧 Email: [shongaikwad10169@gmail.com](mailto:shongaikwad10169@gmail.com)

GitHub: [https://github.com/hackersnake](https://github.com/hackersnake)

