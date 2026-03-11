# LearnUpon Demo Launcher

## Project Overview
The LearnUpon Demo Launcher is a tool designed for launching demos in the LearnUpon platform easily and efficiently.

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/nikhilgamer11/learnupon-demo-launcher.git
   cd learnupon-demo-launcher
   ```
2. **Install dependencies**:
   Make sure to install the necessary dependencies specified in the repository.
   ```bash
   npm install
   ```

## Configuration Details
- **Configuration File**: Update the `config.json` with your settings.
  - `apiKey`: Your API key for accessing LearnUpon.
  - `demoUrl`: The URL where demos will be hosted.

## Deploying the Google Apps Script Backend
1. Open the Google Apps Script Editor.
2. Create a new project and name it accordingly.
3. Copy the functions from the `backend.gs` file in this repository into your script.
4. Set up triggers if necessary to respond to events.
5. Deploy the script as a web app.
   - Navigate to **Deploy > New Deployment** in the Apps Script Editor.
   - Select **Web app** and fill in the required fields.

## Usage Examples
- **Launching a Demo**:
   ```bash
   node launchDemo.js
   ```
- **Accessing the API**:
   You can access the API via the endpoint specified in your configuration file:
   ```bash
   curl -X GET <YOUR_API_ENDPOINT>
   ```