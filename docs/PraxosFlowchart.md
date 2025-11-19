# Praxos System Architecture Flowchart

## Overview

This flowchart illustrates the complete Praxos system for tokenizing Real-World Assets (RWAs), managing them in yield-bearing vaults, and providing personalized vault suggestions to users via an AI agent.

## System Flow

```mermaid
flowchart TD
    subgraph Banks["Private Nodes - Financial Institutions"]
        BankA["Bank A"]
        BankB["Bank B"]
        BankC["Bank C"]
    end

    subgraph RWA_A["Bank A RWAs<br/>Financial Products"]
        BondA1["Bond 1"]
        RealEstateA1["Realestate fund 1"]
        StartupA1["Startup Fund 1"]
    end

    subgraph RWA_B["Bank B RWAs<br/>Financial Products"]
        BondB2["Bond 2"]
        RealEstateB2["Realestate fund 2"]
        StartupB2["Startup Fund 2"]
    end

    subgraph RWA_C["Bank C RWAs<br/>Financial Products"]
        BondC3["Bond 3"]
        RealEstateC3["Realestate fund 3"]
        StartupC3["Startup Fund 3"]
    end

    TokenEngine["Tokenization Engine<br/>ERC-3643 Token Creation"]
    
    subgraph Tokenized["Tokenized RWAs<br/>ERC-3643 Tokens"]
        TokenA1["Bond 1<br/>ERC-3643"]
        TokenA2["Realestate fund 1<br/>ERC-3643"]
        TokenA3["Startup Fund 1<br/>ERC-3643"]
        TokenB1["Bond 2<br/>ERC-3643"]
        TokenB2["Realestate fund 2<br/>ERC-3643"]
        TokenB3["Startup Fund 2<br/>ERC-3643"]
        TokenC1["Bond 3<br/>ERC-3643"]
        TokenC2["Realestate fund 3<br/>ERC-3643"]
        TokenC3["Startup Fund 3<br/>ERC-3643"]
    end

    AIEngine["Praxos AI Engine<br/>Risk Analysis & Allocation"]

    subgraph Vaults["ERC-4626 Yield-Bearing Vaults"]
        VaultA["Vault A<br/>• Bond 1 (Bank A)<br/>• Bond 2 (Bank B)<br/>• Startup Fund 3 (Bank C)"]
        VaultB["Vault B<br/>• Realestate fund 2 (Bank B)<br/>• Realestate fund 3 (Bank C)<br/>• Bond 1 (Bank A)<br/>• Bond 2 (Bank B)"]
        VaultC["Vault C<br/>• Startup Fund 2 (Bank B)<br/>• Startup Fund 3 (Bank C)"]
    end

    AIAgent["Praxos AI Agent<br/>Personalized Vault Suggestions<br/><br/>Based on:<br/>• Timeframe<br/>• Risk tolerance<br/>• Amount"]

    Users["Users<br/>Get Personalized Vault Suggestions"]

    BankA --> RWA_A
    BankB --> RWA_B
    BankC --> RWA_C

    RWA_A --> TokenEngine
    RWA_B --> TokenEngine
    RWA_C --> TokenEngine

    TokenEngine --> Tokenized

    Tokenized --> AIEngine

    AIEngine --> Vaults

    Vaults <--> AIAgent
    Users --> AIAgent
    AIAgent --> Users

    style AIEngine fill:#90EE90
    style AIAgent fill:#90EE90
    style TokenEngine fill:#87CEEB
    style Vaults fill:#FFD700
```

## Component Details

### 1. Private Nodes (Financial Institutions)
- **Bank A, Bank B, Bank C**: Each bank operates a private Rayls node
- Each institution issues various financial products as Real-World Assets (RWAs)

### 2. Financial Products - RWAs
Each bank offers three types of financial products:
- **Bonds**: Fixed-income securities
- **Real Estate Funds**: Property investment products
- **Startup Funds**: Venture capital investment products

### 3. Tokenization Engine
- Converts financial products into **ERC-3643 compliant tokens**
- Example: "Financial product Bond 1" → "ERC-3643 Token Bond 1"
- Enables blockchain-based representation of real-world assets

### 4. Tokenized RWAs
All financial products are tokenized as **ERC-3643 tokens**:
- From Bank A: Realestate fund 1, Bond 1, Startup Fund 1
- From Bank B: Realestate fund 2, Bond 2, Startup Fund 2
- From Bank C: Realestate fund 3, Bond 3, Startup Fund 3

### 5. Praxos AI Engine
- Processes tokenized RWAs
- Performs risk analysis and allocation optimization
- Determines optimal vault compositions

### 6. ERC-4626 Yield-Bearing Vaults
Three diversified vaults containing various ERC-3643 tokens:

**Vault A:**
- Bond 1 (Bank A)
- Bond 2 (Bank B)
- Startup Fund 3 (Bank C)

**Vault B:**
- Realestate fund 2 (Bank B)
- Realestate fund 3 (Bank C)
- Bond 1 (Bank A)
- Bond 2 (Bank B)

**Vault C:**
- Startup Fund 2 (Bank B)
- Startup Fund 3 (Bank C)

### 7. Praxos AI Agent
Provides personalized vault suggestions based on:
- **Timeframe**: Investment duration preferences
- **Risk tolerance**: User's risk appetite
- **Amount**: Investment size

### 8. Users
Users receive personalized vault recommendations from the Praxos AI Agent, enabling informed investment decisions.

## Data Flow Summary

1. **Financial institutions** issue RWAs (bonds, real estate funds, startup funds)
2. **Tokenization Engine** converts RWAs to ERC-3643 tokens
3. **Praxos AI Engine** analyzes and allocates tokens
4. **ERC-4626 vaults** hold diversified token portfolios
5. **Praxos AI Agent** suggests appropriate vaults to users
6. **Users** receive personalized recommendations based on their preferences

