import type { GraphNode, GraphEdge, C1Output, C2Subcategory } from './types';

export class ReactFlowService {
	convertDataToReactFlowDataTypes(
		graphNodes: GraphNode[],
		c1Nodes: C1Output[],
		c2Nodes: C2Subcategory[],
		edges: GraphEdge[]
	) {
		const reactFlowNodes = [
			// Regular graph nodes - smaller, clean design
			...graphNodes.map((node) => ({
				id: node.id,
				position: node.position || { x: 0, y: 0 },
				data: { label: node.label },
				type: 'default',
				style: {
					background: '#dbeafe',
					border: '2px solid #3b82f6',
					color: '#1e40af',
					borderRadius: '8px',
					padding: '8px 12px',
					fontSize: '12px',
					width: '160px',
					height: '50px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				},
			})),
			// C1 category nodes - larger, prominent design
			...c1Nodes.map((node) => ({
				id: node.id,
				position: node.position || { x: 0, y: 0 },
				data: { label: node.label },
				type: 'default',
				style: {
					background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
					border: '3px solid #dc2626',
					color: '#991b1b',
					fontWeight: 'bold',
					borderRadius: '10px',
					padding: '12px 16px',
					fontSize: '14px',
					width: '200px',
					height: '80px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06)'
				},
			})),
			// C2 subcategory nodes - medium size, clear hierarchy
			...c2Nodes.map((node) => ({
				id: node.id,
				position: node.position || { x: 0, y: 0 },
				data: { label: node.label },
				type: 'default',
				style: {
					background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
					border: '2px solid #16a34a',
					color: '#166534',
					fontWeight: '600',
					borderRadius: '8px',
					padding: '10px 14px',
					fontSize: '13px',
					width: '180px',
					height: '60px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: '0 2px 4px -1px rgba(22, 163, 74, 0.1)'
				},
			}))
		];

		const reactFlowEdges = edges.map((edge) => {
			// Determine edge type and styling
			let edgeStyle: any = {};
			let edgeType = 'default';
			let animated = false;
			let labelBgStyle = {};

			if (edge.label === 'contains') {
				// Containment edges - subtle dashed lines
				edgeStyle = {
					stroke: '#9ca3af',
					strokeDasharray: '5,5',
					strokeWidth: 1.5,
					opacity: 0.6
				};
				edgeType = 'smoothstep';
			} else if (edge.id.startsWith('c2_relationship')) {
				// C2 to C2 relationships - prominent green curved lines
				edgeStyle = {
					stroke: '#059669',
					strokeWidth: 2.5,
					opacity: 0.8
				};
				edgeType = 'default'; // This will be curved in ReactFlow
				animated = false;
				labelBgStyle = {
					fill: '#ecfdf5',
					fillOpacity: 0.9
				};
			} else if (edge.id.startsWith('cross_c1_c2_rel')) {
				// Cross C1-C2 relationships - orange curved lines
				edgeStyle = {
					stroke: '#d97706',
					strokeWidth: 2.5,
					opacity: 0.8
				};
				edgeType = 'default';
				animated = false;
				labelBgStyle = {
					fill: '#fffbeb',
					fillOpacity: 0.9
				};
			} else {
				// Regular graph edges - standard gray
				edgeStyle = {
					stroke: '#6b7280',
					strokeWidth: 1.5,
					opacity: 0.7
				};
				edgeType = 'default';
			}

			return {
				id: edge.id,
				source: edge.source,
				target: edge.target,
				label: edge.label,
				type: edgeType,
				animated: animated,
				style: edgeStyle,
				labelStyle: {
					fill: '#374151',
					fontWeight: '500',
					fontSize: '11px'
				},
				labelBgStyle: labelBgStyle,
				labelBgPadding: [4, 4] as [number, number],
				labelBgBorderRadius: 4,
			};
		});

		return {
			nodes: reactFlowNodes,
			edges: reactFlowEdges,
		};
	}
}
