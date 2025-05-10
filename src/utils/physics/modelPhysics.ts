import { Mesh, Box3, Vector3, Object3D } from 'three';

export function computeBoundingBox(object: Object3D) {
  const box = new Box3();
  
  // Compute bounding box including all children
  object.traverse((child) => {
    if (child instanceof Mesh && child.geometry) {
      // Ensure geometry is ready for bounds computation
      child.geometry.computeBoundingBox();
      child.updateMatrixWorld(true);
      child.geometry.computeBoundingBox();
      box.expandByObject(child);
    }
  });
  
  // Get center and size
  const center = new Vector3();
  const size = new Vector3();
  box.getCenter(center);
  box.getSize(size);
  
  return {
    size,
    center,
    box
  };
}

export function setupPhysicsForMesh(object: Object3D) {
  try {
    // Calculate combined bounding box for all meshes
    const { size, center, box } = computeBoundingBox(object);
    
    // Store initial transform with bounding box info
    object.userData.initialTransform = {
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone()
    };

    // Set physics properties
    object.userData.isGLBModel = true;
    object.userData.physicsEnabled = false; // Physics disabled by default
    
    console.log('Physics setup complete for GLB model:', {
      uuid: object.uuid,
      size: size.toArray(),
      center: center.toArray(),
      physicsEnabled: false
    });

    return true;
  } catch (error) {
    console.error('Error setting up physics for GLB model:', error);
    return false;
  }
}