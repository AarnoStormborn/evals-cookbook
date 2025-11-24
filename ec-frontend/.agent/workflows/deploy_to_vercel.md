---
description: Deploy the application to Vercel
---

# Deploy to Vercel

This workflow guides you through deploying the `ec-frontend` application to Vercel.

1.  **Install Vercel CLI** (if not already installed):
    ```bash
    npm install -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```
    Follow the instructions in the terminal to authenticate.

3.  **Deploy**:
    Run the deploy command from the project root:
    ```bash
    vercel
    ```
    - Set up and deploy? **Yes**
    - Which scope? **(Select your scope)**
    - Link to existing project? **No**
    - Project name? **ec-frontend** (or your preferred name)
    - In which directory is your code located? **./**
    - Want to modify these settings? **No** (Auto-detects Vite)

4.  **Production Deployment**:
    Once you are happy with the preview, deploy to production:
    ```bash
    vercel --prod
    ```
