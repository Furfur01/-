// Radius is in simulation space, never inferred from damage or critical power.
export function areaBlastPhase(age,radius,critical=false){
  const life=critical?1.05:.8,t=Math.max(0,Math.min(1,age/life));
  return {life,radius:radius*(1-(1-Math.min(1,age/.28))**3),
    opacity:(critical?.65:.4)*(1-t)**2,flash:Math.exp(-age/(critical?.12:.08)),
    color:critical?[1,.78,.28]:[1,.44,.13]};
}
