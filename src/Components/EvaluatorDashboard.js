import React from 'react';
import { useParams } from 'react-router-dom';
import CharlesDashboard from './CharlesDashboard';
import CarylDashboard from './CarylDashboard';
import PatrickDashboard from './PatrickDashboard';
import VincentDashboard from './VincentDashboard';

function EvaluatorDashboard() {
  const { evaluatorId } = useParams(); // Get the evaluatorId from the URL

  // Based on the evaluatorId, return the correct dashboard
  switch (evaluatorId) {
    case 'charles':
      return <CharlesDashboard />;
    case 'caryl':
      return <CarylDashboard />;
    case 'patrick':
      return <PatrickDashboard />;
    case 'vincent':
      return <VincentDashboard />;
    default:
      return <div>Invalid evaluator ID</div>;
  }
}

export default EvaluatorDashboard;
