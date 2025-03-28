export interface GetProjectResponse {
    id: string; // Assuming Guid can be represented as a string in TypeScript
    name: string;
    startDate: string; // Assuming DateOnly can be represented as a string in TypeScript
    endDate: string; // Assuming DateOnly can be represented as a string in TypeScript
    projectManager: string;
    businessUnitLeader: string;
}

