import { useRef, useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { createText, createMediaPlane } from '../../../utils/objects';
import { loadGLBModel } from '../../../utils/objectCreators';

export function useToolbarHandlers() {
  const addObject = useEditorStore((state) => state.addObject);
  const [showShapes, setShowShapes] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [showArrayDialog, setShowArrayDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleCreateShape = (action: string) => {
    const creators = {
      createCube,
      createSphere,
      createCylinder,
      createCone,
      createTorus,
      createPlane,
      createEmptyEntity,
    };
    addObject(creators[action]());
    setShowShapes(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const object = await loadGLBModel(file);
        addObject(object);
      } catch (error) {
        console.error('Error loading GLB:', error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const plane = await createMediaPlane(file);
        addObject(plane);
        setShowMedia(false);
      }
    } catch (error) {
      console.error('Error creating media plane:', error);
    }
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };

  const handleCreateText = async (is3D: boolean) => {
    const textObject = await createText({
      text: 'Text',
      size: 1,
      height: is3D ? 0.2 : 0.001,
      material: {
        color: '#e0e0e0',
        metalness: 0,
        roughness: 0.4
      }
    });
    addObject(textObject);
    setShowTextMenu(false);
  };

  return {
    showShapes,
    showMedia,
    showTextMenu,
    showArrayDialog,
    fileInputRef,
    mediaInputRef,
    setShowShapes,
    setShowMedia,
    setShowTextMenu,
    setShowArrayDialog,
    handleCreateShape,
    handleFileUpload,
    handleMediaUpload,
    handleCreateText
  };
}