import { Vertex, Edge } from '../types';
import CSS from 'csstype';

export default class NodeGraph {
    container: HTMLElement;
    nodes: Vertex[];
    edges: Edge[];
    draggingNode: Vertex | undefined;
    newEdge?: {element: HTMLElement, startNode: Vertex};
    initialMouseX: number;
    initialMouseY: number;
    initialNodeX: number;
    initialNodeY: number;
    
    constructor(container: HTMLElement) {
        this.container = container;
        this.nodes = [];
        this.edges = [];
        this.draggingNode = undefined;
        this.initialMouseX = 0;
        this.initialMouseY = 0;
        this.initialNodeX = 0;
        this.initialNodeY = 0;

        this.container.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.container.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.container.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    createNodeBase(x: number, y: number) {
        const node = document.createElement("div");
        node.classList.add("node");
        node.setAttribute(
            "style",
            "width: 50px; height: 50px; background-color: #ccc; border: 1px solid #000; border-radius: 50%; cursor: move;"
        );
        node.style.position = 'absolute';
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.zIndex = '2';
        node.id = `node${this.nodes.length + 1}`; // Assign a unique ID to each node
        node.addEventListener("mouseenter", this.handleNodeMouseEnter.bind(this));
        node.addEventListener("mouseleave", this.handleNodeMouseLeave.bind(this));
        const nodeData = {element: node, edges: [], id: node.id};
        this.container.appendChild(node);
        this.nodes.push(nodeData);
        return nodeData;
    }

    createNode(x: number, y: number, props?: {style: CSS.Properties, content: string}) {
        const node = this.createNodeBase(x, y);
        if (props === undefined) {
            return node;
        }
        for (const [key, value] of Object.entries(props.style)) {
            let attribute = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
            node.element.style.setProperty(attribute, value);
        }
        node.element.innerHTML = props.content;
        return node;
    }


    createEdge(startNode: Vertex, endNode: Vertex) {
        const edge = document.createElement("div");
        edge.classList.add("edge");
        edge.id = `edge${this.edges.length + 1}`;
        const edgeData = {element: edge, startNode: startNode.id, endNode: endNode.id};
        startNode.edges.push(edgeData);
        endNode.edges.push(edgeData);
        this.container.appendChild(edge);
        this.edges.push(edgeData);
        this.updateEdges(startNode);
    }

    handleNodeMouseEnter(event: Event) {
        const node = event.target as HTMLElement;
        node.style.border = "3px solid";
    }

    handleNodeMouseLeave(event: Event) {
        const node = event.target as HTMLElement;
        node.style.border = "1px solid #000";
    }

    handleMouseDown(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.closest(".node")) {
            const node = this.nodes.find(nodeData => nodeData.id === target.closest(".node")?.id);
            if (!node) {
                return;
            }
            if (event.button === 0) {
                this.draggingNode = node;
                this.initialMouseX = event.clientX;
                this.initialMouseY = event.clientY;
                this.initialNodeX = node.element.offsetLeft;
                this.initialNodeY = node.element.offsetTop;
                node.element.style.zIndex = "10";
            } else if (event.button === 2) {
                const edgeElement = document.createElement("div");
                edgeElement.classList.add("edge");
                this.newEdge = {element: edgeElement, startNode: node}
                this.container.appendChild(edgeElement);
                this.updateNewEdge(event.clientX, event.clientY);
            }
        }
    }

    handleMouseMove(event: MouseEvent) {
        if (this.draggingNode) {
            const deltaX = event.clientX - this.initialMouseX;
            const deltaY = event.clientY - this.initialMouseY;
            const newNodeX = this.initialNodeX + deltaX;
            const newNodeY = this.initialNodeY + deltaY;
            this.draggingNode.element.style.left = `${newNodeX}px`;
            this.draggingNode.element.style.top = `${newNodeY}px`;
            this.updateEdges(this.draggingNode);
        } else if (this.newEdge) {
            // Update the position of the new edge element
            this.updateNewEdge(event.clientX, event.clientY);
        }
    }

    handleMouseUp(event: MouseEvent) {
        if (this.draggingNode) {
            this.draggingNode.element.style.zIndex = "2";
            this.draggingNode = undefined;
        }
        if (this.newEdge) {
            event.preventDefault();
            const target = event.target as HTMLElement;
            if (target.closest(".node")) {
                const node = this.nodes.find(nodeData => nodeData.id === target.closest(".node")?.id);
                if (!node) {
                    return;
                }
                this.createEdge(this.newEdge.startNode, node);
            }
            this.container.removeChild(this.newEdge.element);
            this.newEdge = undefined;
        }
    }

    updateEdges(node: Vertex) {
        for (const edge of node.edges) {
            const startNode: HTMLElement = document.querySelector(`.node#${edge.startNode}`) as HTMLElement;
            const endNode: HTMLElement = document.querySelector(`.node#${edge.endNode}`) as HTMLElement;

            const startX = parseInt(startNode.style.left, 10) + startNode.offsetWidth / 2;
            const startY = parseInt(startNode.style.top, 10) + startNode.offsetHeight / 2;
            const endX = parseInt(endNode.style.left, 10) + endNode.offsetWidth / 2;
            const endY = parseInt(endNode.style.top, 10) + endNode.offsetHeight / 2;

            const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            const angle = Math.atan2(endY - startY, endX - startX);
            edge.element.style.left = `${startX - ((1 - Math.cos(angle)) * distance / 2)}px`;
            edge.element.style.top = `${startY + Math.sin(angle) * distance / 2}px`;
            edge.element.style.width = `${distance}px`;
            edge.element.style.transform = `rotate(${angle}rad)`;
        }
    }

    updateNewEdge(mouseX: number, mouseY: number) {
        if (this.newEdge) {
            const startX = parseInt(this.newEdge.startNode.element.style.left, 10)
                + this.newEdge.startNode.element.offsetWidth / 2;
            const startY = parseInt(this.newEdge.startNode.element.style.top, 10)
                + this.newEdge.startNode.element.offsetHeight / 2;
            ;
            const endX = mouseX;
            const endY = mouseY;

            const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            const angle = Math.atan2(endY - startY, endX - startX);

            this.newEdge.element.style.left = `${startX - ((1 - Math.cos(angle)) * distance / 2)}px`;
            this.newEdge.element.style.top = `${startY + Math.sin(angle) * distance / 2}px`;
            this.newEdge.element.style.width = `${distance}px`;
            this.newEdge.element.style.transform = `rotate(${angle}rad)`;
        }
    }

    findOptimalNodePosition() {
        const containerWidth = parseInt(this.container.style.width, 10);
        const containerHeight =  parseInt(this.container.style.height, 10);
        const containerLeft =  parseInt(this.container.style.left, 10);
        const containerTop =  parseInt(this.container.style.top, 10);

        const nodes = this.nodes;

        let maxDistance = -1;
        let optimalPosition = {x: 0, y: 0};
        for (let x = 0; x <= containerWidth; x += 50) {
            for (let y = 0; y <= containerHeight; y += 50) {
                const position = {x: containerLeft + x, y: containerTop + y};
                let sumDistance = 0;
                nodes.map((node) => {
                    const nodeX = parseInt(node.element.style.left, 10);
                    const nodeY = parseInt(node.element.style.top, 10);

                    sumDistance += Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
                });
                sumDistance += Math.min(x, containerWidth - x);
                sumDistance += Math.min(y, containerWidth - y);

                if (sumDistance > maxDistance) {
                    maxDistance = sumDistance;
                    optimalPosition = position;
                }
            }
        }

        return optimalPosition;
    }
}
