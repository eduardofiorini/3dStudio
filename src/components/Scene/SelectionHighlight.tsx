import { useEffect, useRef } from 'react';
import { Box3, Box3Helper, Color } from 'three';
import { useFrame } from '@react-three/fiber';
import { useEditorStore } from '../../store/editorStore';

export function SelectionHighlight() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const boxRef = useRef<Box3>(new Box3());
  const helperRef = useRef<Box3Helper>();

  useEffect(() => {
    if (!helperRef.current) {
      const box = boxRef.current;
      const helper = new Box3Helper(box, new Color(0x00ff00));
      helper.material.depthTest = false;
      helper.material.transparent = true;
      helper.material.opacity = 0.3;
      helper.material.linewidth = 1;
      helperRef.current = helper;
    }
  }, []);

useFrame((state) => {
  if (selectedObject) {
    boxRef.current.setFromObject(selectedObject);
    boxRef.current.expandByScalar(0.1); // Make the box slightly larger

    // If a helper already exists, remove it
    if (helperRef.current && state.scene.children.includes(helperRef.current)) {
      state.scene.remove(helperRef.current);
    }

    // Create a new helper with the updated box
    const newHelper = new Box3Helper(boxRef.current, new Color(0xffff00));
    newHelper.material.depthTest = false;
    newHelper.material.transparent = true;
    newHelper.material.opacity = 0.5;
    newHelper.material.linewidth = 2;
    newHelper.renderOrder = 999; // Ensure it renders on top

    state.scene.add(newHelper);
    helperRef.current = newHelper;
  } else {
    // No selected object, remove helper if present
    if (helperRef.current && state.scene.children.includes(helperRef.current)) {
      state.scene.remove(helperRef.current);
      helperRef.current = undefined;
    }
  }
});