/**
 * Embodiment module exports
 * Central export point for all sensorimotor data integration components
 */

// Types
export * from './types/sensorimotor-types.js';

// Interfaces
export * from './interfaces/embodiment-interface.js';

// Base implementations
export * from './sensors/base-sensor.js';
export * from './motors/base-motor.js';

// Core components
export * from './embodiment-manager.js';
export * from './integration/psystem-integrator.js';
export * from './monitoring/meta-monitor.js';

// Simulation
export * from './simulation/virtual-simulation.js';

// Re-export main classes for convenience
export { SensorimotorManager } from './embodiment-manager.js';
export { PSytemIntegrationEngine } from './integration/psystem-integrator.js';
export { SensorimotorMetaMonitor } from './monitoring/meta-monitor.js';
export { VirtualSimulation } from './simulation/virtual-simulation.js';