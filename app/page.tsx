"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, ReactFlow, Background, Controls, MiniMap, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { convertDataToGraphNodesAndEdges } from "../core/data/data-converter";
import { GraphFormatService } from "../core/graph-format.service";
import { ReactFlowService } from "../core/react-flow.service";

const graphFormatService = new GraphFormatService();
const reactFlowService = new ReactFlowService();

const {
	graphNodes,
	graphEdges,
	c1Output,
	c2Subcategories,
	c2Relationships,
	crossC1C2Relationships
} = convertDataToGraphNodesAndEdges();

const layoutedData = graphFormatService.layoutCategoriesWithNodes(
	graphNodes,
	graphEdges,
	c1Output,
	c2Subcategories,
	c2Relationships,
	crossC1C2Relationships
);

const { nodes: initialNodes, edges: initialEdges } = reactFlowService.convertDataToReactFlowDataTypes(
	layoutedData.graphNodes,
	layoutedData.c1Nodes,
	layoutedData.c2Nodes,
	layoutedData.edges,
);

export default function App() {
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	const onNodesChange = useCallback(
		(changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback(
		(params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
		[],
	);

	return (
		<div style={{ width: "100vw", height: "100vh", background: "#fafafa" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				minZoom={0.05}
				maxZoom={2}
				defaultEdgeOptions={{
					type: 'smoothstep',
					animated: false,
				}}
				proOptions={{ hideAttribution: true }}
				style={{ background: "#fafafa" }}
			>
				<Background color="#e5e7eb" gap={20} />
				<Controls />
				<MiniMap 
					nodeColor={(node) => {
						const border = node.style?.border;
						if (typeof border === 'string' && border.includes('#dc2626')) return '#dc2626';
						if (typeof border === 'string' && border.includes('#16a34a')) return '#16a34a';
						return '#3b82f6';
					}}
					maskColor="rgba(0, 0, 0, 0.1)"
					style={{
						backgroundColor: '#ffffff',
						border: '1px solid #e5e7eb'
					}}
				/>
				<Panel position="top-left" style={{
					background: 'white',
					padding: '12px 16px',
					borderRadius: '8px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					border: '1px solid #e5e7eb'
				}}>
					<h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
						FastAPI Codebase Graph
					</h3>
					<div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
						<div><strong>{graphNodes.length}</strong> Functions</div>
						<div><strong>{c1Output.length}</strong> C1 Categories</div>
						<div><strong>{c2Subcategories.length}</strong> C2 Subcategories</div>
					</div>
				</Panel>
				<Panel position="top-right" style={{
					background: 'white',
					padding: '10px',
					borderRadius: '8px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					border: '1px solid #e5e7eb',
					fontSize: '11px',
					maxWidth: '200px'
				}}>
					<div style={{ marginBottom: '6px', fontWeight: '600', color: '#111827' }}>Legend</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
						<div style={{ width: '16px', height: '16px', background: '#fef2f2', border: '2px solid #dc2626', borderRadius: '3px' }}></div>
						<span style={{ color: '#6b7280' }}>C1 Category</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
						<div style={{ width: '16px', height: '16px', background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: '3px' }}></div>
						<span style={{ color: '#6b7280' }}>C2 Subcategory</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
						<div style={{ width: '16px', height: '16px', background: '#dbeafe', border: '2px solid #3b82f6', borderRadius: '3px' }}></div>
						<span style={{ color: '#6b7280' }}>Function</span>
					</div>
				</Panel>
			</ReactFlow>
		</div>
	);
}
