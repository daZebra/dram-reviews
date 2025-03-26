#!/usr/bin/env node
/**
 * This script checks for and installs the Python dependencies needed for the YouTube transcript API.
 * Run this script with: node src/lib/youtube/install-deps.js
 */

const { spawn, exec } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.cyan}==========================================${colors.reset}`
);
console.log(
  `${colors.cyan}YouTube Transcript API Dependency Installer${colors.reset}`
);
console.log(
  `${colors.cyan}==========================================${colors.reset}\n`
);

// Check if Python is installed
function checkPython() {
  console.log(
    `${colors.blue}Checking if Python is installed...${colors.reset}`
  );

  exec("python3 --version", (error, stdout, stderr) => {
    if (error) {
      console.log(
        `${colors.red}❌ Python 3 is not installed or not in PATH.${colors.reset}`
      );
      console.log(
        `${colors.yellow}Please install Python 3 from https://www.python.org/downloads/${colors.reset}\n`
      );
      askExit();
      return;
    }

    console.log(
      `${colors.green}✓ Python 3 is installed: ${stdout.trim()}${colors.reset}`
    );
    checkYoutubeTranscriptApi();
  });
}

// Check if youtube_transcript_api is installed
function checkYoutubeTranscriptApi() {
  console.log(
    `${colors.blue}Checking if youtube_transcript_api is installed...${colors.reset}`
  );

  exec(
    'python3 -c "import youtube_transcript_api"',
    (error, stdout, stderr) => {
      if (error) {
        console.log(
          `${colors.red}❌ youtube_transcript_api is not installed.${colors.reset}`
        );
        askInstallPackage();
        return;
      }

      console.log(
        `${colors.green}✓ youtube_transcript_api is already installed.${colors.reset}`
      );
      console.log(
        `${colors.green}All dependencies are installed! Your app should work correctly.${colors.reset}\n`
      );
      askExit();
    }
  );
}

// Ask if user wants to install the package
function askInstallPackage() {
  rl.question(
    `${colors.yellow}Do you want to install the youtube_transcript_api package? (y/n) ${colors.reset}`,
    (answer) => {
      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        installPackage();
      } else {
        console.log(
          `${colors.yellow}Without this package, the YouTube transcript features will not work.${colors.reset}`
        );
        console.log(
          `${colors.yellow}You can install it later with: pip install youtube-transcript-api${colors.reset}\n`
        );
        askExit();
      }
    }
  );
}

// Install the package using pip
function installPackage() {
  console.log(
    `${colors.blue}Installing youtube_transcript_api...${colors.reset}`
  );

  const install = spawn("pip", ["install", "youtube-transcript-api"]);

  install.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  install.stderr.on("data", (data) => {
    console.error(`${colors.red}${data}${colors.reset}`);
  });

  install.on("close", (code) => {
    if (code === 0) {
      console.log(
        `${colors.green}✓ youtube_transcript_api was installed successfully!${colors.reset}`
      );
      console.log(
        `${colors.green}All dependencies are now installed. Your app should work correctly.${colors.reset}\n`
      );
    } else {
      console.log(
        `${colors.red}❌ Failed to install youtube_transcript_api (exit code: ${code}).${colors.reset}`
      );
      console.log(
        `${colors.yellow}You can try installing it manually with: pip install youtube-transcript-api${colors.reset}\n`
      );
    }
    askExit();
  });
}

// Ask if user wants to exit
function askExit() {
  rl.question(`${colors.cyan}Press Enter to exit...${colors.reset}`, () => {
    rl.close();
  });
}

// Start the process
checkPython();
