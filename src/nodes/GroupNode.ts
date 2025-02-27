// import { NodeSerialized, Node, Input, Output, schema } from "../nodl-core";
// import { CircuitStore } from "../nodl-react";
// import { z } from "zod";

// function processNodes(nodes) {
//     // Step 1: Parse nodes into maps
//     let nodeMap = new Map(); // ID -> node
//     let inDegree = new Map(); // ID -> incoming edges from array nodes
//     let outEdges = new Map(); // ID -> array of node IDs it connects to in array

//     for (let node of nodes) {
//         nodeMap.set(node.id, node);
//         inDegree.set(node.id, 0);
//         outEdges.set(node.id, []);
//     }

//     // // Step 2: Build graph (only connections within the array)
//     // let outputIdsInArray = new Set(
//     //     nodes.flatMap(node =>
//     //         Object.values(node.outputs || {}).map(out => out.id)
//     //     )
//     // );

//     for (let node of nodes) {
//         for (let inputKey in node.inputs) {
//             let input = node.inputs[inputKey];
//             if (input.value.type === "CONNECTED") {
//                 let fromId = JSON.parse(input.value.value).fromId;
//                 let fromNode = [...nodeMap.values()].find(n =>
//                     n.outputs && Object.values(n.outputs).some(out => out.id === fromId)
//                 );
//                 if (fromNode) { // Only count connections within the array
//                     outEdges.get(fromNode.id).push(node.id);
//                     inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
//                 }
//             }
//         }
//     }

//     // Step 3: Check for isolated nodes
//     let isolatedNodes = nodes.filter(node =>
//         inDegree.get(node.id) === 0 && outEdges.get(node.id).length === 0
//     );

//     if (isolatedNodes.length > 0) {
//         throw new Error(`Isolated nodes detected: ${isolatedNodes.map(n => n.id).join(", ")}`);
//     }

//     // Step 4: Identify first and last nodes
//     let firstNodes = [];
//     let lastNodes = [];

//     for (let node of nodes) {
//         if (inDegree.get(node.id) === 0) {
//             firstNodes.push(node); // No incoming from array
//         }
//         if (outEdges.get(node.id).length === 0) {
//             lastNodes.push(node); // No outgoing in array
//         }
//     }

//     // Step 5: Validate exactly one last node
//     if (lastNodes.length === 0) {
//         throw new Error("No last node found (no node with out-degree = 0)!");
//     } else if (lastNodes.length > 1) {
//         throw new Error(`Multiple last nodes detected (must converge to one): ${lastNodes.map(n => n.id).join(", ")}`);
//     }

//     // Step 6: Topological sort
//     let queue = firstNodes.map(n => n.id);
//     let sorted = [];
//     let tempInDegree = new Map(inDegree);

//     while (queue.length > 0) {
//         let currId = queue.shift();
//         sorted.push(nodeMap.get(currId));
//         for (let nextId of outEdges.get(currId)) {
//             tempInDegree.set(nextId, tempInDegree.get(nextId) - 1);
//             if (tempInDegree.get(nextId) === 0) {
//                 queue.push(nextId);
//             }
//         }
//     }

//     if (sorted.length !== nodes.length) {
//         throw new Error("Cycle detected or incomplete sort!");
//     }

//     return {
//         sorted: sorted,
//         firstNodes: firstNodes,
//         lastNode: lastNodes[0] // Single last node
//     };
// }

// // Helper to create unique input/output keys
// const createUniqueKey = (baseName: string, existingKeys: string[]) => {
//     let counter = 1;
//     let uniqueName = baseName;
//     while (existingKeys.includes(uniqueName)) {
//         uniqueName = `${baseName}${counter}`;
//         counter++;
//     }
//     return uniqueName;
// };

// // Create a GroupNode class that encapsulates the selected nodes
// class GroupNode extends Node {
//     public name: string = "GroupNode";
//     public inputs: Record<string, Input> = {};
//     public outputs: Record<string, Output> = {};
    
//     // Store the internal nodes and their connections
//     private internalNodes: NodeSerialized[] = [];
//     // Maps external input keys to internal node inputs
//     private inputMapping: Map<string, {nodeId: string, inputKey: string}> = new Map();
//     // Maps internal node outputs to external output keys
//     private outputMapping: Map<string, string> = new Map();
//     // Internal values for nodes (simulating the nodes' states)
//     private internalValues: Map<string, any> = new Map();
    
