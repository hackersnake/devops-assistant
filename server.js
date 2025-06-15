const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("ssh2");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const { fun1 } = require("./Algo.js"); // Importing the function from Algo.js
require("dotenv").config();


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const EC2_IP = "enter your ip address";
const PRIVATE_KEY_PATH = "C:\\Users\\shong\\Downloads\\KeyFile.pem";



// Serve index.html
app.get("/", (req, res) => {
  fs.readFile("index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// --- SSE Setup ---
let clients = [];

app.get("/deploy-progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

function broadcastProgress(message) {
  const lines = message.split("\n");
  lines.forEach((line) => {
    clients.forEach((client) => {
      client.write(`data: ${line.trim()}\n\n`);
    });
  });
}

// --- AI Recommendation Step ---
async function getSystemRecommendations(githubLink) {
  try {
    const systemPrompt = `
You are an AI DevOps assistant. Given a GitHub project link, analyze its tech stack and suggest:
- Minimum CPU cores
- Minimum RAM
- Recommended Disk size
- Suitable AWS EC2 instance type


Only include relevant requirements in a short bullet format.
GitHub Project: ${githubLink}`.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "system", content: "You're a cloud deployment advisor." },
          { role: "user", content: systemPrompt },
        ],
      },
      {
        headers: {
          Authorization: "enter your api"
         
        },
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content?.trim();
    if (content) {
      console.log("🧠 AI Recommendation Message:", content);
      broadcastProgress("🤖 AI Recommendation: " + content.replace(/\n/g, " "));
    } else {
      console.error("⚠️ AI response malformed:", response.data);
      broadcastProgress("⚠️ AI did not return a valid recommendation.");
    }
  } catch (error) {
    console.error("⚠️ AI Recommendation Error:", error.message);
    broadcastProgress("⚠️ Failed to get AI system recommendation.");
  }
}

// --- Deployment Route ---
app.post("/deploy", async (req, res) => {
  const { githubLink } = req.body;
  await fun1("sample content from GitHub repo");

  if (!githubLink) {
    console.log("❌ Error: Missing GitHub Link");
    return res.status(400).send("Missing GitHub Link!");
  }

  broadcastProgress(`📎 Received GitHub Link: ${githubLink}`);

  // Step 1: AI Recommendation
  await getSystemRecommendations(githubLink);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Pause

  // Step 2: SSH Deployment
  const conn = new Client();
  conn
    .on("ready", () => {
      console.log("✅ SSH Connected");
      broadcastProgress("🟢 Starting Deployment...");

      const command = `
    echo "📎 Received GitHub Link: '${githubLink}'"

echo "🔄 Installing essentials..."
export DEBIAN_FRONTEND=noninteractive

sudo apt-get update && sudo apt-get install -y unzip git curl build-essential || { echo "❌ Failed to update or install core packages"; exit 1; }

# Node.js setup
if ! command -v node >/dev/null 2>&1; then
  echo "🔄 Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh && \
  sudo bash /tmp/nodesource_setup.sh && \
  sudo apt-get install -y nodejs || { echo "❌ Node.js install failed"; exit 1; }
else
  echo "✅ Node.js already installed"
fi

# Upgrade npm to latest version
echo "🔄 Upgrading npm to latest version..."
sudo npm install -g npm@latest || { echo "❌ Failed to upgrade npm"; exit 1; }
echo "✅ Node version: $(node -v), npm version: $(npm -v)"

# Clone the GitHub repository
echo "🔄 Cloning GitHub repository..."
rm -rf project

if [[ "${githubLink}" == https://* || "${githubLink}" == http://* ]]; then
  echo "🌐 Detected HTTPS GitHub URL, using public cloning..."
  git clone --depth 1 "${githubLink}" project || { echo "❌ Git clone failed"; exit 1; }
else
  echo "🔐 Detected SSH GitHub URL, using SSH cloning..."
  GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no" git clone --depth 1 "${githubLink}" project || { echo "❌ Git clone failed"; exit 1; }
fi

cd project || { echo "❌ Failed to enter project directory"; exit 1; }

# Find a free port function
find_free_port() {
  for port in {3000..3010}; do
    if ! lsof -i:\$port >/dev/null 2>&1; then
      echo \$port
      return
    fi
  done
  echo "❌ No available ports"
  exit 1
}

PORT=\$(find_free_port)
export PORT=\$PORT

echo "🔍 Detecting tech stack..."

# Vite + React
if grep -q '"vite"' package.json && grep -q '"react"' package.json; then
  echo "🔧 Detected: Vite + React"
  npm install || { echo "❌ npm install failed"; exit 1; }
  npm run build || { echo "❌ Build failed"; exit 1; }
  nohup npm run preview -- --port \$PORT > output.log 2>&1 &
  sleep 3
  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "✅ Deployment Successful!"
  echo "Application running at: http://\${EC2_IP}:\${PORT}"

# Create React App
elif grep -q '"react-scripts"' package.json; then
  echo "🔧 Detected: Create React App"
  npm install || { echo "❌ npm install failed"; exit 1; }
  npm run build || { echo "❌ Build failed"; exit 1; }
  sudo npm install -g serve || { echo "❌ Failed to install serve"; exit 1; }
  nohup serve -s build -l \$PORT > output.log 2>&1 &
  sleep 3
  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "✅ Deployment Successful!"
  echo "Application running at: http://\${EC2_IP}:\${PORT}"

# Angular
elif grep -q '@angular/core' package.json; then
  echo "🔧 Detected: Angular"
  sudo npm install -g @angular/cli
  npm install || { echo "❌ npm install failed"; exit 1; }
  npm run build || ng build || { echo "❌ Build failed"; exit 1; }
  sudo npm install -g http-server || { echo "❌ Failed to install http-server"; exit 1; }
  projectName=\$(node -p "require('./angular.json').defaultProject")
  nohup http-server ./dist/\$projectName -p \$PORT > output.log 2>&1 &
  sleep 3
  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "✅ Deployment Successful!"
  echo "Application running at: http://\${EC2_IP}:\${PORT}"

# Express
elif grep -q '"express"' package.json; then
  echo "🔧 Detected: Node.js + Express"
  npm install || { echo "❌ npm install failed"; exit 1; }

  if [ -f "server.js" ]; then
    nohup node server.js > output.log 2>&1 &
  elif [ -f "app.js" ]; then
    nohup node app.js > output.log 2>&1 &
  else
    echo "❌ Could not find server entry point (e.g., app.js or server.js)"
    exit 1
  fi

  echo "🚀 Starting server on port \$PORT..."
  sleep 5
  if curl -s http://localhost:\$PORT | grep -q "Hello"; then
    echo "✅ Server responded successfully"
  else
    echo "⚠️ Server did not respond as expected"
  fi

  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "Application running at: http://\${EC2_IP}:\${PORT}"

# PHP
elif ls | grep -q ".php"; then
  echo "🔧 Detected: PHP project"
  sudo apt-get install -y apache2 php libapache2-mod-php || { echo "❌ Apache/PHP install failed"; exit 1; }
  sudo rm -rf /var/www/html/*
  sudo cp -r . /var/www/html/ || { echo "❌ Failed to copy files"; exit 1; }
  sudo systemctl restart apache2
  sleep 2
  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "Application running at: http://\${EC2_IP}"

# Flask
elif [ -f "main.py" ] && grep -qi "flask" requirements.txt; then
  echo "🔧 Detected: Flask Project"
  sudo apt-get install -y python3 python3-pip python3-venv || { echo "❌ Python setup failed"; exit 1; }
  python3 -m venv venv || { echo "❌ Failed to create venv"; exit 1; }
  source venv/bin/activate
  pip install --upgrade pip && pip install -r requirements.txt || { echo "❌ pip install failed"; exit 1; }

  nohup venv/bin/flask run --host=0.0.0.0 --port=\$PORT > output.log 2>&1 &
  sleep 3
  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "✅ Deployment Successful!"
  echo "Application running at: http://\${EC2_IP}:\${PORT}"

# Django
elif [ -f "manage.py" ] && grep -q "django" requirements.txt; then
  echo "🔧 Detected: Django Project"
  sudo apt-get install -y python3 python3-pip python3-venv || { echo "❌ Python setup failed"; exit 1; }
  python3 -m venv venv || { echo "❌ Failed to create venv"; exit 1; }
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt || { echo "❌ pip install failed"; exit 1; }
  python manage.py migrate || { echo "❌ Migration failed"; exit 1; }
  python manage.py collectstatic --noinput || { echo "❌ collectstatic failed"; exit 1; }

  nohup venv/bin/python manage.py runserver 0.0.0.0:\$PORT > output.log 2>&1 &
  sleep 3
  EC2_IP=\$(curl -s http://checkip.amazonaws.com)
  echo "✅ Deployment Successful!"
  echo "Application running at: http://\${EC2_IP}:\${PORT}"

# Java + Spring Boot
elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
  echo "🔧 Detected: Java Spring Boot Project"
  
  # Install Java & Maven
  sudo apt-get install -y openjdk-17-jdk maven || { echo "❌ Java/Maven install failed"; exit 1; }

  echo "☕ Java Version: $(java -version 2>&1 | head -n 1)"
  echo "📦 Maven Version: $(mvn -v | head -n 1)"

  # Build the project
  mvn clean package -DskipTests || { echo "❌ Maven build failed"; exit 1; }

  # Find the JAR file
  JAR_FILE=$(find target -type f -name "*.jar" | head -n 1)
  if [ -z "$JAR_FILE" ]; then
    echo "❌ No JAR file found after build"
    exit 1
  fi

  # Find an available port
  PORT=$(find_free_port)
  export PORT=$PORT

  echo "🚀 Launching Spring Boot app on port $PORT..."
  nohup java -jar "$JAR_FILE" --server.port=$PORT > output.log 2>&1 &

  sleep 5
  EC2_IP=$(curl -s http://checkip.amazonaws.com)
  echo "✅ Deployment Successful!"
  echo "Application running at: http://\${EC2_IP}:\${PORT}"


else
  echo "❌ Unsupported Tech Stack"
  exit 2
fi
`;

      conn.exec(command, (err, stream) => {
        if (err) {
          console.error("❌ SSH Execution Error:", err);
          broadcastProgress("❌ SSH Execution Error: " + err.message);
          return;
        }

        let responseSent = false;

        stream.on("data", (data) => {
          const message = data.toString().trim();
          console.log("📜 STDOUT:", message);
          broadcastProgress(message);

          if (!responseSent && message.includes("Application running at:")) {
            const deployedUrl = message.split("Application running at: ")[1];
            broadcastProgress("✅ Deployment Complete: " + deployedUrl);
            responseSent = true;
          }
        });

        stream.stderr.on("data", (data) => {
          const errorMsg = data.toString().trim();
          console.error("🚨 STDERR:", errorMsg);
          broadcastProgress("❌ " + errorMsg);
        });

        stream.on("close", () => {
          console.log("🔒 SSH Stream Closed");
          conn.end();
        });
      });
    })
    .on("error", (err) => {
      console.error("❌ SSH Connection Failed:", err);
      broadcastProgress("❌ SSH Connection Failed: " + err.message);
    })
    .connect({
      host: EC2_IP,
      port: 22,
      username: "ubuntu",
      privateKey: fs.readFileSync(PRIVATE_KEY_PATH),
    });

  res.sendStatus(200);
});

// --- Start Server ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`💻 Server running at http://localhost:${PORT}`);
});
