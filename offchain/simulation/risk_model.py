#!/usr/bin/env python3
"""
Praxos Risk Simulation Layer
Simulates risk profiles for ERC-3643 RWA tokens
"""

from dataclasses import dataclass
from typing import List, Dict
import math
from datetime import datetime, timedelta


@dataclass
class RiskSignature:
    """Standardized risk signature for an RWA product"""
    asset_address: str
    asset_type: str
    risk_tier: int  # 1-5
    annual_yield: float  # percentage
    maturity_days: int
    credit_score: float  # 0-100
    volatility: float  # annualized volatility
    liquidity_score: float  # 0-100
    counterparty_risk: float  # 0-100 (lower is better)
    duration: float  # years


class RiskSimulator:
    """Simulates risk profiles for ERC-3643 RWA tokens"""
    
    def __init__(self):
        self.risk_cache: Dict[str, RiskSignature] = {}
    
    def simulate_risk(
        self,
        asset_address: str,
        asset_type: str,
        annual_yield: float,
        maturity_timestamp: int,
        risk_tier: int,
        current_timestamp: int = None
    ) -> RiskSignature:
        """
        Simulate risk profile for an RWA token
        
        Args:
            asset_address: Token contract address
            asset_type: Type of asset (bond, real-estate, startup-fund, etc.)
            annual_yield: Annual yield in basis points (e.g., 500 = 5%)
            maturity_timestamp: Unix timestamp of maturity (0 if no maturity)
            risk_tier: Risk tier (1-5)
            current_timestamp: Current block timestamp
            
        Returns:
            RiskSignature with calculated risk metrics
        """
        if current_timestamp is None:
            current_timestamp = int(datetime.now().timestamp())
        
        # Calculate maturity in days
        if maturity_timestamp == 0:
            maturity_days = 0
            duration = 0.0
        else:
            maturity_days = max(0, (maturity_timestamp - current_timestamp) // 86400)
            duration = maturity_days / 365.0
        
        # Convert yield from basis points to percentage
        yield_pct = annual_yield / 100.0
        
        # Calculate credit score based on risk tier and yield
        # Lower risk tier + reasonable yield = higher credit score
        base_credit = 100 - (risk_tier * 15)
        yield_adjustment = min(10, yield_pct * 0.5)  # Bonus for yield up to 10 points
        credit_score = max(0, min(100, base_credit + yield_adjustment))
        
        # Calculate volatility based on asset type and risk tier
        volatility = self._calculate_volatility(asset_type, risk_tier, yield_pct)
        
        # Calculate liquidity score
        liquidity_score = self._calculate_liquidity(asset_type, maturity_days, risk_tier)
        
        # Calculate counterparty risk
        counterparty_risk = self._calculate_counterparty_risk(asset_type, risk_tier, credit_score)
        
        signature = RiskSignature(
            asset_address=asset_address,
            asset_type=asset_type,
            risk_tier=risk_tier,
            annual_yield=yield_pct,
            maturity_days=maturity_days,
            credit_score=credit_score,
            volatility=volatility,
            liquidity_score=liquidity_score,
            counterparty_risk=counterparty_risk,
            duration=duration
        )
        
        self.risk_cache[asset_address] = signature
        return signature
    
    def _calculate_volatility(self, asset_type: str, risk_tier: int, yield_pct: float) -> float:
        """Calculate annualized volatility"""
        base_volatility = {
            "corporate-bond": 0.05,
            "real-estate": 0.12,
            "startup-fund": 0.35,
            "revenue-sharing": 0.20,
            "credit-risk-pool": 0.15
        }.get(asset_type, 0.15)
        
        # Adjust for risk tier
        tier_multiplier = 1.0 + (risk_tier - 1) * 0.3
        volatility = base_volatility * tier_multiplier
        
        # Higher yield often correlates with higher volatility
        if yield_pct > 10:
            volatility *= 1.2
        
        return min(1.0, volatility)
    
    def _calculate_liquidity(self, asset_type: str, maturity_days: int, risk_tier: int) -> float:
        """Calculate liquidity score (0-100, higher is better)"""
        # Base liquidity by asset type
        base_liquidity = {
            "corporate-bond": 70,
            "real-estate": 40,
            "startup-fund": 20,
            "revenue-sharing": 50,
            "credit-risk-pool": 60
        }.get(asset_type, 50)
        
        # Adjust for maturity (shorter = more liquid)
        if maturity_days > 0:
            if maturity_days < 90:
                maturity_bonus = 20
            elif maturity_days < 365:
                maturity_bonus = 10
            else:
                maturity_bonus = -10
        else:
            maturity_bonus = 0
        
        # Lower risk tier = higher liquidity
        risk_adjustment = (6 - risk_tier) * 5
        
        liquidity = base_liquidity + maturity_bonus + risk_adjustment
        return max(0, min(100, liquidity))
    
    def _calculate_counterparty_risk(self, asset_type: str, risk_tier: int, credit_score: float) -> float:
        """Calculate counterparty risk (0-100, lower is better)"""
        base_risk = {
            "corporate-bond": 15,
            "real-estate": 25,
            "startup-fund": 60,
            "revenue-sharing": 35,
            "credit-risk-pool": 30
        }.get(asset_type, 40)
        
        # Adjust for risk tier
        tier_adjustment = (risk_tier - 1) * 10
        
        # Adjust for credit score
        credit_adjustment = (100 - credit_score) / 2
        
        counterparty_risk = base_risk + tier_adjustment + credit_adjustment
        return max(0, min(100, counterparty_risk))
    
    def get_risk_signature(self, asset_address: str) -> RiskSignature:
        """Get cached risk signature"""
        if asset_address not in self.risk_cache:
            raise ValueError(f"No risk signature found for {asset_address}")
        return self.risk_cache[asset_address]
    
    def get_all_signatures(self) -> List[RiskSignature]:
        """Get all cached risk signatures"""
        return list(self.risk_cache.values())


if __name__ == "__main__":
    # Example usage
    simulator = RiskSimulator()
    
    # Simulate risk for different assets
    bond_sig = simulator.simulate_risk(
        asset_address="0x123...",
        asset_type="corporate-bond",
        annual_yield=500,  # 5%
        maturity_timestamp=int((datetime.now() + timedelta(days=365)).timestamp()),
        risk_tier=2
    )
    
    print(f"Bond Risk Signature:")
    print(f"  Credit Score: {bond_sig.credit_score:.1f}")
    print(f"  Volatility: {bond_sig.volatility:.2%}")
    print(f"  Liquidity Score: {bond_sig.liquidity_score:.1f}")
    print(f"  Counterparty Risk: {bond_sig.counterparty_risk:.1f}")

