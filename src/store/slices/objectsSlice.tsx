@@ .. @@
     // Clean up camera helper if this is a camera
     if (object.userData.isCamera && object.userData.helper) {
       const scene = (window as any).__THREE_SCENE__;
       if (scene) {
         scene.remove(object.userData.helper);
         object.userData.helper.dispose();
         object.userData.helper = null;
       }
     }
+
+    // Preserve physics state when removing from scene
+    // Don't clear physics references as they might be needed for re-adding
 
     // Create new maps to avoid mutation