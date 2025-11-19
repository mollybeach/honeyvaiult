//path: scripts/environment/envUpdater.mjs
import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Updates only the contract address lines in the .env file, leaving the rest untouched.
 * If the .env file does not exist, it will be created with the contract address keys.
 * If a key is missing, it will be added.
 * Optionally, also update .env.example if exampleEnv is true.
 * @param {object} addresses - An object with contract address keys and values.
 *   Keys should match contract names: PraxosFactory -> PRAXOS_FACTORY_ADDRESS,
 *   MockUSDC -> MOCK_USDC_ADDRESS, etc.
 * @param {boolean} [exampleEnv=false] - Whether to also update .env.example.
 */
export function updateEnvAddresses(addresses, exampleEnv = false) {
    const envPath = path.resolve(__dirname, '..', '..', '.env');
    const addressKeys = Object.keys(addresses);

    // Read or initialize .env
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    } else {
        // Create default .env with all keys
        envContent = addressKeys.map(key => `${key}=${addresses[key] || ''}`).join('\n');
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file');
        return;
    }

    let lines = envContent.split('\n');

    // Track which keys are present
    const presentKeys = new Set();

    lines = lines.map(line => {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || line.trim() === '') {
            return line;
        }

        for (const key of addressKeys) {
            // Match key at start of line (with optional whitespace)
            if (line.trim().startsWith(key + '=')) {
                presentKeys.add(key);
                return `${key}=${addresses[key] || ''}`;
            }
        }
        return line;
    });

    // Add any missing keys at the end
    for (const key of addressKeys) {
        if (!presentKeys.has(key)) {
            lines.push(`${key}=${addresses[key] || ''}`);
        }
    }

    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('✅ Updated .env file with contract addresses');

    // Optionally update .env.example
    if (exampleEnv) {
        const envExamplePath = path.resolve(__dirname, '..', '..', '.env.example');
        let exampleContent = '';
        if (fs.existsSync(envExamplePath)) {
            exampleContent = fs.readFileSync(envExamplePath, 'utf8');
        } else {
            exampleContent = addressKeys.map(key => `${key}=${addresses[key] || ''}`).join('\n');
            fs.writeFileSync(envExamplePath, exampleContent);
            console.log('✅ Created .env.example file');
            return;
        }

        let exampleLines = exampleContent.split('\n');
        const presentExampleKeys = new Set();

        exampleLines = exampleLines.map(line => {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || line.trim() === '') {
                return line;
            }

            for (const key of addressKeys) {
                if (line.trim().startsWith(key + '=')) {
                    presentExampleKeys.add(key);
                    return `${key}=${addresses[key] || ''}`;
                }
            }
            return line;
        });

        for (const key of addressKeys) {
            if (!presentExampleKeys.has(key)) {
                exampleLines.push(`${key}=${addresses[key] || ''}`);
            }
        }

        fs.writeFileSync(envExamplePath, exampleLines.join('\n'));
        console.log('✅ Updated .env.example file with contract addresses');
    }
}