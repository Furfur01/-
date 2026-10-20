import {cockpitClass,cabinPose} from './pilot-controls.mjs';

// Interior selection is shared by the range, live combat and replays. It does
// not grant pilot authority or change the server's handling/weapon profiles.
export const shipCabins=Object.freeze({
 Light_Fighter:'fighter',Heavy_Fighter:'fighter',Titanenergetic_Frigate:'fighter',
 Destroyer:'horizon',Cruiser:'horizon',Battleship:'horizon',Dreadnought:'horizon',Bomber:'horizon',
 Cargo_Ship:'horizon',Large_Cargo_Ship:'horizon',Colony_Ship:'horizon',Recycler:'horizon',Guardian:'horizon',
 Interceptor:'bastion',Devourer_Interceptor:'bastion',Reaper:'bastion',Death_Star:'bastion',
 Iron_Behemoth:'flagship',Probe:null,Solar_Satellite:null,Annihilator:null,
});
export function shipCabinFamily(type,profile={}){
 if(profile.ground||profile.role==='station'||profile.role==='ordnance'||profile.special==='antimatter')return null;
 if(Object.hasOwn(shipCabins,type))return shipCabins[type];
 // Carrier-spawned drones use a fighter mesh, but have no occupied seat.
 if(profile.renderType&&!profile.piloted)return null;
 if(profile.carrier)return 'flagship';
 return cockpitClass({...profile,length:profile.relativeLength??profile.length,role:profile.capital===false?'fighter':profile.role});
}
export function shipCabinClass(type,profile={}){
 const family=shipCabinFamily(type,profile);return family==='flagship'?'bastion':family;
}
export function shipCabinSeat(type,layout){
 // A spherical hull has no forward deck below a roof-mounted bridge. Put the
 // Death Star's observation seat on its forward cap, looking away from the hull.
 if(type==='Death_Star'&&layout.bounds){const {center,half}=layout.bounds;return [-center[2],center[1]+half[1]*.22,center[0]-half[0]-layout.length*.025];}
 return layout.bridge;
}
export function resetShipCabin(flight,type,profile){
 flight.cabinKind=shipCabinClass(type,profile);
 flight.cabinPose=flight.cabinKind?cabinPose(flight.cabinKind):null;
 flight.cabinWalk=false;
 if(!flight.cabinKind){flight.external=true;flight.cameraBlend=1;}
}
