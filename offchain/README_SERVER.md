# Praxos Backend Server

The Praxos backend server exposes the AI models and vault generation functionality via REST API for frontend integration.

## Why You Need a Server

The AI models are written in Python and require:
- Python runtime environment
- ML/AI libraries (numpy, etc.)
- Access to blockchain data for RWA tokens
- Computational resources for risk simulation

**You cannot run Python AI models directly in the browser**, so a backend server is required.

## Setup

1. **Install dependencies:**
```bash
cd offchain
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Start the server:**
```bash
python server.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /health
```

### Generate Vault Strategies
```bash
POST /api/vaults/generate
Content-Type: application/json

{
  "rwa_tokens": [
    {
      "address": "0x...",
      "asset_type": "corporate-bond",
      "annual_yield": 500,
      "maturity_timestamp": 1234567890,
      "risk_tier": 2
    }
  ],
  "strategy_types": ["conservative-short-term"]  # optional
}
```

### Get Vault Recommendations
```bash
POST /api/vaults/recommend
Content-Type: application/json

{
  "user_risk_tolerance": 3,
  "investment_horizon_days": 365,
  "target_yield_bps": 600,
  "available_rwa_tokens": [...]
}
```

### Analyze Risk
```bash
POST /api/risk/analyze
Content-Type: application/json

{
  "asset_address": "0x...",
  "asset_type": "corporate-bond",
  "annual_yield": 500,
  "maturity_timestamp": 1234567890,
  "risk_tier": 2
}
```

## Frontend Integration

Update your `frontend/app.js` to call the backend API:

```javascript
const API_BASE = 'http://localhost:5000';

async function getVaultRecommendations(userPreferences) {
    const response = await fetch(`${API_BASE}/api/vaults/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPreferences)
    });
    return await response.json();
}
```

## Production Deployment

For production, consider:
- **Deploy to cloud**: AWS, GCP, Azure, or Heroku
- **Use serverless**: AWS Lambda, Vercel Functions (though Python ML may be heavy)
- **Add authentication**: Protect API endpoints
- **Add caching**: Cache strategy results
- **Add rate limiting**: Prevent abuse
- **Use WSGI server**: Gunicorn or uWSGI instead of Flask dev server

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 server:app
```

## Alternative: Local Development Only

For hackathon demos, you can:
1. Run the Python scripts locally to generate strategies
2. Manually copy results to the frontend
3. Skip the server for the demo

But for a real application, you'll need the server.

