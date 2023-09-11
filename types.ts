export type Vertex = {
    element: HTMLElement;
    edges: Edge[];
    id: string;
}

export type Edge = {
    element: HTMLElement;
    startNode: string;
    endNode: string;
}