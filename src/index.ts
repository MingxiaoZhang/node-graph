import NodeGraph from "./nodegraph";
// Create a new NodeGraph instance
const container = document.getElementById("graphContainer") as HTMLElement;
const nodeGraph = new NodeGraph(container);

// Create nodes and edges
const node1 = nodeGraph.createNode(50, 50);
const node2 = nodeGraph.createNode(150, 150);
const node3 = nodeGraph.createNode(250, 250, {style: {borderRadius: '0', textAlign: 'center'}, content: "Hello"});

nodeGraph.createEdge(node1, node2);
nodeGraph.createEdge(node2, node3);

(document.getElementById("addButton") as HTMLElement).addEventListener("click", addNode);
function addNode() {
    const position = nodeGraph.findOptimalNodePosition();
    const node = nodeGraph.createNode(position.x, position.y);
}
