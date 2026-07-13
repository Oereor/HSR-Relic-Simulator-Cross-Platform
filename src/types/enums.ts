/**
 * Relic equipment slot position.
 * Numeric enum matching the C# RelicPosition exactly.
 *
 * Values: Unknown=0, Head=1, Hands=2, Body=3, Feet=4, Sphere=5, Rope=6
 * The 6 equipped slots are Head through Rope. Unknown is a sentinel for unset state.
 */
export enum RelicPosition {
  Unknown = 0,
  Head,
  Hands,
  Body,
  Feet,
  Sphere,
  Rope
}

/**
 * All 22 affix (stat) types in Honkai: Star Rail.
 * Numeric enum matching the C# AffixType exactly (values 0-22).
 *
 * Flat stats (Hp, Atk, Def) are absolute values.
 * Percentage stats (HpPercentage, AtkPercentage, etc.) are displayed with a % sign.
 * Damage boosts (PhysicalDmgBoost through ImaginaryDmgBoost) are percentage-based.
 */
export enum AffixType {
  Unknown = 0,
  Hp,
  Atk,
  Def,
  HpPercentage,
  AtkPercentage,
  DefPercentage,
  EffectHitRate,
  EffectRes,
  OutgoingHealingBoost,
  CritRate,
  CritDmg,
  Spd,
  PhysicalDmgBoost,
  FireDmgBoost,
  IceDmgBoost,
  WindDmgBoost,
  LightningDmgBoost,
  QuantumDmgBoost,
  ImaginaryDmgBoost,
  BreakEffect,
  EnergyRegenerationRate
}
