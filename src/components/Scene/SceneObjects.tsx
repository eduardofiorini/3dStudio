import { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { PivotControls } from '@react-three/drei';
import { PhysicsObject } from './physics/PhysicsObject';
import { SelectionHighlight } from './SelectionHighlight';
import { Event } from 'three';
import { handleObjectClick } from './utils/interactions';

export function SceneObjects() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const isTransforming = useEditorStore((state) => state.isTransforming);
  const transformMode = useEditorStore((state) => state.transformMode);
  const physics = useEditorStore((state) => state.physics);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);

  const handleTransformStart = () => useEditorStore.getState().setIsTransforming(true);
  const handleTransformEnd = () => useEditorStore.getState().setIsTransforming(false);
  const handleTransformChange = () => useEditorStore.getState().updateTransform();

  const handleClick = (e: Event, object: Object3D) => {
    e.stopPropagation();
    if (!isTransforming) {
      setSelectedObject(object);
    }
  };

  return (
    <>
      <SelectionHighlight />
      {selectedObject && !physics.running && (
        <PivotControls
          object={selectedObject}
          rotation={transformMode === 'rotate'} 
          scale={transformMode === 'scale'} 
          translate={transformMode === 'translate'} 
          size={5}
          lineWidth={10}
          fixed
          activeAxes={[true, true, true]}
          axisColors={['#ff0000', '#00ff00', '#0000ff']}
          hoveredColor="#ff00ff"
          depthTest={false}
          opacity={1}
          snapTranslate={0.5}
          snapRotate={15}
          snapScale={0.25}
          autoTransform
          anchor={[0, 0.5, 0]}
          onDragStart={handleTransformStart}
          onDragEnd={handleTransformEnd}
          onDrag={handleTransformChange}
        />
      )}

      {objects.map((object, index) => {
        if (physics.running) {
          if (physics.enabledObjects.has(object)) {
            return (
              <PhysicsObject
                key={index}
                object={object}
                isStatic={object.userData.physicsType === 'static'}
                onClick={(e) => handleClick(e, object)}
              />
            );
          }
          return (
            <primitive 
              key={index} 
              object={object}
              onClick={(e) => handleClick(e, object)}
            />
          );
        }

        return (
          <primitive
            key={index}
            object={object}
            onClick={(e) => handleClick(e, object)}
          />
        );
      })}
    </>
  );
}