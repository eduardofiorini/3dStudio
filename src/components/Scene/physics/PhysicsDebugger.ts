import { PhysicsDebugInfo } from './types';

export class PhysicsDebugger {
  static logCreation(info: Omit<PhysicsDebugInfo, 'rigidBodyApi'>) {
    console.log('PhysicsObject created:', {
      ...info,
      timestamp: new Date().toISOString()
    });
  }

  static logStatus(info: PhysicsDebugInfo) {
    console.log('Physics status check:', {
      ...info,
      timestamp: new Date().toISOString()
    });
  }

  static startPeriodicCheck(info: PhysicsDebugInfo, interval = 2000) {
    return setInterval(() => {
      this.logStatus(info);
    }, interval);
  }
}