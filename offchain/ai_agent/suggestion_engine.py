#!/usr/bin/env python3
"""
Praxos AI Agent - Personalized Vault Suggestion Engine
Provides personalized vault recommendations to users based on their preferences
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum


class RiskTolerance(Enum):
    """User risk tolerance levels"""
    CONSERVATIVE = 1
    MODERATE = 2
    BALANCED = 3
    GROWTH = 4
    AGGRESSIVE = 5


class Timeframe(Enum):
    """Investment timeframe categories"""
    SHORT_TERM = "short"  # < 1 year
    MEDIUM_TERM = "medium"  # 1-3 years
    LONG_TERM = "long"  # > 3 years


@dataclass
class UserPreferences:
    """User investment preferences"""
    timeframe: Timeframe
    risk_tolerance: RiskTolerance
    amount: float  # Investment amount
    min_yield: Optional[float] = None  # Minimum expected yield (optional)
    preferred_asset_types: Optional[List[str]] = None  # e.g., ["corporate-bond", "real-estate"]


@dataclass
class VaultRecommendation:
    """A vault recommendation for a user"""
    vault_address: str
    vault_name: str
    match_score: float  # 0-100, how well it matches user preferences
    risk_tier: int
    expected_yield: float
    timeframe_match: bool
    reasoning: str  # Explanation of why this vault was recommended


class PraxosAIAgent:
    """AI Agent that provides personalized vault suggestions"""
    
    def __init__(self):
        self.vault_registry: List[Dict] = []
    
    def register_vault(self, vault_info: Dict):
        """
        Register a vault for recommendation
        
        Args:
            vault_info: Dictionary containing vault metadata:
                {
                    "address": "0x...",
                    "name": "Vault Name",
                    "risk_tier": 3,
                    "target_duration": 1095,  # days
                    "expected_yield": 7.5,  # percentage
                    "strategy": "balanced-diversified",
                    "assets": [...]
                }
        """
        self.vault_registry.append(vault_info)
    
    def suggest_vaults(
        self,
        user_prefs: UserPreferences,
        max_recommendations: int = 5
    ) -> List[VaultRecommendation]:
        """
        Suggest vaults based on user preferences
        
        Args:
            user_prefs: User's investment preferences
            max_recommendations: Maximum number of recommendations to return
            
        Returns:
            List of vault recommendations sorted by match score
        """
        recommendations = []
        
        for vault in self.vault_registry:
            score = self._calculate_match_score(vault, user_prefs)
            timeframe_match = self._check_timeframe_match(vault, user_prefs.timeframe)
            
            reasoning = self._generate_reasoning(vault, user_prefs, score)
            
            rec = VaultRecommendation(
                vault_address=vault["address"],
                vault_name=vault["name"],
                match_score=score,
                risk_tier=vault["risk_tier"],
                expected_yield=vault.get("expected_yield", 0.0),
                timeframe_match=timeframe_match,
                reasoning=reasoning
            )
            recommendations.append(rec)
        
        # Sort by match score (highest first)
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        # Filter out low-scoring recommendations
        recommendations = [r for r in recommendations if r.match_score >= 50]
        
        return recommendations[:max_recommendations]
    
    def _calculate_match_score(self, vault: Dict, user_prefs: UserPreferences) -> float:
        """Calculate how well a vault matches user preferences (0-100)"""
        score = 0.0
        
        # Risk tier matching (40% weight)
        risk_match = self._match_risk_tier(vault["risk_tier"], user_prefs.risk_tolerance)
        score += risk_match * 0.4
        
        # Timeframe matching (30% weight)
        timeframe_match = self._check_timeframe_match(vault, user_prefs.timeframe)
        score += (100 if timeframe_match else 50) * 0.3
        
        # Yield matching (20% weight)
        if user_prefs.min_yield:
            vault_yield = vault.get("expected_yield", 0.0)
            if vault_yield >= user_prefs.min_yield:
                score += 100 * 0.2
            else:
                # Penalize if below minimum
                score += max(0, (vault_yield / user_prefs.min_yield) * 100) * 0.2
        else:
            score += 50 * 0.2  # Neutral if no yield preference
        
        # Asset type matching (10% weight)
        if user_prefs.preferred_asset_types:
            vault_assets = vault.get("assets", [])
            # Simple check - could be enhanced
            score += 50 * 0.1  # Placeholder
        else:
            score += 50 * 0.1  # Neutral if no preference
        
        return min(100, score)
    
    def _match_risk_tier(self, vault_risk_tier: int, user_risk: RiskTolerance) -> float:
        """Calculate risk tier match score"""
        user_risk_value = user_risk.value
        
        # Exact match = 100
        if vault_risk_tier == user_risk_value:
            return 100.0
        
        # Within 1 tier = 80
        if abs(vault_risk_tier - user_risk_value) == 1:
            return 80.0
        
        # Within 2 tiers = 50
        if abs(vault_risk_tier - user_risk_value) == 2:
            return 50.0
        
        # More than 2 tiers away = 20
        return 20.0
    
    def _check_timeframe_match(self, vault: Dict, user_timeframe: Timeframe) -> bool:
        """Check if vault timeframe matches user preference"""
        vault_duration = vault.get("target_duration", 0)  # days
        
        if user_timeframe == Timeframe.SHORT_TERM:
            return vault_duration <= 365  # < 1 year
        elif user_timeframe == Timeframe.MEDIUM_TERM:
            return 365 < vault_duration <= 1095  # 1-3 years
        elif user_timeframe == Timeframe.LONG_TERM:
            return vault_duration > 1095  # > 3 years
        
        return True  # Default to match if unclear
    
    def _generate_reasoning(
        self,
        vault: Dict,
        user_prefs: UserPreferences,
        score: float
    ) -> str:
        """Generate human-readable reasoning for recommendation"""
        reasons = []
        
        risk_match = self._match_risk_tier(vault["risk_tier"], user_prefs.risk_tolerance)
        if risk_match >= 80:
            reasons.append(f"Risk tier {vault['risk_tier']} aligns well with your {user_prefs.risk_tolerance.name.lower()} risk tolerance")
        
        if self._check_timeframe_match(vault, user_prefs.timeframe):
            reasons.append(f"Timeframe matches your {user_prefs.timeframe.value}-term investment preference")
        
        expected_yield = vault.get("expected_yield", 0.0)
        if expected_yield > 0:
            reasons.append(f"Expected yield: {expected_yield:.2f}%")
        
        if not reasons:
            reasons.append("This vault may be suitable based on your preferences")
        
        return ". ".join(reasons) + "."


if __name__ == "__main__":
    # Example usage
    agent = PraxosAIAgent()
    
    # Register some example vaults
    agent.register_vault({
        "address": "0x111...",
        "name": "Conservative Short-Term Vault",
        "risk_tier": 1,
        "target_duration": 180,
        "expected_yield": 5.0,
        "strategy": "conservative-short-term"
    })
    
    agent.register_vault({
        "address": "0x222...",
        "name": "Balanced Diversified Vault",
        "risk_tier": 3,
        "target_duration": 1095,
        "expected_yield": 7.5,
        "strategy": "balanced-diversified"
    })
    
    agent.register_vault({
        "address": "0x333...",
        "name": "High-Yield Long-Term Vault",
        "risk_tier": 5,
        "target_duration": 3650,
        "expected_yield": 12.0,
        "strategy": "high-yield-long-term"
    })
    
    # User preferences
    user_prefs = UserPreferences(
        timeframe=Timeframe.MEDIUM_TERM,
        risk_tolerance=RiskTolerance.BALANCED,
        amount=10000.0,
        min_yield=6.0
    )
    
    # Get recommendations
    recommendations = agent.suggest_vaults(user_prefs)
    
    print(f"Found {len(recommendations)} vault recommendations:")
    for rec in recommendations:
        print(f"\n{rec.vault_name}")
        print(f"  Match Score: {rec.match_score:.1f}/100")
        print(f"  Risk Tier: {rec.risk_tier}")
        print(f"  Expected Yield: {rec.expected_yield:.2f}%")
        print(f"  Reasoning: {rec.reasoning}")

