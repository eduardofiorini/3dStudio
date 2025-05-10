<div>
                 <label className="text-xs text-gray-400 block mb-1">Color</label>
                 <div className="flex gap-2">
                   <input
                     type="color"
                     value={`#${material.color.getHexString()}`}
                     onChange={(e) => {
                       material.color.set(e.target.value);
                       material.needsUpdate = true;
                       useEditorStore.getState().updateTransform();
                     }}
                     className="w-8 h-8 rounded cursor-pointer"
                   />
                   <input
                     type="text"
                     value={`#${material.color.getHexString()}`}
                     onChange={(e) => {
                       material.color.set(e.target.value);
                       updateTransform();
                     }}
                     className="flex-1 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
                   />
                 </div>
               </div>
               <div>
                <label className="text-xs text-gray-400 block mb-1">Emissive Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={`#${material.emissive?.getHexString() || '000000'}`}
                    onChange={(e) => {
                      material.emissive.set(e.target.value);
                      material.needsUpdate = true;
                      useEditorStore.getState().updateTransform();
                    }}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={`#${material.emissive?.getHexString() || '000000'}`}
                    onChange={(e) => {
                      material.emissive.set(e.target.value);
                      updateTransform();
                    }}
                    className="flex-1 py-0.5 px-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200"
                  />
                </div>
               </div>
               <div>
                <label className="text-xs text-gray-400 block mb-0.5">Emissive Intensity</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={material.emissiveIntensity || 1}
                  onChange={(e) => {
                    material.emissiveIntensity = parseFloat(e.target.value);
                    material.needsUpdate = true;
                    useEditorStore.getState().updateTransform();
                  }}
                  className="w-full"
                />
                <div className="text-right text-xs text-gray-400">
                  {(material.emissiveIntensity || 1).toFixed(1)}
                </div>
               </div>
               <div>
                <label className="text-xs text-gray-400 block mb-0.5">Metalness</label>