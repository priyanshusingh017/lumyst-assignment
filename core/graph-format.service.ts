import dagre from 'dagre';
import type { GraphNode, GraphEdge, C1Output, C2Subcategory, C2Relationship, CrossC1C2Relationship } from './types';

interface LayoutConfig {
	rankdir: 'TB' | 'LR' | 'BT' | 'RL';
	ranksep: number;
	nodesep: number;
	edgesep: number;
	c1NodeWidth: number;
	c1NodeHeight: number;
	c2NodeWidth: number;
	c2NodeHeight: number;
	graphNodeWidth: number;
	graphNodeHeight: number;
}

export class GraphFormatService {
	private config: LayoutConfig = {
		rankdir: 'TB', // Top to Bottom hierarchy
		ranksep: 150, // Vertical spacing between ranks (increased for better separation)
		nodesep: 100, // Horizontal spacing between nodes (increased to reduce congestion)
		edgesep: 20, // Spacing between edges
		c1NodeWidth: 200,
		c1NodeHeight: 80,
		c2NodeWidth: 180,
		c2NodeHeight: 60,
		graphNodeWidth: 160,
		graphNodeHeight: 50,
	};

	layoutCategoriesWithNodes(
		graphNodes: GraphNode[],
		graphEdges: GraphEdge[],
		c1Outputs: C1Output[],
		c2Subcategories: C2Subcategory[],
		c2Relationships: C2Relationship[],
		crossC1C2Relationships: CrossC1C2Relationship[]
	) {
		// Create a mapping from C2 names to C2 IDs for relationships
		const c2NameToIdMap = new Map<string, string>();
		c2Subcategories.forEach(c2 => {
			c2NameToIdMap.set(c2.c2Name, c2.id);
		});

		// Build edge list first to analyze connectivity
		const allEdges: GraphEdge[] = this.buildEdgeList(
			graphEdges,
			c2Subcategories,
			c2Relationships,
			crossC1C2Relationships,
			c2NameToIdMap
		);

		// Calculate node importance (degree centrality) for better positioning
		const nodeImportance = this.calculateNodeImportance(
			[...graphNodes, ...c1Outputs, ...c2Subcategories],
			allEdges
		);

		// Create the dagre graph with optimized settings (no compound for now to avoid errors)
		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));

		// Set up the graph with enhanced spacing parameters
		dagreGraph.setGraph({
			rankdir: this.config.rankdir,
			ranksep: this.config.ranksep,
			nodesep: this.config.nodesep,
			edgesep: this.config.edgesep,
			marginx: 50,
			marginy: 50,
		});

		// Add nodes with appropriate sizes based on their type and importance
		// Add C1 nodes first
		c1Outputs.forEach((node) => {
			const importance = nodeImportance.get(node.id) || 1;
			const width = this.config.c1NodeWidth + (importance - 1) * 20;
			const height = this.config.c1NodeHeight;
			dagreGraph.setNode(node.id, { width, height });
		});

		// Add C2 nodes
		c2Subcategories.forEach((node) => {
			const importance = nodeImportance.get(node.id) || 1;
			const width = this.config.c2NodeWidth + (importance - 1) * 15;
			const height = this.config.c2NodeHeight;
			dagreGraph.setNode(node.id, { width, height });
		});

		// Add graph nodes
		graphNodes.forEach((node) => {
			const importance = nodeImportance.get(node.id) || 1;
			const width = this.config.graphNodeWidth + (importance - 1) * 10;
			const height = this.config.graphNodeHeight;
			dagreGraph.setNode(node.id, { width, height });
		});

		// Add edges with weights to influence layout (shorter paths for important edges)
		// Only add edges if both source and target nodes exist in the graph
		allEdges.forEach((edge) => {
			if (edge && dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
				// Assign weights to edges based on type
				let weight = 1;
				if (edge.label === 'contains') {
					weight = 10; // Higher weight for containment edges (keep them shorter)
				} else if (edge.id.startsWith('c2_relationship')) {
					weight = 5; // Medium weight for C2 relationships
				} else if (edge.id.startsWith('cross_c1_c2_rel')) {
					weight = 2; // Lower weight for cross relationships (can be longer)
				}
				
				dagreGraph.setEdge(edge.source, edge.target, { weight });
			}
		});

		// Calculate layout using dagre
		dagre.layout(dagreGraph);

		// Apply positions with post-processing for better distribution
		const positionedGraphNodes = this.applyPositionsWithSpacing(
			graphNodes,
			dagreGraph,
			'graph'
		);

		const positionedC1Nodes = this.applyPositionsWithSpacing(
			c1Outputs,
			dagreGraph,
			'c1'
		);

		const positionedC2Nodes = this.applyPositionsWithSpacing(
			c2Subcategories,
			dagreGraph,
			'c2'
		);

		// Apply force-directed adjustment to reduce edge crossings
		const adjustedNodes = this.applyForceDirectedAdjustment(
			positionedGraphNodes,
			positionedC1Nodes,
			positionedC2Nodes,
			allEdges
		);

		return {
			graphNodes: adjustedNodes.graphNodes,
			c1Nodes: adjustedNodes.c1Nodes,
			c2Nodes: adjustedNodes.c2Nodes,
			edges: allEdges,
		};
	}

	private buildEdgeList(
		graphEdges: GraphEdge[],
		c2Subcategories: C2Subcategory[],
		c2Relationships: C2Relationship[],
		crossC1C2Relationships: CrossC1C2Relationship[],
		c2NameToIdMap: Map<string, string>
	): GraphEdge[] {
		return [
			...graphEdges,
			// Edges from C1 to their C2 subcategories
			...c2Subcategories.map(c2 => ({
				id: `c1-${c2.c1CategoryId}-to-c2-${c2.id}`,
				source: c2.c1CategoryId,
				target: c2.id,
				label: 'contains'
			})),
			// Edges from C2 to their nodes
			...c2Subcategories.flatMap(c2 =>
				c2.nodeIds.map(nodeId => ({
					id: `c2-${c2.id}-to-node-${nodeId}`,
					source: c2.id,
					target: nodeId,
					label: 'contains'
				}))
			),
			// C2 relationships
			...c2Relationships.map(rel => {
				const sourceId = c2NameToIdMap.get(rel.fromC2);
				const targetId = c2NameToIdMap.get(rel.toC2);
				if (!sourceId || !targetId) {
					return null;
				}
				return {
					id: rel.id,
					source: sourceId,
					target: targetId,
					label: rel.label
				};
			}).filter((edge): edge is GraphEdge => edge !== null),
			// Cross C1-C2 relationships
			...crossC1C2Relationships.map(rel => {
				const sourceId = c2NameToIdMap.get(rel.fromC2);
				const targetId = c2NameToIdMap.get(rel.toC2);
				if (!sourceId || !targetId) {
					return null;
				}
				return {
					id: rel.id,
					source: sourceId,
					target: targetId,
					label: rel.label
				};
			}).filter((edge): edge is GraphEdge => edge !== null)
		];
	}

	private calculateNodeImportance(
		nodes: Array<GraphNode | C1Output | C2Subcategory>,
		edges: GraphEdge[]
	): Map<string, number> {
		const importance = new Map<string, number>();
		
		// Initialize all nodes with importance 1
		nodes.forEach(node => importance.set(node.id, 1));

		// Calculate degree centrality (number of connections)
		edges.forEach(edge => {
			importance.set(edge.source, (importance.get(edge.source) || 0) + 1);
			importance.set(edge.target, (importance.get(edge.target) || 0) + 1);
		});

		// Normalize importance scores
		const maxImportance = Math.max(...Array.from(importance.values()));
		if (maxImportance > 1) {
			importance.forEach((value, key) => {
				importance.set(key, value / maxImportance);
			});
		}

		return importance;
	}

	private applyPositionsWithSpacing<T extends { id: string }>(
		nodes: T[],
		dagreGraph: dagre.graphlib.Graph,
		nodeType: 'graph' | 'c1' | 'c2'
	): Array<T & { position: { x: number; y: number } }> {
		return nodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			if (!nodeWithPosition) {
				// Fallback position if node is not in dagre graph
				return {
					...node,
					position: { x: 0, y: 0 }
				};
			}

			return {
				...node,
				position: {
					x: nodeWithPosition.x - nodeWithPosition.width / 2,
					y: nodeWithPosition.y - nodeWithPosition.height / 2,
				},
			};
		});
	}

	private applyForceDirectedAdjustment(
		graphNodes: Array<GraphNode & { position: { x: number; y: number } }>,
		c1Nodes: Array<C1Output & { position: { x: number; y: number } }>,
		c2Nodes: Array<C2Subcategory & { position: { x: number; y: number } }>,
		edges: GraphEdge[]
	) {
		// Create a simple force-directed adjustment to reduce overlaps
		// This is a lightweight adjustment, not a full force simulation
		
		const allNodes = [
			...graphNodes.map(n => ({ ...n, type: 'graph' as const })),
			...c1Nodes.map(n => ({ ...n, type: 'c1' as const })),
			...c2Nodes.map(n => ({ ...n, type: 'c2' as const }))
		];

		// Build adjacency map
		const adjacency = new Map<string, Set<string>>();
		edges.forEach(edge => {
			if (!adjacency.has(edge.source)) {
				adjacency.set(edge.source, new Set());
			}
			if (!adjacency.has(edge.target)) {
				adjacency.set(edge.target, new Set());
			}
			adjacency.get(edge.source)?.add(edge.target);
			adjacency.get(edge.target)?.add(edge.source);
		});

		// Apply light repulsion between non-connected nodes at the same hierarchy level
		const iterations = 3;
		for (let iter = 0; iter < iterations; iter++) {
			for (let i = 0; i < allNodes.length; i++) {
				for (let j = i + 1; j < allNodes.length; j++) {
					const nodeA = allNodes[i];
					const nodeB = allNodes[j];

					// Only adjust nodes of the same type (same hierarchy level)
					if (nodeA.type !== nodeB.type) continue;

					// Skip connected nodes
					if (adjacency.get(nodeA.id)?.has(nodeB.id)) continue;

					const dx = nodeB.position.x - nodeA.position.x;
					const dy = nodeB.position.y - nodeA.position.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					// Minimum distance threshold based on node type
					const minDistance = nodeA.type === 'c1' ? 250 : nodeA.type === 'c2' ? 200 : 180;

					if (distance < minDistance && distance > 0) {
						// Apply repulsion
						const force = (minDistance - distance) / distance;
						const fx = (dx / distance) * force * 0.1;
						const fy = (dy / distance) * force * 0.1;

						nodeA.position.x -= fx;
						nodeA.position.y -= fy;
						nodeB.position.x += fx;
						nodeB.position.y += fy;
					}
				}
			}
		}

		// Separate adjusted nodes back into their types
		return {
			graphNodes: allNodes
				.filter(n => n.type === 'graph')
				.map(({ type, ...rest }) => rest as GraphNode & { position: { x: number; y: number } }),
			c1Nodes: allNodes
				.filter(n => n.type === 'c1')
				.map(({ type, ...rest }) => rest as C1Output & { position: { x: number; y: number } }),
			c2Nodes: allNodes
				.filter(n => n.type === 'c2')
				.map(({ type, ...rest }) => rest as C2Subcategory & { position: { x: number; y: number } })
		};
	}
}