//     constructor(groupedNodes: NodeSerialized[], firstNodes: NodeSerialized[], lastNode: NodeSerialized) {
//         super();
        
//         this.localName = "Group";
//         this.internalNodes = groupedNodes;
        
//         // Create inputs for each input port on first-layer nodes
//         firstNodes.forEach(node => {
//             Object.entries(node.inputs).forEach(([key, input]) => {
//                 // Only create external inputs for non-connected inputs (which are connected from outside)
//                 if (input.value.type !== "CONNECTED") {
//                     const inputKey = createUniqueKey(`${node.type}_${key}`, Object.keys(this.inputs));
//                     this.inputs[inputKey] = new Input({
//                         name: inputKey,
//                         type: schema(z.any()),
//                         defaultValue: () => {
//                             try {
//                                 if (typeof input.value.value === 'string') {
//                                     return JSON.parse(input.value.value);
//                                 }
//                                 return input.value.value;
//                             } catch (e) {
//                                 return input.value.value;
//                             }
//                         },
//                         onChange: (value) => {
//                             // When an external input changes, propagate to internal node
//                             this.handleInputChange(inputKey, value);
//                         }
//                     });
                    
//                     // Map this external input to the internal node input
//                     this.inputMapping.set(inputKey, {
//                         nodeId: node.id,
//                         inputKey: key
//                     });
//                 }
//             });
//         });
        
//         // Create outputs based on the last node's outputs
//         Object.entries(lastNode.outputs).forEach(([key, output]) => {
//             const outputKey = createUniqueKey(key, Object.keys(this.outputs));
//             this.outputs[outputKey] = new Output({
//                 name: outputKey,
//                 type: schema(z.any()),
//                 getValue: () => {
//                     // Retrieve the value from the internal last node's output
//                     return () => {
//                         const internalOutputValue = this.getInternalOutputValue(lastNode.id, key);
//                         console.log(`GroupNode output ${outputKey} value:`, internalOutputValue);
//                         return internalOutputValue;
//                     };
//                 }
//             });
            
//             // Map this internal node output to the external output
//             this.outputMapping.set(`${lastNode.id}:${key}`, outputKey);
//         });
        
//         // Initialize internal values for all nodes
//         this.initializeInternalValues();
//     }
    
//     // Initialize internal values for simulation purposes
//     private initializeInternalValues() {
//         // Set initial values for all internal nodes
//         this.internalNodes.forEach(node => {
//             this.internalValues.set(node.id, {
//                 inputs: { ...node.inputs },
//                 outputs: { ...node.outputs },
//                 processed: false
//             });
//         });
//     }
    
//     // Handle changes to the external inputs
//     private handleInputChange(externalInputKey: string, value: any) {
//         const mapping = this.inputMapping.get(externalInputKey);
//         if (!mapping) return;
        
//         // Update the internal value for this input
//         const internalNode = this.internalValues.get(mapping.nodeId);
//         if (internalNode) {
//             internalNode.inputs[mapping.inputKey].value.value = 
//                 typeof value === 'object' ? JSON.stringify(value) : value;
//             internalNode.processed = false;
            
//             // Propagate changes through the internal nodes
//             this.propagateChanges();
//         }
//     }
    
//     // Propagate changes through the internal node network
//     private propagateChanges() {
//         // Create a processing queue based on topological sort
//         const { sorted } = processNodes(this.internalNodes);
//         const processingQueue = [...sorted];
        
//         // Process each node in topological order
//         while (processingQueue.length > 0) {
//             const node = processingQueue.shift();
//             if (!node) continue;
            
//             const internalNode = this.internalValues.get(node.id);
//             if (!internalNode || internalNode.processed) continue;
            
//             // Simulate processing this node (in a real implementation, you'd run the node's code)
//             this.processInternalNode(node);
            
//             // Mark as processed
//             internalNode.processed = true;
//         }
//     }
    
//     // Process an internal node (simplified simulation)
//     private processInternalNode(node: NodeSerialized) {
//         // In a real implementation, this would execute the node's actual processing logic
//         console.log(`Processing internal node: ${node.type} (${node.id})`);
        
