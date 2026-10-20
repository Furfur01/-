import React from 'react';
import Logistics from './secondary-logistics.jsx';
import Reports from './secondary-reports.jsx';
import Community from './secondary-community.jsx';
import Strategic from './secondary-strategic.jsx';
import Utilities from './secondary-utilities.jsx';

export default function Secondary(props){
  const {page,api}=props;
  if(page==='logistics')return <Logistics {...props}/>;
  if(page==='reports')return <Reports {...props}/>;
  if(['rankings','alliance','chat'].includes(page))return <Community key={page} {...props}/>;
  if(['moon','missiles'].includes(page))return <Strategic key={page+api.planet.id} {...props}/>;
  return <Utilities key={page+api.planet.id} {...props}/>;
}