//         // For demonstration, we'll just pass input values to outputs
//         // In reality, this would run the node's code
//         const internalNode = this.internalValues.get(node.id);
//         if (!internalNode) return;
        
//         // Update all outputs based on inputs (simplified)
//         Object.keys(node.outputs || {}).forEach(outputKey => {
//             // This is a placeholder. In reality, you'd compute the output value
//             // based on the node's processing logic
//             const outputValue = `Processed output for ${node.type}:${outputKey}`;
            
//             if (internalNode.outputs[outputKey]) {
//                 internalNode.outputs[outputKey].value = outputValue;
//             }
            
//             // If this is mapped to an external output, trigger observers
//             const mappingKey = `${node.id}:${outputKey}`;
//             const externalOutputKey = this.outputMapping.get(mappingKey);
//             if (externalOutputKey && this.outputs[externalOutputKey]) {
//                 // Notify observers that this output has changed
//                 this.notifyOutputChange(externalOutputKey);
//             }
//         });
//     }
    
//     // Get the value of an internal node's output
//     private getInternalOutputValue(nodeId: string, outputKey: string): any {
//         const internalNode = this.internalValues.get(nodeId);
//         if (!internalNode || !internalNode.outputs[outputKey]) {
//             return undefined;
//         }
        
//         return internalNode.outputs[outputKey].value;
//     }
    
//     // Notify observers that an output has changed
//     private notifyOutputChange(outputKey: string) {
//         const output = this.outputs[outputKey];
//         if (output && output.observers) {
//             // Notify all observers about the change
//             output.observers.forEach(observer => {
//                 if (typeof observer === 'function') {
//                     observer();
//                 }
//             });
//         }
//     }
    
//     public code(args: string[]) {
//         // In a real implementation, this would generate code that incorporates
//         // all the internal nodes' code
//         return {
//             code: '// GroupNode implementation\n' + 
//                   '// This would contain code that combines all internal nodes\n',
//             dependencies: []
//         };
//     }
    
//     // Override serialize to include internal nodes
//     public serialize(): NodeSerialized {
//         const serialized = super.serialize();
//         serialized['internalNodes'] = this.internalNodes;
//         return serialized;
//     }
// }

// export const groupNodes = (store: CircuitStore) => {
//     const selectedNodes = store.selectedNodes;
//     if (selectedNodes.length < 2) return;

//     const serializedNodes: NodeSerialized[] = []
//     selectedNodes.forEach(node => {
//         const pos = store.nodePositions.get(node.id)
//         if (!pos) throw new Error("No position found for node")
//         serializedNodes.push({ ...node.serialize(), position: { x: pos.x, y: pos.y } })
//     })

//     try {
//         // Process the nodes to get topology information
//         const { sorted, firstNodes, lastNode } = processNodes(serializedNodes);
        
//         console.log("Sorted nodes:", sorted.map(n => n.type));
//         console.log("First layer nodes:", firstNodes.map(n => n.type));
//         console.log("Last node:", lastNode.type);
        
//         // Create the group node
//         const groupNode = new GroupNode(serializedNodes, firstNodes, lastNode);
        
//         // Calculate the center position of all selected nodes
//         const positions = selectedNodes.map(node => store.nodePositions.get(node.id));
//         const validPositions = positions.filter(pos => pos !== undefined) as { x: number, y: number }[];
        
//         const avgX = validPositions.reduce((sum, pos) => sum + pos.x, 0) / validPositions.length;
//         const avgY = validPositions.reduce((sum, pos) => sum + pos.y, 0) / validPositions.length;
        
//         // Add the group node to the store
//         store.nodes.push(groupNode);
//         store.nodePositions.set(groupNode.id, { x: avgX, y: avgY });
        
//         // Remove the selected nodes
//         // selectedNodes.forEach(node => {
//         //     store.removeNode(node.id);
//         // });
        
//         // Select the new group node
//         store.selectNodes([groupNode]);
        
//         // Save the circuit store state
//         store.save();
        
//         return groupNode;
//     } catch (error) {
//         console.error("Failed to create group node:", error);
//         alert(`Failed to group nodes: ${error.message}`);
//         return null;
//     }
// }